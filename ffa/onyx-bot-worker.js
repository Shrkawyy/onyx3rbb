/**
 * ONYX FFA codec worker.
 *
 * Runs Jaxx bundle.wasm in a dedicated worker global so it cannot share
 * Emscripten embind/emval state with deo.onyx.beautified.js on the page.
 *
 * This is not the Jaxx lobby/app. Only wasmLoader Module.create() for
 * encrypt/decrypt of the Senpa FFA WebSocket.
 */
/* eslint-disable no-undef */
(function () {
  'use strict';

  // wasmLoader/embind looks up constructors via window/globalThis.
  // Dedicated workers have WebSocket on `self`, but no `window`.
  // Without this, emval `instanceof` RHS is undefined (handle 1).
  if (typeof self.window === 'undefined') self.window = self;
  if (typeof self.document === 'undefined') {
    self.document = { location: self.location, currentScript: null, baseURI: self.location.href };
  }

  importScripts('./onyx-bot-protocol.js');
  var protocol = null;
  var factories = Object.create(null);
  var installed = Object.create(null);

  function requireFactory(id) {
    if (installed[id]) return installed[id].exports;
    var factory = factories[id];
    if (!factory) throw new Error('FFA codec: webpack module ' + id + ' missing');
    var module = installed[id] = { id: id, exports: {} };
    factory.call(module.exports, module, module.exports, requireFactory);
    return module.exports;
  }

  requireFactory.d = function (exports, definition) {
    for (var key in definition) {
      if (Object.prototype.hasOwnProperty.call(definition, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };
  requireFactory.r = function () {};
  requireFactory.n = function (mod) {
    var getter = function () { return mod && mod.__esModule ? mod.default : mod; };
    requireFactory.d(getter, { a: getter });
    return getter;
  };
  requireFactory.o = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  self.webpackChunkeon_client = [];
  self.webpackChunkeon_client.push = function (chunk) {
    if (chunk && chunk[1]) {
      var mods = chunk[1];
      for (var id in mods) {
        if (Object.prototype.hasOwnProperty.call(mods, id)) factories[id] = mods[id];
      }
    }
    return self.webpackChunkeon_client.length;
  };

  try {
    importScripts('./wasmLoader.js');
  } catch (err) {
    self.postMessage({ type: 'error', code: 'INITIALIZATION_FAILED', msg: String(err && err.message || err) });
    return;
  }

  var wasmFactory;
  try {
    wasmFactory = requireFactory(458).A;
  } catch (err) {
    self.postMessage({ type: 'error', code: 'INITIALIZATION_FAILED', msg: 'wasmLoader export A: ' + (err && err.message || err) });
    return;
  }

  var moduleInstance = null;
  var socket = null;

  function boot() {
    return new Promise(function (resolve, reject) {
      var settled = false;
      moduleInstance = wasmFactory({
        locateFile: function (name) {
          return new URL(name, self.location.href).href;
        },
        print: function (msg) { self.postMessage({ type: 'log', msg: '[WASM] ' + msg }); },
        printErr: function (msg) {
          if (!settled) {
            settled = true;
            reject(new Error(String(msg)));
          }
        },
        onRuntimeInitialized: function () {
          if (!settled) {
            settled = true;
            resolve(moduleInstance);
          }
        }
      });
    });
  }

  function connect(url) {
    if (!moduleInstance || typeof moduleInstance.create !== 'function') {
      throw new Error('WASM create() missing');
    }
    if (!/^wss:\/\/[a-z0-9-]+\.senpa\.io:\d{2,5}\?/.test(url || '')) {
      throw new Error('[FFA] Invalid codec URL: ' + url);
    }
    socket = moduleInstance.create(
      url,
      function () { self.postMessage({ type: 'open' }); },
      function (code, reason, wasClean) {
        self.postMessage({
          type: 'close',
          code: typeof code === 'number' ? code : (code && code.code),
          reason: String(reason || (code && code.reason) || ''),
          wasClean: !!(wasClean || (code && code.wasClean))
        });
      },
      function (data) {
        var buf;
        if (data && data.buffer && data.byteLength != null) {
          buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        } else if (data instanceof ArrayBuffer) {
          buf = data.slice(0);
        } else {
          return;
        }
        try {
          protocol.receive(buf);
          var track = self.CanvasCaptureMediaStreamTrack;
          if (track && track.contextBufferFactory) {
            moduleInstance._alloc(9, track.contextBufferFactory);
            track.contextBufferFactory = null;
          }
        } catch (err) {
          self.postMessage({type:'error', msg:'Protocol: ' + err.message}); closeSock();
        }
      },
      function (err) {
        var msg = 'ws error';
        if (err && err.message) msg = err.message;
        else if (err && err.type) msg = 'WebSocket ' + err.type;
        else if (err != null) msg = String(err);
        self.postMessage({ type: 'error', code: 'WS_ERROR', msg: msg });
      }
    );
  }

  function send(bytes) {
    if (!socket) return;
    if (bytes instanceof ArrayBuffer) socket.send(new Uint8Array(bytes));
    else socket.send(bytes);
  }

  function closeSock() {
    try { if (socket && socket.close) socket.close(); } catch (_) {}
    socket = null;
  }

  var ready = boot();
  ready.then(function () {
    self.postMessage({ type: 'codec-ready' });
  }).catch(function (err) {
    self.postMessage({ type: 'error', code: 'INITIALIZATION_FAILED', msg: String(err && err.message || err) });
  });

  self.onmessage = function (ev) {
    var msg = ev.data || {};
    if (msg.type === 'connect') {
      ready.then(function () {
        protocol = new self.OnyxBotProtocol(send, function (event) { self.postMessage(event); },
          function (kind, bytes) { moduleInstance._alloc(kind, bytes); });
        protocol.name = String(msg.name || 'Bot').slice(0, 24);
        protocol.token = msg.token || 'null';
        connect(msg.url);
      }).catch(function (err) {
        self.postMessage({ type: 'error', code: 'INITIALIZATION_FAILED', msg: String(err && err.message || err) });
      });
      return;
    }
    if (protocol && msg.type === 'spawn') { protocol.spawn(); return; }
    if (protocol && msg.type === 'move') { protocol.move(msg.x, msg.y); return; }
    if (protocol && msg.type === 'split') { protocol.action(22); return; }
    if (protocol && msg.type === 'feed') { protocol.action(23); return; }
    if (protocol && msg.type === 'ping') { if (protocol.ready) send(new Uint8Array([30])); return; }
    if (msg.type === 'send') {
      send(msg.data);
      return;
    }
    if (msg.type === 'close') {
      closeSock();
    }
  };
})();
