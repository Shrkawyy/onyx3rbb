/* ============================================================================
   onyx-custom.js — rregullime specifike për këtë build (ONYX × RYUTEN)
   ----------------------------------------------------------------------------
   Ngarkohet PARA motorit (deo.onyx) që cilësimet të lexohen që në fillim.

   QËLLIMI:
   1) "Everyone skins" = ON  → shfaq skinet e TË GJITHË lojtarëve në hartë.
   2) "URL skins"      = ON  → lejon skinet me URL (imgur) të lojtarëve të tjerë.
   3) THEME "ryuten" (gold/amber) për pamjen IN-GAME të lojtarit:
      kufijtë e qelizës, emri, masa, ushqimi, minimap, unaza e multibox-it —
      të gjitha në paletën gold të ryuten. Aplikohet NJË herë (me flamur),
      që lojtari të mund t'i ndryshojë vetë më pas pa u mbishkruar.

   Motori i ruan cilësimet te localStorage me prefiks 'ONYXPROD540-':
     - 'ONYXPROD540-settings' (toggles)
     - 'ONYXPROD540-theme'    (ngjyrat) → çelësat = id-të e color picker-ave.
   Bëjmë merge jo-shkatërrues (nuk prekim cilësimet e tjera ekzistuese).
   ============================================================================ */
(function () {
  'use strict';

  var PREFIX = 'ONYXPROD540-';
  var SETTINGS_KEY = PREFIX + 'settings';
  var THEME_KEY = PREFIX + 'theme';
  var FLAG_KEY = PREFIX + 'ryutenTheme';   // flamur: theme-i gold u aplikua njëherë

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function writeJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }

  /* 1) Skinet e të gjithëve + URL skins = ON
     Multibox Cell Color = ON që ngjyra e picker-it të shkojë te qeliza e botit. */
  function ensureSkinSettings() {
    var s = readJSON(SETTINGS_KEY);
    var changed = false;
    if (s.everyoneSkins !== 'on') { s.everyoneSkins = 'on'; changed = true; }
    if (s.urlSkins !== 'on') { s.urlSkins = 'on'; changed = true; }
    if (s.multiboxCellColor !== 'on') { s.multiboxCellColor = 'on'; changed = true; }
    if (changed) writeJSON(SETTINGS_KEY, s);
  }

  /* Picker-at e MultiBox duhet të jenë <input> të pastër PARA motorit.
     HTML-ja e ruajtur kishte widget minicolors të ngrirë — ndryshimi i ngjyrës
     nuk i shkonte saveTheme, prandaj boti mbante ngjyrën e vjetër. */
  function unwrapMultiboxPickers() {
    ['multiboxActive', 'multiboxInactive'].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      var options = input.closest ? input.closest('.theme-options') : null;
      if (!options) {
        var p = input.parentNode;
        while (p && p !== document.body) {
          if (p.classList && p.classList.contains('theme-options')) { options = p; break; }
          p = p.parentNode;
        }
      }
      if (!options) return;
      var nested = options.querySelector('.minicolors-panel') || options.querySelector('.minicolors-swatch');
      if (!nested && options.children.length === 1 && input.tagName === 'INPUT') return;
      var opacity = input.getAttribute('opacity') || '0';
      var val = input.value || '';
      options.innerHTML = '';
      var fresh = document.createElement('input');
      fresh.id = id;
      fresh.setAttribute('opacity', opacity);
      if (val) fresh.value = val;
      options.appendChild(fresh);
    });
  }
  unwrapMultiboxPickers();

  /* 2) Paleta GOLD/amber e ryuten për pamjen in-game (çelësat = id-të e theme-it) */
  var RYUTEN_GOLD = {
    borderColor:       '#e0a82e',  // kufiri i qelizës — theksi kryesor gold i ryuten
    borderGlow:        '#ffcb3d',
    gridColor:         '#1a1a20',  // grid i errët, i butë
    gridTextColor:     '#26262e',
    nickColor:         '#f5e6c8',  // emrat ngjyrë krem e ngrohtë
    nickStrokeColor:   '#15100a',
    massColor:         '#e0a82e',  // masa gold
    massStrokeColor:   '#15100a',
    foodColor:         '#e0a82e',  // ushqimi gold (mono-colored)
    foodGlow:          '#ffcb3d',
    virusGlow:         '#ffcb3d',
    virusBorderColor:  '#e0a82e',
    backgroundColor:   '#0e0e12',  // sfond i errët si ryuten
    waveColor:         '#e0a82e',
    cursorLineColor:   '#e0a82e',
    selfColor:         '#e0a82e',  // vetja në minimap — gold
    selfViewportColor: '#e0a82e',
    teammateNameColor: '#ffcb3d',
    lbColor:           '#e0a82e'   // titulli i leaderboard-it gold
  };

  function ensureRyutenTheme() {
    if (localStorage.getItem(FLAG_KEY) === '1') return;  // u aplikua më parë → mos prek
    var t = readJSON(THEME_KEY);
    for (var k in RYUTEN_GOLD) {
      if (RYUTEN_GOLD.hasOwnProperty(k) && t[k] === undefined) t[k] = RYUTEN_GOLD[k];
    }
    writeJSON(THEME_KEY, t);
    try { localStorage.setItem(FLAG_KEY, '1'); } catch (e) {}
  }

  ensureSkinSettings();
  ensureRyutenTheme();

  /* Default new FFA host so deo finishUp does not overwrite the menu with eu.senpa.io:2001 */
  (function seedFfaExtras() {
    var host = 'eu1.senpa.io:7101';
    try {
      var sel = document.getElementById('servers');
      if (sel && sel.value) host = sel.value === 'ffa-eu' ? 'eu1.senpa.io:7101' : sel.value;
    } catch (_) {}
    var key = PREFIX + 'extras';
    var extras = readJSON(key);
    var migrateKey = PREFIX + 'ffaHostV19';
    var migrated = false;
    try { migrated = localStorage.getItem(migrateKey) === '1'; } catch (_) {}
    var stale = !extras.server || extras.server === 'ffa-eu' || String(extras.server).indexOf('ffa:') === 0;
    if (!migrated || stale) {
      extras.server = host;
      writeJSON(key, extras);
      try { localStorage.setItem(migrateKey, '1'); } catch (_) {}
    }
  })();
})();
