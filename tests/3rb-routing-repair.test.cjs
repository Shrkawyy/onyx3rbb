const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('onyx-3rb-adapter.js','utf8');
function context(extra={}){const c={URL,console:{log(){},warn(){},error(){}},setInterval:()=>1,clearInterval(){},...extra};c.window=c;vm.createContext(c);return c;}
test('actual primary and secondary create expressions: reproduce broken URL, verify repair',()=>{
 const game=fs.readFileSync('deo.onyx.beautified.js','utf8');
 const expressions=[...game.matchAll(/\['create'\]\((\(window\.__ONYX_ADAPTER__[\s\S]*?), \(\(\) =>/g)].map(m=>m[1]);
 assert.equal(expressions.length,2);
 const c=context({_0x14454b:'wss://alpha.3rb.io:777/V5',_0x749c0f:n=>n===0x83d?'wss://':'?password='});
 for(const e of expressions)assert.equal(vm.runInContext(e,c),'wss://wss://alpha.3rb.io:777/V5?password=');
 vm.runInContext(source,c);
 for(const e of expressions)assert.equal(vm.runInContext(e,c),'wss://alpha.3rb.io:777/V5');
});
test('idempotent URL normalization and invalid address rejection',()=>{
 const c=context();vm.runInContext(source,c);const a=c.ONYX3rbAdapter;
 for(const input of ['alpha.3rb.io:777','wss://alpha.3rb.io:777','wss://alpha.3rb.io:777/V5','wss://alpha.3rb.io:777/V5/']){
 assert.equal(a.wsUrl(input),'wss://alpha.3rb.io:777/V5');assert.equal(a.wsUrl(a.wsUrl(input)),a.wsUrl(input));}
 for(const input of ['','eu1.senpa.io:7101','alpha.3rb.io.evil.test:777','wss://alpha.3rb.io:777/V5?password=','wss://wss://alpha.3rb.io:777/V5'])assert.throws(()=>a.wsUrl(input));
 assert.equal(a.isNewFfa(),false);assert.equal(a.diagnostics.protocolReady,false);
});
test('catalogue preserves ports on shared hostname',()=>{
 const c=context();vm.runInContext(fs.readFileSync('onyx-3rb-servers.js','utf8'),c);
 c.ONYXServers.applyTracker({ip:'alpha.3rb.io',modes:{FFA:{servers:[{port:777},{port:778}]}}});
 assert.equal(c.ONYXServers.find('alpha.3rb.io:778').port,778);assert.equal(c.ONYXServers.find('alpha.3rb.io'),null);
 vm.runInContext(source,c);assert.equal(c.ONYX3rbAdapter.wsUrl('3rb-ffa-778'),'wss://alpha.3rb.io:778/V5');
});
test('SC preserves receiver, tab and return; errors remain visible',()=>{
 const SC={ip:'alpha.3rb.io:778',init(host,tab){assert.equal(this,SC);assert.equal(tab,2);return host;}};
 const c=context({SC});vm.runInContext(source,c);assert.equal(SC.init('',2),'wss://alpha.3rb.io:778/V5');assert.equal(c.ONYX3rbAdapter.diagnostics.attempts,1);
 const bad=context({SC:{init(){throw new RangeError('DataView offset is out of bounds');}}});vm.runInContext(source,bad);
 assert.throws(()=>bad.SC.init('alpha.3rb.io:777',1),/DataView/);assert.equal(bad.ONYX3rbAdapter.diagnostics.errors.length,1);
});
test('standalone uses embedded repaired adapter; recovery exits before touching page',()=>{
 const s=fs.readFileSync('kateronyx.user.js','utf8'),calls=[];
 const c=context({localStorage:{getItem:k=>k==='kateronyx:official-mode'?'1':null},GM_registerMenuCommand:name=>calls.push(name)});
 vm.runInContext(s,c);assert.equal(calls.length,2);assert.ok(s.includes('var adapterJs = '+JSON.stringify(source)+';'));
});
