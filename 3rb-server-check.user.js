// ==UserScript==
// @name         ONYX 3RB Server Check (official client)
// @namespace    https://3rb.io/
// @version      1.0.0
// @description  Read-only official 3rb server catalogue diagnostics. Does not replace game client or start bots.
// @match        https://3rb.io/*
// @match        https://www.3rb.io/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      3rb.io
// ==/UserScript==
(function () {
  'use strict';
  const endpoint = 'https://3rb.io/php/Servers.php';
  const box = document.createElement('div');
  box.id = 'onyx-3rb-server-check';
  box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;width:min(380px,90vw);max-height:65vh;overflow:auto;background:#10131b;color:#f0f0f0;border:1px solid #d6a63e;border-radius:10px;padding:12px;font:13px system-ui;box-shadow:0 4px 25px #0009';
  const heading=document.createElement('div');heading.textContent='3rb.io — Server Check';heading.style.cssText='font-weight:bold;margin-bottom:8px';box.appendChild(heading);
  const status=document.createElement('div');status.textContent='Checking server discovery…';status.style.margin='8px 0';box.appendChild(status);
  const action=document.createElement('button');action.textContent='Refresh';action.style.cssText='padding:6px 12px;margin-right:8px;cursor:pointer';box.appendChild(action);
  const close=document.createElement('button');close.textContent='Close';close.style.cssText='padding:6px 12px;cursor:pointer';close.onclick=()=>box.remove();box.appendChild(close);
  const list=document.createElement('div');list.style.cssText='margin-top:10px;white-space:pre-wrap;overflow-wrap:anywhere';box.appendChild(list);
  (document.body||document.documentElement).appendChild(box);
  function render(data){
    if(!data||typeof data.ip!=='string'||!data.modes||typeof data.modes!=='object')throw new Error('Unexpected catalogue format');
    const host=data.ip.trim();
    if(!/^(?:[a-z0-9.-]+)$/i.test(host)||(!host.endsWith('.3rb.io')&&host!=='3rb.io'))throw new Error('Unexpected 3rb host: '+host);
    const servers=[];
    for(const [mode,group] of Object.entries(data.modes))for(const row of (Array.isArray(group&&group.servers)?group.servers:[])){
      const port=Number(row&&row.port);
      if(!Number.isInteger(port)||port<1||port>65535)continue;
      servers.push({mode,name:String(row.name||mode),port,players:row.count,url:`wss://${host}:${port}/V5`});
    }
    status.textContent=`Discovered ${servers.length} server(s). Discovery alone does not prove gameplay/bot compatibility.`;
    list.replaceChildren();
    for(const s of servers){const p=document.createElement('div');p.style.cssText='border-top:1px solid #34363b;padding:6px 0';p.textContent=`${s.name} | ${s.mode} | players: ${s.players??'?'}\n${s.url}`;list.appendChild(p);}
    console.info('[ONYX 3RB CHECK] Official server discovery',servers);
  }
  function refresh(){status.textContent='Checking server discovery…';list.replaceChildren();GM_xmlhttpRequest({method:'GET',url:endpoint,timeout:12000,onload:r=>{try{if(r.status!==200)throw new Error('HTTP '+r.status);render(JSON.parse(r.responseText));}catch(e){status.textContent='Discovery error: '+e.message;console.error('[ONYX 3RB CHECK]',e);}},onerror:()=>status.textContent='Network error while loading catalogue',ontimeout:()=>status.textContent='Server catalogue request timed out'});}
  action.onclick=refresh;refresh();
})();
