/* Rebuild standalone and userscript bot assets from one source. */
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let core=read('ffa/onyx-bot-worker.js')
 .replace("importScripts('./onyx-bot-protocol.js');",read('ffa/onyx-bot-protocol.js'))
 .replace("importScripts('./wasmLoader.js');",()=>read('ffa/wasmLoader.js'))
 .replaceAll('self.postMessage', 'emitCodecMessage')
 .replace('moduleInstance = wasmFactory({','moduleInstance = wasmFactory({\n        wasmBinary: self.__ONYX_BOT_WASM_BYTES__,');
const bytes=JSON.stringify([...fs.readFileSync(path.join(base,'ffa/bundle.wasm'))]);
const bridge=`
var emitCodecMessage;
(function(){
  const queue=[];let port=null;
  emitCodecMessage=message=>{if(port)port.postMessage(message);else queue.push(message);};
  const report=e=>emitCodecMessage({type:'error',msg:String(e.message||e.reason&&e.reason.message||e.reason||'Codec error')});
  self.addEventListener('error',report);self.addEventListener('unhandledrejection',report);
  function attach(e){
    if(e.source!==parent||e.data!=='onyx-codec-init'||!e.ports[0]||port)return;
    port=e.ports[0];port.onmessage=event=>{if(typeof self.onmessage==='function')self.onmessage(event);};
    queue.splice(0).forEach(m=>port.postMessage(m));self.removeEventListener('message',attach);
  }
  self.addEventListener('message',attach);
})();
emitCodecMessage({type:'log',msg:'Codec frame loaded; initializing WASM'});
self.__ONYX_BOT_WASM_BYTES__=new Uint8Array(${bytes});
`;
const source=bridge+core;
const factory=`/* Native Window codec isolation: no fake DOM or shared WASM handles. */
(function(){
  const source=${JSON.stringify(source)};
  window.ONYXCreateBotCodec=function(){
    const frame=document.createElement('iframe'),channel=new MessageChannel();
    let closed=false;
    const codec={onmessage:null,onerror:null,
      isAttached(){return frame.isConnected;},
      postMessage(message){if(!closed)channel.port1.postMessage(message);},
      terminate(){if(closed)return;closed=true;channel.port1.close();frame.remove();}
    };
    frame.setAttribute('data-onyx-codec','local');
    frame.hidden=true;frame.title='Bot connection';frame.setAttribute('aria-hidden','true');
    channel.port1.onmessage=e=>{if(!closed&&codec.onmessage)codec.onmessage(e);};
    frame.onload=()=>{if(!closed)frame.contentWindow.postMessage('onyx-codec-init','*',[channel.port2]);};
    frame.onerror=()=>{if(codec.onerror)codec.onerror({message:'Codec frame failed to load'});};
    frame.srcdoc='<!doctype html><meta charset="utf-8"><script>'+source.replace(/<\\/script/gi,'<\\\\/script')+'<'+ '/script>';
    document.body.appendChild(frame);return codec;
  };
})();
`;
fs.writeFileSync(path.join(base,'onyx-bot-codec.js'),factory);
let user=read('kateronyx.user.js');
const start=user.indexOf('  // Embedded bot assets:');const end=user.indexOf('\n  async function mount(baseUrl)',start);
if(start<0||end<0)throw Error('Missing userscript markers');
user=user.slice(0,start)+`  // Embedded bot assets: generated from the same files as the hosted client.
  async function mountBotPanel() {
    await injectScript(${JSON.stringify(factory)}, 'onyx-bot-codec.js');
    await injectScript(${JSON.stringify(read('onyx-bots.js'))}, 'onyx-bots.js');
    await injectScript(${JSON.stringify(read('onyx-spectate.js'))}, 'onyx-spectate.js');
  }
`+user.slice(end);
// Version only our metadata, never CDN dependency URLs or embedded libraries.
const release='2.2.2';
user=user.replace(/^(\/\/ @version\s+)[^\r\n]+/m, (_,prefix)=>prefix+release)
 .replace(/var VERSION = '[^']+';/, ()=>`var VERSION = '${release}';`);fs.writeFileSync(path.join(base,'kateronyx.user.js'),user);
