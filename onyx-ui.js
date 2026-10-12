/**
 * ONYX theme/HUD helper. Does not replace PIXI, steal PLAY, or open a 2d canvas.
 * deo.onyx owns #canvas, menus, and #button-play.
 */
(function (global) {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function hideLoadersSoon() {
    var a = $('loading-screen');
    var b = $('fake-loading-screen');
    if (a) {
      a.style.display = 'block';
      setTimeout(function () { a.style.display = 'none'; }, 1100);
    }
    if (b) b.style.display = 'none';
  }

  function lockTheme() {
    if (document.getElementById('onyx-theme-lock')) return;
    var style = document.createElement('style');
    style.id = 'onyx-theme-lock';
    style.textContent = [
      'html,body{background:#05060c!important}',
      '#canvas{display:block!important;z-index:3!important}',
      '#gameCanvas{display:none!important}',
      '#huds,#leaderboard-hud,#stats-hud,#minimap-hud{z-index:120!important;pointer-events:none}',
      '#leaderboard-hud{display:block!important}',
      'iframe,#google_ads_iframe,#ad_position_box,.ad-container,[id*="adinplay"],[class*="ad-manager"]{display:none!important}',
      'ins.adsbygoogle,.pub_300x250,.pub_300x250m,.pub_728x90{display:none!important}',
      '#leaderboard-positions .lb-position{display:flex!important;justify-content:flex-end;gap:8px}',
      '#leaderboard-positions span[lbdata=mass]{display:inline!important;color:#e0a82e;font-weight:700}',
      '#menu-overlay{z-index:200!important}',
      '#settings,#theme,#inputs{z-index:220!important;pointer-events:auto}',
      '#onyx-status-chip{position:fixed;top:30px;left:8px;right:auto;z-index:230;padding:6px 12px;border-radius:999px;background:rgba(15,19,32,.86);border:1px solid rgba(34,211,238,.35);color:#22d3ee;font:700 12px Rajdhani,Segoe UI,sans-serif;letter-spacing:.08em}',
      'iframe[src*="adinplay"],iframe[src*="doubleclick"],iframe[src*="prebid"]{display:none!important}'
    ].join('');
    document.head.appendChild(style);
    var head = $('leaderboard-head');
    if (head) {
      function enforceLeaderboardName() {
        if (head.textContent !== 'OnyxAlbion') head.textContent = 'OnyxAlbion';
        head.style.color = '#e0a82e';
        head.style.fontSize = '36px';
      }
      enforceLeaderboardName();
      try {
        var headObserver = new MutationObserver(enforceLeaderboardName);
        headObserver.observe(head, { childList: true, characterData: true, subtree: true });
      } catch (_) {}
    }
    if (!document.getElementById('onyx-status-chip')) {
      var chip = document.createElement('div');
      chip.id = 'onyx-status-chip';
      chip.textContent = '● ONYX';
      document.body.appendChild(chip);
    }

    function positionStatusChipBesideLogin() {
      var chip = document.getElementById('onyx-status-chip');
      var login = document.getElementById('onyx-auth-fab');
      if (!chip || !login) return;
      var rect = login.getBoundingClientRect();
      chip.style.left = Math.max(8, rect.left - chip.offsetWidth - 10) + 'px';
      chip.style.right = 'auto';
      chip.style.top = Math.max(8, rect.top) + 'px';
    }
    global.__onyxPositionStatusChip = positionStatusChipBesideLogin;
    positionStatusChipBesideLogin();
    window.addEventListener('resize', positionStatusChipBesideLogin);
    setTimeout(positionStatusChipBesideLogin, 100);
    setTimeout(positionStatusChipBesideLogin, 400);
    setTimeout(positionStatusChipBesideLogin, 1200);
  }

  function ensureLoginButton() {
    if ($('onyx-jwt-login') || $('button-login')) return;
    var block = $('mainBlock') || $('player-data');
    if (!block) return;
    var btn = document.createElement('button');
    btn.id = 'button-login';
    btn.type = 'button';
    btn.className = 'menu-button';
    btn.textContent = 'JWT LOGIN';
    btn.style.cssText = 'margin-top:8px;width:100%;padding:10px;border:0;border-radius:8px;background:#3b82f6;color:#fff;font-weight:700;cursor:pointer';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (global.ONYXAuth && global.ONYXAuth.openSenpaPanel) global.ONYXAuth.openSenpaPanel();
    });
    block.appendChild(btn);
  }

  function bind() {
    hideLoadersSoon();
    lockTheme();
    ensureLoginButton();
    console.log('[UI] ONYX READY');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  global.ONYXUi = {
    showMenu: function () { var m = $('menu-overlay'); if (m) m.style.display = 'block'; },
    hideMenu: function () { var m = $('menu-overlay'); if (m) m.style.display = 'none'; },
    closePanels: function () {},
    updateLeaderboard: function () {},
    updateStats: function () {},
    setStatus: function (text) {
      var chip = document.getElementById('onyx-status-chip');
      if (chip) chip.textContent = text || '● ONYX';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
