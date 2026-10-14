/*
 * Ryuten visual theme layer for Jaxx/Senpa.
 * This file changes only local UI/theme state. It does not replace the
 * Senpa WebSocket, authentication, packet handlers, or WASM runtime.
 */
(function () {
  'use strict';

  var KEY = 'ryuten-theme-settings';
  var defaults = {
    enabled: true,
    pinkVirus: true,
    neonHud: true,
    reducedMotion: false,
    contrast: 'balanced'
  };

  function loadSettings() {
    try {
      var raw = localStorage.getItem(KEY);
      return Object.assign({}, defaults, raw ? JSON.parse(raw) : {});
    } catch (_) {
      return Object.assign({}, defaults);
    }
  }

  var state = loadSettings();

  function saveSettings() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  }

  function ensureStyle() {
    if (document.getElementById('ryuten-theme-style')) return;
    var style = document.createElement('style');
    style.id = 'ryuten-theme-style';
    style.textContent = `
      :root {
        --ryu-cyan: #2dd4bf;
        --ryu-pink: #ff4fa3;
        --ryu-bg: #071017;
      }
      body.ryuten-theme-enabled .lobby-overlay,
      body.ryuten-theme-enabled .settings-overlay,
      body.ryuten-theme-enabled .skins-modal {
        filter: saturate(1.08) contrast(1.03);
      }
      body.ryuten-theme-enabled .server-panel-card,
      body.ryuten-theme-enabled .profile-card,
      body.ryuten-theme-enabled .settings-overlay,
      body.ryuten-theme-enabled .skins-modal {
        border-color: rgba(45,212,191,.30) !important;
        box-shadow: 0 0 30px rgba(45,212,191,.08), inset 0 0 24px rgba(8,145,178,.05);
      }
      body.ryuten-theme-neon .hud-overlay,
      body.ryuten-theme-neon .hud-overlay * {
        text-shadow: 0 0 7px rgba(45,212,191,.32);
      }
      body.ryuten-theme-reduced-motion *,
      body.ryuten-theme-reduced-motion *::before,
      body.ryuten-theme-reduced-motion *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .001ms !important;
        scroll-behavior: auto !important;
      }
      body.ryuten-theme-high-contrast .hud-overlay,
      body.ryuten-theme-high-contrast .lobby-overlay {
        filter: contrast(1.18) saturate(1.18);
      }
      #ryuten-theme-panel {
        width: min(720px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 18px 20px;
        border: 1px solid rgba(45,212,191,.22);
        border-radius: 12px;
        background: linear-gradient(145deg, rgba(8,25,34,.96), rgba(8,15,22,.96));
        color: #e9fffb;
        font-family: 'Titillium Web', sans-serif;
      }
      #ryuten-theme-panel .ryu-panel-title {
        color: #2dd4bf;
        font-size: 13px;
        letter-spacing: 3px;
        font-weight: 800;
        margin-bottom: 5px;
      }
      #ryuten-theme-panel .ryu-panel-note {
        color: rgba(255,255,255,.52);
        font-size: 11px;
        line-height: 1.5;
        margin-bottom: 16px;
      }
      #ryuten-theme-panel .ryu-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      #ryuten-theme-panel .ryu-toggle,
      #ryuten-theme-panel .ryu-select {
        min-height: 42px;
        border: 1px solid rgba(45,212,191,.16);
        border-radius: 8px;
        background: rgba(255,255,255,.045);
        color: #e9fffb;
        font: inherit;
        cursor: pointer;
      }
      #ryuten-theme-panel .ryu-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 12px;
        text-align: left;
      }
      #ryuten-theme-panel .ryu-toggle span:first-child { font-size: 12px; letter-spacing: 1px; }
      #ryuten-theme-panel .ryu-toggle b { color: #ff75b4; font-size: 11px; letter-spacing: 1px; }
      #ryuten-theme-panel .ryu-select { width: 100%; padding: 8px 12px; }
      #ryuten-theme-panel .ryu-virus-preview {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 14px;
        padding: 10px 12px;
        border: 1px solid rgba(255,79,163,.20);
        border-radius: 8px;
        background: radial-gradient(circle at 18% 50%, rgba(255,79,163,.12), transparent 42%), rgba(0,0,0,.16);
      }
      #ryuten-theme-panel .ryu-virus-preview img {
        width: 62px;
        height: 67px;
        object-fit: contain;
        image-rendering: auto;
        filter: drop-shadow(0 0 10px rgba(255,79,163,.46));
      }
      #ryuten-theme-panel .ryu-virus-preview strong { color: #ff75b4; font-size: 12px; letter-spacing: 1px; }
      #ryuten-theme-panel .ryu-virus-preview small { display: block; color: rgba(255,255,255,.5); margin-top: 3px; font-size: 10px; }
      @media (max-width: 620px) { #ryuten-theme-panel .ryu-grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  function applyTheme() {
    ensureStyle();
    document.body.classList.toggle('ryuten-theme-enabled', !!state.enabled);
    document.body.classList.toggle('ryuten-theme-neon', !!state.neonHud);
    document.body.classList.toggle('ryuten-theme-reduced-motion', !!state.reducedMotion);
    document.body.classList.toggle('ryuten-theme-high-contrast', state.contrast === 'high');
  }

  function esc(value) {
    return String(value).replace(/[&<>'"]/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c];
    });
  }

  function renderPanel() {
    var host = document.getElementById('settingsContent');
    if (!host) return;
    host.innerHTML = `
      <div id="ryuten-theme-panel">
        <div class="ryu-panel-title">RYUTEN VISUAL LAYER</div>
        <div class="ryu-panel-note">Local visual settings only. Senpa connection, authentication, packets, and WASM remain unchanged.</div>
        <div class="ryu-grid">
          <button class="ryu-toggle" data-ryu-setting="enabled"><span>Ryuten theme</span><b>${state.enabled ? 'ON' : 'OFF'}</b></button>
          <button class="ryu-toggle" data-ryu-setting="neonHud"><span>Neon HUD</span><b>${state.neonHud ? 'ON' : 'OFF'}</b></button>
          <button class="ryu-toggle" data-ryu-setting="pinkVirus"><span>New virus visual</span><b>${state.pinkVirus ? 'ON' : 'OFF'}</b></button>
          <button class="ryu-toggle" data-ryu-setting="reducedMotion"><span>Reduced motion</span><b>${state.reducedMotion ? 'ON' : 'OFF'}</b></button>
        </div>
        <div style="margin-top:10px">
          <select class="ryu-select" data-ryu-contrast aria-label="Contrast">
            <option value="balanced" ${state.contrast === 'balanced' ? 'selected' : ''}>Balanced contrast</option>
            <option value="high" ${state.contrast === 'high' ? 'selected' : ''}>High contrast</option>
          </select>
        </div>
        <div class="ryu-virus-preview" style="${state.pinkVirus ? '' : 'opacity:.45'}">
          <img src="assets/ryuten-theme/virus-new.png" alt="New virus visual preview">
          <div><strong>NEW VIRUS VISUAL</strong><small>Preview asset is installed locally. The game renderer remains on Senpa protocol.</small></div>
        </div>
      </div>`;

    host.querySelectorAll('[data-ryu-setting]').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-ryu-setting');
        state[key] = !state[key];
        saveSettings();
        applyTheme();
        renderPanel();
      });
    });
    var select = host.querySelector('[data-ryu-contrast]');
    if (select) select.addEventListener('change', function () {
      state.contrast = select.value;
      saveSettings();
      applyTheme();
      renderPanel();
    });
  }

  function hookSettings() {
    var original = window.switchTab;
    if (typeof original === 'function' && !original.__ryutenWrapped) {
      var wrapped = function (button, tabId) {
        original.apply(this, arguments);
        if (tabId === 'theme') renderPanel();
      };
      wrapped.__ryutenWrapped = true;
      window.switchTab = wrapped;
    }
    var settings = document.getElementById('settingsOverlay');
    if (settings) {
      settings.addEventListener('click', function (event) {
        var tab = event.target.closest && event.target.closest('[data-tab="theme"]');
        if (tab) window.setTimeout(renderPanel, 0);
      });
    }
  }

  window.RyutenTheme = {
    settings: state,
    apply: applyTheme,
    renderSettings: renderPanel,
    virusAsset: 'assets/ryuten-theme/virus-new.png'
  };

  function init() {
    applyTheme();
    hookSettings();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
