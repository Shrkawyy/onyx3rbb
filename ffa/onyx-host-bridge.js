/**
 * DEPRECATED — do not load on the ONYX page.
 * Booting window.app / ffa/bundle.js beside deo.onyx.beautified.js loaded a
 * second copy of bundle.wasm in the same global and crashed at instanceof.
 * Protocol lives in onyx-ffa.js; codec WASM lives in onyx-ffa-codec-worker.js.
 */
(function () {
  'use strict';

  var phase = 'BOOT';
  var worldSeen = false;
  var playerSeen = false;
  var hooked = typeof WeakSet === 'function' ? new WeakSet() : { add: function () {}, has: function () { return false; } };

  function log(msg) {
    console.log('[FFA]', msg);
  }

  function fail(code, msg, extra) {
    console.error('[FFA ERROR]', code, msg || '');
    if (extra) console.error('[FFA ERROR]', extra);
  }

  function firstOpcode(data) {
    try {
      if (data instanceof ArrayBuffer) {
        var b = new Uint8Array(data);
        return b.length ? b[0] : null;
      }
      if (ArrayBuffer.isView(data)) return data.byteLength ? data[0] : null;
    } catch (_) {}
    return null;
  }

  function expectedPacket(p) {
    if (p === 'CONNECTING' || p === 'WS_OPEN') return 'server opcode 8 (auth request)';
    if (p === 'HANDSHAKE') return 'server opcode 0 (client id)';
    if (p === 'INIT') return 'server opcode 20 (world) / 10 (players)';
    if (p === 'SPAWN') return 'own cell in opcode 20';
    return 'unknown';
  }

  function tokenPresent(client) {
    try {
      var getter = window.__JAXXV6_GET_CLIENT_TOKEN__;
      var t = typeof getter === 'function' ? getter(client) : null;
      if (t) return /^[\w-]+\.[\w-]+\.[\w-]+$/.test(t);
      if (!client || client.type !== 'Secondary') {
        t = localStorage.getItem('senpaio:session') || localStorage.getItem('senpa_auth_token') || '';
        return /^[\w-]+\.[\w-]+\.[\w-]+$/.test(t);
      }
    } catch (_) {}
    return false;
  }

  function hookClient(client) {
    if (!client || hooked.has(client)) return;
    hooked.add(client);

    var origSendAuth = client.sendAuth && client.sendAuth.bind(client);
    if (origSendAuth) {
      client.sendAuth = function () {
        phase = 'HANDSHAKE';
        if (!tokenPresent(client)) fail('TOKEN_MISSING', 'sendAuth: senpaio:session is not a JWT');
        else log('Sending handshake');
        return origSendAuth();
      };
    }

    var origOnMessage = client.onMessage && client.onMessage.bind(client);
    if (origOnMessage) {
      client.onMessage = function (data) {
        var op = firstOpcode(data);
        if (op === 8) {
          phase = 'HANDSHAKE';
          log('Sending handshake');
        } else if (op === 0) {
          phase = 'INIT';
          log('Handshake accepted');
          log('Game initialization');
        } else if (op === 10 || op === 11) {
          if (!playerSeen) {
            playerSeen = true;
            log('Player initialized');
          }
        } else if (op === 20) {
          if (!worldSeen) {
            worldSeen = true;
            log('World state received');
          }
        } else if (op === 7) {
          log('Starting authentication');
        }
        return origOnMessage(data);
      };
    }

    var origSpawn = client.sendSpawn && client.sendSpawn.bind(client);
    if (origSpawn) {
      client.sendSpawn = function (tab) {
        phase = 'SPAWN';
        return origSpawn(tab);
      };
    }

    if (!client.events) return;

    client.events.on('connected', function () {
      phase = 'WS_OPEN';
      log('WebSocket OPEN');
    });
    client.events.on('ready', function () {
      phase = 'INIT';
      log('Game initialization');
      setTimeout(function () {
        if (client.authCompleted && client.isDead && client.sendSpawn) client.sendSpawn();
      }, 200);
    });
    client.events.on('spawned', function () {
      phase = 'CONNECTED';
      window.__ONYX_FFA_CONNECTED__ = true;
      log('Spawn successful');
      log('FFA CONNECTED');
    });
    client.events.on('disconnected', function () {
      if (window.__ONYX_FFA_CONNECTED__ && phase === 'CONNECTED') {
        log('Disconnected after gameplay');
        return;
      }
      fail('WS_ERROR', 'WebSocket closed', {
        phase: phase,
        authCompleted: !!client.authCompleted,
        clientReady: !!client.clientReady,
        expected: expectedPacket(phase)
      });
    });
    client.events.on('error', function (err) {
      fail('WS_ERROR', err && err.message ? err.message : String(err || 'socket error'), { phase: phase });
    });
  }

  function wrapInitClient(app) {
    if (!app.lobby || app.lobby.__onyxFfaWrapped) return;
    app.lobby.__onyxFfaWrapped = true;
    var orig = app.lobby.initClient.bind(app.lobby);
    app.lobby.initClient = function (url) {
      phase = 'CONNECTING';
      worldSeen = false;
      playerSeen = false;
      window.__ONYX_FFA_CONNECTED__ = false;
      log('Connecting to eu1.senpa.io:7101');
      var client = orig(url);
      hookClient(client);
      return client;
    };
  }

  function gateStageMouse(app) {
    if (!app.stage || app.stage.__onyxFfaMouseGated) return;
    app.stage.__onyxFfaMouseGated = true;
    var orig = app.stage.onMouseMove && app.stage.onMouseMove.bind(app.stage);
    window.onmousemove = function (ev) {
      if (!window.__ONYX_FFA_PLAYING__) return;
      if (orig) orig(ev);
    };
  }

  function waitForApp(cb) {
    var n = 0;
    (function poll() {
      if (window.app && window.app.lobby) return cb(window.app);
      if (++n > 200) {
        fail('INITIALIZATION_FAILED', 'window.app did not boot from ffa/bundle.js');
        return;
      }
      setTimeout(poll, 50);
    })();
  }

  waitForApp(function (app) {
    wrapInitClient(app);
    gateStageMouse(app);
    try {
      (app.player.pendingConnections || []).forEach(hookClient);
      if (app.dualConnectionHandler && app.dualConnectionHandler.forEachClient) {
        app.dualConnectionHandler.forEachClient(hookClient);
      }
    } catch (_) {}
    window.__ONYX_FFA_ENGINE__ = app;
    log('Jaxx engine ready (connect on PLAY)');
  });
})();
