/*
 * Senpa OAuth session bridge for JaxxV6.
 *
 * Primary and Secondary use separate localStorage keys. The Secondary key is
 * never used as a fallback for Primary, and Primary is never sent to Secondary.
 * The provider popup performs the actual login; this page only accepts a JWT
 * from the trusted Senpa API origin.
 */
(function () {
  'use strict';

  var AUTH_ORIGIN = 'https://api.senpa.io';
  var PRIMARY_SESSION_KEY = 'senpaio:session';
  var SECONDARY_SESSION_KEY = 'senpaio:session:secondary';
  var PRIMARY_ACCOUNT_KEY = 'senpaio:account';
  var SECONDARY_ACCOUNT_KEY = 'senpaio:account:secondary';
  var secondaryAuthPromise = null;

  function isJwt(token) {
    if (typeof token !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return false;
    try {
      var payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      payload += '='.repeat((4 - payload.length % 4) % 4);
      var data = JSON.parse(atob(payload));
      return !data.exp || data.exp * 1000 > Date.now();
    } catch (_) {
      return false;
    }
  }

  function keyForSlot(slot) {
    return slot === 'secondary' ? SECONDARY_SESSION_KEY : PRIMARY_SESSION_KEY;
  }

  function accountKeyForSlot(slot) {
    return slot === 'secondary' ? SECONDARY_ACCOUNT_KEY : PRIMARY_ACCOUNT_KEY;
  }

  function getToken(slot) {
    try {
      var token = localStorage.getItem(keyForSlot(slot)) || '';
      return isJwt(token) ? token : null;
    } catch (_) {
      return null;
    }
  }

  window.__JAXXV6_GET_CLIENT_TOKEN__ = function (client) {
    return getToken(client && client.type === 'Secondary' ? 'secondary' : 'primary');
  };

  function saveAccount(token, slot) {
    fetch(AUTH_ORIGIN + '/account/', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    }).then(function (response) {
      return response.ok ? response.json() : null;
    }).then(function (account) {
      if (account) {
        try { localStorage.setItem(accountKeyForSlot(slot), JSON.stringify(account)); } catch (_) {}
      }
    }).catch(function () {});
  }

  function acceptToken(token, source, slot) {
    slot = slot === 'secondary' ? 'secondary' : 'primary';
    if (!isJwt(token)) return false;
    try { localStorage.setItem(keyForSlot(slot), token); } catch (_) {}
    saveAccount(token, slot);
    try {
      if (source && source.postMessage) source.postMessage({ type: 'senpa-auth-done' }, AUTH_ORIGIN);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('senpa-auth-updated', { detail: { slot: slot } }));
    window.__JAXXV6_AUTH_TARGET__ = 'primary';
    return true;
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== AUTH_ORIGIN) return;
    var data = event.data || {};
    if (data.type === 'senpa-auth-ready') {
      try { event.source && event.source.postMessage({ type: 'senpa-auth-hello' }, AUTH_ORIGIN); } catch (_) {}
      return;
    }
    var slot = window.__JAXXV6_AUTH_TARGET__ === 'secondary' ? 'secondary' : 'primary';
    if (acceptToken(data.access_token, event.source, slot)) {
      if (slot === 'primary') {
        window.setTimeout(function () { location.reload(); }, 250);
      }
    }
  });

  function refreshSession() {
    return fetch(AUTH_ORIGIN + '/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    }).then(function (response) {
      return response.ok ? response.json() : null;
    }).then(function (data) {
      if (data && acceptToken(data.access_token, null, 'primary')) {
        window.dispatchEvent(new CustomEvent('senpa-auth-updated', { detail: { slot: 'primary' } }));
        return true;
      }
      return false;
    }).catch(function () { return false; });
  }

  function providerEndpoint(provider) {
    return provider === 'facebook' ? '/auth/facebook' : '/auth/discord';
  }

  function openAuth(provider, slot) {
    slot = slot === 'secondary' ? 'secondary' : 'primary';
    window.__JAXXV6_AUTH_TARGET__ = slot;
    var title = slot === 'secondary' ? 'Senpa Secondary Login' : 'Senpa Login';
    var features = 'toolbar=no,menubar=no,width=600,height=700,top=100,left=100';
    var popup = window.open(AUTH_ORIGIN + providerEndpoint(provider), title, features);
    if (!popup) {
      window.dispatchEvent(new CustomEvent('senpa-auth-popup-blocked', { detail: { slot: slot } }));
      return false;
    }
    try { popup.focus(); } catch (_) {}
    return true;
  }

  window.__JAXXV6_OPEN_AUTH__ = function (provider, slot) {
    return openAuth(provider, slot || 'primary');
  };

  function makeSecondaryDialog() {
    var overlay = document.createElement('div');
    overlay.id = 'jax-secondary-auth-overlay';
    overlay.innerHTML =
      '<div class="jax-secondary-auth-card" role="dialog" aria-modal="true" aria-labelledby="jax-secondary-auth-title">' +
        '<h2 id="jax-secondary-auth-title">Login for Secondary Bot</h2>' +
        '<p id="jax-secondary-auth-status">Choose Facebook or Discord for the second bot. The first bot session will not be reused.</p>' +
        '<div class="jax-secondary-auth-actions">' +
          '<button type="button" data-provider="discord">Login with Discord</button>' +
          '<button type="button" data-provider="facebook">Login with Facebook</button>' +
        '</div>' +
        '<button type="button" data-cancel class="jax-secondary-auth-cancel">Cancel</button>' +
      '</div>';
    var style = document.createElement('style');
    style.textContent =
      '#jax-secondary-auth-overlay{position:fixed;inset:0;z-index:2147483001;display:grid;place-items:center;background:rgba(0,0,0,.72);font:16px system-ui,sans-serif;color:#eef4ff}' +
      '#jax-secondary-auth-overlay .jax-secondary-auth-card{width:min(92vw,440px);padding:24px;border:1px solid #3e516b;border-radius:14px;background:#111923;box-shadow:0 18px 70px rgba(0,0,0,.5);text-align:center}' +
      '#jax-secondary-auth-overlay h2{margin:0 0 10px;font-size:22px}' +
      '#jax-secondary-auth-overlay p{margin:8px 0 18px;line-height:1.45;color:#c8d5e6}' +
      '#jax-secondary-auth-overlay .jax-secondary-auth-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
      '#jax-secondary-auth-overlay button{border:0;border-radius:8px;padding:11px 15px;cursor:pointer;color:#fff;background:#5865f2;font-weight:700}' +
      '#jax-secondary-auth-overlay button[data-provider="facebook"]{background:#1877f2}' +
      '#jax-secondary-auth-overlay .jax-secondary-auth-cancel{margin-top:16px;background:#3a4655;font-weight:500}';
    overlay.appendChild(style);
    document.body.appendChild(overlay);
    return overlay;
  }

  window.__JAXXV6_ENSURE_SECONDARY_AUTH__ = function () {
    if (getToken('secondary')) return Promise.resolve(true);
    if (secondaryAuthPromise) return secondaryAuthPromise;

    secondaryAuthPromise = new Promise(function (resolve) {
      var overlay = makeSecondaryDialog();
      var status = overlay.querySelector('#jax-secondary-auth-status');
      var finished = false;

      function cleanup() {
        window.removeEventListener('senpa-auth-updated', onAuthUpdated);
        window.removeEventListener('senpa-auth-popup-blocked', onPopupBlocked);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }

      function finish(ok) {
        if (finished) return;
        finished = true;
        cleanup();
        resolve(!!ok);
      }

      function onAuthUpdated(event) {
        var detail = event && event.detail;
        if (detail && detail.slot === 'secondary' && getToken('secondary')) finish(true);
      }

      function onPopupBlocked(event) {
        var detail = event && event.detail;
        if (detail && detail.slot === 'secondary' && status) {
          status.textContent = 'The login popup was blocked. Allow popups and choose a provider again.';
        }
      }

      overlay.querySelectorAll('[data-provider]').forEach(function (button) {
        button.addEventListener('click', function () {
          var provider = button.getAttribute('data-provider');
          if (status) status.textContent = 'Complete the second account login in the popup, then return here.';
          if (!openAuth(provider, 'secondary') && status) {
            status.textContent = 'The login popup was blocked. Allow popups and try again.';
          }
        });
      });
      overlay.querySelector('[data-cancel]').addEventListener('click', function () { finish(false); });
      window.addEventListener('senpa-auth-updated', onAuthUpdated);
      window.addEventListener('senpa-auth-popup-blocked', onPopupBlocked);
    }).then(function (result) {
      secondaryAuthPromise = null;
      return result;
    }, function (error) {
      secondaryAuthPromise = null;
      throw error;
    });

    return secondaryAuthPromise;
  };

  window.__JAXXV6_SESSION_READY__ = refreshSession();
  window.__JAXXV6_REFRESH_SESSION__ = refreshSession;
})();
