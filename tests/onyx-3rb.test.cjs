const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function load(file, extra = {}) { const context = { URL, console, ...extra, setInterval: () => 1, clearInterval: () => {}, document: null }; context.globalThis = context; vm.runInNewContext(fs.readFileSync(file, 'utf8'), context); return context; }
test('3rb catalogue normalizes V5 urls', () => { const c = load('onyx-3rb-servers.js'); const rows = c.ONYXServers.applyTracker({ region: 'NA', ip: 'alpha.3rb.io', modes: { FFA: { max: 70, servers: [{ name: 'Free For All 1', port: 777, count: 2 }] } } }); assert.equal(rows[0].url, 'wss://alpha.3rb.io:777/V5'); assert.equal(rows[0].protocol, '3rb-v5'); });
test('3rb adapter exposes the selected URL and never fabricates packets', () => { const c = load('onyx-3rb-adapter.js'); assert.equal(c.ONYX3rbAdapter.wsUrl('alpha.3rb.io:777'), 'wss://alpha.3rb.io:777/V5'); assert.throws(() => c.ONYX3rbAdapter.unsupported('split'), /official 3rb V5 codec/); });
