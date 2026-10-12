const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function panel(){
 const ids={},events={},timers=new Map(),intervals=[],workers=[];let now=10000;class Clock extends Date {static now(){return now;}}
 let n=0,point={x:900,y:1100};
 function el(){return {style:{},value:'',tagName:'DIV',hidden:false,setAttribute(){},appendChild(){},addEventListener(){},replaceChildren(...children){this.children=children;}};}
 const root={getElementById:id=>ids[id],querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},set innerHTML(s){for(const m of s.matchAll(/<(input|select|[a-z]+)\b[^>]*\bid="([^"]+)"[^>]*>/gi)){const e=el();e.value=(m[0].match(/value="([^"]*)"/)||[])[1]||'';e.checked=/\bchecked\b/.test(m[0]);ids[m[2]]=e;}ids.target.value='player';}};
 const document={baseURI:'https://senpa.io/web/',hidden:false,body:{appendChild(){}},createElement(){const e=el();e.attachShadow=()=>root;return e;},getElementById:()=>({value:'server'}),addEventListener(){}};
 const c={document,URL,console,Date:Clock,Number,navigator:{},setTimeout(fn,ms){const id=++n;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),setInterval(fn){intervals.push(fn);return intervals.length;},clearInterval(){},addEventListener(type,fn){(events[type]??=[]).push(fn);},ONYXServers:{find:()=>({host:'eu1.senpa.io:7112',mode_name:'Mega'})},ONYXFfaAdapter:{wsUrl:()=> 'wss://eu1.senpa.io:7112?po=senpa.io',readJwt:()=> 'null'},ONYXBotGame:{target:()=>point,tag:()=> 'Crew'},ONYXCreateBotCodec(){const w={sent:[],postMessage(m){this.sent.push(m);},terminate(){this.closed=true;},isAttached:()=>true};workers.push(w);return w;}};c.window=c;
 vm.runInNewContext(read('onyx-bots.js'),c);
 function start(slots=1){const [id,t]=[...timers].sort((a,b)=>a[1].ms-b[1].ms)[0];timers.delete(id);t.fn();const w=workers.at(-1);for(const data of [{type:'codec-ready'},{type:'ready',slots,border:20000}])w.onmessage({data});return w;}
 function key(type,code,tagName='BODY'){const e={code,composedPath:()=>[{tagName}],preventDefault(){},stopImmediatePropagation(){}};(events[type]||[]).forEach(fn=>fn(e));}
 return {advance:ms=>now+=ms,ids,timers,workers,start,key,events,intervals,setPoint:v=>point=v};
}
test('100 bot request is staggered and Stop cancels queued starts',()=>{const p=panel();p.ids.count.value='150';p.ids.connect.onclick();assert.equal(p.ids.count.value,100);assert.equal(p.timers.size,1);p.ids.stop.onclick();assert.equal(p.timers.size,0);assert.equal(p.workers.length,0);});
test('spawn targets active player, passes TAG, keyboard split and held feed stop on release',()=>{
 const p=panel();p.ids.auto.checked=false;p.ids.autoFeed.checked=false;p.ids.count.value='1';p.ids.connect.onclick();const w=p.start();assert.equal(w.sent[0].tag,'Crew');
 p.key('keydown','KeyZ');assert.equal(w.sent.at(-1).type,'spawn');assert.equal(w.sent.at(-2).x,900);
 w.onmessage({data:{type:'world',alive:[0],died:[]}});p.key('keydown','KeyX');assert.equal(w.sent.at(-1).type,'split');
 const before=w.sent.length;p.key('keydown','KeyX','INPUT');assert.equal(w.sent.length,before);
 p.key('keydown','KeyC');p.intervals[0]();const count=w.sent.filter(m=>m.type==='feed').length;assert.equal(count,2);
 p.key('keyup','KeyC');p.intervals[0]();assert.equal(w.sent.filter(m=>m.type==='feed').length,count);
 p.setPoint({x:123,y:456});p.intervals[0]();assert.equal(w.sent.at(-1).x,123);
 p.setPoint(null);const moves=w.sent.filter(m=>m.type==='move').length;p.intervals[0]();assert.equal(w.sent.filter(m=>m.type==='move').length,moves);
});
test('game facade converts active player and mouse coordinates using the correct FFA or Dual connection',()=>{
 const s=read('deo.onyx.beautified.js'),a=s.indexOf('window.ONYXBotGame ='),b=s.indexOf('\n            };',a)+15;
 const c={window:{},_0x1ee324:{connectedTab1:true},_0x1b521e:{controllingTab:2,isAliveTab1:true,isAliveTab2:true,x1:10,y1:20,x2:30,y2:40,tag:'A',tag2:'B'},_0x225b15:{ffaServerType:true},_0x517fc7:{canvasX:50,canvasY:60},_0x122508:{serverX:(x,t)=>x+t*100,serverY:(y,t)=>y+t*100}};vm.runInNewContext(s.slice(a,b),c);const api=c.window.ONYXBotGame;
 assert.equal(api.target('player').x,230);assert.equal(api.tag(),'B');c._0x225b15.ffaServerType=false;assert.equal(api.target('player').x,130);assert.equal(api.target('mouse').y,160);assert.equal(api.tag(),'A');
 c._0x1b521e.isAliveTab2=false;assert.equal(api.target('player').x,110);c._0x1b521e.isAliveTab1=false;assert.equal(api.target('player'),null);
});

test('auto spawn and feed handle readiness, death, pause, toggles and stop',()=>{
 const p=panel();p.ids.auto.checked=true;p.ids.autoFeed.checked=true;p.ids.count.value='1';p.ids.connect.onclick();const w=p.start();
 const count=t=>w.sent.filter(m=>m.type===t).length;
 assert.equal(count('spawn'),1);p.intervals[0]();assert.equal(count('spawn'),1);assert.equal(count('feed'),0);
 w.onmessage({data:{type:'world',alive:[0],died:[]}});p.intervals[0]();assert.equal(count('feed'),1);
 p.ids.pause.onclick();p.intervals[0]();assert.equal(count('feed'),1);
 p.ids.pause.onclick();p.intervals[0]();assert.equal(count('feed'),2);
 p.ids.autoFeed.checked=false;p.intervals[0]();assert.equal(count('feed'),2);
 w.onmessage({data:{type:'world',alive:[],died:[0]}});p.intervals[0]();assert.equal(count('spawn'),1);
 const [id,t]=[...p.timers].find(([,t])=>t.ms===1500);p.timers.delete(id);t.fn();assert.equal(count('spawn'),2);
 const [sid,st]=[...p.timers].find(([,t])=>t.ms===8000);p.timers.delete(sid);st.fn();
 p.ids.auto.checked=false;p.intervals[0]();assert.equal(count('spawn'),2);
 p.ids.auto.checked=true;p.ids.auto.onchange();assert.equal(count('spawn'),3);
 p.ids.stop.onclick();const sent=w.sent.length;p.intervals[0]();assert.equal(w.sent.length,sent);assert.equal(p.timers.size,0);
});

test('2 requested players share one dual connection and both receive controls',()=>{
 const p=panel();p.ids.count.value='2';p.ids.connect.onclick();const w=p.start(2);
 assert.equal(w.sent[0].slotLimit,2);assert.equal(p.workers.length,1);
 assert.equal([...p.timers.values()].filter(t=>t.ms===1000).length,0);
 w.onmessage({data:{type:'world',alive:[0,1],died:[]}});p.key('keydown','KeyX');assert.equal(w.sent.at(-1).type,'split');
 assert.match(p.ids.counts.textContent,/2 allocated.*2 ready.*2 alive/);
});
test('100 players allocate 50 dual connections; odd remainder requests one slot',()=>{
 const p=panel();p.ids.auto.checked=false;p.ids.count.value='100';p.ids.connect.onclick();
 for(let i=0;i<50;i++){const w=p.start(2);assert.equal(w.sent[0].slotLimit,100-i*2);}
 assert.equal(p.workers.length,50);assert.equal(p.timers.size,0);
 const q=panel();q.ids.auto.checked=false;q.ids.count.value='3';q.ids.connect.onclick();q.start(2);const last=q.start(1);
 assert.equal(last.sent[0].slotLimit,1);assert.equal(q.workers.length,2);assert.equal(q.timers.size,0);
});

test('Auto Spawn checkbox connects once and enables mouse follow and feed; disabling stops feed',()=>{
 const p=panel();p.ids.count.value='2';p.ids.auto.checked=true;p.ids.auto.onchange();
 assert.equal(p.ids.target.value,'mouse');assert.equal(p.ids.follow.checked,true);assert.equal(p.ids.autoFeed.checked,true);
 const w=p.start(2);assert.equal(w.sent.filter(m=>m.type==='spawn').length,1);
 p.ids.auto.onchange();assert.equal(p.workers.length,1);assert.equal([...p.timers.values()].filter(t=>t.ms===0).length,0);
 w.onmessage({data:{type:'world',alive:[0,1],died:[]}});p.setPoint({x:400,y:800});p.intervals[0]();
 const f=w.sent.findLastIndex(m=>m.type==='feed');assert.equal(w.sent[f-1].type,'move');assert.equal(w.sent[f-1].x,400);
 const feeds=w.sent.filter(m=>m.type==='feed').length;p.setPoint(null);p.intervals[0]();assert.equal(w.sent.filter(m=>m.type==='feed').length,feeds);
 p.ids.auto.checked=false;p.ids.auto.onchange();p.setPoint({x:1,y:2});p.intervals[0]();assert.equal(w.sent.filter(m=>m.type==='feed').length,feeds);assert.equal(p.ids.autoFeed.checked,false);
});

test('auto split aims on spawn, respects cooldown and pause, and manual split survives disabling auto',()=>{
 const p=panel();p.ids.count.value='1';p.ids.auto.checked=true;p.ids.auto.onchange();const w=p.start();
 const splits=()=>w.sent.filter(m=>m.type==='split').length;
 assert.equal(splits(),0);w.onmessage({data:{type:'world',alive:[0],died:[]}});assert.equal(splits(),1);
 const i=w.sent.findIndex(m=>m.type==='split');assert.equal(w.sent[i-1].type,'move');assert.equal(w.sent[i].count,6);
 p.intervals[0]();assert.equal(splits(),1);p.advance(1000);p.intervals[0]();assert.equal(splits(),2);
 p.ids.pause.onclick();p.advance(1000);p.intervals[0]();assert.equal(splits(),2);p.ids.pause.onclick();
 p.setPoint(null);p.intervals[0]();assert.equal(splits(),2);p.setPoint({x:12,y:34});
 p.ids.auto.checked=false;p.ids.auto.onchange();p.intervals[0]();assert.equal(splits(),2);
 p.key('keydown','KeyX');assert.equal(splits(),3);
});
test('hosted client rejects unmodified old Senpa loaders and accepts new generation',()=>{
 const s=read('deo.onyx.beautified.js').split('/* End loader gate */')[0];
 const c={window:{location:{hostname:'senpa.io'}},document:{body:null}};
 assert.throws(()=>vm.runInNewContext(s,c),/outdated/);c.window.__ONYX_LOADER_GENERATION__=2;
 assert.doesNotThrow(()=>vm.runInNewContext(s,c));
 assert.ok(read('kateronyx.user.js').includes('window.__ONYX_LOADER_GENERATION__=2;'));
});

test('Connect appends to existing bots and to pending work without duplicate launches',()=>{
 const p=panel();p.ids.count.value='2';p.ids.connect.onclick();p.ids.count.value='3';p.ids.connect.onclick();
 assert.equal(p.timers.size,1);const first=p.start(2);assert.equal(first.sent[0].slotLimit,2);
 const second=p.start(2);assert.equal(second.sent[0].slotLimit,3);p.start(1);
 assert.equal(p.workers.length,3);assert.equal(first.closed,undefined);
 p.ids.count.value='2';p.ids.connect.onclick();p.start(2);
 assert.equal(p.workers.length,4);assert.equal(first.closed,undefined);
 assert.match(p.ids.counts.textContent,/7 ready/);p.ids.stop.onclick();assert.ok(p.workers.every(w=>w.closed));
});
test('repeated Connect caps both ready and waiting players at 100',()=>{
 const p=panel();p.ids.count.value='98';p.ids.connect.onclick();p.start(2);
 p.ids.count.value='10';p.ids.connect.onclick();p.ids.connect.onclick();
 assert.equal(p.ids.connect.disabled,true);
 for(let i=0;i<49;i++)p.start(2);
 assert.equal(p.workers.length,50);assert.equal(p.timers.size,0);assert.match(p.ids.counts.textContent,/100 ready/);
 const w=p.workers[0];w.onmessage({data:{type:'close',code:1000}});assert.equal(p.ids.connect.disabled,false);
 p.ids.connect.onclick();p.start(2);assert.equal(p.workers.length,51);assert.match(p.ids.counts.textContent,/100 ready/);
});
