/* ONYX 3rb-only server catalogue. Uses the public 3rb discovery endpoint. */
(function (global) {
  'use strict';
  var endpoint = 'https://3rb.io/php/Servers.php';
  var entries = [];
  var pending = null;
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function normalize(data) {
    if (!data || typeof data.ip !== 'string' || !data.modes) throw new Error('Invalid 3rb server discovery response');
    var out = [];
    Object.keys(data.modes).forEach(function (mode) {
      var group = data.modes[mode] || {};
      (Array.isArray(group.servers) ? group.servers : []).forEach(function (row) {
        var port = Number(row && row.port);
        if (!Number.isInteger(port) || port < 1 || port > 65535) return;
        out.push({
          id: '3rb-' + slug(mode) + '-' + port,
          name: String(row.name || (mode + ' ' + port)), mode: mode,
          mode_name: mode, host: data.ip.trim(), port: port,
          url: 'wss://' + data.ip.trim() + ':' + port + '/V5',
          players: Number.isInteger(row.count) ? row.count : null,
          capacity: Number.isInteger(group.max) ? group.max : null,
          region: String(data.region || 'NA'), protocol: '3rb-v5'
        });
      });
    });
    return out;
  }
  function find(value) { value = String(value || '').trim(); return entries.find(function (e) { return value === e.id || value === e.host + ':' + e.port || value === e.url || value === String(e.port); }) || null; }
  function mapHost(value) { var e = find(value); return e ? e.host + ':' + e.port : String(value || '').trim(); }
  function render(select, selected) {
    if (!select) return;
    var old = find(selected || select.value), fragment = document.createDocumentFragment();
    entries.forEach(function (e) { var option = document.createElement('option'); option.value = e.id; option.textContent = e.name + ' — ' + e.mode + (e.players !== null && e.capacity !== null ? ' (' + e.players + '/' + e.capacity + ')' : ''); option.dataset.onyxId = e.id; option.dataset.onyxHost = e.host + ':' + e.port; option.dataset.onyxType = e.mode; option.dataset.onyxProtocol = '3rb-v5'; option.selected = old ? e.id === old.id : e === entries[0]; fragment.appendChild(option); });
    select.replaceChildren(fragment);
  }
  async function refresh() {
    if (pending) return pending;
    pending = fetch(endpoint, { credentials: 'omit', cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('3rb discovery HTTP ' + r.status); return r.json(); }).then(function (data) { entries = normalize(data); render(document.getElementById('servers')); return list(); });
    try { return await pending; } finally { pending = null; }
  }
  function list() { return entries.map(function (e) { return Object.assign({}, e); }); }
  global.ONYXServers = { list: list, find: find, mapHost: mapHost, refresh: refresh, applyTracker: function (data) { entries = normalize(data); return list(); }, provider: '3rb' };
  if (global.document) { function boot() { refresh().catch(function (e) { console.warn('[ONYX 3RB] server discovery unavailable', e); }); } if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot(); }
})(typeof window !== 'undefined' ? window : globalThis);
