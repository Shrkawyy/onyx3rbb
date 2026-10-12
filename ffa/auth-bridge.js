/*
 * DEPRECATED on the ONYX page — captcha is handled inside onyx-ffa.js.
 * Senpa authentication bridge (Jaxx page helper).
 *
 * This file deliberately uses the official Cloudflare Turnstile widget in the
 * senpa.io page context. It does not call CAPTCHA-solving services and never
 * fabricates or persists a challenge token.
 */
(function () {
  'use strict';

  var SITE_KEY = '0x4AAAAAAACWFDYFT_opGqX8';
  var pending = new WeakMap();
  var sequence = 0;

  function ensureTurnstileScript() {
    if (window.turnstile && typeof window.turnstile.render === 'function') {
      return Promise.resolve();
    }

    var existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]');
    if (existing) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Cloudflare Turnstile could not be loaded.')); };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  function waitForTurnstile(timeoutMs) {
    timeoutMs = timeoutMs || 15000;
    return ensureTurnstileScript().then(function () {
      return new Promise(function (resolve, reject) {
        var started = Date.now();
        (function poll() {
          if (window.turnstile && typeof window.turnstile.render === 'function') {
            resolve(window.turnstile);
            return;
          }
          if (Date.now() - started >= timeoutMs) {
            reject(new Error('Cloudflare Turnstile did not load. Disable script blockers and reload Senpa.io.'));
            return;
          }
          window.setTimeout(poll, 100);
        })();
      });
    });
  }

  function toast(app, text, type) {
    try {
      if (app && app.toasts && typeof app.toasts.show === 'function') {
        app.toasts.show(text, type || 'error', 5000);
      }
    } catch (_) {}
  }

  function createOverlay() {
    var overlay = document.createElement('div');
    var hostId = 'jax-captcha-widget-' + (++sequence);
    overlay.id = 'jax-captcha-overlay';
    overlay.innerHTML =
      '<div class="jax-captcha-card" role="dialog" aria-modal="true" aria-labelledby="jax-captcha-title">' +
        '<h2 id="jax-captcha-title">Security verification</h2>' +
        '<p>Complete the official Cloudflare verification to connect to Senpa.io.</p>' +
        '<div id="' + hostId + '"></div>' +
        '<p class="jax-captcha-hint">If the widget does not appear, allow Cloudflare scripts and reload the page.</p>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#jax-captcha-overlay{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:rgba(0,0,0,.72);font:16px system-ui,sans-serif;color:#eef4ff}' +
      '#jax-captcha-overlay .jax-captcha-card{width:min(92vw,430px);padding:24px;border:1px solid #3e516b;border-radius:14px;background:#111923;box-shadow:0 18px 70px rgba(0,0,0,.5);text-align:center}' +
      '#jax-captcha-overlay h2{margin:0 0 10px;font-size:22px}' +
      '#jax-captcha-overlay p{margin:8px 0 18px;line-height:1.45;color:#c8d5e6}' +
      '#jax-captcha-overlay .jax-captcha-hint{margin:18px 0 0;font-size:12px;color:#91a4bb}' +
      '#jax-captcha-overlay [id^="jax-captcha-widget-"]{display:flex;justify-content:center;min-height:65px}';
    overlay.appendChild(style);
    document.body.appendChild(overlay);
    return { overlay: overlay, hostId: hostId };
  }

  function renderForClient(client, app) {
    if (pending.has(client)) return pending.get(client);

    var task = waitForTurnstile().then(function (turnstile) {
      var ui = createOverlay();
      return new Promise(function (resolve, reject) {
        var widgetId = null;
        var finished = false;

        function cleanup() {
          if (finished) return;
          finished = true;
          try {
            if (widgetId !== null && turnstile.remove) turnstile.remove(widgetId);
          } catch (_) {}
          if (ui.overlay && ui.overlay.parentNode) ui.overlay.parentNode.removeChild(ui.overlay);
          pending.delete(client);
        }

        function fail(message) {
          cleanup();
          toast(app, message, 'error');
          reject(new Error(message));
        }

        try {
          widgetId = turnstile.render('#' + ui.hostId, {
            sitekey: SITE_KEY,
            theme: 'dark',
            retry: 'auto',
            'callback': function (token) {
              if (!token || finished) return;
              try {
                client.sendCaptcha(1, token);
                cleanup();
                resolve();
              } catch (error) {
                fail(error && error.message ? error.message : 'Could not send the verification result.');
              }
            },
            'expired-callback': function () {
              if (widgetId !== null && turnstile.reset) turnstile.reset(widgetId);
            },
            'timeout-callback': function () {
              if (widgetId !== null && turnstile.reset) turnstile.reset(widgetId);
            },
            'error-callback': function () {
              fail('Cloudflare verification failed. Please reload and try again.');
              return true;
            }
          });
        } catch (error) {
          fail(error && error.message ? error.message : 'Could not render Cloudflare verification.');
        }
      });
    }).catch(function (error) {
      pending.delete(client);
      toast(app, error && error.message ? error.message : 'Cloudflare verification is unavailable.', 'error');
      throw error;
    });

    pending.set(client, task);
    return task;
  }

  window.__JAXXV6_NATIVE_CAPTCHA__ = function (client, app) {
    return renderForClient(client, app || window.app);
  };

  function install() {
    var app = window.app;
    if (!app || !app.lobby) {
      window.setTimeout(install, 50);
      return;
    }

    app.lobby.solveTurnstile = function (client) {
      return window.__JAXXV6_NATIVE_CAPTCHA__(client, app);
    };
  }

  install();
})();
