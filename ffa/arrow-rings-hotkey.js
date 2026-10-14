// ============================================================
//  Arrow Rings — hotkey + Settings > CONTROLS key-bind row
//  (mirrors the existing Replay Recorder hotkey pattern)
// ============================================================
(function() {
  var STORAGE_KEY = 'ryuArrowRingsHotkey';

  function getKey() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (e) { return ''; }
  }
  function setKey(k) {
    try { localStorage.setItem(STORAGE_KEY, k || ''); } catch (e) {}
  }

  function isTyping() {
    var el = document.activeElement;
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function toggleArrowRings() {
    try {
      if (window.app && window.app.settings) {
        var cur = !!window.app.settings.get('arrowRingsEnabled');
        window.app.settings.set('arrowRingsEnabled', !cur);
        // keep the Theme-tab toggle switch in sync if it's currently visible
        var sw = document.querySelector('[data-setting="arrowRingsEnabled"] input, #arrowRingsEnabled');
        if (sw && sw.type === 'checkbox') sw.checked = !cur;
      }
    } catch (e) {}
  }

  // ---- global hotkey listener ----
  document.addEventListener('keydown', function(e) {
    var bind = getKey();
    if (!bind) return;
    if (isTyping()) return;
    if (e.repeat) return;
    var pressed = (e.key || '').toUpperCase();
    if (pressed === bind.toUpperCase()) {
      e.preventDefault();
      e.stopPropagation();
      toggleArrowRings();
    }
  }, true);

  // ============================================================
  //  Settings > CONTROLS  injected key-bind row
  // ============================================================
  function buildArrowRingsRow() {
    var row = document.createElement('div');
    row.className = 'ryu-sp-row';
    row.id = 'ryu-arrow-rings-setting-row';

    var lbl = document.createElement('div');
    lbl.className = 'ryu-sp-label';
    lbl.textContent = 'Toggle Arrow Rings';
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
    if (document.getElementById('ryu-arrow-rings-setting-row')) return;
    var hdr = document.createElement('div');
    hdr.className = 'ryu-sp-section-hdr';
    hdr.textContent = 'ARROW RINGS';
    content.appendChild(hdr);
    content.appendChild(buildArrowRingsRow());
  }

  var _arObserver = new MutationObserver(function() { maybeInjectControlsRow(); });
  _arObserver.observe(document.body, { childList: true, subtree: true });
})();
