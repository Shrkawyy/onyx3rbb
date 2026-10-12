/**
 * DEPRECATED — do not load on the ONYX page.
 * Wrapping window.WebSocket next to deo.onyx.beautified.js collided with
 * Emscripten embind (`x instanceof ctor`) and with the chat relay.
 * FFA sockets are created inside ffa/onyx-ffa-codec-worker.js only.
 */
(function () {
  'use strict';
  var Native = window.WebSocket;
  if (!Native || Native.__onyxFfaHook) return;

  function Wrapped(url, protocols) {
    var ws = protocols !== undefined ? new Native(url, protocols) : new Native(url);
    try {
      if (String(url).indexOf('eu1.senpa.io') !== -1) {
        console.log('[FFA]', 'Connecting to eu1.senpa.io:7101');
        ws.addEventListener('open', function () {
          console.log('[FFA]', 'WebSocket OPEN');
        });
        ws.addEventListener('error', function () {
          console.error('[FFA ERROR]', 'WS_ERROR', 'browser error on wss://eu1.senpa.io:7101');
        });
        ws.addEventListener('close', function (ev) {
          if (window.__ONYX_FFA_CONNECTED__ && (ev.code === 1000 || ev.code === 1001)) {
            console.log('[FFA]', 'WebSocket closed after gameplay code=' + ev.code);
            return;
          }
          var code = 'WS_ERROR';
          if (ev.code === 1008 || ev.code === 4001 || ev.code === 4003) code = 'SERVER_REJECTED';
          if (!window.__ONYX_FFA_CONNECTED__ && (ev.code === 1000 || ev.code === 1005)) code = 'HANDSHAKE_FAILED';
          console.error('[FFA ERROR]', code, 'close code=' + ev.code + ' reason="' + (ev.reason || '') + '" clean=' + ev.wasClean);
        });
      }
    } catch (_) {}
    return ws;
  }

  Wrapped.prototype = Native.prototype;
  Wrapped.CONNECTING = Native.CONNECTING;
  Wrapped.OPEN = Native.OPEN;
  Wrapped.CLOSING = Native.CLOSING;
  Wrapped.CLOSED = Native.CLOSED;
  Wrapped.__onyxFfaHook = true;
  window.WebSocket = Wrapped;
})();
