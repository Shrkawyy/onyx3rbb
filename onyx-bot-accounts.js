/* Bot-only OAuth session manager. Does not modify the game's primary login.
 * One browser profile shares provider cookies; separate tokens do NOT imply
 * server permission for concurrent logins or connections.
 * Bot tokens are held in memory for this tab and are never exported to logs.
 */
(function (global) {
  'use strict';
  if (global.ONYXBotAccounts) return;
  var AUTH_ORIGIN = 'https://api.senpa.io';
  var SLOT_COUNT = 9; // 1 game login (existing UI) + 9 bot logins = 10 total
  var slots = Array.from({length:SLOT_COUNT}, function(_,i) {
    return {id:i+1, token:null, profile:null, status:'Not signed in', code:null};
  });
  var pending = null;
  var handledPopups = new WeakSet();
  var listeners = [];
  function notify(slot, event, detail) {
    listeners.forEach(function(cb) { try { cb(slot.id, event, detail || ''); } catch (_) {} });
  }
  function jwtAlive(token) {
    if (typeof token !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return false;
    try {
      var b64=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      var payload=JSON.parse(atob(b64.padEnd(Math.ceil(b64.length/4)*4,'=')));
      return !payload.exp || payload.exp * 1000 > Date.now() + 30000;
    } catch (_) { return false; }
  }
  function explainStatus(status) {
    if (status === 401) return '401 Unauthorized — login session invalid or expired (not proof of ban)';
    if (status === 403) return '403 Forbidden — rejected or restricted; only Senpa can confirm whether banned';
    if (status === 429) return '429 Too Many Requests — retry later';
    if (status >= 500) return status + ' — Senpa API/server error';
    return 'HTTP ' + status + ' — account verification failed';
  }
  function publicSlot(slot) {
    return {id:slot.id, status:slot.status, code:slot.code,
      name:slot.profile && (slot.profile.username || slot.profile.nickname || slot.profile.name || slot.profile.id) || '',
      verified:!!slot.token && jwtAlive(slot.token)};
  }
  function getToken(id) {
    var slot=slots[Number(id)-1];
    if (!slot || !slot.token) return null;
    if (!jwtAlive(slot.token)) {
      slot.token=null; slot.status='Session expired — sign in again'; slot.code='JWT_EXPIRED';
      notify(slot,'AUTH_EXPIRED',slot.status);
      return null;
    }
    return slot.token;
  }
  async function verifyAndStore(slot,token) {
    if (!jwtAlive(token)) {
      slot.status='Invalid or expired JWT';slot.code='INVALID_TOKEN';notify(slot,'AUTH_FAILED',slot.status);
      return;
    }
    slot.status='Checking with Senpa API…';slot.code=null;notify(slot,'AUTH_PENDING',slot.status);
    try {
      var result=await fetch(AUTH_ORIGIN+'/account/', {
        method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store'
      });
      if (!result.ok) {
        slot.token=null;slot.profile=null;slot.code=result.status;
        slot.status=explainStatus(result.status);notify(slot,'AUTH_REJECTED',slot.status);
        return;
      }
      var account=await result.json();
      slot.token=token;slot.profile=account;slot.code=200;slot.status='Verified by Senpa';
      notify(slot,'AUTH_VERIFIED',slot.status);
      // A shared provider cookie or server-wide session policy can invalidate primary.
      var primary=global.ONYXAuth && global.ONYXAuth.getSenpaToken && global.ONYXAuth.getSenpaToken();
      if (primary && primary!==token) {
        try {
          var check=await fetch(AUTH_ORIGIN+'/account/',{
            headers:{Authorization:'Bearer '+primary},cache:'no-store'});
          if (!check.ok) notify(slot,'PRIMARY_SESSION_WARNING',
            'Primary account check returned '+check.status+'. Shared browser cookies or server login policy may be invalidating it.');
        } catch (_) { notify(slot,'PRIMARY_SESSION_CHECK', 'Primary session could not be verified (network/CORS)'); }
      }
    } catch (err) {
      slot.token=null;slot.profile=null;slot.code='NETWORK';
      slot.status='Verification request failed (network/CORS).';
      notify(slot,'AUTH_NETWORK_ERROR',slot.status);
    }
  }
  function login(id,provider) {
    var slot=slots[Number(id)-1];
    if (!slot) return false;
    if (pending) {
      notify(slot,'AUTH_BUSY','Finish or cancel the other bot-account login first.');
      return false;
    }
    if (provider!=='facebook' && provider!=='discord') return false;
    var popup=global.open(AUTH_ORIGIN+'/auth/'+provider,
      'OnyxBotAccountLogin', 'toolbar=no,menubar=no,width=600,height=700,top=100,left=100');
    if (!popup) { notify(slot,'POPUP_BLOCKED','Allow popup windows for this website.');return false; }
    pending={slot:slot,popup:popup};
    slot.token=null;slot.profile=null; // A new login must be verified independently.
    slot.status='Complete official '+provider+' login in popup…';slot.code=null;
    notify(slot,'AUTH_STARTED',slot.status);
    try { popup.focus(); } catch (_) {}
    return true;
  }
  // Capture messages from *our own popup* before the game's primary auth listener.
  // This is essential to avoid overwriting senpaio:session on a bot-only login.
  global.addEventListener('message',function(event) {
    if (event.origin!==AUTH_ORIGIN) return;
    if (handledPopups.has(event.source)) {
      if (event.data && (event.data.access_token || event.data.token || event.data.type==='senpa-auth-ready')) event.stopImmediatePropagation();
      return;
    }
    if (!pending || event.source!==pending.popup) return;
    var data=event.data || {};
    if (data.type==='senpa-auth-ready') {
      event.stopImmediatePropagation();
      try { event.source.postMessage({type:'senpa-auth-hello'},AUTH_ORIGIN); } catch (_) {}
      return;
    }
    var token=typeof data.access_token==='string'?data.access_token:
      typeof data.token==='string'?data.token:null;
    if (!token) return;
    event.stopImmediatePropagation();
    var slot=pending.slot;handledPopups.add(event.source);pending=null;
    try { event.source.postMessage({type:'senpa-auth-done'},AUTH_ORIGIN); } catch (_) {}
    verifyAndStore(slot,token);
  },true);
  function clear(id) {
    var slot=slots[Number(id)-1];if(!slot)return;
    if(pending && pending.slot===slot){try{pending.popup.close();}catch(_){}pending=null;}
    slot.token=null;slot.profile=null;slot.status='Signed out (bot slot only)';slot.code=null;
    notify(slot,'AUTH_LOGOUT',slot.status);
  }
  function cancelPending(){
    if (!pending) return;
    var slot=pending.slot;
    try {pending.popup.close();}catch(_){}
    pending=null;slot.status='Login cancelled';notify(slot,'AUTH_CANCELLED',slot.status);
  }
  global.ONYXBotAccounts={count:SLOT_COUNT,login:login,getToken:getToken,
    getStatus:function(id){return slots[Number(id)-1]?publicSlot(slots[Number(id)-1]):null;},
    clear:clear,cancelPending:cancelPending,subscribe:function(callback){
      listeners.push(callback);return function(){listeners=listeners.filter(function(cb){return cb!==callback;});};
    }
  };
})(window);
