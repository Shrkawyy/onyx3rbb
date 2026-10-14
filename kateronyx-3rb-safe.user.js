// ==UserScript==
// @name         KaterOnyx FFA for 3rb.io
// @namespace    https://kateronyx.local/ffa
// @version      3.0.0
// @description  Safe 3rb.io companion: keeps official game running, displays server discovery. Legacy Senpa bots disabled until 3rb V5 compatibility is implemented.
// @author       ZkaOnyx
// @match        https://3rb.io/*
// @match        https://www.3rb.io/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      3rb.io
// @noframes
// @updateURL    none
// @downloadURL  none
// ==/UserScript==

(function (global) {
  'use strict';
  const ENDPOINT = 'https://3rb.io/php/Servers.php';
  const VERSION = '3.0.0-safe';
  const VALID_HOST = /^(?:[a-z0-9-]+\.)*3rb\.io$/i;

  function normalizeCatalogue(data) {
    if (!data || typeof data !== 'object' || !data.modes || typeof data.modes !== 'object' || Array.isArray(data.modes)) {
      throw new Error('صيغة قائمة السيرفرات غير معروفة');
    }
    const hostname = String(data.ip || '').trim().toLowerCase();
    if (!VALID_HOST.test(hostname)) throw new Error('عنوان السيرفر ليس تابعًا لـ 3rb.io');
    const list = [];
    const seen = new Set();
    for (const [mode, entry] of Object.entries(data.modes)) {
      if (!entry || !Array.isArray(entry.servers)) continue;
      for (const item of entry.servers) {
        if (!item || typeof item !== 'object') continue;
        const port = Number(item.port);
        if (!Number.isInteger(port) || port < 1 || port > 65535 || seen.has(mode + ':' + port)) continue;
        seen.add(mode + ':' + port);
        const count = Number(item.count);
        const capacity = Number(entry.max);
        list.push({
          mode: String(mode).slice(0, 45),
          name: String(item.name || mode).slice(0, 90),
          players: item.count != null && Number.isInteger(count) && count >= 0 ? count : null,
          capacity: entry.max != null && Number.isInteger(capacity) && capacity >= 0 ? capacity : null,
          port: port,
          url: `wss://${hostname}:${port}/V5`
        });
      }
    }
    if (!list.length) throw new Error('الكتالوج لا يحتوي على سيرفرات صالحة');
    return list;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { normalizeCatalogue };
  if (!global.document || !global.location || !/^(www\.)?3rb\.io$/i.test(global.location.hostname)) return;
  if (global.document.getElementById('onyx-3rb-native-companion')) return;

  const state = { servers: [], error: '', fetchedAt: '', busy: false, filter: 'all', visible: true };
  const outer = global.document.createElement('div');
  outer.id = 'onyx-3rb-native-companion';
  Object.assign(outer.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: '2147483646', pointerEvents: 'auto' });
  const shadow = outer.attachShadow({mode:'open'});
  shadow.innerHTML = `<style>
    :host{direction:rtl;all:initial;font:12px/1.7 system-ui,Tahoma,Arial,sans-serif;color:#e9e6e0}
    *{box-sizing:border-box} .panel{width:min(405px,calc(100vw - 32px));max-height:min(76vh,620px);display:flex;flex-direction:column;overflow:hidden;border:1px solid #aa8131;border-radius:12px;background:#101116f5;box-shadow:0 12px 40px #000a}
    .header{display:flex;align-items:center;gap:9px;padding:12px 14px;background:#181820;border-bottom:1px solid #534023}
    .mark{width:10px;height:10px;border-radius:50%;background:#eab94e;box-shadow:0 0 13px #eab94e8b;flex:none}
    strong{font-weight:750}.brand{flex:1;min-width:0;font-size:14px}.version{font-size:10px;color:#c5af79}
    button,select{font:inherit;background:#191c23;color:#f1e9d7;border:1px solid #4d4538;border-radius:7px;padding:7px 9px;cursor:pointer}
    button:hover,select:hover{border-color:#e1b14e}button:focus-visible,select:focus-visible{outline:2px solid #e1b14e;outline-offset:1px}button:disabled{opacity:.5;cursor:not-allowed}
    .scroll{padding:12px 14px;overflow-y:auto;overscroll-behavior:contain}.muted{color:#aeb0bf}.good{color:#a8d3b8}.warn{color:#f0c27a}.error{color:#ffac9c}
    .note{border:1px solid #3c4139;border-radius:7px;padding:9px;margin:8px 0;background:#19211e}
    .line{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:10px 0}.line select{flex:1;min-width:100px}
    .item{display:flex;align-items:center;gap:8px;border-top:1px solid #33323a;padding:9px 0}.item-body{flex:1;min-width:0}.server-name{font-weight:650;overflow-wrap:anywhere}.tiny{font-size:10px;color:#a6a5af;overflow-wrap:anywhere;direction:ltr;text-align:right}.subtle{font-size:11px;color:#b7bbc4}
    .footer{margin-top:9px;border-top:1px solid #393741;padding-top:9px}.chip{padding:10px 14px;border-radius:28px;border:1px solid #b79245;background:#14151c;box-shadow:0 6px 16px #0009}
    .hidden{display:none!important} .buttons{display:flex;gap:6px;flex-wrap:wrap} .count{font-size:11px;color:#e0c17b}
  </style>
  <section id="panel" class="panel" lang="ar">
    <div class="header"><span class="mark"></span><strong class="brand">ONYX · 3rb.io</strong><span class="version">SAFE 3.0</span><button id="minimize" title="تصغير">−</button></div>
    <div class="scroll">
      <div class="note"><strong class="good">اللعبة الأصلية شغّالة بدون استبدال</strong><div class="subtle">الإضافة لا توقف محرك 3rb ولا تتدخل في اتصالات WebSocket أو WASM أو التحقق.</div></div>
      <div class="line"><strong>سيرفرات 3rb الرسمية</strong><span class="count" id="count">—</span></div>
      <div class="line"><select id="mode" aria-label="تصفية نوع السيرفر"><option value="all">كل الأنواع</option></select><button id="refresh">تحديث</button><button id="copy-report">نسخ التقرير</button></div>
      <div id="status" class="muted" aria-live="polite">جارِ قراءة قائمة السيرفرات...</div>
      <div id="servers" role="list"></div>
      <div class="footer"><strong>تشغيل السيرفر</strong><div class="subtle">ادخل السيرفر من زر MODES / PLAY داخل اللعبة الأصلية. عرض العنوان هنا للتشخيص فقط؛ اختيار سيرفر في القائمة لا ينشئ اتصال لعب جديد.</div></div>
      <div class="footer"><strong class="warn">البوتات والمالتي</strong><div class="subtle">محرك البوتات الحالي خاص بـ Senpa وليس متوافقًا مع 3rb V5. تم تعطيله بدل إنشاء اتصالات فاشلة أو طلب JWT من Senpa. يحتاج عميل 3rb متوافقًا وأذونات السيرفر.</div></div>
    </div>
  </section><button id="restore" class="chip hidden">ONYX · 3rb</button>`;
  const $ = id => shadow.getElementById(id);
  const setStatus = (message, cssClass = 'muted') => { $('status').className = cssClass; $('status').textContent = message; };
  function mount() {
    if (global.document.getElementById(outer.id)) return;
    (global.document.body || global.document.documentElement).appendChild(outer);
  }
  mount();

  function render() {
    const modes = [...new Set(state.servers.map(s => s.mode))];
    const oldFilter = $('mode').value;
    $('mode').replaceChildren();
    for (const [value,label] of [['all','كل الأنواع'],...modes.map(x=>[x,x])]) {
      const opt = global.document.createElement('option'); opt.value = value; opt.textContent = label; $('mode').appendChild(opt);
    }
    $('mode').value = modes.includes(oldFilter) ? oldFilter : 'all';
    state.filter = $('mode').value;
    const shown = state.servers.filter(s => state.filter === 'all' || s.mode === state.filter);
    $('count').textContent = `${state.servers.length} سيرفر`;
    const fragment = global.document.createDocumentFragment();
    for (const s of shown.slice(0,120)) {
      const row = global.document.createElement('div'); row.className='item'; row.setAttribute('role','listitem');
      const body = global.document.createElement('div');body.className='item-body';
      const name=global.document.createElement('div');name.className='server-name';name.textContent=s.name;
      const info=global.document.createElement('div');info.className='subtle';info.textContent=`${s.mode} · ${s.players == null ? '?' : s.players}${s.capacity == null ? '' : '/' + s.capacity} لاعب`;
      const url=global.document.createElement('div');url.className='tiny';url.textContent=s.url;
      body.append(name,info,url);
      const copy=global.document.createElement('button');copy.textContent='نسخ';copy.setAttribute('aria-label',`نسخ عنوان ${s.name}`);
      copy.addEventListener('click',()=>copyText(s.url));
      row.append(body,copy);fragment.appendChild(row);
    }
    $('servers').replaceChildren(fragment);
    if(shown.length>120) setStatus('معروض أول 120 سيرفر. اختر النوع لعرض البقية.', 'warn');
  }

  async function copyText(text) {
    try {
      if (typeof GM_setClipboard === 'function') GM_setClipboard(text, 'text');
      else await global.navigator.clipboard.writeText(text);
      setStatus('تم نسخ النص.', 'good');
    } catch (error) { setStatus('تعذّر النسخ: ' + String(error.message || error), 'error'); }
  }

  function fetchViaGM() {
    return new Promise((resolve,reject) => {
      if (typeof GM_xmlhttpRequest !== 'function') return reject(new Error('GM_xmlhttpRequest غير متاح'));
      GM_xmlhttpRequest({
        method:'GET', url:ENDPOINT, timeout:12000,
        onload: response => {
          if (response.status !== 200) return reject(new Error(`HTTP ${response.status}`));
          try { resolve(JSON.parse(response.responseText)); }
          catch (_) { reject(new Error('استجابة الكتالوج ليست JSON')); }
        },
        onerror:()=>reject(new Error('خطأ في الاتصال بالكتالوج')),
        ontimeout:()=>reject(new Error('انتهت مهلة الاتصال بالكتالوج'))
      });
    });
  }

  async function refresh() {
    if (state.busy) return;
    state.busy=true; $('refresh').disabled=true;
    setStatus('جارِ فحص السيرفرات الرسمية...', 'muted');
    try {
      let raw;
      try {
        const response=await global.fetch(ENDPOINT,{credentials:'same-origin',cache:'no-store'});
        if(!response.ok) throw new Error('HTTP '+response.status);
        raw=await response.json();
      } catch (error) {
        // Try userscript transport if the page request is blocked. This does not bypass game verification.
        raw=await fetchViaGM();
      }
      state.servers=normalizeCatalogue(raw);
      state.fetchedAt=new Date().toISOString(); state.error='';
      render();
      setStatus('تم تحديث قائمة السيرفرات. الاتصال واللعب يتمان من داخل اللعبة الأصلية.', 'good');
      console.info('[ONYX 3RB SAFE] Server catalogue loaded:',state.servers.length);
    } catch(error) {
      state.error=String(error.message || error);
      setStatus('تعذّر قراءة كتالوج السيرفرات: '+state.error+' — اللعبة الأصلية لم تتأثر.', 'error');
      console.warn('[ONYX 3RB SAFE] Server catalogue error:',state.error);
    } finally {state.busy=false;$('refresh').disabled=false;}
  }
  function report(){
    return ['ONYX 3rb safe report '+VERSION,'Time: '+new Date().toISOString(),
      'URL: https://3rb.io/','Official client preserved: yes',
      'Catalog: '+state.servers.length+' entries','Last checked: '+(state.fetchedAt||'never'),
      'Catalog error: '+(state.error||'none'),'Legacy Senpa/WASM bots: disabled',
      ...state.servers.map(s=>`${s.mode} | ${s.name} | ${s.players??'?'}${s.capacity==null?'':'/'+s.capacity} | ${s.url}`)].join('\n');
  }
  $('mode').addEventListener('change',()=>{state.filter=$('mode').value;render();});
  $('refresh').addEventListener('click',refresh);
  $('copy-report').addEventListener('click',()=>copyText(report()));
  $('minimize').addEventListener('click',()=>{$('panel').classList.add('hidden');$('restore').classList.remove('hidden');});
  $('restore').addEventListener('click',()=>{$('restore').classList.add('hidden');$('panel').classList.remove('hidden');});
  // Only shield pointer events inside the panel. Native game networking and game control remain untouched.
  ['pointerdown','pointerup','mousedown','mouseup','click','wheel','keydown','keyup'].forEach(type=>{
    shadow.addEventListener(type,e=>e.stopPropagation());
  });
  refresh();
})(typeof window !== 'undefined' ? window : globalThis);
