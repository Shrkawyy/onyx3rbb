const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function cleanupPredicate(){
 const s=read('kateronyx.user.js');
 const a=s.indexOf('  function isOfficialRuntimeNode('),b=s.indexOf('\n  function stripOfficial(',a);
 return vm.runInNewContext('('+s.slice(a,b)+')',{srcOf:el=>el.src||'',isAllowedKeep:src=>src.startsWith('blob:')});
}
test('page cleaner keeps generated bot codec frames and still removes unrelated frames',()=>{
 let frame;const c={window:{},MessageChannel,document:{createElement(){const attrs={};return frame={nodeType:1,tagName:'IFRAME',setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k]||null;},remove(){}};},body:{appendChild(){}}}};
 vm.runInNewContext(read('onyx-bot-codec.js'),c);const codec=c.window.ONYXCreateBotCodec();
 try {
  const removes=cleanupPredicate();assert.equal(removes(frame),false);
  assert.equal(removes({...frame,getAttribute:()=>null}),true);
  assert.equal(removes({...frame,src:'https://example.com/ad',getAttribute:k=>k==='src'?'https://example.com/ad':'local'}),true);
 } finally {codec.terminate();}
});
function chatEnvironment(v4,ffa,slot){
 const s=read('deo.onyx.beautified.js'),c={window:{},Set,Map};vm.createContext(c);vm.runInContext(s,c);
 const a=s.indexOf('function (_0x2424e9, _0x4c574d)'),b=s.indexOf('\n                        }',a)+26;
 const game=[],legacy=[];
 class Writer {constructor(){this.buffer=[];}writeUint8(n){this.buffer.push(n);}writeString16(t){this.buffer.push(t.length);for(const ch of t)this.buffer.push(ch.charCodeAt(0)&255,ch.charCodeAt(0)>>8);}}
 Object.assign(c,{_0x4a2ec6:c._0x400f,_0x59e2d7:Writer,_0x225b15:{ffaServerType:ffa},_0x1b521e:{controllingTab:slot},_0x1ee324:{send:(bytes,tab)=>game.push({bytes,tab})},_0x272162:{send:bytes=>legacy.push(bytes)}});
 c.window.__ONYX_ADAPTER__={isNewFfa:()=>v4};return {send:vm.runInContext('('+s.slice(a,b)+')',c),game,legacy};
}
for(const [name,ffa,slot] of [['FFA',true,1],['Dual main',false,1],['Dual multi',false,2],['Megasplit',true,1]])test(name+' sends Arabic chat through the game connection',()=>{
 const c=chatEnvironment(true,ffa,slot);c.send(1,'مرحبا');
 assert.equal(c.legacy.length,0);assert.equal(c.game.length,1);assert.equal(c.game[0].tab,1);
 assert.deepEqual(c.game[0].bytes.slice(0,4),[40,1,ffa?0:slot-1,5]);
 c.send(2,'go');assert.equal(c.game[1].bytes[1],2);
});
test('legacy non-Senpa chat routing is retained',()=>{const c=chatEnvironment(false,false,2);c.send(1,'hi');assert.equal(c.game.length,0);assert.equal(c.legacy[0][0],9);});
test('leaderboard uses the requested name',()=>{
 const head={textContent:'ZkaOnyx',style:{}},nodes={};let callback;
 const c={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(t,fn){callback=fn;},getElementById:id=>id==='leaderboard-head'?head:nodes[id]||null,createElement:()=>({style:{}}),head:{appendChild(el){nodes[el.id]=el;}},body:{appendChild(el){nodes[el.id]=el;}}},setTimeout(){},MutationObserver:class{observe(){}}};
 // Exercise the actual theme function without unrelated login/menu startup.
 const s=read('onyx-ui.js'),a=s.indexOf('  function lockTheme()'),b=s.indexOf('\n  function ensureLoginButton()',a);
 c.global=c.window;c.$=id=>c.document.getElementById(id);vm.runInNewContext('('+s.slice(a,b)+')()',c);assert.equal(head.textContent,'OnyxAlbion');
});
