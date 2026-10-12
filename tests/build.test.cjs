const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
test('rebuilding changes only the addon version and preserves CDN dependency versions',()=>{
 const source=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'onyx-build-'));
 const cdn=s=>s.slice(s.indexOf('var CDN_SCRIPTS'),s.indexOf('function isLocalHost'));
 try{
  for(const f of ['scripts/build-bots.cjs','kateronyx.user.js','onyx-bots.js','onyx-spectate.js','ffa/onyx-bot-worker.js','ffa/onyx-bot-protocol.js','ffa/wasmLoader.js','ffa/bundle.wasm']){fs.mkdirSync(path.dirname(path.join(tmp,f)),{recursive:true});fs.copyFileSync(path.join(source,f),path.join(tmp,f));}
  const before=fs.readFileSync(path.join(tmp,'kateronyx.user.js'),'utf8');
  assert(cdn(before).includes('https://unpkg.com/tippy.js@2.0.6/dist/tippy.all.min.js'));
  execFileSync(process.execPath,[path.join(tmp,'scripts/build-bots.cjs')]);
  const after=fs.readFileSync(path.join(tmp,'kateronyx.user.js'),'utf8');
  assert.equal(cdn(after),cdn(before));assert.match(after,/\/\/ @version\s+2\.2\.2/);assert.match(after,/var VERSION = '2\.2\.2';/);
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});
