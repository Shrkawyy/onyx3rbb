(function() {
  'use strict';

  // runs on any path (patched)

  // Ensure #gallery stub exists so inject functions work without server
  function ensureGalleryStub() {
    if (!document.getElementById('gallery')) {
      var g = document.createElement('div');
      g.id = 'gallery';
      g.style.cssText = 'display:block;position:fixed;inset:0;z-index:9997;background:transparent;pointer-events:none;';
      document.body.appendChild(g);
    }
  }


  var RYU_GAL_STYLE_ID    = 'ryu-gal-style';
  var RYU_GAL_INJECTED_ID = 'ryu-gal-injected';
  var _galMenuOpen        = false;
  var RYU_GAL_NAMES_KEY   = 'ryutenReplayNames_v5';
  var RYU_GAL_FAVS_KEY    = 'ryutenReplayFavs_v1';



  // inject styles
  function injectReplaysStyle() {
    var existing = document.getElementById(RYU_GAL_STYLE_ID);
    if (existing) existing.remove();
    var s = document.createElement('style');
    s.id = RYU_GAL_STYLE_ID;
    s.textContent = `
      #gallery .layer__title,
      #gallery .gl-container-wrapper,
      #gallery .layer__bottom-btns {
        opacity: 0 !important;
        pointer-events: none !important;
      }
      #gl-alert {
        opacity: 0 !important;
        pointer-events: none !important;
      }
      #gallery {
        background: transparent !important;
        pointer-events: none !important;
      }
      #ryu-gal-injected {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.97) !important;
        width: 1595px; height: 1015px;
        max-width: 92vw; max-height: 92vh;
        display: flex; flex-direction: column;
        font-family: 'Titillium Web', sans-serif;
        background: #0c0e16;
        border: 1px solid rgba(34,211,238,0.15);
        box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.9);
        overflow: hidden; flex-shrink: 0;
        opacity: 1; pointer-events: all;
        visibility: visible !important;
        transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 99999;
      }
      #ryu-gal-injected.ryu-gal-visible { transform: translate(-50%, -50%) scale(1) !important; }
      #ryu-gal-injected.ryu-gal-closing {
        opacity: 0; transform: translate(-50%, -50%) scale(0.97) !important;
        transition: opacity 140ms ease-in, transform 140ms ease-in;
      }
      #ryu-gal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 24px; height: 50px;
        background: rgba(34,211,238,0.03);
        border-bottom: 1px solid rgba(34,211,238,0.1);
        flex-shrink: 0;
      }
      #ryu-gal-title { font-size: 11px; font-weight: 300; letter-spacing: 5px; color: #22d3ee; }
      #ryu-gal-back-btn {
        padding: 4px 12px; border: 1px solid rgba(255,255,255,0.08);
        background: transparent; color: rgba(255,255,255,0.25);
        font-size: 7px; font-weight: 300; letter-spacing: 2px;
        cursor: pointer; font-family: 'Titillium Web', sans-serif; transition: all 0.15s;
      }
      #ryu-gal-back-btn:hover { border-color: rgba(34,211,238,0.3); color: rgba(255,255,255,0.7); }
      #ryu-gal-body { flex: 1; display: flex; min-height: 0; }
      #ryu-gal-sidebar {
        width: 200px; flex-shrink: 0;
        border-right: 1px solid rgba(34,211,238,0.08);
        display: flex; flex-direction: column;
        padding: 14px 0; background: #080b10; overflow-y: auto;
      }
      .ryu-gal-sb-label {
        font-size: 9px; font-weight: 300; letter-spacing: 2px;
        color: rgba(255,255,255,0.55); padding: 0 16px 10px;
      }
      .ryu-gal-sb-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 11px 16px; border-left: 2px solid transparent;
        font-size: 11px; font-weight: 300; color: rgba(255,255,255,0.3);
        cursor: pointer; transition: all 0.15s;
      }
      .ryu-gal-sb-item:hover { color: rgba(255,255,255,0.6); background: rgba(34,211,238,0.04); }
      .ryu-gal-sb-item.active { border-left-color: #22d3ee; background: rgba(34,211,238,0.07); color: #fff; }
      .ryu-gal-sb-item .ryu-gal-sb-count { font-size: 11px; font-weight: 300; color: rgba(34,211,238,0.6); }
      .ryu-gal-sb-divider { height: 1px; background: rgba(34,211,238,0.06); margin: 10px 16px; }
      #ryu-gal-grid-wrap {
        flex: 1; overflow-y: auto; padding: 14px 20px;
        display: flex; flex-direction: column; gap: 8px;
      }
      #ryu-gal-grid-wrap::-webkit-scrollbar { width: 3px; }
      #ryu-gal-grid-wrap::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 2px; }
      .ryu-gal-card {
        background: #0c1018; border: 1px solid rgba(255,255,255,0.05);
        display: flex; align-items: center; gap: 16px;
        padding: 16px 20px; position: relative;
        transition: border-color 0.15s;
      }
      .ryu-gal-card:hover { border-color: rgba(34,211,238,0.2); background: rgba(34,211,238,0.02); }
      .ryu-gal-card.ryu-gal-fav { border-color: rgba(34,211,238,0.35); background: rgba(34,211,238,0.04); }
      .ryu-gal-card.ryu-gal-fav::before {
        content: ''; position: absolute; left: 0; top: 0; bottom: 0;
        width: 2px; background: #22d3ee;
      }
      .ryu-gal-card-icon {
        width: 44px; height: 44px; flex-shrink: 0;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        display: flex; align-items: center; justify-content: center;
      }
      .ryu-gal-card.ryu-gal-fav .ryu-gal-card-icon {
        background: rgba(34,211,238,0.08); border-color: rgba(34,211,238,0.2);
      }
      .ryu-gal-card-play-icon {
        width: 0; height: 0;
        border-top: 8px solid transparent; border-bottom: 8px solid transparent;
        border-left: 14px solid rgba(255,255,255,0.2);
        margin-left: 3px;
      }
      .ryu-gal-card.ryu-gal-fav .ryu-gal-card-play-icon { border-left-color: #22d3ee; }
      .ryu-gal-card-info { flex: 1; min-width: 0; }
      .ryu-gal-card-name {
        font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.65);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-bottom: 4px;
      }
      .ryu-gal-card.ryu-gal-fav .ryu-gal-card-name { color: #fff; }
      .ryu-gal-card-meta {
        font-size: 13px; color: rgba(255,255,255,0.55); letter-spacing: 0.5px;
        display: flex; gap: 20px; margin-top: 4px;
      }
      .ryu-gal-card-meta span { display: flex; align-items: center; gap: 5px; }
      .ryu-gal-card-fav-btn {
        font-size: 18px; cursor: pointer;
        color: rgba(255,255,255,0.12); transition: color 0.15s;
        background: none; border: none; padding: 0; line-height: 1; flex-shrink: 0;
      }
      .ryu-gal-card-fav-btn.on { color: #f59e0b; }
      .ryu-gal-card-fav-btn:hover { color: #f59e0b; }
      .ryu-gal-card-actions { display: flex; gap: 6px; flex-shrink: 0; }
      .ryu-gal-btn-play {
        padding: 8px 18px;
        background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.2);
        color: #22d3ee; font-size: 10px; font-weight: 300; letter-spacing: 1px;
        cursor: pointer; font-family: 'Titillium Web', sans-serif; transition: background 0.15s;
        white-space: nowrap;
      }
      .ryu-gal-card.ryu-gal-fav .ryu-gal-btn-play { background: rgba(34,211,238,0.14); border-color: rgba(34,211,238,0.35); }
      .ryu-gal-btn-play:hover { background: rgba(34,211,238,0.2); }
      .ryu-gal-btn-icon {
        padding: 8px 12px; border: 1px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.65); font-size: 14px; cursor: pointer;
        background: rgba(255,255,255,0.04); font-family: sans-serif; transition: all 0.15s;
      }
      .ryu-gal-btn-icon:hover { border-color: rgba(34,211,238,0.4); color: #fff; background: rgba(255,255,255,0.08); }
      .ryu-gal-btn-delete { border-color: rgba(220,60,60,0.35); color: rgba(220,80,80,0.85); background: rgba(220,60,60,0.06); }
      .ryu-gal-btn-delete:hover { border-color: rgba(220,60,60,0.6); color: #ff6666; background: rgba(220,60,60,0.12); }
      #ryu-gal-footer {
        height: 30px; background: #0a0d12;
        border-top: 1px solid rgba(34,211,238,0.08);
        display: flex; align-items: center; padding: 0 24px; flex-shrink: 0;
        font-size: 8px; font-weight: 300; letter-spacing: 2px;
        color: rgba(255,255,255,0.2); font-family: 'Titillium Web', sans-serif;
      }
      #ryu-gal-rename-overlay {
        position: fixed; inset: 0; background: rgba(9,13,18,0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 100000;
      }
      #ryu-gal-rename-box {
        background: #111820; border: 1px solid rgba(34,211,238,0.25);
        padding: 28px 32px; display: flex; flex-direction: column;
        align-items: center; gap: 16px; min-width: 320px;
      }
      #ryu-gal-rename-title {
        font-size: 9px; font-weight: 300; letter-spacing: 4px;
        color: rgba(255,255,255,0.4); font-family: 'Titillium Web', sans-serif;
      }
      #ryu-gal-rename-input {
        width: 100%; padding: 8px 12px; box-sizing: border-box;
        background: rgba(9,13,18,0.85); border: 1px solid rgba(34,211,238,0.2);
        color: #fff; font-size: 13px; font-family: 'Titillium Web', sans-serif;
        outline: none; caret-color: #22d3ee;
      }
      #ryu-gal-rename-input:focus { border-color: rgba(34,211,238,0.45); }
      .ryu-gal-rename-btns { display: flex; gap: 10px; }
      .ryu-gal-rename-btn {
        padding: 8px 24px; font-size: 9px; font-weight: 300;
        letter-spacing: 2px; cursor: pointer; font-family: 'Titillium Web', sans-serif;
      }
      .ryu-gal-rename-btn.confirm {
        background: rgba(34,211,238,0.12); border: 1px solid rgba(34,211,238,0.4); color: #22d3ee;
      }
      .ryu-gal-rename-btn.cancel {
        background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);
      }

      /* clip editor */
      #ryu-clip-editor {
        position: fixed; inset: 0;
        background: rgba(6,9,14,0.95);
        display: flex; align-items: center; justify-content: center;
        z-index: 100020;
      }
      #ryu-clip-editor-box {
        background: #0c0e16; border: 1px solid rgba(34,211,238,0.2);
        width: 860px; max-width: 94vw;
        display: flex; flex-direction: column; gap: 0;
        box-shadow: 0 24px 80px rgba(0,0,0,0.9);
      }
      #ryu-clip-editor-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 20px; border-bottom: 1px solid rgba(34,211,238,0.1);
        background: rgba(34,211,238,0.03);
      }
      #ryu-clip-editor-title {
        font-size: 10px; font-weight: 300; letter-spacing: 4px; color: #22d3ee;
        font-family: 'Titillium Web', sans-serif;
      }
      #ryu-clip-editor-close {
        background: transparent; border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.3); font-size: 13px; cursor: pointer;
        padding: 3px 10px; transition: all 0.15s;
      }
      #ryu-clip-editor-close:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.8); }
      #ryu-clip-preview {
        width: 100%; background: #080b10;
        display: flex; align-items: center; justify-content: center;
        padding: 32px 20px; border-bottom: 1px solid rgba(34,211,238,0.08);
      }
      #ryu-clip-preview-info {
        font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.35);
        font-family: 'Titillium Web', sans-serif; letter-spacing: 1px; text-align: center;
        line-height: 2;
      }
      #ryu-clip-controls {
        padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;
      }
      #ryu-clip-timeline-wrap {
        position: relative; height: 44px;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      }
      #ryu-clip-timeline-bg {
        position: absolute; inset: 0;
        background: repeating-linear-gradient(90deg, rgba(34,211,238,0.03) 0px, rgba(34,211,238,0.03) 1px, transparent 1px, transparent 40px);
      }
      #ryu-clip-range {
        position: absolute; top: 0; bottom: 0;
        background: rgba(34,211,238,0.12); border-top: 2px solid #22d3ee; border-bottom: 2px solid #22d3ee;
        pointer-events: none;
      }
      #ryu-clip-playhead {
        position: absolute; top: 0; bottom: 0; width: 2px;
        background: #fff; pointer-events: none;
        transition: left 0.05s linear;
      }
      .ryu-clip-handle {
        position: absolute; top: 0; bottom: 0; width: 12px;
        background: #22d3ee; cursor: ew-resize; z-index: 2;
        display: flex; align-items: center; justify-content: center;
      }
      .ryu-clip-handle::after {
        content: ''; width: 2px; height: 16px;
        background: rgba(0,0,0,0.5); border-radius: 1px;
      }
      #ryu-clip-handle-start { left: 0; transform: translateX(-50%); }
      #ryu-clip-handle-end { right: 0; transform: translateX(50%); }
      #ryu-clip-time-row {
        display: flex; justify-content: space-between; align-items: center;
      }
      .ryu-clip-time-label {
        font-size: 10px; font-weight: 300; color: rgba(255,255,255,0.4);
        font-family: 'Titillium Web', sans-serif; letter-spacing: 1px;
      }
      .ryu-clip-time-val { color: #22d3ee; }
      #ryu-clip-playback-row {
        display: flex; align-items: center; gap: 10px;
      }
      .ryu-clip-pb-btn {
        padding: 7px 16px; border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6);
        font-size: 10px; font-weight: 300; letter-spacing: 1px;
        cursor: pointer; font-family: 'Titillium Web', sans-serif; transition: all 0.15s;
      }
      .ryu-clip-pb-btn:hover { border-color: rgba(34,211,238,0.4); color: #22d3ee; }
      #ryu-clip-save-row {
        display: flex; align-items: center; justify-content: space-between;
        padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05);
      }
      #ryu-clip-name-input {
        flex: 1; padding: 7px 12px; margin-right: 10px;
        background: rgba(9,13,18,0.85); border: 1px solid rgba(34,211,238,0.15);
        color: #fff; font-size: 12px; font-family: 'Titillium Web', sans-serif;
        outline: none; caret-color: #22d3ee;
      }
      #ryu-clip-name-input:focus { border-color: rgba(34,211,238,0.4); }
      #ryu-clip-save-btn {
        padding: 8px 24px; background: rgba(34,211,238,0.12);
        border: 1px solid rgba(34,211,238,0.4); color: #22d3ee;
        font-size: 10px; font-weight: 300; letter-spacing: 2px;
        cursor: pointer; font-family: 'Titillium Web', sans-serif; transition: all 0.15s;
        white-space: nowrap;
      }
      #ryu-clip-save-btn:hover { background: rgba(34,211,238,0.2); }
      #ryu-clip-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      #ryu-clip-status {
        font-size: 10px; color: rgba(34,211,238,0.6); letter-spacing: 1px;
        font-family: 'Titillium Web', sans-serif; min-height: 14px; text-align: right;
        padding: 0 4px;
      }

      /* ── Native playbar reskin ── */
      #playback-bar {
        background: rgba(9,13,18,0.95) !important;
        border: 1px solid rgba(34,211,238,0.2) !important;
        border-radius: 12px !important;
        padding: 14px 24px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.7) !important;
        gap: 16px !important;
        font-family: 'Titillium Web', sans-serif !important;
        min-width: 300px !important;
      }
      .playback-bar-button {
        color: rgba(255,255,255,0.6) !important;
        font-size: 20px !important;
        width: 38px !important;
        height: 38px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        border-radius: 8px !important;
        transition: all 0.15s !important;
        cursor: pointer !important;
      }
      .playback-bar-button:hover {
        color: #fff !important;
        background: rgba(34,211,238,0.1) !important;
        border-color: rgba(34,211,238,0.4) !important;
      }
      #playback-progress {
        height: 6px !important;
        accent-color: #22d3ee !important;
        cursor: pointer !important;
        flex: 1 !important;
      }
      #playback-speed {
        height: 4px !important;
        accent-color: rgba(34,211,238,0.5) !important;
        width: 80px !important;
      }
      #playback-progress-text, #playback-speed-text {
        color: rgba(255,255,255,0.45) !important;
        font-family: 'Titillium Web', sans-serif !important;
        font-size: 12px !important;
        font-weight: 300 !important;
        letter-spacing: 1px !important;
        min-width: 60px !important;
        text-align: center !important;
      }
    `;
    (document.head || document.documentElement).appendChild(s);
  }

  function closeReplaysWrapper() {
    var ow = document.getElementById(RYU_GAL_INJECTED_ID);
    if (!ow) return;
    ow.classList.remove('ryu-gal-visible');
    ow.classList.add('ryu-gal-closing');
    var nativeBack = document.getElementById('gl-back-button');
    if (nativeBack) nativeBack.click();
    setTimeout(function() {
      var el = document.getElementById(RYU_GAL_INJECTED_ID);
      if (el) el.remove();
      var menuPanel = document.getElementById('ryu-menu-ui');
      var menuBackdrop = document.getElementById('ryu-menu-backdrop');
      var teamBox = document.getElementById('ryu-team-box');
      if (menuPanel) menuPanel.style.removeProperty('display');
      if (menuBackdrop) menuBackdrop.style.removeProperty('display');
      if (teamBox) teamBox.style.removeProperty('display');
    }, 155);
  }

  // clip editor — loads raw clip from IndexedDB, lets user trim start/end, saves trimmed clip
  // clip editor — overlays timeline controls over the game canvas while clip plays natively

  function openClipEditor(entry) {
    if (document.getElementById('ryu-clip-editor')) return;

    // hide replays UI while editor is open
    var galWrapper = document.getElementById(RYU_GAL_INJECTED_ID);
    if (galWrapper) galWrapper.style.setProperty('display', 'none', 'important');

    var editorEl = document.createElement('div');
    editorEl.id = 'ryu-clip-editor';
    editorEl.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:100020;pointer-events:none;';

    var panel = document.createElement('div');
    panel.style.cssText = [
      'position:relative;left:0;right:0;bottom:0;',
      'background:linear-gradient(transparent,rgba(6,9,14,0.97) 25%);',
      'padding:60px 32px 24px;pointer-events:all;',
      "font-family:'Titillium Web',sans-serif;"
    ].join('');

    panel.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
        '<span style="font-size:10px;font-weight:300;letter-spacing:4px;color:#22d3ee;">CLIP EDITOR</span>' +
        '<div style="display:flex;align-items:center;gap:16px;">' +
          '<span id="ryu-clip-status" style="font-size:10px;color:rgba(34,211,238,0.5);letter-spacing:1px;"></span>' +
          '<button id="ryu-clip-editor-close" style="padding:4px 12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.35);font-size:11px;cursor:pointer;">\u2715 CLOSE</button>' +
        '</div>' +
      '</div>' +
      '<div id="ryu-clip-timeline-wrap" style="position:relative;height:40px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;margin-bottom:12px;">' +
        '<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(34,211,238,0.04) 0,rgba(34,211,238,0.04) 1px,transparent 1px,transparent 40px);pointer-events:none;"></div>' +
        '<div id="ryu-clip-range" style="position:absolute;top:0;bottom:0;background:rgba(34,211,238,0.15);border-top:2px solid #22d3ee;border-bottom:2px solid #22d3ee;pointer-events:none;"></div>' +
        '<div id="ryu-clip-playhead" style="position:absolute;top:0;bottom:0;width:2px;background:#fff;pointer-events:none;"></div>' +
        '<div id="ryu-clip-handle-start" style="position:absolute;top:0;bottom:0;width:12px;background:#22d3ee;cursor:ew-resize;z-index:2;transform:translateX(-50%);"></div>' +
        '<div id="ryu-clip-handle-end" style="position:absolute;top:0;bottom:0;width:12px;background:#22d3ee;cursor:ew-resize;z-index:2;transform:translateX(50%);right:0;"></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:12px;">' +
        '<span style="font-size:10px;font-weight:300;color:rgba(255,255,255,0.4);letter-spacing:1px;">START <span id="ryu-clip-start-val" style="color:#22d3ee;">0:00</span></span>' +
        '<span id="ryu-clip-cursor-val" style="font-size:10px;font-weight:300;color:rgba(255,255,255,0.25);letter-spacing:1px;">0:00</span>' +
        '<span style="font-size:10px;font-weight:300;color:rgba(255,255,255,0.4);letter-spacing:1px;">END <span id="ryu-clip-end-val" style="color:#22d3ee;">0:00</span></span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<button id="ryu-clip-play-btn" style="width:34px;height:34px;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&#9654;</button>' +
        '<button id="ryu-clip-pause-btn" style="width:34px;height:34px;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.3);color:#22d3ee;font-size:14px;cursor:pointer;display:none;align-items:center;justify-content:center;flex-shrink:0;">&#9646;&#9646;</button>' +
        '<select id="ryu-clip-speed-sel" style="height:34px;padding:0 8px;background:#0d1117;border:1px solid rgba(34,211,238,0.2);color:rgba(34,211,238,0.8);font-family:\'Titillium Web\',sans-serif;font-size:11px;cursor:pointer;outline:none;">' +
          '<option value="0.25">0.25x</option>' +
          '<option value="0.5">0.5x</option>' +
          '<option value="1" selected>1x</option>' +
          '<option value="2">2x</option>' +
          '<option value="4">4x</option>' +
        '</select>' +
        '<div style="flex:1;"></div>' +
      '</div>';

    editorEl.appendChild(panel);
    document.body.appendChild(editorEl);

    var timelineWrap = document.getElementById('ryu-clip-timeline-wrap');
    var rangeEl      = document.getElementById('ryu-clip-range');
    var playheadEl   = document.getElementById('ryu-clip-playhead');
    var handleStart  = document.getElementById('ryu-clip-handle-start');
    var handleEnd    = document.getElementById('ryu-clip-handle-end');
    var startVal     = document.getElementById('ryu-clip-start-val');
    var endVal       = document.getElementById('ryu-clip-end-val');
    var cursorVal    = document.getElementById('ryu-clip-cursor-val');
    var saveBtn      = document.getElementById('ryu-clip-save-btn');
    var statusEl     = document.getElementById('ryu-clip-status');
    var nameInput    = document.getElementById('ryu-clip-name-input');

    var clipBuf = null;
    var frameOffsets = [];
    var timestamps = [];
    var totalFrames = 0;
    var startPct = 0;
    var endPct = 1;
    var _fullKey = null;
    var _playheadTimer = null;

    function formatMs(ms) {
      var s = Math.floor(ms / 1000);
      var m = Math.floor(s / 60);
      return m + ':' + String(s % 60).padStart(2, '0');
    }

    function updateRangeUI() {
      rangeEl.style.left = (startPct * 100) + '%';
      rangeEl.style.width = ((endPct - startPct) * 100) + '%';
      handleStart.style.left = (startPct * 100) + '%';
      handleEnd.style.left = (endPct * 100) + '%';
      if (timestamps.length > 1) {
        var total = timestamps[timestamps.length - 1] - timestamps[0];
        startVal.textContent = formatMs(startPct * total);
        endVal.textContent = formatMs(endPct * total);
      }
    }

    function updatePlayhead(pct) {
      playheadEl.style.left = (pct * 100) + '%';
      if (timestamps.length > 1) {
        var total = timestamps[timestamps.length - 1] - timestamps[0];
        cursorVal.textContent = formatMs(pct * total);
      }
    }

    function startPlayheadTracking() {
      if (_playheadTimer) clearInterval(_playheadTimer);
      _playheadTimer = setInterval(function() {
        var pb = document.getElementById('playback-progress');
        if (!pb || !totalFrames) return;
        var pct = parseInt(pb.value) / (parseInt(pb.max) || 1);
        updatePlayhead(Math.max(0, Math.min(1, pct)));
      }, 50);
    }

    var dbReq = indexedDB.open('Gallery', 1);
    dbReq.addEventListener('success', function() {
      var db = dbReq.result;
      var keysReq = db.transaction('clips', 'readonly').objectStore('clips').getAllKeys();
      keysReq.addEventListener('success', function() {
        var fullKey = keysReq.result.find(function(k) { return k.indexOf(entry.id) !== -1; });
        if (!fullKey) { statusEl.textContent = 'Clip not found'; return; }
        _fullKey = fullKey;
        var getReq = db.transaction('clips', 'readonly').objectStore('clips').get(fullKey);
        getReq.addEventListener('success', function() {
          clipBuf = getReq.result;
          if (!clipBuf) { statusEl.textContent = 'Failed to load clip'; return; }
          if (!globalThis.__ryuV) { statusEl.textContent = 'Game not ready — try again in a moment'; return; }
          var V = globalThis.__ryuV;
          var r = new V(clipBuf);

          var isString16 = false;
          var strCount = r._1241();
          if (strCount > 0) {
            var first = r._3803();
            if (first !== 'string16') strCount--;
            else isString16 = true;
          }
          for (var i = 0; i < strCount; i++) { if (isString16) r._5978(); else r._3803(); }

          frameOffsets = []; timestamps = [];
          while (!r._9514) {
            frameOffsets.push(r._3090);
            var fr2 = new V(clipBuf); fr2._3090 = r._3090;
            timestamps.push(fr2._9733());
            r._9178(4); r._9178(2); r._9178(2); r._9178(2);
            var rc = r._1241(); r._9178(2 * rc);
            var ac = r._1241(); r._9178(4 * ac);
            var cc = r._1241(); r._9178(8 * cc);
            var cells = r._1241();
            for (var j = 0; j < cells; j++) {
              r._9178(8);
              var type = r._2292();
              if (type === 1) r._9178(9);
              else if (type === 2) r._9178(3);
            }
          }

          totalFrames = frameOffsets.length;
          if (totalFrames === 0) { statusEl.textContent = 'No frames found'; return; }

          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          statusEl.textContent = totalFrames + ' frames \u00b7 ' + formatMs(timestamps[totalFrames-1] - timestamps[0]);
          updateRangeUI();
          updatePlayhead(0);
          startPlayheadTracking();

          // Disconnect galObserver so it doesn't destroy the editor when gallery closes
          if (globalThis.__ryuGalObserver) globalThis.__ryuGalObserver.disconnect();

          // Close the native gallery cleanly first — prevents the black canvas transition overlay
          var glBackBtn = document.getElementById('gl-back-button');
          if (glBackBtn) glBackBtn.click();

          // click native play button to load clip into game engine
          var playBtn = entry.nativeEl.querySelector('.iconfont-play');
          if (playBtn) {
            // Wait for gallery to fully close before clicking play
            setTimeout(function() {
              playBtn.click();
              setTimeout(function() {
              // confirm native disconnect alert
              var yes = document.getElementById('gl-alert-yes');
              if (yes) yes.click();

              // wait for playback bar to appear, then hide it and wire our controls
              var pbPoll = setInterval(function() {
                var pb = document.getElementById('playback-bar');
                if (pb && pb.style.display !== 'none') {
                  clearInterval(pbPoll);

                  // Native bar permanently hidden via CSS — wire our play/pause buttons
                  var q = globalThis.__ryuQ_;
                  var playBtnEl  = document.getElementById('ryu-clip-play-btn');
                  var pauseBtnEl = document.getElementById('ryu-clip-pause-btn');
                  var speedSel   = document.getElementById('ryu-clip-speed-sel');

                  if (playBtnEl && q) {
                    playBtnEl.addEventListener('click', function() { q._1572(); });
                    pauseBtnEl.addEventListener('click', function() { q._7119(); });
                  }
                  if (speedSel && q) {
                    speedSel.addEventListener('change', function() {
                      q._5545 = parseFloat(speedSel.value);
                    });
                  }

                  // Listen for play/pause events to toggle button visibility
                  if (q) {
                    q._4935('play', function() {
                      if (playBtnEl) playBtnEl.style.display = 'none';
                      if (pauseBtnEl) pauseBtnEl.style.display = 'flex';
                    });
                    q._4935('pause', function() {
                      if (pauseBtnEl) pauseBtnEl.style.display = 'none';
                      if (playBtnEl) playBtnEl.style.display = 'flex';
                    });
                  }
                }
              }, 100);
            }, 50);
            }, 300); // wait for gallery to close
          }
        });
        getReq.addEventListener('error', function() { statusEl.textContent = 'Failed to load clip'; });
      });
      keysReq.addEventListener('error', function() { statusEl.textContent = 'Failed to read gallery'; });
    });

    timelineWrap.addEventListener('click', function(e) {
      if (!totalFrames || e.target === handleStart || e.target === handleEnd) return;
      var rect = timelineWrap.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      updatePlayhead(pct);
      var q = globalThis.__ryuQ_;
      if (q) q._4836 = Math.round(pct * (totalFrames - 1));
    });

    function makeDraggable(handle, isStart) {
      handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        function onMove(ev) {
          var rect = timelineWrap.getBoundingClientRect();
          var pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
          if (isStart) startPct = Math.min(pct, endPct - 0.01);
          else endPct = Math.max(pct, startPct + 0.01);
          updateRangeUI();
          // real-time scrub — seek game to this frame
          var q = globalThis.__ryuQ_;
          if (q && totalFrames) {
            var frameIdx = Math.round(pct * (totalFrames - 1));
            q._4836 = frameIdx;
            updatePlayhead(pct);
          }
        }
        function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }
    makeDraggable(handleStart, true);
    makeDraggable(handleEnd, false);



    saveBtn.addEventListener('click', function() {
      if (!clipBuf || !totalFrames) return;
      var startFrame = Math.round(startPct * (totalFrames - 1));
      var endFrame   = Math.round(endPct * (totalFrames - 1));
      if (startFrame >= endFrame) { statusEl.textContent = 'Select a valid range first'; return; }
      saveBtn.disabled = true; statusEl.textContent = 'Saving...';

      var V2 = globalThis.__ryuV;
      var r2 = new V2(clipBuf);
      r2._3090 = frameOffsets[endFrame];
      r2._9178(4); r2._9178(2); r2._9178(2); r2._9178(2);
      var rc2 = r2._1241(); r2._9178(2 * rc2);
      var ac2 = r2._1241(); r2._9178(4 * ac2);
      var cc2 = r2._1241(); r2._9178(8 * cc2);
      var cells2 = r2._1241();
      for (var k = 0; k < cells2; k++) { r2._9178(8); var t2 = r2._2292(); if (t2 === 1) r2._9178(9); else if (t2 === 2) r2._9178(3); }
      var byteEnd = r2._3090;
      var byteStart = frameOffsets[startFrame];
      var headerEnd = frameOffsets[0];

      var header = new Uint8Array(clipBuf, 0, headerEnd);
      var frames = new Uint8Array(clipBuf, byteStart, byteEnd - byteStart);
      var trimmed = new Uint8Array(header.length + frames.length);
      trimmed.set(header, 0); trimmed.set(frames, header.length);

      var clipName = nameInput.value.trim() || (entry.name + ' (clip)');
      var now = new Date();
      var dur = formatMs(timestamps[endFrame] - timestamps[startFrame]);
      var newKey = now.getTime() + '~replay~' + now.toLocaleString('en-US') + '~00:' + dur;

      var dbReq2 = indexedDB.open('Gallery', 1);
      dbReq2.addEventListener('success', function() {
        var putReq = dbReq2.result.transaction('clips', 'readwrite').objectStore('clips').put(trimmed.buffer, newKey);
        putReq.addEventListener('success', function() {
          try { var names = JSON.parse(localStorage.getItem(RYU_GAL_NAMES_KEY) || '{}'); names[newKey] = clipName; localStorage.setItem(RYU_GAL_NAMES_KEY, JSON.stringify(names)); } catch(e) {}
          statusEl.textContent = 'Saved as "' + clipName + '"';
          saveBtn.disabled = false;
          // reload native gallery so the game picks up the new clip
          var nativeBtn = document.getElementById('mame-trb-replays-btn');
          if (nativeBtn) {
            nativeBtn.click();
            setTimeout(function() {
              var backBtn = document.getElementById('gl-back-button');
              if (backBtn) backBtn.click();
            }, 300);
          }
        });
        putReq.addEventListener('error', function() { statusEl.textContent = 'Save failed'; saveBtn.disabled = false; });
      });
    });

    function closeEditor() {
      if (_playheadTimer) clearInterval(_playheadTimer);
      editorEl.remove();
      // Reconnect galObserver now that editor is closed
      if (globalThis.__ryuGalObserver) {
        var galEl2 = document.getElementById('gallery');
        if (galEl2) globalThis.__ryuGalObserver.observe(galEl2, { attributes: true, attributeFilter: ['style'] });
      }
      var gw = document.getElementById(RYU_GAL_INJECTED_ID);
      if (gw) gw.style.removeProperty('display');
    }

    document.getElementById('ryu-clip-editor-close').addEventListener('click', closeEditor);
    function onEditorEsc(e) {
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        document.removeEventListener('keydown', onEditorEsc, true);
        closeEditor();
      }
    }
    document.addEventListener('keydown', onEditorEsc, true);
  }

  function injectReplaysRedesign() {
    if (document.getElementById(RYU_GAL_INJECTED_ID)) return;
    injectReplaysStyle();

    var galEl = document.getElementById('gallery');
    if (!galEl) return;

    function loadNames() {
      try { return JSON.parse(localStorage.getItem(RYU_GAL_NAMES_KEY) || '{}'); } catch(e) { return {}; }
    }
    function saveNames(data) {
      try { localStorage.setItem(RYU_GAL_NAMES_KEY, JSON.stringify(data)); } catch(e) {}
    }
    function loadFavs() {
      try { return JSON.parse(localStorage.getItem(RYU_GAL_FAVS_KEY) || '[]'); } catch(e) { return []; }
    }
    function saveFavs(data) {
      try { localStorage.setItem(RYU_GAL_FAVS_KEY, JSON.stringify(data)); } catch(e) {}
    }

    function getEntries() {
      var names = loadNames();
      var favs  = loadFavs();
      var entries = [];
      document.querySelectorAll('.gl-entry').forEach(function(el) {
        var info = el.querySelector('.gl-entry-main-info');
        if (!info) return;
        var parts     = info.innerHTML.split('<br>');
        var timestamp = parts[0].trim();
        var duration  = (parts[1] || '').replace('Duration: ', '').trim();
        var id        = timestamp;
        var name      = names[id] || 'Unnamed Clip';
        var isFav     = favs.indexOf(id) !== -1;
        var dateObj   = new Date(timestamp);
        var dateStr   = isNaN(dateObj) ? timestamp : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        entries.push({ id: id, name: name, duration: duration, date: dateStr, isFav: isFav, nativeEl: el });
      });
      return entries;
    }

    function parseEntryDate(entry) {
      try { return new Date(entry.date); } catch(e) { return new Date(0); }
    }

    function filterAndSort(entries, view, sort, filter) {
      var now = new Date();
      var result = entries.filter(function(e) {
        if (view === 'favs' && !e.isFav) return false;
        if (filter === '30') {
          var diff = (now - parseEntryDate(e)) / (1000 * 60 * 60 * 24);
          return diff <= 30;
        }
        if (filter === '60') {
          var diff2 = (now - parseEntryDate(e)) / (1000 * 60 * 60 * 24);
          return diff2 <= 60;
        }
        if (['2023','2024','2025','2026'].indexOf(filter) !== -1) {
          return parseEntryDate(e).getFullYear().toString() === filter;
        }
        return true;
      });
      if (sort === 'oldest') result.sort(function(a,b) { return parseEntryDate(a) - parseEntryDate(b); });
      else if (sort === 'longest') {
        result.sort(function(a,b) {
          function toSec(d) { var p = (d||'0:0:0').split(':'); return (+p[0])*3300+(+p[1])*60+(+p[2]); }
          return toSec(b.duration) - toSec(a.duration);
        });
      } else {
        result.sort(function(a,b) { return parseEntryDate(b) - parseEntryDate(a); });
      }
      return result;
    }

    var _view   = 'all';
    var _sort   = 'newest';
    var _filter = 'all';

    var wrapper = document.createElement('div');
    wrapper.id = RYU_GAL_INJECTED_ID;

    function getFilterLabel() {
      if (_filter === '30') return 'LAST 30 DAYS';
      if (_filter === '60') return 'LAST 60 DAYS';
      if (['2023','2024','2025','2026'].indexOf(_filter) !== -1) return _filter;
      return 'ALL TIME';
    }

    function buildGrid(entries) {
      return entries.map(function(e) {
        return '<div class="ryu-gal-card' + (e.isFav ? ' ryu-gal-fav' : '') + '" data-id="' + e.id + '">' +
          '<div class="ryu-gal-card-icon">' +
            '<div class="ryu-gal-card-play-icon"></div>' +
          '</div>' +
          '<div class="ryu-gal-card-info">' +
            '<div class="ryu-gal-card-name">' + e.name + '</div>' +
            '<div class="ryu-gal-card-meta">' +
              '<span>📅 ' + e.date + '</span>' +
              '<span>⏱ ' + (e.duration || '00:00:00') + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="ryu-gal-card-fav-btn' + (e.isFav ? ' on' : '') + '" data-action="fav">★</button>' +
          '<div class="ryu-gal-card-actions">' +
            '<button class="ryu-gal-btn-play" data-action="play">▶ PLAY</button>' +
            '<button class="ryu-gal-btn-icon" data-action="rename" title="Rename">✎</button>' +
            '<button class="ryu-gal-btn-icon" data-action="save" title="Save">↓</button>' +
            '<button class="ryu-gal-btn-icon ryu-gal-btn-delete" data-action="delete" title="Delete">✕</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function buildSidebarItems(totalFavs, totalAll) {
      var items = [
        { key: 'all',  label: 'ALL',        count: totalAll  },
        { key: 'favs', label: '★ FAVORITES', count: totalFavs }
      ];
      var sorts   = [{ key: 'newest', label: 'Newest' }, { key: 'oldest', label: 'Oldest' }];
      var filters = [{ key: 'all', label: 'All Time' }, { key: '30', label: 'Last 30 Days' }, { key: '60', label: 'Last 60 Days' }];
      var years   = ['2026','2025','2024','2023'];

      var html = '<div class="ryu-gal-sb-label">VIEW</div>';
      items.forEach(function(it) {
        html += '<div class="ryu-gal-sb-item' + (_view === it.key ? ' active' : '') + '" data-view="' + it.key + '">' + it.label + '<span class="ryu-gal-sb-count">' + it.count + '</span></div>';
      });
      html += '<div class="ryu-gal-sb-divider"></div><div class="ryu-gal-sb-label">SORT</div>';
      sorts.forEach(function(it) {
        html += '<div class="ryu-gal-sb-item' + (_sort === it.key ? ' active' : '') + '" data-sort="' + it.key + '">' + it.label + '</div>';
      });
      html += '<div class="ryu-gal-sb-divider"></div><div class="ryu-gal-sb-label">FILTER</div>';
      filters.forEach(function(it) {
        html += '<div class="ryu-gal-sb-item' + (_filter === it.key ? ' active' : '') + '" data-filter="' + it.key + '">' + it.label + '</div>';
      });
      html += '<div class="ryu-gal-sb-divider"></div><div class="ryu-gal-sb-label">YEAR</div>';
      years.forEach(function(y) {
        html += '<div class="ryu-gal-sb-item' + (_filter === y ? ' active' : '') + '" data-filter="' + y + '">' + y + '</div>';
      });
      return html;
    }

    function renderUI() {
      var allEntries = getEntries();
      var favCount   = allEntries.filter(function(e) { return e.isFav; }).length;
      var displayed  = filterAndSort(allEntries, _view, _sort, _filter);

      wrapper.innerHTML =
        '<div id="ryu-gal-header">' +
          '<div style="display:flex;align-items:center;gap:20px;">' +
            '<span id="ryu-gal-title">REPLAYS</span>' +
            '<div style="width:1px;height:14px;background:rgba(34,211,238,0.15);"></div>' +
            '<span style="font-size:8px;font-weight:300;letter-spacing:2px;color:rgba(34,211,238,0.4);">' + displayed.length + ' SHOWN</span>' +
          '</div>' +
          '<button id="ryu-gal-back-btn">← BACK [ESC]</button>' +
        '</div>' +
        '<div id="ryu-gal-body">' +
          '<div id="ryu-gal-sidebar">' + buildSidebarItems(favCount, allEntries.length) + '</div>' +
          '<div id="ryu-gal-grid-wrap">' + buildGrid(displayed) + '</div>' +
        '</div>' +
        '<div id="ryu-gal-footer">' + displayed.length + ' REPLAYS · ' + getFilterLabel() + '</div>';

      document.body.appendChild(wrapper);
      wrapper.classList.add('ryu-gal-visible');
      wireGalUI(displayed);
    }

    function refreshGrid() {
      var allEntries = getEntries();
      var favCount   = allEntries.filter(function(e) { return e.isFav; }).length;
      var displayed  = filterAndSort(allEntries, _view, _sort, _filter);

      var grid = document.getElementById('ryu-gal-grid-wrap');
      if (grid) grid.innerHTML = buildGrid(displayed);

      var footer = document.getElementById('ryu-gal-footer');
      if (footer) footer.textContent = displayed.length + ' REPLAYS · ' + getFilterLabel();

      var shown = wrapper.querySelector('#ryu-gal-header span:last-child');
      if (shown) shown.textContent = displayed.length + ' SHOWN';

      var sidebar = document.getElementById('ryu-gal-sidebar');
      if (sidebar) sidebar.innerHTML = buildSidebarItems(favCount, allEntries.length);

      wireGalUI(displayed);
    }

    function showRenameOverlay(entry) {
      var existing = document.getElementById('ryu-gal-rename-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.id = 'ryu-gal-rename-overlay';
      overlay.innerHTML =
        '<div id="ryu-gal-rename-box">' +
          '<div id="ryu-gal-rename-title">RENAME REPLAY</div>' +
          '<input id="ryu-gal-rename-input" value="' + entry.name.replace(/"/g, '&quot;') + '" spellcheck="false">' +
          '<div class="ryu-gal-rename-btns">' +
            '<button class="ryu-gal-rename-btn confirm" id="ryu-gal-rename-confirm">SAVE</button>' +
            '<button class="ryu-gal-rename-btn cancel" id="ryu-gal-rename-cancel">CANCEL</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      var input = document.getElementById('ryu-gal-rename-input');
      if (input) { input.focus(); input.select(); }

      function doSave() {
        var val = (input ? input.value.trim() : '') || entry.id;
        var names = loadNames();
        names[entry.id] = val;
        saveNames(names);
        overlay.remove();
        refreshGrid();
      }

      document.getElementById('ryu-gal-rename-confirm').addEventListener('click', doSave);
      document.getElementById('ryu-gal-rename-cancel').addEventListener('click', function() { overlay.remove(); });
      if (input) input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doSave();
        if (e.key === 'Escape') { e.stopPropagation(); overlay.remove(); }
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function wireGalUI(displayed) {
      // sidebar
      var sidebar = document.getElementById('ryu-gal-sidebar');
      if (sidebar) {
        sidebar.querySelectorAll('[data-view]').forEach(function(el) {
          el.addEventListener('click', function() { _view = el.getAttribute('data-view'); refreshGrid(); });
        });
        sidebar.querySelectorAll('[data-sort]').forEach(function(el) {
          el.addEventListener('click', function() { _sort = el.getAttribute('data-sort'); refreshGrid(); });
        });
        sidebar.querySelectorAll('[data-filter]').forEach(function(el) {
          el.addEventListener('click', function() { _filter = el.getAttribute('data-filter'); refreshGrid(); });
        });
      }

      // card actions
      var grid = document.getElementById('ryu-gal-grid-wrap');
      if (grid) {
        grid.querySelectorAll('.ryu-gal-card').forEach(function(card, idx) {
          var entry = displayed[idx];
          if (!entry) return;

          // play
          card.querySelectorAll('[data-action="play"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var existing = document.getElementById('ryu-gal-play-confirm');
              if (existing) existing.remove();
              var overlay = document.createElement('div');
              overlay.id = 'ryu-gal-play-confirm';
              overlay.style.cssText = 'position:fixed;inset:0;background:rgba(9,13,18,0.88);display:flex;align-items:center;justify-content:center;z-index:100002;';
              overlay.innerHTML =
                '<div style="background:#111820;border:1px solid rgba(34,211,238,0.25);padding:32px 40px;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:440px;text-align:center;">' +
                  '<div style="font-size:9px;font-weight:300;letter-spacing:4px;color:rgba(255,255,255,0.4);font-family:\'Titillium Web\',sans-serif;">PLAY REPLAY</div>' +
                  '<div style="font-size:13px;font-weight:300;color:#fff;font-family:\'Titillium Web\',sans-serif;">' + entry.name + '</div>' +
                  '<div style="font-size:11px;color:rgba(255,255,255,0.4);font-family:\'Titillium Web\',sans-serif;line-height:1.6;">You will be disconnected from the game server.</div>' +
                  '<div style="display:flex;gap:10px;margin-top:4px;">' +
                    '<button id="ryu-gal-play-yes" style="padding:9px 28px;background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.4);color:#22d3ee;font-size:9px;font-weight:300;letter-spacing:2px;cursor:pointer;font-family:\'Titillium Web\',sans-serif;">YES</button>' +
                    '<button id="ryu-gal-play-no" style="padding:9px 28px;background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);font-size:9px;font-weight:300;letter-spacing:2px;cursor:pointer;font-family:\'Titillium Web\',sans-serif;">CANCEL</button>' +
                  '</div>' +
                '</div>';
              document.body.appendChild(overlay);

              document.getElementById('ryu-gal-play-yes').addEventListener('click', function() {
                overlay.remove();
                _clipPlayed = true;
                // Hide our UI panels
                var ow = document.getElementById(RYU_GAL_INJECTED_ID);
                if (ow) ow.style.setProperty('display', 'none', 'important');
                var menuPanel = document.getElementById('ryu-menu-ui');
                var menuBackdrop = document.getElementById('ryu-menu-backdrop');
                var teamBox = document.getElementById('ryu-team-box');
                if (menuBackdrop) menuBackdrop.style.setProperty('display', 'none', 'important');
                if (teamBox) teamBox.style.setProperty('display', 'none', 'important');
                // Click native play button
                var playBtn = entry.nativeEl.querySelector('.iconfont-play');
                if (playBtn) {
                  playBtn.click();
                  setTimeout(function() {
                    var yes = document.getElementById('gl-alert-yes');
                    if (yes) yes.click();

                  }, 50);
                }
              });
              document.getElementById('ryu-gal-play-no').addEventListener('click', function() { overlay.remove(); });
              overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
            });
          });

          // fav
          card.querySelectorAll('[data-action="fav"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var favs = loadFavs();
              var i = favs.indexOf(entry.id);
              if (i === -1) {
                favs.push(entry.id);
                if (globalThis.__ryuShowToast) globalThis.__ryuShowToast('FAVORITED', 'fav');
              } else {
                favs.splice(i, 1);
                if (globalThis.__ryuShowToast) globalThis.__ryuShowToast('UNFAVORITED', 'unfav');
              }
              saveFavs(favs);
              refreshGrid();
            });
          });

          // rename
          card.querySelectorAll('[data-action="rename"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              showRenameOverlay(entry);
            });
          });

          // export raw binary as .ryu file
          card.querySelectorAll('[data-action="save"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var dbReq = indexedDB.open('Gallery', 1);
              dbReq.addEventListener('success', function() {
                var keysReq = dbReq.result.transaction('clips', 'readonly').objectStore('clips').getAllKeys();
                keysReq.addEventListener('success', function() {
                  var fullKey = keysReq.result.find(function(k) { return k.indexOf(entry.id) !== -1; });
                  if (!fullKey) return;
                  var getReq = dbReq.result.transaction('clips', 'readonly').objectStore('clips').get(fullKey);
                  getReq.addEventListener('success', function() {
                    var buf = getReq.result;
                    if (!buf) return;
                    var filename = entry.name.replace(/[^a-z0-9_\-]/gi, '_') + '.ryu';
                    var blob = new Blob([buf], { type: 'application/octet-stream' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url; a.download = filename;
                    document.body.appendChild(a); a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  });
                });
              });
            });
          });

          // delete
          card.querySelectorAll('[data-action="delete"]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var existing = document.getElementById('ryu-gal-delete-confirm');
              if (existing) existing.remove();
              var overlay = document.createElement('div');
              overlay.id = 'ryu-gal-delete-confirm';
              overlay.style.cssText = 'position:fixed;inset:0;background:rgba(9,13,18,0.88);display:flex;align-items:center;justify-content:center;z-index:100002;';
              overlay.innerHTML =
                '<div style="background:#111820;border:1px solid rgba(220,60,60,0.3);padding:32px 40px;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:440px;text-align:center;">' +
                  '<div style="font-size:9px;font-weight:300;letter-spacing:4px;color:rgba(220,80,80,0.7);font-family:\'Titillium Web\',sans-serif;">DELETE REPLAY</div>' +
                  '<div style="font-size:13px;font-weight:300;color:#fff;font-family:\'Titillium Web\',sans-serif;">' + entry.name + '</div>' +
                  '<div style="font-size:11px;color:rgba(255,255,255,0.4);font-family:\'Titillium Web\',sans-serif;line-height:1.6;">This clip will be permanently deleted.</div>' +
                  '<div style="display:flex;gap:10px;margin-top:4px;">' +
                    '<button id="ryu-gal-delete-yes" style="padding:9px 28px;background:rgba(220,60,60,0.12);border:1px solid rgba(220,60,60,0.4);color:rgba(220,80,80,0.9);font-size:9px;font-weight:300;letter-spacing:2px;cursor:pointer;font-family:\'Titillium Web\',sans-serif;">DELETE</button>' +
                    '<button id="ryu-gal-delete-no" style="padding:9px 28px;background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);font-size:9px;font-weight:300;letter-spacing:2px;cursor:pointer;font-family:\'Titillium Web\',sans-serif;">CANCEL</button>' +
                  '</div>' +
                '</div>';
              document.body.appendChild(overlay);
              document.getElementById('ryu-gal-delete-yes').addEventListener('click', function() {
                overlay.remove();
                var delBtn = entry.nativeEl.querySelector('.iconfont-delete');
                if (delBtn) {
                  delBtn.click();
                  setTimeout(function() {
                    var yes = document.getElementById('gl-alert-yes');
                    if (yes) yes.click();
                    setTimeout(refreshGrid, 300);
                  }, 50);
                }
              });
              document.getElementById('ryu-gal-delete-no').addEventListener('click', function() { overlay.remove(); });
              overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
            });
          });
        });
      }

      // back button
      var backBtn = document.getElementById('ryu-gal-back-btn');
      if (backBtn) backBtn.addEventListener('click', function() { closeReplaysWrapper(); });
    }

    _galMenuOpen = true;

    // watch for native gallery close
    var galObserver = new MutationObserver(function() {
      var cs = window.getComputedStyle(galEl);
      if (_galMenuOpen && cs.display === 'none') {
        _galMenuOpen = false;
        closeReplaysWrapper();
      }
    });
    galObserver.observe(galEl, { attributes: true, attributeFilter: ['style'] });
    globalThis.__ryuGalObserver = galObserver;

    // ESC handler
    var _clipPlayed = false;
    function onGalEsc(e) {
      if (e.key === 'Escape') {
        if (document.getElementById('ryu-gal-rename-overlay')) return;
        if (document.getElementById('ryu-gal-play-confirm')) return;
        if (document.getElementById('ryu-gal-delete-confirm')) return;
        if (document.getElementById('ryu-clip-editor')) return;
        e.preventDefault(); e.stopPropagation();
        document.removeEventListener('keydown', onGalEsc, true);
        if (_clipPlayed) {
          _clipPlayed = false;
          // Disconnect observer so gallery closing doesn't trigger closeReplaysWrapper (which removes playbar)
          if (globalThis.__ryuGalObserver) globalThis.__ryuGalObserver.disconnect();
          var nativeBtn = document.getElementById('mame-trb-replays-btn');
          if (nativeBtn) nativeBtn.click();
          var attempts2 = 0;
          var poll2 = setInterval(function() {
            attempts2++;
            if (document.querySelectorAll('.gl-entry').length > 0 || attempts2 > 20) {
              clearInterval(poll2);
              injectReplaysRedesign();
            }
          }, 100);
        } else {
          closeReplaysWrapper();
        }
      }
    }
    document.addEventListener('keydown', onGalEsc, true);

    renderUI();
  }

  // expose globally so interface.js can call them
  globalThis.injectReplaysStyle    = injectReplaysStyle;
  globalThis.injectReplaysRedesign = injectReplaysRedesign;

})();
/* ============================================================
   RYUTEN WEBM REPLAY RECORDER
   - Records the live game canvas to a .webm video file
   - Toggle with an assignable hotkey (default: F8)
   - Hotkey is rebindable from Settings > CONTROLS section
   ============================================================ */
(function() {
  'use strict';

  var REC_KEY_LS   = 'Jax-V5WebmRecorderKey_v1';
  var REC_FPS_LS   = 'Jax-V5WebmRecorderFps_v1';
  var DEFAULT_KEY  = 'F8';            // unused key by default
  var _recorder    = null;
  var _chunks      = [];
  var _recording   = false;
  var _stream      = null;
  var _startTime   = 0;
  var _timerInt    = null;

  function getKey() {
    try { return (localStorage.getItem(REC_KEY_LS) || DEFAULT_KEY); } catch(e) { return DEFAULT_KEY; }
  }
  function setKey(k) {
    try { localStorage.setItem(REC_KEY_LS, k || ''); } catch(e) {}
  }
  function getFps() {
    try { var v = parseInt(localStorage.getItem(REC_FPS_LS), 10); return (v && v > 0) ? v : 144; } catch(e) { return 144; }
  }

  function findCanvas() {
    return document.getElementById('gameCanvas') ||
           document.querySelector('canvas.game-canvas') ||
           document.querySelector('canvas');
  }

  function pickMime() {
    var candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
    }
    return 'video/webm';
  }

  function toast(msg, color) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:1000000;' +
      'background:rgba(12,14,22,0.95);border:1px solid ' + (color || 'rgba(34,211,238,0.4)') + ';' +
      'color:#fff;font-family:"Titillium Web",sans-serif;font-size:12px;font-weight:300;letter-spacing:1px;' +
      'padding:10px 20px;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,0.6);pointer-events:none;';
    document.body.appendChild(t);
    setTimeout(function() { t.style.transition = 'opacity 0.4s'; t.style.opacity = '0'; }, 1800);
    setTimeout(function() { t.remove(); }, 2300);
  }

  function showIndicator() {
    var ind = document.getElementById('ryu-rec-indicator');
    if (ind) return;
    ind = document.createElement('div');
    ind.id = 'ryu-rec-indicator';
    ind.style.cssText = 'position:fixed;top:16px;right:16px;z-index:1000000;display:flex;align-items:center;gap:8px;' +
      'background:rgba(12,14,22,0.9);border:1px solid rgba(232,25,44,0.5);border-radius:20px;padding:6px 14px;' +
      'font-family:"Titillium Web",sans-serif;font-size:12px;font-weight:300;letter-spacing:1px;color:#fff;pointer-events:none;';
    ind.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background:#e8192c;display:inline-block;' +
      'animation:ryuRecBlink 1s steps(2,start) infinite;"></span><span id="ryu-rec-time">REC 0:00</span>';
    if (!document.getElementById('ryu-rec-kf')) {
      var st = document.createElement('style');
      st.id = 'ryu-rec-kf';
      st.textContent = '@keyframes ryuRecBlink{50%{opacity:0.15;}}';
      document.head.appendChild(st);
    }
    document.body.appendChild(ind);
  }
  function hideIndicator() {
    var ind = document.getElementById('ryu-rec-indicator');
    if (ind) ind.remove();
  }
  function updateTime() {
    var el = document.getElementById('ryu-rec-time');
    if (!el) return;
    var s = Math.floor((Date.now() - _startTime) / 1000);
    el.textContent = 'REC ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function startRecording() {
    if (_recording) return;
    if (!window.MediaRecorder) { toast('Recording not supported in this browser', 'rgba(232,25,44,0.5)'); return; }
    var canvas = findCanvas();
    if (!canvas || typeof canvas.captureStream !== 'function') {
      toast('Game canvas not found', 'rgba(232,25,44,0.5)');
      return;
    }
    try {
      _stream = canvas.captureStream(getFps());
    } catch (e) {
      toast('Could not capture canvas', 'rgba(232,25,44,0.5)');
      return;
    }
    var mime = pickMime();
    try {
      _recorder = new MediaRecorder(_stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
    } catch (e) {
      try { _recorder = new MediaRecorder(_stream); } catch (e2) {
        toast('Recorder init failed', 'rgba(232,25,44,0.5)');
        return;
      }
    }
    _chunks = [];
    _recorder.addEventListener('dataavailable', function(ev) {
      if (ev.data && ev.data.size > 0) _chunks.push(ev.data);
    });
    _recorder.addEventListener('stop', function() {
      var blob = new Blob(_chunks, { type: 'video/webm' });
      _chunks = [];
      if (_stream) { _stream.getTracks().forEach(function(tr) { tr.stop(); }); _stream = null; }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      var d = new Date();
      var stamp = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') +
                  '_' + String(d.getHours()).padStart(2,'0') + '-' + String(d.getMinutes()).padStart(2,'0') + '-' + String(d.getSeconds()).padStart(2,'0');
      a.href = url;
      a.download = 'jax-replay_' + stamp + '.webm';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() { a.remove(); URL.revokeObjectURL(url); }, 1500);
      toast('Replay saved (.webm)', 'rgba(34,211,238,0.5)');
    });
    _recorder.start(1000); // gather data in 1s chunks
    _recording = true;
    _startTime = Date.now();
    showIndicator();
    updateTime();
    _timerInt = setInterval(updateTime, 500);
    toast('Recording started \u2014 press ' + (getKey() || '?') + ' to stop', 'rgba(232,25,44,0.5)');
  }

  function stopRecording() {
    if (!_recording) return;
    _recording = false;
    if (_timerInt) { clearInterval(_timerInt); _timerInt = null; }
    hideIndicator();
    try { if (_recorder && _recorder.state !== 'inactive') _recorder.stop(); } catch (e) {}
  }

  function toggleRecording() {
    if (_recording) stopRecording(); else startRecording();
  }

  // expose for external triggers
  globalThis.ryuToggleReplayRecording = toggleRecording;

  // ---- global hotkey listener ----
  function isTyping() {
    var el = document.activeElement;
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  document.addEventListener('keydown', function(e) {
    var bind = getKey();
    if (!bind) return;
    if (isTyping()) return;
    if (e.repeat) return;
    var pressed = (e.key || '').toUpperCase();
    if (pressed === bind.toUpperCase()) {
      e.preventDefault();
      e.stopPropagation();
      toggleRecording();
    }
  }, true);

  // ============================================================
  //  Settings > CONTROLS  injected key-bind row
  // ============================================================
  function buildRecorderRow() {
    var row = document.createElement('div');
    row.className = 'ryu-sp-row';
    row.id = 'ryu-rec-setting-row';

    var lbl = document.createElement('div');
    lbl.className = 'ryu-sp-label';
    lbl.textContent = 'Replay Recorder (WebM)';
    row.appendChild(lbl);

    var ctrl = document.createElement('div');
    ctrl.className = 'ryu-sp-ctrl';

    var box = document.createElement('div');
    box.textContent = getKey() || '\u2014';
    box.title = 'Click then press a key to bind';
    box.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:4px 14px;min-width:60px;text-align:center;cursor:pointer;font-size:11px;font-weight:300;color:rgba(255,255,255,0.82);letter-spacing:1px;font-family:"Titillium Web",sans-serif;user-select:none;transition:all 0.15s;';

    var listening = false;
    box.addEventListener('click', function() {
      if (listening) return;
      listening = true;
      box.textContent = '...';
      box.style.borderColor = 'rgba(255,255,255,0.2)';
      box.style.background = 'rgba(255,255,255,0.10)';
      function onKey(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        listening = false;
        document.removeEventListener('keydown', onKey, true);
        var k = ev.key.toUpperCase();
        if (k === 'ESCAPE') {
          box.textContent = getKey() || '\u2014';
        } else {
          setKey(ev.key.length === 1 ? ev.key.toUpperCase() : ev.key);
          box.textContent = getKey();
        }
        box.style.borderColor = 'rgba(255,255,255,0.12)';
        box.style.background = 'rgba(255,255,255,0.06)';
      }
      document.addEventListener('keydown', onKey, true);
    });

    var clear = document.createElement('div');
    clear.textContent = '\u2715';
    clear.style.cssText = 'margin-left:5px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.3);font-size:10px;border-radius:3px;transition:all 0.15s;flex-shrink:0;';
    clear.addEventListener('mouseenter', function() { clear.style.color = '#e8192c'; clear.style.background = 'rgba(232,25,44,0.1)'; });
    clear.addEventListener('mouseleave', function() { clear.style.color = 'rgba(255,255,255,0.3)'; clear.style.background = 'transparent'; });
    clear.addEventListener('click', function() { setKey(''); box.textContent = '\u2014'; });

    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;';
    wrap.appendChild(box);
    wrap.appendChild(clear);
    ctrl.appendChild(wrap);
    row.appendChild(ctrl);
    return row;
  }

  function maybeInjectControlsRow() {
    var content = document.getElementById('ryu-sp-content');
    if (!content) return;
    var activeTab = document.querySelector('.ryu-sp-tab.ryu-sp-tab-active');
    if (!activeTab || activeTab.getAttribute('data-tab') !== 'CONTROLS') return;
    if (document.getElementById('ryu-rec-setting-row')) return;
    var hdr = document.createElement('div');
    hdr.className = 'ryu-sp-section-hdr';
    hdr.textContent = 'REPLAY RECORDER';
    content.appendChild(hdr);
    content.appendChild(buildRecorderRow());
  }

  var _spObserver = new MutationObserver(function() { maybeInjectControlsRow(); });
  _spObserver.observe(document.body, { childList: true, subtree: true });
})();
