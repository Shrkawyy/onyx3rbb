/* ONYX 3rb-only transport boundary. Does not bypass Captcha, attestation or anti-bot. */
(function (global) {
  'use strict';
  var hooked = false, last = '';
  function selected() { var el = global.document && document.getElementById('servers'); return el && el.options[el.selectedIndex]; }
  function entry(host) { return global.ONYXServers && global.ONYXServers.find(host || (selected() && selected().value)); }
  function wsUrl(host) { var e = entry(host); if (!e) { var raw = String(host || '').trim(); return /^wss:\/\/.+\/V5(?:\?.*)?$/.test(raw) ? raw : 'wss://' + raw + '/V5'; } return e.url; }
  function readSession() { try { return localStorage.getItem('3rbio:session') || localStorage.getItem('session') || ''; } catch (_) { return ''; } }
  function unsupported(name) { throw new Error('[ONYX 3RB] ' + name + ' requires the official 3rb V5 codec/handshake; no guessed packets are sent.'); }
  global.ONYX3rbAdapter = { provider: '3rb', wsUrl: wsUrl, readSession: readSession, readJwt: readSession, is3rb: function () { return true; }, unsupported: unsupported };
  global.ONYXFfaAdapter = global.ONYX3rbAdapter;
  function hook() {
    if (hooked || !global.SC || typeof global.SC.init !== 'function') return;
    hooked = true;
    var init = global.SC.init;
    global.SC.init = function (host, tab) { last = wsUrl(host); console.log('[ONYX 3RB] SC.init target=' + last + ' tab=' + (tab || 1)); return init.call(this, last, tab); };
    console.log('[ONYX 3RB] adapter installed; transport target is /V5');
  }
  var timer = setInterval(function () { hook(); if (hooked) clearInterval(timer); }, 50);
  global.addEventListener && global.addEventListener('pagehide', function () { clearInterval(timer); }, { once: true });
})(typeof window !== 'undefined' ? window : globalThis);
