/* Transport routing repair only. The legacy Senpa codec is NOT a 3rb V5 codec. */
(function (global) {
  'use strict';
  var hooked = false;
  var diagnostics = { version: '2.3.1-routing', protocolReady: false, attempts: 0, lastTarget: '', errors: [] };
  function selected() {
    var el = global.document && global.document.getElementById('servers');
    return el && el.value || '';
  }
  function wsUrl(value) {
    var raw = String(value || selected() || '').trim();
    var entry = global.ONYXServers && global.ONYXServers.find(raw);
    if (entry) raw = entry.url;
    if (!raw) throw new Error('Select a 3rb server first.');
    var url = new URL(/^wss:\/\//i.test(raw) ? raw : 'wss://' + raw);
    if (url.protocol !== 'wss:' || !/(^|\.)3rb\.io$/i.test(url.hostname) || url.username || url.password || url.hash || url.search || !['/', '/V5', '/V5/'].includes(url.pathname)) {
      throw new Error('Invalid 3rb server address.');
    }
    url.pathname = '/V5';
    return url.href;
  }
  function readSession() { try { return global.localStorage.getItem('3rbio:session') || global.localStorage.getItem('session') || ''; } catch (_) { return ''; } }
  function unsupported(name) { throw new Error('[ONYX 3RB] ' + name + ' requires the official 3rb V5 codec/handshake.'); }
  var adapter = { provider: '3rb', wsUrl: wsUrl, readSession: readSession, readJwt: readSession,
    is3rb: function () { return true; }, isNewFfa: function () { return false; }, unsupported: unsupported, diagnostics: diagnostics };
  // This is the exact facade read at BOTH create() call sites in deo.onyx.
  global.__ONYX_ADAPTER__ = global.ONYX3rbAdapter = global.ONYXFfaAdapter = adapter;
  function record(error) {
    var message = String(error && error.message || error || 'Unknown runtime error');
    diagnostics.errors.push(message.slice(0, 300));
    if (diagnostics.errors.length > 10) diagnostics.errors.shift();
    console.error('[ONYX 3RB] Runtime failure; V5 compatibility is not established:', message);
  }
  function hook() {
    if (hooked || !global.SC || typeof global.SC.init !== 'function') return;
    hooked = true;
    var init = global.SC.init;
    global.SC.init = function (host, tab) {
      var target = wsUrl(host || this.ip);
      diagnostics.lastTarget = target;
      diagnostics.attempts++;
      console.log('[ONYX 3RB] ROUTING target=' + target + ' tab=' + (tab || 1));
      try { return init.call(this, target, tab); }
      catch (error) { record(error); throw error; }
    };
    console.warn('[ONYX 3RB] URL routing repaired. Legacy codec remains unverified for 3rb V5.');
  }
  hook();
  var timer = hooked ? null : setInterval(function () { hook(); if (hooked) clearInterval(timer); }, 50);
  if (global.addEventListener) {
    global.addEventListener('pagehide', function () { if (timer !== null) clearInterval(timer); }, { once: true });
    global.addEventListener('error', function (event) {
      if (/DataView|Uint32Array|WebAssembly|wasm|out of bounds/i.test(String(event.message || ''))) record(event.error || event.message);
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
