const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const script=require('../kateronyx-3rb-safe.user.js');

test('parse all modes without guessing a game handshake',()=>{
 const servers=script.normalizeCatalogue({ip:'alpha.3rb.io',modes:{
   FFA:{max:70,servers:[{port:777,count:23,name:'FFA #1'},{port:778,count:0,name:'FFA #2'}]},
   DUAL:{max:100,servers:[{port:800,count:13,name:'DUAL'}]}
 }});
 assert.equal(servers.length,3);
 assert.deepEqual(servers.map(x=>x.url),['wss://alpha.3rb.io:777/V5','wss://alpha.3rb.io:778/V5','wss://alpha.3rb.io:800/V5']);
 assert.equal(servers[0].capacity,70);
 assert.equal(servers[1].players,0);
});
test('reject malicious hosts and invalid ports',()=>{
 for(const ip of ['senpa.io','alpha.3rb.io.evil.com','https://alpha.3rb.io','alpha.3rb.io:777']){
  assert.throws(()=>script.normalizeCatalogue({ip,modes:{FFA:{servers:[{port:777}]}}}));
 }
 const servers=script.normalizeCatalogue({ip:'alpha.3rb.io',modes:{FFA:{servers:[{port:0},{port:65536},{port:NaN},{port:777}]}}});
 assert.equal(servers.length,1);
});
test('do not hijack official game runtime or inject Senpa auth',()=>{
 const s=fs.readFileSync(require.resolve('../kateronyx-3rb-safe.user.js'),'utf8');
 for (const token of ['document.open(', 'window.stop(', 'killSenpaRuntime(', 'seizePage(', 'api.senpa.io', 'SC.init =', 'new WebSocket(', 'WebAssembly.instantiate']){
  assert.equal(s.includes(token),false,token);
 }
 assert.match(s, /document-idle/);
 assert.match(s, /Legacy Senpa bots disabled/);
});
