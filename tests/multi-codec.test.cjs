const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function engine(){
 const s=read('deo.onyx.beautified.js'),c={window:{},Set,Map};vm.createContext(c);vm.runInContext(s,c);
 const index=s.indexOf('const _0x2f9d12 ='),start=s.lastIndexOf("'value': function",index)+9,end=s.indexOf('\n                    }',index)+22;
 Object.assign(c,{_0x1e03f1:c._0x400f,_0x122508:{update(){}},_0x225b15:{ffaServerType:true},_0x3b5e3c:{cellsIDTab1:new Set(),cellsIDTab2:new Set()},_0x1b521e:{},_0x446f71:{playerInfo(){}}});
 c.parse=vm.runInContext('('+s.slice(start,end)+')',c);return c;
}
for(const n of [1,2,4])test('player handshake selects containers and engine for '+n+' server slots',()=>{
 const c=engine(),ids=Array.from({length:n},(_,i)=>100+i),words=[55,...ids];c.parse({readUInt32:()=>20000,readUInt16:()=>words.shift(),readUInt8:()=>n},1);
 assert.equal(c._0x225b15.ffaServerType,n===1);assert.equal(Array.isArray(c._0x3b5e3c.cellsIDTab1),n>1);assert.deepEqual([...c._0x3b5e3c.cellsIDTab1],ids);
});
test('embedded iframe codec starts the real WASM and closes its message channel',async()=>{
 let frame;const context={window:{},MessageChannel,document:{createElement(){return frame={setAttribute(){},remove(){this.removed=true;}};},body:{appendChild(){}}}};
 vm.runInNewContext(read('onyx-bot-codec.js'),context);const codec=context.window.ONYXCreateBotCodec();
 const source=frame.srcdoc.match(/<script>([\s\S]*)<\/script>/)[1],messages=[],listeners={};
 const c={console,URL,WebAssembly,crypto:require('node:crypto').webcrypto,TextDecoder,TextEncoder,setTimeout,clearTimeout,setInterval,clearInterval,location:{href:'about:srcdoc'},document:{location:{href:'about:srcdoc'}},WebSocket,addEventListener:(type,fn)=>{listeners[type]=fn;},removeEventListener(){},parent:{}};
 c.self=c;c.window=c;
 c.postMessage=function(data,origin,ports){listeners.message({source:c.parent,data,ports});};
 const nativePostMessage=c.postMessage;
 vm.runInNewContext(source,c);
 assert.equal(c.postMessage,nativePostMessage,"codec must not replace native Window.postMessage");
 const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('WASM did not initialize')),3000);
  c.postMessage('onyx-codec-init','*',[{postMessage(m){messages.push(m);if(m.type==='error'){clearTimeout(timer);reject(Error(m.msg));}if(m.type==='codec-ready'){clearTimeout(timer);resolve();}}}]);
 });
 try {await ready;assert(messages.some(m=>m.type==='codec-ready'));}finally{codec.terminate();assert.equal(frame.removed,true);}
});
