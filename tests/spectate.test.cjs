const {test}=require('node:test'),assert=require('node:assert/strict');
const {rows}=require('../onyx-spectate.js');
test('roster joins visible players to client names and TAG without treating unseen clients as spectators',()=>{
 const s={connected:true,clients:new Map([[1,{id:1,nick:'<img>',tag:'Crew'}],[2,{id:2,nick:'Away',tag:'Other'}],[3,{id:3,nick:'Viewer',isSpectating:true}]]),players:new Map([[21,{id:21,parentClientID:1}]]),cells:new Map([[50,{parentPlayerID:21}],[51,{parentPlayerID:21}]])};
 const r=rows(s);assert.equal(r.length,3);assert.equal(r.find(x=>x.id===1).tag,'Crew');assert.equal(r.find(x=>x.id===1).pid,21);assert.equal(r.find(x=>x.id===2).status,'unknown');assert.equal(r.find(x=>x.id===3).status,'spectating');
 s.cells.clear();assert.equal(rows(s).find(x=>x.id===1).status,'unknown');s.connected=false;assert.deepEqual(rows(s),[]);
});
test('native spectate facade prevents changing a live player and selects the requested visible player ID',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),s=fs.readFileSync(require('node:path').join(__dirname,'../deo.onyx.beautified.js'),'utf8');
 const a=s.indexOf('window.ONYXSpectateGame = '),b=s.indexOf('\n            };',a)+15;
 let entered=0;const c={window:{},_0x1ee324:{connectedTab1:true},_0x3b5e3c:{cellsTab1:new Map([[1,{parentPlayerID:21}]])},_0x1b521e:{isAlive:true},_0x446f71:{spectate(){entered++;}},_0x247292:{close(){}},_0x1e4a8a:{},_0x20a728:{target1:{},target2:{},update(){}},_0x223dce:{targetMode(){}}};
 vm.runInNewContext(s.slice(a,b),c);const api=c.window.ONYXSpectateGame;
 assert(api.watch(21,'Name'));assert.equal(entered,0);c._0x1b521e.isAlive=false;
 assert.equal(api.watch(21,'Name'),'');assert.equal(c._0x20a728.target1.parentPlayerID,21);assert(c._0x1e4a8a.freeSpectate);assert(api.watch(99,'Missing'));
});
