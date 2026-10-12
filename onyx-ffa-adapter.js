/**
 * New-server adapter for ONYX (deo.onyx + PIXI + WASM create).
 * Does not render, spawn, or open its own WebSocket.
 * Load BEFORE deo.onyx so auto-connect uses wsUrl (?po=&tid=) instead of ?password=.
 *
 * Confirmed deo URL: wss://<host>?password=
 * Senpa v4 URLs use ?po=<location.host>&tid=<32 hex> for all three target modes.
 * Confirmed auth: opcode 13. FFA uses UInt16 length + UTF-16; deo writeString16 uses UInt8 length.
 */
(function (global) {
  'use strict';

  var NEW_FFA_HOST = 'eu1.senpa.io:7101';
  var NEW_FFA_IDS = { 'ffa-eu': 1, 'eu1.senpa.io:7101': 1 };
  var TID_KEY = 'kateronyx:senpa-tid';
  var LEGACY_SUFFIX = '?password=';

  var cellInLog = 0;
  var cellOutLog = 0;
  var hooked = false;
  var spectateSent = false;
  var lastConnectHost = '';
  var origInit = null;
  var origSend = null;
  var origOnMessage = null;
  var origOnClose = null;
  var origOnError = null;
  var jwtNullWarned = false;
  var wasmWaitTimer = null;
  var secondaryInitAllowedUntil = 0;
  var mainSlots = 0;

  /* Only a real user Tab press may open the second connection. */
  function armSecondaryInit() {
    secondaryInitAllowedUntil = Date.now() + 1200;
  }
  if (global.addEventListener) {
    global.addEventListener('keydown', function (event) {
      if ((event.key === 'Tab' || event.code === 'Tab') &&
          !(event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) {
        armSecondaryInit();
      }
    }, true);
  }

  function log(tag, msg) {
    console.log('[NEW-SERVER] [' + tag + '] ' + msg);
  }

  function hex32() {
    var existing = '';
    try { existing = sessionStorage.getItem(TID_KEY) || ''; } catch (_) {}
    if (/^[a-f0-9]{32}$/.test(existing)) return existing;
    var hex;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      hex = crypto.randomUUID().replace(/-/g, '');
    } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      var bytes = crypto.getRandomValues(new Uint8Array(16));
      hex = Array.prototype.map.call(bytes, function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    } else {
      hex = '00000000000000000000000000000000';
    }
    try { sessionStorage.setItem(TID_KEY, hex); } catch (_) {}
    return hex;
  }

  function selectedRaw() {
    var el = document.getElementById('servers');
    if (!el) return '';
    return String(el.value || '');
  }

  function selectedOption() {
    var el = document.getElementById('servers');
    if (!el || el.selectedIndex < 0) return null;
    return el.options[el.selectedIndex];
  }

  function mapHost(raw) {
    var host = String(raw || '').trim();
    if (!host) {
      var opt = selectedOption();
      if (opt && opt.getAttribute('data-onyx-host')) host = opt.getAttribute('data-onyx-host');
      else host = selectedRaw();
    }
    if (global.ONYXServers) {
      var entry = global.ONYXServers.find(host.indexOf('ffa:') === 0 ? 'ffa-eu' : host);
      if (entry) return entry.host;
    }
    if (host === 'ffa-eu' || host.indexOf('ffa:') === 0) return NEW_FFA_HOST;
    var opt = selectedOption();
    if (opt && (opt.getAttribute('data-onyx-id') === 'ffa-eu' || opt.value === 'ffa-eu')) {
      if (!host || host === 'ffa-eu') return NEW_FFA_HOST;
    }
    if (opt && opt.getAttribute('data-onyx-host') && (host === 'ffa-eu' || host === opt.value && opt.getAttribute('data-onyx-id') === 'ffa-eu')) {
      return opt.getAttribute('data-onyx-host');
    }
    return global.ONYXServers ? global.ONYXServers.mapHost(host) : host;
  }

  function isNewFfaHost(host) {
    host = mapHost(host);
    // Historical function name: this selects the v4 wire format, not FFA gameplay.
    return global.ONYXServers ? !!global.ONYXServers.find(host) : host === NEW_FFA_HOST;
  }

  function isNewFfaSelected() {
    if (global.ONYXServers) return !!global.ONYXServers.find(selectedRaw());
    var opt = selectedOption();
    if (opt) {
      if (opt.getAttribute('data-onyx-id') === 'ffa-eu') return true;
      if (opt.getAttribute('data-onyx-type') === 'ffa') return true;
      if (NEW_FFA_IDS[opt.value]) return true;
      if (opt.getAttribute('data-onyx-host') === NEW_FFA_HOST) return true;
    }
    return isNewFfaHost(selectedRaw());
  }

  function wsUrl(host) {
    host = mapHost(host);
    if (isNewFfaHost(host)) {
      return 'wss://' + host + '?po=' + encodeURIComponent(location.host) + '&tid=' + hex32();
    }
    return 'wss://' + host + LEGACY_SUFFIX;
  }

  function readJwt() {
    if (global.ONYXAuth && typeof global.ONYXAuth.getSenpaToken === 'function') {
      var t = global.ONYXAuth.getSenpaToken();
      if (t) return String(t);
    }
    try {
      var a = localStorage.getItem('senpaio:session') || '';
      if (a && a.split('.').length >= 3) return a;
      var b = localStorage.getItem('senpa_auth_token') || '';
      if (b && b.split('.').length >= 3) return b;
    } catch (_) {}
    return 'null';
  }

  function toU8(buf) {
    if (!buf) return null;
    if (buf instanceof Uint8Array) return buf;
    if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
    if (buf.buffer instanceof ArrayBuffer) {
      return new Uint8Array(buf.buffer, buf.byteOffset || 0, buf.byteLength || buf.buffer.byteLength);
    }
    return null;
  }

  function buildAuthPacket(token) {
    token = String(token || 'null');
    var buf = new ArrayBuffer(1 + 2 + token.length * 2);
    var v = new DataView(buf);
    v.setUint8(0, 0x0d);
    v.setUint16(1, token.length, true);
    for (var i = 0; i < token.length; i++) v.setUint16(3 + i * 2, token.charCodeAt(i), true);
    return buf;
  }

  function sendDeoSpectate(sc) {
    if (!sc || typeof sc.send !== 'function') return;
    var buf = new ArrayBuffer(10);
    var v = new DataView(buf);
    v.setUint8(0, 20);
    v.setUint8(1, 1);
    v.setInt32(2, 0, true);
    v.setInt32(6, 0, true);
    origSend ? origSend.call(sc, buf, 1) : sc.send(buf, 1);
    log('PACKET-OUT', 'opcode=20 spectate-ready length=10 x=0 y=0');
  }

  function opcodeName(op, dir) {
    var names = {
      0: dir === 'in' ? 'serverInfo' : 'spawn',
      5: 'timer',
      7: 'captcha',
      8: 'authFlag',
      10: dir === 'in' ? 'updatePlayerClients' : 'nick',
      11: dir === 'in' ? 'updatePlayers' : 'tag',
      13: 'auth',
      14: 'captchaToken',
      20: dir === 'in' ? 'worldUpdate' : 'mouse/spectate',
      21: 'leaderboard',
      22: 'split',
      23: dir === 'in' ? 'spectateCamera' : 'feed',
      30: 'ping',
      31: 'fullSync',
      40: 'chat',
      41: 'serverChat'
    };
    return names[op] || 'UNKNOWN';
  }

  function describePacket(u8, dir) {
    if (!u8 || !u8.length) return 'empty';
    var op = u8[0];
    var extra = opcodeName(op, dir);
    if (dir === 'in' && op === 0 && u8.length >= 7) {
      var border = u8[1] | (u8[2] << 8) | (u8[3] << 16) | (u8[4] << 24);
      var clientId = u8[5] | (u8[6] << 8);
      extra += ' border=' + (border >>> 0) + ' clientId=' + clientId;
    }
    if (dir === 'out' && op === 13) extra += ' jwtChars=' + Math.max(0, (u8.length - 3) / 2);
    return 'opcode=' + op + ' (' + extra + ') length=' + u8.length + ' dir=' + dir;
  }

  function shouldLogPacket(u8, dir) {
    if (!u8 || !u8.length) return true;
    var op = u8[0];
    if (op === 20) {
      if (dir === 'in') {
        cellInLog++;
        return cellInLog <= 3;
      }
      cellOutLog++;
      return cellOutLog <= 3;
    }
    if (op === 30) return false;
    return true;
  }

  function seedExtrasServer() {
    var host = mapHost(selectedRaw()) || NEW_FFA_HOST;
    var prefixes = ['ONYXPROD540-', 'ONYXPROD532-'];
    var migrateKey = 'ONYXPROD540-ffaHostV19';
    var migrated = false;
    try { migrated = localStorage.getItem(migrateKey) === '1'; } catch (_) {}
    for (var i = 0; i < prefixes.length; i++) {
      var key = prefixes[i] + 'extras';
      var data = {};
      try { data = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { data = {}; }
      var mappedSaved = global.ONYXServers && global.ONYXServers.mapHost(data.server);
      var stale = !data.server || data.server === 'ffa-eu' || String(data.server).indexOf('ffa:') === 0;
      if (mappedSaved && mappedSaved !== data.server) {
        data.server = mappedSaved;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
      }
      if (!migrated || stale) {
        data.server = host;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
        log('CONNECT', 'seeded extras.server=' + host);
      }
    }
    try { localStorage.setItem(migrateKey, '1'); } catch (_) {}
  }

  function seedChatType() {
    var prefixes = ['ONYXPROD540-', 'ONYXPROD532-'];
    var migrateKey = 'ONYXPROD540-chatroomV198';
    var migrated = false;
    try { migrated = localStorage.getItem(migrateKey) === '1'; } catch (_) {}
    for (var i = 0; i < prefixes.length; i++) {
      var key = prefixes[i] + 'settings';
      var data = {};
      try { data = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { data = {}; }
      if (!migrated && (!data.chatType || data.chatType === 'normal' || data.chatType === 'popup')) {
        data.chatType = 'chatroom';
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
        log('ONYX-ENGINE', 'chatType → chatroom (Senpa persistent list)');
      }
    }
    try { localStorage.setItem(migrateKey, '1'); } catch (_) {}
  }

  function asSet(value) {
    if (value instanceof Set) return value;
    if (Array.isArray(value)) return new Set(value);
    return new Set();
  }

  function syncFfaType() {
    if (!isNewFfaSelected()) return;
    if (mainSlots > 1) return;
    if (global.zt && typeof global.zt === 'object') global.zt.ffaServerType = true;
    var keys = ['cellsIDTab1', 'cellsIDTab2'];
    var roots = [global.__ONYX_GS__, global.gs, global];
    for (var r = 0; r < roots.length; r++) {
      var obj = roots[r];
      if (!obj || typeof obj !== 'object') continue;
      for (var k = 0; k < keys.length; k++) {
        if (obj[keys[k]] != null && typeof obj[keys[k]].has !== 'function') {
          obj[keys[k]] = asSet(obj[keys[k]]);
          log('GAME-STATE', 'converted ' + keys[k] + ' Array → Set');
        }
      }
    }
  }

  function multiboxOn() {
    try {
      var prefixes = ['ONYXPROD540-', 'ONYXPROD532-'];
      for (var i = 0; i < prefixes.length; i++) {
        var s = JSON.parse(localStorage.getItem(prefixes[i] + 'settings') || '{}') || {};
        if (s.multiboxMode && s.multiboxMode !== 'off') return true;
      }
    } catch (_) {}
    return false;
  }

  function hookSC() {
    var sc = global.SC;
    if (!sc || hooked) return !!hooked;
    if (typeof sc.init !== 'function' || typeof sc.send !== 'function') return false;

    origInit = sc.init.bind(sc);
    origSend = sc.send.bind(sc);
    origOnMessage = typeof sc.onMessage === 'function' ? sc.onMessage.bind(sc) : null;
    origOnClose = typeof sc.onClose === 'function' ? sc.onClose.bind(sc) : null;
    origOnError = typeof sc.onError === 'function' ? sc.onError.bind(sc) : null;

    sc.init = function (host, tab) {
      if ((tab || 1) === 1) mainSlots = 0;
      if (tab === 2 && mainSlots > 1) return null;
      var mapped = mapHost(host);
      lastConnectHost = mapped;
      spectateSent = false;
      cellInLog = 0;
      cellOutLog = 0;
      syncFfaType();
      tab = tab || 1;
      if (tab === 2 && Date.now() > secondaryInitAllowedUntil) {
        log('CONNECT', 'tab=2 suppressed — waiting for user Tab');
        return null;
      }
      if (tab === 2) secondaryInitAllowedUntil = 0;
      if (isNewFfaHost(mapped)) {
        log('CONNECT', 'host=' + mapped + ' tab=' + tab + ' url=' + wsUrl(mapped).replace(/([?&]tid=)[a-f0-9]+/i, '$1***'));
        log('ONYX-ENGINE', 'SC.init → deo WASM create() (single runtime)');
      } else {
        log('CONNECT', 'legacy host=' + mapped + ' tab=' + tab + ' suffix=?password=');
      }
      try {
        var result = origInit(mapped, tab);
      } catch (err) {
        if (tab === 2) {
          log('CONNECT', 'tab=2 create failed — ' + (err && err.message || err));
          return;
        }
        throw err;
      }
      /*
       * Tab 1 is the only connection opened when PLAY is pressed.
       * The engine's multiboxTab() calls SC.init('', 2) after the user
       * presses Tab, so Tab 2 is intentionally started there instead of
       * being opened in parallel during the initial connection.
       */
      if (tab === 1 && wasmWaitTimer) {
        clearInterval(wasmWaitTimer);
        wasmWaitTimer = null;
      }
      return result;
    };

    sc.send = function (buf, tab) {
      var u8 = toU8(buf);
      if (u8 && u8.length && isNewFfaHost(lastConnectHost || selectedRaw())) {
        if (u8[0] === 0x0d) {
          var jwt = readJwt();
          buf = buildAuthPacket(jwt);
          u8 = toU8(buf);
          if (jwt === 'null' && !jwtNullWarned) {
            jwtNullWarned = true;
            console.warn('[AUTH] no senpaio:session — sending jwt=null (Jaxx guest)');
          }
          log('AUTH', 'opcode=13 UInt16-length jwt=' + (jwt === 'null' ? 'null' : 'session') + ' chars=' + String(jwt).length);
        }
        if (shouldLogPacket(u8, 'out')) log('PACKET-OUT', describePacket(u8, 'out') + ' tab=' + (tab || 1));
      }
      var result = origSend(buf, tab);
      // Optional observer: packet bytes and engine behavior remain unchanged.
      try {
        if (global.ONYXBots && global.ONYXBots.observePacket) global.ONYXBots.observePacket(buf);
      } catch (_) {}
      return result;
    };

    if (origOnMessage) {
      sc.onMessage = function (data, tab) {
        var u8 = toU8(data);
        if ((tab || 1) === 1 && u8 && u8[0] === 0 && u8.length >= 8 + 2 * u8[7]) mainSlots = u8[7];
        var result = origOnMessage(data, tab);
        if (u8 && u8.length && isNewFfaHost(lastConnectHost || selectedRaw())) {
          if (shouldLogPacket(u8, 'in')) log('PACKET-IN', describePacket(u8, 'in') + ' tab=' + (tab || 1));
          if (u8[0] === 0) {
            log('HANDSHAKE', describePacket(u8, 'in'));
            log('GAME-STATE', 'serverInfo received — deo worldUpdate/PIXI path');
            if (!spectateSent) {
              spectateSent = true;
              try { sendDeoSpectate(sc); } catch (err) {
                log('INPUT', 'spectate-ready skip ' + (err && err.message || err));
              }
            }
          }
          if (u8[0] === 8) log('AUTH', 'server opcode=8 → deo auth()');
          if (u8[0] === 7) log('HANDSHAKE', 'server captcha opcode=7 — deo sends opcode 14');
        }
        return result;
      };
    }

    if (origOnClose) {
      sc.onClose = function (tab) {
        log('DISCONNECT', 'tab=' + (tab || 1));
        spectateSent = false;
        return origOnClose(tab);
      };
    }

    if (origOnError) {
      sc.onError = function (tab) {
        log('DISCONNECT', 'error tab=' + (tab || 1));
        return origOnError(tab);
      };
    }

    hooked = true;
    log('ONYX-ENGINE', 'adapter wrapped SC.init/send/onMessage');
    syncFfaType();
    return true;
  }

  function bindMenu() {
    var servers = document.getElementById('servers');
    if (servers && !servers.__onyxAdapterBound) {
      servers.__onyxAdapterBound = true;
      servers.addEventListener('change', function () {
        var host = mapHost(servers.value);
        log('CONNECT', 'menu host=' + host + ' newFfa=' + isNewFfaHost(host));
        syncFfaType();
      });
    }
    if (!document.__onyxAdapterPlayBound) {
      document.__onyxAdapterPlayBound = true;
      document.addEventListener('click', function (e) {
        var play = e.target && e.target.closest && e.target.closest('#button-play');
        if (!play) return;
        syncFfaType();
        log('INPUT', 'PLAY → deo.onyx #button-play (not ONYXFfa)');
      }, true);
    }
  }

  function installWasmLocate() {
    global.k = global.k || {};
    global.k.locateFile = function (name, path) {
      name = String(name || '');
      if (global.__KATERONYX_WASM89_BLOB__ && /89\.wasm/i.test(name) && !/899\.wasm/i.test(name)) {
        return global.__KATERONYX_WASM89_BLOB__;
      }
      if (global.__KATERONYX_WASM_BLOB__) return global.__KATERONYX_WASM_BLOB__;
      if (/89\.wasm/i.test(name) && !/899\.wasm/i.test(name)) return (path || '') + '89.wasm';
      return (path || '') + (name || '899.wasm');
    };
    if (global.__KATERONYX_WASM_BLOB__) log('ONYX-ENGINE', 'locateFile → wasm blobs (game+89)');
  }

  function boot() {
    installWasmLocate();
    seedExtrasServer();
    seedChatType();
    bindMenu();
    if (!hookSC()) {
      var n = 0;
      var t = setInterval(function () {
        n++;
        bindMenu();
        if (hookSC() || n > 80) clearInterval(t);
      }, 100);
    }
    log('ONYX-ENGINE', 'adapter ready PIXI/deo path — onyx-ffa.js not loaded');
    log('RENDER', '#canvas PIXI (deo) — #gameCanvas hidden');
    log('DECODE', 'deo suffix 0x386="?password=" 0x83d="wss://" — FFA adds ?po=&tid=');
  }

  global.__ONYX_ADAPTER__ = {
    wsUrl: wsUrl,
    mapHost: mapHost,
    isNewFfa: isNewFfaSelected,
    readJwt: readJwt
  };
  global.ONYXFfaAdapter = global.__ONYX_ADAPTER__;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
