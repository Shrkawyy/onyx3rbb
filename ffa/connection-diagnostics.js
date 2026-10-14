/*
 * Non-sensitive connection diagnostics for the JaxxV6 client.
 * It records only WebSocket state, packet type, byte length, and close code.
 * It never prints message contents, cookies, headers, or authentication tokens.
 */
(function () {
  'use strict';
  if (window.__JAXXV6_CONNECTION_DIAGNOSTICS__) return;
  window.__JAXXV6_CONNECTION_DIAGNOSTICS__ = true;

  var NativeWebSocket = window.WebSocket;
  var panel = null;
  var logLines = [];
  var readySeen = false;
  var socketCount = 0;

  function ensurePanel() {
    if (panel && panel.isConnected) return panel;
    if (!document.body) {
      window.setTimeout(ensurePanel, 50);
      return null;
    }
    panel = document.createElement('div');
    panel.id = 'jax-connection-diagnostics';
    panel.innerHTML =
      '<div class="jax-diag-title">Connection diagnostics <button type="button" id="jax-diag-hide">×</button></div>' +
      '<div id="jax-diag-status">Waiting for WebSocket...</div>' +
      '<div id="jax-diag-log"></div>';
    var style = document.createElement('style');
    style.textContent =
      '#jax-connection-diagnostics{position:fixed;left:12px;bottom:12px;z-index:2147482000;width:min(420px,calc(100vw - 24px));padding:10px 12px;border:1px solid rgba(255,210,80,.55);border-radius:8px;background:rgba(10,14,20,.94);box-shadow:0 8px 30px rgba(0,0,0,.45);color:#edf3fb;font:12px/1.4 system-ui,sans-serif;pointer-events:auto}' +
      '#jax-connection-diagnostics .jax-diag-title{font-weight:700;color:#ffd66e;margin-bottom:5px}' +
      '#jax-connection-diagnostics button{float:right;border:0;background:transparent;color:#aebacc;font-size:16px;line-height:12px;cursor:pointer}' +
      '#jax-connection-diagnostics button:hover{color:#fff}' +
      '#jax-diag-status{color:#fff;margin-bottom:4px;word-break:break-word}' +
      '#jax-diag-log{max-height:110px;overflow:auto;color:#b8c5d6;white-space:pre-wrap;word-break:break-word}';
    panel.appendChild(style);
    document.body.appendChild(panel);
    document.getElementById('jax-diag-hide').addEventListener('click', function () {
      panel.style.display = 'none';
    });
    return panel;
  }

  function render(status) {
    var root = ensurePanel();
    if (!root) return;
    var statusEl = root.querySelector('#jax-diag-status');
    var logEl = root.querySelector('#jax-diag-log');
    if (statusEl) statusEl.textContent = status;
    if (logEl) logEl.textContent = logLines.slice(-8).join('\n');
  }

  function addLog(text) {
    logLines.push(new Date().toLocaleTimeString() + '  ' + text);
    render(text);
    try { console.info('[JAXX DIAG]', text); } catch (_) {}
  }

  function packetInfo(data, callback) {
    if (data instanceof ArrayBuffer) {
      var bytes = new Uint8Array(data);
      callback(bytes.length ? bytes[0] : null, bytes.length);
      return;
    }
    if (ArrayBuffer.isView(data)) {
      var view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      callback(view.length ? view[0] : null, view.length);
      return;
    }
    if (data instanceof Blob) {
      data.arrayBuffer().then(function (buffer) {
        packetInfo(buffer, callback);
      }).catch(function () { callback(null, 0); });
      return;
    }
    callback(null, typeof data === 'string' ? data.length : 0);
  }

  function describePacket(type) {
    if (type === 0) return 'packet 0: READY received';
    if (type === 7) return 'packet 7: CAPTCHA request';
    if (type === 8) return 'packet 8: AUTH handshake request';
    if (type === null) return 'non-binary message received';
    return 'packet ' + type + ' received';
  }

  function safeUrl(url) {
    try {
      var parsed = new URL(String(url));
      var path = parsed.pathname === '/' ? '' : parsed.pathname;
      return parsed.protocol + '//' + parsed.host + path +
        '?po=' + (parsed.searchParams.has('po') ? 'present' : 'missing') +
        '&tid=' + (parsed.searchParams.has('tid') ? 'present' : 'missing');
    } catch (_) {
      return 'unknown WebSocket URL';
    }
  }

  class DiagnosticWebSocket extends NativeWebSocket {
    constructor(url, protocols) {
      if (arguments.length > 1) super(url, protocols);
      else super(url);
      var self = this;
      var id = ++socketCount;
      readySeen = false;
      addLog('#' + id + ' opening ' + safeUrl(url));
      this.addEventListener('open', function () {
        addLog('#' + id + ' socket OPEN; waiting for server handshake');
        window.setTimeout(function () {
          if (!readySeen && self.readyState === NativeWebSocket.OPEN) {
            render('#' + id + ' socket is open, but no READY packet arrived after 6 seconds');
            addLog('#' + id + ' handshake still pending');
          }
        }, 6000);
      });
      this.addEventListener('message', function (event) {
        packetInfo(event.data, function (type, length) {
          if (type === 0) readySeen = true;
          addLog('#' + id + ' ' + describePacket(type) + ' (' + length + ' bytes)');
        });
      });
      this.addEventListener('close', function (event) {
        addLog('#' + id + ' CLOSED code=' + event.code + (event.reason ? ' reason=' + event.reason : ''));
      });
      this.addEventListener('error', function () {
        addLog('#' + id + ' socket ERROR');
      });
    }

    send(data) {
      packetInfo(data, function (type, length) {
        addLog('outgoing packet ' + (type === null ? 'unknown' : type) + ' (' + length + ' bytes)');
      });
      return super.send(data);
    }
  }

  ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (key) {
    try { Object.defineProperty(DiagnosticWebSocket, key, { value: NativeWebSocket[key] }); } catch (_) {}
  });
  try { Object.setPrototypeOf(DiagnosticWebSocket, NativeWebSocket); } catch (_) {}
  window.WebSocket = DiagnosticWebSocket;
  ensurePanel();
})();
