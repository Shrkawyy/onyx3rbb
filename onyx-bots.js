/* Independent bot controls; never replace WebSocket, SC, WASM or game keyboard handlers. */
(function () {
  'use strict';
  if (window.ONYXBots) return;
  const scriptBase = new URL(window.__KATERONYX_BASE_URL || '.', document.baseURI);
  const state = {bots: [], generation: 0, paused: false, target: null, host: '', logs: [], spawnWanted: false, remaining: 0};
  const host = document.createElement('div'); host.id = 'onyx-bots-panel';
  Object.assign(host.style, {position:'fixed', right:'16px', top:'70px', zIndex:'100000', maxWidth:'calc(100vw - 24px)'});
  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `<style>
  :host{font:12px Arial,sans-serif;color:#c8cbce}*{box-sizing:border-box}button,input,select{font:inherit;color:inherit;background:#101214;border:1px solid #303438;border-radius:4px;min-height:34px;padding:8px}button{cursor:pointer}button:hover{background:#252a30;border-color:#6a7480}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #7dd3fc}button:disabled{opacity:.4;cursor:default}section{width:380px;max-width:calc(100vw - 24px);background:#0a0c0eed;border:1px solid #303438;border-radius:8px;box-shadow:0 12px 45px #0009;overflow:hidden}header{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid #272b30}header strong{flex:1;font-size:13px}header small{color:#929ba4;font-size:10px}main{padding:12px;max-height:calc(100vh - 155px);overflow:auto}nav,.row,.actions{display:flex;gap:8px;margin-bottom:12px}nav button{flex:1;font-size:10px;padding:6px 2px}.account-row{padding:10px 0;border-bottom:1px solid #293242}.account-status{color:#98b7cc;font-size:11px;margin:6px 0;overflow-wrap:anywhere}.account-actions{display:flex;flex-wrap:wrap;gap:5px}.account-actions button{min-height:29px;padding:6px 7px;flex:1}.warning{color:#dcbf8a} .small{font-size:10px}nav button[aria-selected=true]{border-color:#8294a8}label{display:block;color:#909aa5;font-size:10px;line-height:1.5}label input:not([type=checkbox]),label select{width:100%;display:block;margin-top:4px}label.grow{flex:1}.count{width:72px}.checks{display:flex;flex-wrap:wrap;gap:12px;margin:14px 0}.checks label{display:flex;align-items:center;gap:5px}input[type=checkbox]{min-height:0;accent-color:#b1c6d9}.actions button{flex:1}footer{border:1px solid #282c30;border-radius:4px;padding:9px;color:#93a3b4;overflow-wrap:anywhere}.hint{font-size:11px;color:#9ba6b1;line-height:1.5}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px monospace;max-height:350px;overflow:auto}.bot{padding:10px 0;border-bottom:1px solid #292e33} [hidden]{display:none!important}
  </style><section><header><strong>🤖 GAME BOTS · 2.3.0</strong><small id="counts">0 total | 0 ready | 0 alive</small><button id="collapse" aria-label="Collapse panel">−</button></header><main>
  <nav><button data-tab="controls" aria-selected="true">CONTROLS</button><button data-tab="accounts">BOT ACCOUNTS</button><button data-tab="active">ACTIVE BOTS</button><button data-tab="console">CONSOLE</button></nav>
  <div id="controls"><div class="row"><label class="grow">NAME<input id="name" maxlength="24" value="Bot"></label><label class="count">ADD COUNT<input id="count" type="number" min="1" max="100" value="2"></label></div>
  <label>SERVER · SAME AS GAME<input id="server" readonly></label><p class="hint">DUAL · FFA · MEGASPLIT<br>Each Connect adds COUNT players. Maximum 100 connected or waiting.<br>On a 2-slot server, Count 2 uses one connection controlling both players.<br>For player multibox only: use PLAY and Tab; leave bots disconnected.</p>
  <div class="row"><label class="grow">TARGET<select id="target"><option value="mouse">Mouse · الماوس</option><option value="player">Follow me · اتجمع عندي</option><option value="hold">Hold current point</option></select></label></div>
  <p class="hint">Z: Spawn · X: Split ×64 · hold C: Mass<br>Enable AUTO SPAWN + FEED to connect, spawn and feed toward your mouse.<br>The server chooses initial spawn locations; bots move toward the target afterward.<br>100 maximum requested; connections start one per second.</p><p id="targetStatus" class="hint"></p><label>PANEL OPACITY<input id="opacity" type="range" min="35" max="100" value="100"></label>
  <div class="row"><label class="grow">SPAWN KEY<input id="spawnKey" readonly placeholder="Click to bind"></label><label class="grow">SPLIT KEY<input id="splitKey" readonly placeholder="Click to bind"></label><label class="grow">MASS KEY<input id="feedKey" readonly placeholder="Click to bind"></label></div>
  <div class="actions"><button id="connect">⚡ Connect</button><button id="spawn">▶ Spawn</button><button id="split">✂ Split ×64</button><button id="feed">● Mass</button></div>
  <div class="checks"><label><input id="auto" type="checkbox">AUTO SPAWN + FEED</label><label><input id="autoSplit" type="checkbox">AUTO SPLIT ×64 · 1s</label><label><input id="autoFeed" type="checkbox">AUTO FEED</label><label><input id="respawn" type="checkbox">RESPAWN</label><label><input id="follow" type="checkbox" checked>FOLLOW</label></div>
  <div class="actions"><button id="pause">Ⅱ Pause</button><button id="stop">■ Stop All</button></div></div>
  <div id="accounts" hidden><strong>Bot account sessions (9 slots)</strong>
  <p class="hint warning">Your existing SENPA AUTH remains the main player login. These bot logins do not change the main token. Browser cookies are shared and Senpa may invalidate the previous login or reject extra connections. Server limits still apply.</p>
  <div class="actions"><button id="cancelAuth">Cancel pending login</button></div><div id="accountRows"></div></div>
  <div id="active" hidden></div><div id="console" hidden>
  <p class="hint">Only bot connections, account verification and spawn diagnostics. Tokens and request bodies are not saved.</p>
  <div class="actions"><button id="copy">Copy diagnostics</button><button id="export">Export JSON</button><button id="clearLog">Clear</button></div>
  <pre id="log"></pre></div>
  <footer id="status">Ready — select a server and press Connect.</footer></main></section>`;
  const $ = id => root.getElementById(id), keys = {spawn:'KeyZ',split:'KeyX',feed:'KeyC'};
  let feeding=false;
  const accounts=window.ONYXBotAccounts;
  function safeText(value) {
    return String(value || '').replace(/[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g,'[JWT REDACTED]')
      .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s]+/ig,'$1[REDACTED]')
      .replace(/([?&](?:access_token|token|session|key)=)[^&\s]+/ig,'$1[REDACTED]');
  }
  function diagnoseClose(code, reason) {
    const message=String(reason||'').toLowerCase();
    if(code===1000) return 'Normal closure; check preceding event.';
    if(code===1006) return 'Abnormal network/proxy disconnect; WebSocket close reason unavailable.';
    if(code===4101) return 'Server-side rejection (possibly a restriction). Only Senpa can confirm a ban.';
    if(code===4405) return 'Server rejected connection (4405); verify session and server policy.';
    if(code===4406) return 'Server rejected the session (4406). Could be login conflict, stale token or server policy; not proof of ban.';
    if(/ban|banned/.test(message)) return 'Server reason mentions a ban; confirm with Senpa support.';
    if(/token|auth|unauthor|expire/.test(message)) return 'Authentication/session appears to be rejected.';
    return code ? 'WebSocket closed ('+code+'); server reason may be incomplete.' : 'Connection closed without a usable server code.';
  }
  const diagnostics=[];
  function audit(account,kind,message,code) {
    const entry={time:new Date().toISOString(),account:account||'main bot slot',kind:kind,code:code||null,message:safeText(message)};
    diagnostics.push(entry); if(diagnostics.length>300) diagnostics.shift();
    log('[Account '+entry.account+'] '+kind+': '+entry.message);
  }
  for(const id of Object.keys(keys)) $(id+'Key').value=keys[id];
  function log(message) {
    message=safeText(message); state.logs.push(new Date().toLocaleTimeString() + ' ' + message); state.logs = state.logs.slice(-300);
    $('log').textContent = state.logs.join('\n'); $('status').textContent = message;
  }
  function selected() { const el = document.getElementById('servers'); return window.ONYXServers && window.ONYXServers.find(el && el.value); }
  function target() {
    if(!$('autoSplit').checked&&$('target').value==='hold') return state.target;
    const api=window.ONYXBotGame;
    const value=api&&api.target($('autoSplit').checked?'mouse':$('target').value);
    state.target=value&&Number.isFinite(value.x)&&Number.isFinite(value.y)?value:null;
    return state.target;
  }
  function aim(b) {
    const point=target();
    if(point&&b.worker&&b.ready)b.worker.postMessage({type:'move',...point});
    return point;
  }
  function autoSplit(b) {
    if(!$('autoSplit').checked||state.paused||!b.ready||!b.worker||!b.alive.length)return;
    const now=Date.now();if(b.lastAutoSplit!=null&&now-b.lastAutoSplit<1000)return;
    if(!aim(b))return;
    b.worker.postMessage({type:'split',count:6});b.lastAutoSplit=now;
  }
  function reservedCount() {return state.remaining+state.bots.filter(b=>b.worker&&b.ready).reduce((n,b)=>n+b.slots,0);}
  function render() {
    $('counts').textContent = `${state.bots.reduce((n,b)=>n+b.slots,0)} allocated | ${state.bots.filter(b=>b.ready).reduce((n,b)=>n+b.slots,0)} ready | ${state.bots.reduce((n,b)=>n+b.alive.length,0)} alive | ${state.remaining} waiting`;
    $('active').replaceChildren(...state.bots.map(b => { const el = document.createElement('div'); el.className='bot'; el.textContent=`${b.name} · ${b.status} · ${b.alive.length}/${b.slots} slots alive`; return el; }));
    for (const id of ['spawn','split','feed']) $(id).disabled = state.paused || !state.bots.some(b=>b.ready);
    $('connect').disabled = reservedCount()>=100;
    if(accounts)renderAccounts();
  }
  function dispose(b, reason) {
    if(!b.accountSlot && !b.ready && (b.worker||b.status==='Queued')){state.remaining=0;}
    clearTimeout(b.timer); clearTimeout(b.respawnTimer); clearTimeout(b.spawnTimer);
    if (b.worker) { b.worker.postMessage({type:'close'}); b.worker.terminate(); b.worker=null; }
    b.ready=false; b.alive=[]; b.status=reason; render();
  }
  function stop(reason='Stopped') { feeding=false;state.generation++; state.remaining=0; state.bots.forEach(b=>dispose(b,reason)); state.spawnWanted=false; state.paused=false; $('pause').textContent='Ⅱ Pause'; render(); log(reason); }
  function spawnBot(b) {
    if (!b.ready || !b.worker || state.paused || b.spawnTimer || b.respawnTimer || b.alive.length === b.slots) return;
    aim(b);
    b.worker.postMessage({type:'spawn'}); b.status='Waiting for own cells';audit(b.accountSlot||'primary','SPAWN_REQUEST',b.name);
    b.spawnTimer=setTimeout(()=>{ b.spawnTimer=null; if(b.alive.length<b.slots) { audit(b.accountSlot||'primary','SPAWN_TIMEOUT',b.name+': spawn not confirmed after 8s.'); b.status='Spawn unconfirmed'; render(); } },8000);
  }
  function action(type) {
    if (state.paused) return;
    if(type==='spawn') state.spawnWanted=true;
    if(type!=='spawn'&&!state.bots.some(b=>b.alive.length)) return log('No confirmed live bots yet. Wait for alive after Spawn.');
    state.bots.forEach(b=>{if(b.worker&&b.ready) {if(type==='spawn') spawnBot(b); else if(b.alive.length) {aim(b);b.worker.postMessage(type==='split'?{type,count:6}:{type});}}});
  }
  function launch(b, entry, generation) {
    if(generation!==state.generation) return;
    let worker;
    try { worker = window.ONYXCreateBotCodec(); } catch(e) { dispose(b,'Codec failed'); log(e.message); return; }
    b.worker=worker; b.status='Loading codec'; audit(b.accountSlot||'primary','CODEC_START',b.name);
    b.timer=setTimeout(()=>{const phase=b.status;const removed=b.worker&&b.worker.isAttached&&!b.worker.isAttached();dispose(b,'Connection timeout');audit(b.accountSlot||'primary','TIMEOUT',b.name+': '+(removed?'Codec frame was removed.': 'Timeout during '+phase+' after 15s.'));},15000);
    worker.onerror=e=>{dispose(b,'Codec error');audit(b.accountSlot||'primary','CODEC_ERROR',b.name+': '+(e.message||'codec could not load.'));};
    worker.onmessage=event=>{
      if(generation!==state.generation || b.worker!==worker) return;
      const m=event.data;
      if(m.type==='log') log(b.name+': '+m.msg);
      if(m.type==='codec-ready') {
        log(b.name+': WASM ready; opening game connection.');
        const token=b.accountSlot ? accounts&&accounts.getToken(b.accountSlot) : window.ONYXFfaAdapter.readJwt();
        if(!token || token==='null') {dispose(b,'No verified session');audit(b.accountSlot||'primary','AUTH_MISSING','No verified, unexpired session for this bot.');return;}
        b.status='Connecting';
        worker.postMessage({type:'connect',url:window.ONYXFfaAdapter.wsUrl(entry.host),name:b.name,slotLimit:b.requestedSlots,token:token,tag:window.ONYXBotGame?window.ONYXBotGame.tag():''});
      }
      if(m.type==='open') {b.status='Authenticating';audit(b.accountSlot||'primary','WS_OPEN',b.name+': WebSocket open; waiting for server handshake.');}
      if(m.type==='ready') {if(b.ready)return;clearTimeout(b.timer);b.ready=true;b.slots=m.slots;if(!b.accountSlot)state.remaining=Math.max(0,state.remaining-b.slots);b.border=m.border;b.status='Ready';audit(b.accountSlot||'primary','READY',b.name+': '+m.slots+' players; server assigned '+(m.assignedSlots||m.slots)+' slots.');if($('auto').checked||state.spawnWanted) spawnBot(b);if(!b.accountSlot)queueNext(entry,generation);}
      if(m.type==='world') {
        const previous=b.status+':'+b.alive.join(',');
        b.alive=m.alive;
        if(!b.alive.length)b.lastAutoSplit=null;
        autoSplit(b);
        if(b.alive.length&&$('follow').checked&&!state.paused)aim(b);
        if(b.alive.length===b.slots){clearTimeout(b.spawnTimer);b.spawnTimer=null;}
        b.status=b.alive.length?'Alive':b.spawnTimer?'Spawning':'Ready';
        if(m.died.length && ($('auto').checked || $('respawn').checked) && !state.paused && !b.respawnTimer) b.respawnTimer=setTimeout(()=>{b.respawnTimer=null;if($('auto').checked||$('respawn').checked)spawnBot(b);},1500);
        if(previous===b.status+':'+b.alive.join(','))return;
      }
      if(m.type==='blocked'||m.type==='error'||m.type==='close') {
        const reason=safeText(m.reason||m.msg||'Server did not provide a reason');
        const code=m.code!=null&&Number.isInteger(Number(m.code))?Number(m.code):null;
        const diagnosis=m.type==='close'?diagnoseClose(code,reason):'Bot protocol/WASM returned '+m.type+'.';
        dispose(b,reason);
        audit(b.accountSlot||'primary',m.type.toUpperCase(),b.name+': '+reason+' | '+diagnosis,code);
      }
      render();
    }; render();
  }
  function queueNext(entry,generation,delay=1000) {
    if(generation!==state.generation||state.remaining<=0||state.bots.some(b=>b.status==='Queued'||(b.worker&&!b.ready)))return;
    const first=state.bots.reduce((n,b)=>n+b.slots,0)+1;
    const b={name:($('name').value.trim()||'Bot')+' '+first,requestedSlots:state.remaining,ready:false,slots:0,alive:[],status:'Queued',worker:null};
    state.bots.push(b);b.timer=setTimeout(()=>launch(b,entry,generation),delay);
  }
  $('connect').onclick=()=>{
    const entry=selected(); if(!entry || !window.ONYXFfaAdapter) return log('Select a supported game server first.');
    const active=state.bots.some(b=>b.worker||b.status==='Queued');
    if(active&&state.host!==entry.host)return log('Server changed. Stop All before adding on the new server.');
    const count=Math.min(100,Math.max(1,Math.trunc(Number($('count').value)||1)));$('count').value=count;
    const added=Math.min(count,Math.max(0,100-reservedCount()));
    if(!added)return log('Maximum 100 players connected or waiting.');
    if(!active){state.host=entry.host;state.target=null;}
    state.remaining+=added;queueNext(entry,state.generation,0);
    log('Added '+added+' players to the queue'+(added<count?' (100 total limit).':'.'));

    render();
  };
  for(const id of ['spawn','split','feed']) $(id).onclick=()=>action(id);
  $('auto').onchange=()=>{
    if(!$('auto').checked) {
      $('autoFeed').checked=false;$('autoSplit').checked=false;feeding=false;state.spawnWanted=false;
      state.bots.forEach(b=>{clearTimeout(b.respawnTimer);b.respawnTimer=null;});
      log('Auto Spawn + Feed off. FOLLOW remains available.');return;
    }
    $('target').value='mouse';state.target=null;$('follow').checked=true;$('autoFeed').checked=true;$('autoSplit').checked=true;
    if(!state.bots.some(b=>b.worker||b.status==='Queued'))$('connect').onclick();
    if(state.paused){state.paused=false;$('pause').textContent='Ⅱ Pause';}
    state.bots.forEach(spawnBot);render();
    log('Auto Spawn + Feed on: bots follow and feed toward the mouse when your player is alive.');
  };
  $('autoSplit').onchange=()=>{if($('autoSplit').checked){$('target').value='mouse';$('follow').checked=true;state.bots.forEach(autoSplit);}};
  $('stop').onclick=()=>stop();
  $('pause').onclick=()=>{feeding=false;state.paused=!state.paused;$('pause').textContent=state.paused?'▶ Resume':'Ⅱ Pause';log(state.paused?'Paused controls; connections remain open.':'Controls resumed.');render();};
  $('collapse').onclick=()=>{const main=root.querySelector('main');main.hidden=!main.hidden;$('collapse').textContent=main.hidden?'+':'−';};
  $('opacity').oninput=()=>host.style.opacity=Number($('opacity').value)/100;
  root.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>{for(const id of ['controls','accounts','active','console']) $(id).hidden=id!==btn.dataset.tab;root.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b===btn)));});
  $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(state.logs.join('\n'));$('copy').textContent='Copied';}catch(_){log('Copy unavailable; select the console text.');}};
  $('export').onclick=()=>{
    const blob=new Blob([JSON.stringify({version:'2.3.0',logs:diagnostics},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;
    link.download='onyx-bot-diagnostics-'+new Date().toISOString().slice(0,10)+'.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  $('clearLog').onclick=()=>{state.logs.length=0;diagnostics.length=0;$('log').textContent='';};
  function renderAccounts() {
    if(!accounts) return;
    for(let id=1;id<=accounts.count;id++) {
      const slot=accounts.getStatus(id);
      const current=state.bots.filter(b=>b.accountSlot===id&&(b.worker||b.status==='Queued'));
      const status=$('account-status-'+id);
      if(status) status.textContent=slot.status+' · '+(slot.name||'No account profile')+
        (current.length?' · '+current.map(b=>b.status).join(', '):'');
      $('account-connect-'+id).disabled=!slot.verified||current.length>0;
      $('account-facebook-'+id).disabled=current.length>0;
      $('account-discord-'+id).disabled=current.length>0;
      $('account-disconnect-'+id).disabled=current.length===0;
    }
  }
  function connectAccount(id) {
    const entry=selected();
    if(!entry || !window.ONYXFfaAdapter) return audit(id,'NO_SERVER','Choose a supported game server first.');
    if(!accounts || !accounts.getToken(id))return audit(id,'AUTH_REQUIRED','Log in and verify this bot account first.');
    if(state.bots.some(b=>b.accountSlot===id&&(b.worker||b.status==='Queued')))
      return audit(id,'ALREADY_CONNECTED','This slot already has a connection.');
    if(reservedCount()+2>100)return audit(id,'SERVER_LIMIT','Maximum 100 players allocated or waiting.');
    if(state.bots.some(b=>(b.worker||b.status==='Queued'))&&state.host&&state.host!==entry.host)
      return audit(id,'SERVER_CHANGED','Stop all bot connections before changing servers.');
    state.host=entry.host;
    const b={name:'Bot account '+id,accountSlot:id,requestedSlots:2,ready:false,slots:0,
      alive:[],status:'Queued',worker:null};
    state.bots.push(b);
    audit(id,'CONNECT_REQUEST','Requested one connection with up to 2 players. Server may reject it.');
    launch(b,entry,state.generation);render();renderAccounts();
  }
  function disconnectAccount(id) {
    const bots=state.bots.filter(b=>b.accountSlot===id&&(b.worker||b.status==='Queued'));
    bots.forEach(b=>dispose(b,'Manually disconnected'));
    audit(id,'DISCONNECT_REQUEST',bots.length?'Disconnected '+bots.length+' bot connection(s).':'No active connections.');
    renderAccounts();
  }
  if(accounts){
    const list=$('accountRows');
    for(let id=1;id<=accounts.count;id++) {
      const wrap=document.createElement('div');wrap.className='account-row';
      const head=document.createElement('strong');head.textContent='Bot Account '+id;wrap.appendChild(head);
      const status=document.createElement('div');status.className='account-status';status.id='account-status-'+id;
      wrap.appendChild(status);
      const actions=document.createElement('div');actions.className='account-actions';
      const buttons=[['Facebook','facebook'],['Discord','discord'],['Connect','connect'],['Disconnect','disconnect'],['Logout','logout']];
      for(const [label,command] of buttons) {
        const button=document.createElement('button');button.textContent=label;
        button.id='account-'+command+'-'+id;
        button.onclick=()=>{
          if(command==='facebook'||command==='discord')accounts.login(id,command);
          else if(command==='connect')connectAccount(id);
          else if(command==='disconnect')disconnectAccount(id);
          else {disconnectAccount(id);accounts.clear(id);}
          renderAccounts();
        };
        actions.appendChild(button);
      }
      wrap.appendChild(actions);list.appendChild(wrap);
    }
    accounts.subscribe((id,kind,message)=>{audit(id,kind,message);renderAccounts();});
    $('cancelAuth').onclick=()=>accounts.cancelPending();renderAccounts();
  } else { $('accounts').textContent='Bot accounts module missing. Confirm onyx-bot-accounts.js loaded first.'; }
  for(const id of ['spawn','split','feed']) {
    $(id+'Key').onkeydown=e=>{e.preventDefault();e.stopPropagation(); if(['Tab','ShiftLeft','ShiftRight','ControlLeft','AltLeft','MetaLeft','KeyP'].includes(e.code))return;
      if(e.code==='Escape'||e.code==='Backspace'||e.code==='Delete'){delete keys[id];$(id+'Key').value='';return;}
      for(const other of Object.keys(keys))if(keys[other]===e.code){delete keys[other];$(other+'Key').value='';}
      keys[id]=e.code;$(id+'Key').value=e.code;
    };
  }
  function typing(e){return e.composedPath().some(el=>el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));}
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||typing(e)||e.composedPath().includes(host)||state.paused)return;
    const id=Object.keys(keys).find(k=>keys[k]===e.code);
    if(!id||!state.bots.some(b=>b.ready))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(e.repeat)return;
    if(id==='feed')feeding=true;
    action(id);
  },true);
  window.addEventListener('keyup',e=>{if(e.code===keys.feed)feeding=false;},true);
  window.addEventListener('blur',()=>{feeding=false;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)feeding=false;});
  $('target').onchange=()=>{if($('target').value!=='hold')state.target=null;target();};
  $('follow').onchange=()=>{if(!$('follow').checked)feeding=false;};
  // Shadow retargeting keeps game shortcuts out of panel inputs.
  for(const type of ['keydown','keyup','mousedown','mouseup','wheel']) root.addEventListener(type,e=>e.stopPropagation());
  let ticks=0;
  const timer=setInterval(()=>{
    const entry=selected();$('server').value=entry?entry.mode_name+' · '+entry.host:'No supported server';
    if(state.bots.some(b=>b.worker||b.status==='Queued') && (!entry||entry.host!==state.host))stop('Server changed — reconnect bots.');
    ticks++;
    const point=target();
    $('targetStatus').textContent=point?('Target: '+Math.round(point.x)+', '+Math.round(point.y)):'Waiting for your player position — enter PLAY and update the hosted files.';
    if((feeding||($('autoFeed').checked&&point))&&!state.paused&&state.bots.some(b=>b.ready&&b.alive.length))action('feed');
    state.bots.forEach(b=>{if(!b.worker||!b.ready)return;autoSplit(b);if(ticks%10===0)b.worker.postMessage({type:'ping'});
      if(!state.paused&&$('auto').checked)spawnBot(b);
      if(!state.paused&&$('follow').checked&&point)b.worker.postMessage({type:'move',...point});});
  },100);
  window.addEventListener('pagehide',()=>{clearInterval(timer);stop();},{once:true});
  window.ONYXBots={stop,observePacket(){ /* Targets come from the active game's coordinate transform. */ }};

  document.body.appendChild(host);render();
})();
