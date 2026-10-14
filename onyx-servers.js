/* Official Senpa v4 server catalogue. No sockets or authentication requests. */
(function (global) {
  'use strict';
  var trackerUrl = 'https://api.senpa.io/tracker';
  var defaults = [
    { id: 'ffa-eu', name: 'Nemesis', mode: 'ffa', mode_name: 'Free For All', host: 'eu1.senpa.io:7101' },
    { id: 'dual-eu', name: 'Zephyr', mode: 'dual', mode_name: 'Dual', host: 'eu1.senpa.io:7106' },
    { id: 'mega-eu', name: 'WindBine', mode: 'megasplit2', mode_name: 'MegaSplitX', host: 'eu1.senpa.io:7112' }
  ];
  var entries = defaults.map(function (entry) { return Object.assign({ region: 'EU', version: '4.0.0' }, entry); });
  var aliases = { 'eu.senpa.io:2001': 'ffa-eu', 'eu.senpa.io:1200': 'dual-eu', 'eu.senpa.io:9999': 'mega-eu' };
  var pending = null;

  function find(value) {
    value = String(value || '').trim();
    value = aliases[value] || value;
    return entries.find(function (entry, index) {
      return value === entry.id || value === entry.host || value === defaults[index].host;
    }) || null;
  }

  function mapHost(value) {
    var entry = find(value);
    return entry ? entry.host : String(value || '').trim();
  }

  function list() { return entries.map(function (entry) { return Object.assign({}, entry); }); }

  function applyTracker(rows) {
    if (!Array.isArray(rows)) throw new Error('Invalid Senpa tracker response');
    entries = defaults.map(function (fallback, index) {
      var row = rows.find(function (item) {
        return item && item.region === 'EU' && item.name === fallback.name && item.mode === fallback.mode;
      });
      if (!row || !/^[a-z0-9-]+\.senpa\.io:\d{2,5}$/i.test(row.host || '') || row.version !== '4.0.0') {
        return Object.assign({}, entries[index], { live: false });
      }
      var port = Number(row.host.split(':')[1]);
      if (port < 1 || port > 65535) return Object.assign({}, entries[index], { live: false });
      return Object.assign({}, fallback, {
        host: row.host, region: 'EU', version: row.version, live: true,
        players: Number.isInteger(row.num_players) && row.num_players >= 0 ? row.num_players : null,
        capacity: Number.isInteger(row.max_players) && row.max_players > 0 ? row.max_players : null
      });
    });
    return list();
  }

  function render(select, selectedId) {
    if (!select) return;
    var old = find(select.value);
    selectedId = selectedId || (old && old.id) || 'ffa-eu';
    var fragment = document.createDocumentFragment();
    entries.forEach(function (entry) {
      var option = document.createElement('option');
      option.value = entry.host;
      option.textContent = entry.name + ' — ' + entry.mode_name +
        (entry.live && entry.players !== null && entry.capacity !== null ? ' (' + entry.players + '/' + entry.capacity + ')' : '');
      option.dataset.onyxId = entry.id;
      option.dataset.onyxHost = entry.host;
      option.dataset.onyxType = entry.mode;
      option.dataset.onyxProtocol = 'senpa-v4';
      option.selected = entry.id === selectedId;
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
    // Refreshing population counts must not trigger the engine's change/reconnect handler.
  }

  async function refresh() {
    if (pending) return pending;
    pending = (async function () {
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 8000);
      try {
        var response = await global.fetch(trackerUrl, { credentials: 'omit', cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Senpa tracker HTTP ' + response.status);
        var select = global.document && document.getElementById('servers');
        var selected = select && find(select.value);
        applyTracker(await response.json());
        render(select, selected && selected.id);
        return list();
      } finally { clearTimeout(timer); }
    })();
    try { return await pending; } finally { pending = null; }
  }

  global.ONYXServers = { list: list, find: find, mapHost: mapHost, refresh: refresh, applyTracker: applyTracker };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ONYXServers;
  if (global.document) {
    function boot() {
      render(document.getElementById('servers'));
      refresh().catch(function () { console.warn('[ONYX] Live server list unavailable; using last known addresses.'); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
