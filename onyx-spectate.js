/* Server-provided clients + visible world ownership; absence is not proof of spectating. */
(function(g){
'use strict';
function rows(s){
 if(!s||!s.connected||!s.clients)return [];
 const seen=new Map();
 if(s.cells)s.cells.forEach(c=>{if(c.isRemoved||c.isFood||c.isVirus||c.isEjected)return;const p=s.players&&s.players.get(c.parentPlayerID);if(p&&!seen.has(p.parentClientID))seen.set(p.parentClientID,p.id);});
 return [...s.clients.values()].map(c=>({id:c.id,nick:c.nick||'Unnamed',tag:c.tag||'—',pid:seen.get(c.id),
 status:seen.has(c.id)?'playing':c.isSpectating===true?'spectating':'unknown'})).sort((a,b)=>a.nick.localeCompare(b.nick));
}
g.ONYXSpectateRows=rows;
if(typeof module!=='undefined')module.exports={rows};
if(!g.document||g.ONYXSpectatePanel)return;
const host=document.createElement('div');host.id='onyx-spectate-panel';host.hidden=true;
Object.assign(host.style,{position:'fixed',top:'12vh',left:'50%',transform:'translateX(-50%)',zIndex:'100005',width:'min(680px,94vw)'});
const root=host.attachShadow({mode:'open'});root.innerHTML=`<style>
:host{font:14px Arial;color:#e6edf5}*{box-sizing:border-box}section{background:#101820;border:1px solid #415263;border-radius:12px;padding:18px;box-shadow:0 16px 70px #000b}header{display:flex;justify-content:space-between;align-items:center}button,input,select{background:#1c2935;color:#e6edf5;border:1px solid #526575;border-radius:6px;padding:9px}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}.tools{display:flex;gap:8px;margin:14px 0;flex-wrap:wrap}input{flex:1;min-width:130px}.scroll{max-height:48vh;overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:start;padding:9px;border-bottom:1px solid #2a3a48;overflow-wrap:anywhere}small,p{color:#afbdcb;line-height:1.6}td:first-child{max-width:190px}</style>
<section dir="rtl"><header><strong>Spectate · اللاعبين والـTAG</strong><button id="close">إغلاق ×</button></header>
<div class="tools"><input id="search" placeholder="بحث بالاسم أو TAG"><select id="filter"><option value="all">الكل</option><option value="playing">بيلعب</option><option value="spectating">بيتفرج — مؤكد</option><option value="unknown">الحالة غير مؤكدة</option></select><button id="enter">دخول Spectate</button></div>
<small id="count"></small><div class="scroll"><table><thead><tr><th>الاسم</th><th>TAG</th><th>الحالة</th><th>مشاهدة</th></tr></thead><tbody id="list"></tbody></table></div>
<p id="note">السيرفر قد لا يرسل حالة كل المتفرجين. غياب الخلايا لا يثبت إن الشخص بيتفرج. المشاهدة متاحة للاعب الظاهر حاليًا.</p><p id="status"></p></section>`;
const $=id=>root.getElementById(id),labels={playing:'بيلعب',spectating:'بيتفرج',unknown:'غير مؤكدة'};
function refresh(){if(host.hidden)return;const api=g.ONYXSpectateGame,s=api&&api.snapshot(),all=rows(s),q=$('search').value.trim().toLowerCase(),filter=$('filter').value;
 $('count').textContent=s&&s.connected?all.length+' اتصال ظاهر في بيانات السيرفر':'اتصل بالسيرفر لعرض القائمة';
 const filtered=all.filter(r=>(filter==='all'||r.status===filter)&&(r.nick+' '+r.tag).toLowerCase().includes(q));
 $('list').replaceChildren(...filtered.map(r=>{const tr=document.createElement('tr');for(const text of [r.nick+' ['+r.id+']',r.tag,labels[r.status]]){const td=document.createElement('td');td.textContent=text;tr.appendChild(td);}const td=document.createElement('td'),button=document.createElement('button');button.textContent='مشاهدة';button.disabled=r.pid===undefined;button.onclick=()=>{$('status').textContent=api.watch(r.pid,r.nick)||'جاري متابعة '+r.nick;};td.appendChild(button);tr.appendChild(td);return tr;}));
}
function toggle(){host.hidden=!host.hidden;if(!host.hidden){refresh();$('search').focus();}}
$('close').onclick=()=>{host.hidden=true;};$('enter').onclick=()=>{$('status').textContent=g.ONYXSpectateGame?g.ONYXSpectateGame.enter()||'وضع المشاهدة مفتوح':'اللعبة لسه بتحمّل';};$('search').oninput=refresh;$('filter').onchange=refresh;
g.addEventListener('keydown',e=>{const path=e.composedPath();if(e.key==='Escape'&&!host.hidden){host.hidden=true;e.stopImmediatePropagation();return;}if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;if(path.some(el=>el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))return;if(e.code==='KeyP'){e.preventDefault();e.stopImmediatePropagation();toggle();}},true);
for(const type of ['keydown','keyup','mousedown','mouseup','wheel'])root.addEventListener(type,e=>e.stopPropagation());
document.body.appendChild(host);const timer=setInterval(refresh,1000);g.addEventListener('pagehide',()=>clearInterval(timer),{once:true});g.ONYXSpectatePanel={toggle};
})(typeof window!=='undefined'?window:globalThis);
