const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function environment(host) {
  const values = new Map();
  const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const option = { value: host, getAttribute: () => null };
  const select = { value: host, selectedIndex: 0, options: [option], addEventListener() {} };
  const listeners = [];
  const sent = [];
  const initialized = [];
  const windowEvents = {};
  const context = vm.createContext({
    console: { log() {}, warn() {} },
    document: { readyState: 'loading', addEventListener: (type, fn) => listeners.push(fn), getElementById: id => id === 'servers' ? select : null },
    location: { host: 'senpa.io' },
    localStorage: storage, sessionStorage: storage,
    crypto: { randomUUID: () => '11111111-2222-4333-8444-555555555555' },
    addEventListener(type,fn) {windowEvents[type]=fn;}, setTimeout, clearTimeout, setInterval, clearInterval,
    ArrayBuffer, Uint8Array, DataView, Set,
    SC: { init: (...args) => initialized.push(args), send: data => sent.push(data), onMessage() {}, onClose() {}, onError() {} },
    zt: {},
  });
  context.window = context;
  for (const file of ['onyx-servers.js', 'onyx-ffa-adapter.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  // The adapter's DOM-ready callback can run independently of tracker/network access.
  listeners[1]();
  return { context, sent, initialized, select, windowEvents };
}

for (const [name, host, legacy] of [
  ['Nemesis', 'eu1.senpa.io:7101', 'eu.senpa.io:2001'],
  ['Zephyr', 'eu1.senpa.io:7106', 'eu.senpa.io:1200'],
  ['WindBine', 'eu1.senpa.io:7112', 'eu.senpa.io:9999'],
]) {
  test(name + ': saved legacy host reaches v4 URL and auth encoder', () => {
    const { context: c, sent, initialized } = environment(host);
    c.SC.init(legacy, 1);
    assert.equal(initialized[0][0], host);
    const url = new URL(c.__ONYX_ADAPTER__.wsUrl(legacy));
    assert.equal(url.host, host);
    assert.equal(url.searchParams.get('po'), 'senpa.io');
    assert.match(url.searchParams.get('tid'), /^[a-f0-9]{32}$/);
    assert.equal(url.searchParams.has('password'), false);
    assert.equal(c.zt.ffaServerType, true);
    c.SC.send(new Uint8Array([13, 0]).buffer, 1);
    const auth = new DataView(sent[0]);
    assert.equal(auth.getUint8(0), 13);
    assert.equal(auth.getUint16(1, true), 4); // Guest token string 'null'; no forged session.
    assert.equal(auth.byteLength, 11);
  });
}

test('tracker matches the named server, not another server with the same mode', () => {
  const { context: c } = environment('eu1.senpa.io:7112');
  c.ONYXServers.applyTracker([
    { name: 'Overworld', mode: 'megasplit', host: 'eu1.senpa.io:7113', region: 'EU', version: '4.0.0' },
    { name: 'WindBine', mode: 'megasplit2', host: 'eu2.senpa.io:7200', region: 'EU', version: '4.0.0', num_players: 0, max_players: 50 }
  ]);
  assert.equal(c.__ONYX_ADAPTER__.mapHost('eu.senpa.io:9999'), 'eu2.senpa.io:7200');
  assert.equal(c.ONYXServers.find('mega-eu').players, 0);
});

test('malformed tracker hosts and unknown protocol versions retain fallback addresses', () => {
  const { context: c } = environment('eu1.senpa.io:7106');
  for (const host of ['evil.example:7106', 'eu1.senpa.io:7106@evil.example', 'eu1.senpa.io:7106/path', 'eu1.senpa.io:99999']) {
    c.ONYXServers.applyTracker([{ name: 'Zephyr', mode: 'dual', host, region: 'EU', version: '4.0.0' }]);
    assert.equal(c.ONYXServers.find('dual-eu').host, 'eu1.senpa.io:7106');
  }
  c.ONYXServers.applyTracker([{ name: 'Zephyr', mode: 'dual', host: 'eu2.senpa.io:7106', region: 'EU', version: '5.0.0' }]);
  assert.equal(c.ONYXServers.find('dual-eu').live, false);
  assert.throws(() => c.ONYXServers.applyTracker({ servers: [] }));
  assert.equal(c.__ONYX_ADAPTER__.wsUrl('eu1.senpa.io:7101.evil.example').includes('?password='), true);
});

test('both entry points load catalogue before adapter and engine', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('src="onyx-servers.js"') < html.indexOf('src="onyx-ffa-adapter.js'));
  assert.ok(html.indexOf('src="onyx-ffa-adapter.js') < html.indexOf('src="./deo.onyx.beautified.js'));
  const script = fs.readFileSync(path.join(root, 'kateronyx.user.js'), 'utf8');
  assert.ok(script.indexOf('injectScript(serversJs') < script.indexOf('injectScript(adapterJs'));
});

test('DUAL handshake keeps Tab on one connection; single-slot FFA allows user Tab',()=>{
 for(const n of [1,2]) {
  const {context:c,initialized,windowEvents}=environment('eu1.senpa.io:7106');
  c.SC.init('eu1.senpa.io:7106',1);
  const packet=new Uint8Array(8+n*2);packet[7]=n;c.SC.onMessage(packet.buffer,1);
  windowEvents.keydown({key:'Tab',target:{tagName:'BODY'}});c.SC.init('',2);
  assert.equal(initialized.length,n===2?1:2);
 }
});
