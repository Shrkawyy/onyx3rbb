/* ============================================================
 * RYU CHAT - Real-time chat using Ably
 * ============================================================ */
(function () {
  'use strict';

  var ABLY_KEY = 'M3N05Q.U7oBUA:L6FE3rPuWW-ET_51xw8Uo-skX9yRfMz8zYMOzHuid5E';
  var CHANNEL_NAME = 'jaxv5-chat';

  var EMOJIS = [
    '😀','😂','😍','😎','🤔','😤','😡','🤯','😭','😱',
    '🤣','😊','😇','🥳','😜','🤩','😏','😒','😢','😤',
    '👍','👎','❤️','🔥','💀','⚡','🎯','💪','🏆','⭐',
    '🐍','🦅','🐉','🦁','🐺','🦊','🦈','🐝','🍀','💎',
    '💯','🔵','🟢','🔴','⚔️','🛡️','👑','🎮','💣','🚀',
    '😴','🤑','😈','👻','💩','🤖','👽','🦾','🧠','🫀',
    '🌙','☀️','🌊','🌪️','🌈','❄️','🍕','🍔','🍜','🎂',
    '🎉','🎊','🎸','🎵','🎬','📢','📌','✅','❌','⚠️'
  ];

  var ablyClient = null;
  var chatChannel = null;
  var chatOpen = false;
  var chatVisible = false;
  var emojiPickerOpen = false;
  var _collapsed = false;
  var unreadCount = 0;

  /* ── GET PLAYER NICKNAME ── */
  function getMyNick() {
    var sel = ['.input-nick1', '#nick-input', 'input[placeholder*="NICK" i]'];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && el.value && el.value.trim()) return el.value.trim();
    }
    return 'Player';
  }

  /* ── INJECT STYLES ── */
  function injectStyles() {
    if (document.getElementById('ryu-chat-style')) return;
    var style = document.createElement('style');
    style.id = 'ryu-chat-style';
    style.textContent = `
      #ryu-chat-box {
        position: fixed;
        bottom: 10px; left: 10px;
        width: calc(210px + 16vw);
        max-width: 400px;
        background: linear-gradient(180deg, hsla(190,35%,7%,0.92), hsla(220,20%,5%,0.92));
        border: 1px solid rgba(45,212,191,0.18);
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.3), 0 0 18px rgba(45,212,191,0.06);
        display: flex; flex-direction: column;
        z-index: 99999999;
        font-family: 'Titillium Web', 'Segoe UI', sans-serif;
        font-size: 12px;
        backdrop-filter: blur(6px);
        user-select: none;
        pointer-events: auto;
        overflow: hidden;
      }
      #ryu-chat-box.ryu-chat-hidden { display: none !important; }

      #ryu-chat-header {
        display: flex; align-items: center;
        justify-content: space-between;
        padding: 7px 10px;
        background: linear-gradient(90deg, rgba(45,212,191,0.10), transparent);
        border-bottom: 1px solid rgba(45,212,191,0.12);
        cursor: pointer; flex-shrink: 0;
      }
      #ryu-chat-header-title {
        font-size: 10px; letter-spacing: 2.5px;
        color: rgba(210,255,250,0.75);
        text-transform: uppercase;
        font-weight: 600;
        display: flex; align-items: center; gap: 6px;
      }
      #ryu-chat-status {
        width: 7px; height: 7px; border-radius: 50%;
        background: #ff5566;
        box-shadow: 0 0 6px rgba(255,85,102,0.7);
        display: inline-block;
        transition: background 0.3s, box-shadow 0.3s;
      }
      #ryu-chat-status.connected { background: #2dd4bf; box-shadow: 0 0 8px rgba(45,212,191,0.9); animation: ryu-chat-pulse 1.8s ease-out infinite; }
      @keyframes ryu-chat-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(45,212,191,0.5), 0 0 8px rgba(45,212,191,0.9); }
        70%  { box-shadow: 0 0 0 6px rgba(45,212,191,0), 0 0 8px rgba(45,212,191,0.9); }
        100% { box-shadow: 0 0 0 0 rgba(45,212,191,0), 0 0 8px rgba(45,212,191,0.9); }
      }
      #ryu-chat-toggle-btn {
        background: none; border: none;
        color: rgba(45,212,191,0.6);
        font-size: 10px; cursor: pointer;
        transition: color 0.15s, transform 0.15s;
      }
      #ryu-chat-toggle-btn:hover { color: #2dd4bf; }

      #ryu-chat-messages {
        flex: 1;
        overflow-y: scroll;
        max-height: calc(130px + 10vh);
        display: flex; flex-direction: column-reverse;
        padding: 6px 8px; margin: 0;
        scrollbar-width: none; gap: 2px;
        transition: max-height 0.2s;
      }
      #ryu-chat-messages.collapsed { max-height: 0 !important; padding: 0 !important; overflow: hidden !important; }
      #ryu-chat-messages::-webkit-scrollbar { display: none; }

      .ryu-chat-msg {
        font-size: calc(10px + 0.2vh);
        line-height: 1.5; color: rgba(215,225,230,0.92);
        word-break: break-word; padding: 2px 6px;
        border-radius: 4px; transition: background 0.1s;
        border-left: 2px solid transparent;
      }
      .ryu-chat-msg:hover { background: rgba(45,212,191,0.06); border-left-color: rgba(45,212,191,0.35); }
      .ryu-chat-msg .ryu-chat-nick {
        font-weight: 700; margin-right: 4px;
      }
      .ryu-chat-msg .ryu-chat-nick.own { color: #2dd4bf; text-shadow: 0 0 6px rgba(45,212,191,0.5); }
      .ryu-chat-msg .ryu-chat-time {
        font-size: 9px; color: rgba(255,255,255,0.25);
        margin-right: 4px;
      }
      .ryu-chat-msg.system-msg {
        color: rgba(255,190,60,0.8);
        font-style: italic; font-size: 10px;
      }

      #ryu-chat-input-wrap {
        display: flex; align-items: center;
        border-top: 1px solid rgba(45,212,191,0.1);
        background: rgba(0,0,0,0.15);
        padding: 6px 8px; gap: 6px; flex-shrink: 0;
      }
      #ryu-chat-input-wrap.collapsed { display: none; }

      #ryu-chat-input {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(45,212,191,0.12); border-radius: 5px;
        color: rgba(230,245,245,0.95);
        font-size: calc(9px + 0.3vh);
        padding: 5px 9px; outline: none;
        opacity: 0.55; pointer-events: none;
        transition: border 0.15s, opacity 0.15s, background 0.15s;
      }
      #ryu-chat-input.active {
        opacity: 1; pointer-events: auto;
        background: rgba(45,212,191,0.05);
        border-color: rgba(45,212,191,0.5);
        box-shadow: 0 0 8px rgba(45,212,191,0.12);
      }
      #ryu-chat-input::placeholder { color: rgba(255,255,255,0.28); }

      #ryu-chat-emoji-btn {
        background: none; border: none;
        font-size: 16px; cursor: pointer;
        opacity: 0.5; pointer-events: none;
        transition: opacity 0.15s, transform 0.15s;
        padding: 2px 4px; line-height: 1;
      }
      #ryu-chat-emoji-btn.active { opacity: 0.9; pointer-events: auto; }
      #ryu-chat-emoji-btn:hover { transform: scale(1.2); opacity: 1; }

      #ryu-emoji-picker {
        position: fixed; top: 0; left: 0;
        width: calc(210px + 16vw); max-width: 400px;
        background: hsla(190,30%,8%,0.97);
        border: 1px solid rgba(45,212,191,0.2);
        border-radius: 10px;
        padding: 6px; display: none; flex-wrap: wrap;
        gap: 2px; z-index: 100000000;
        max-height: 180px; overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        scrollbar-width: thin;
        scrollbar-color: rgba(45,212,191,0.25) transparent;
      }
      #ryu-emoji-picker.open { display: flex; }
      #ryu-emoji-picker::-webkit-scrollbar { width: 4px; }
      #ryu-emoji-picker::-webkit-scrollbar-thumb { background: rgba(45,212,191,0.25); border-radius: 2px; }

      .ryu-emoji-btn {
        background: none; border: none;
        font-size: 18px; cursor: pointer;
        padding: 3px 4px; border-radius: 4px;
        transition: background 0.1s, transform 0.1s; line-height: 1;
      }
      .ryu-emoji-btn:hover { background: rgba(45,212,191,0.15); transform: scale(1.25); }

      #ryu-chat-badge {
        background: #ff5566; color: #fff;
        font-size: 9px; font-weight: 700;
        border-radius: 8px; padding: 1px 5px;
        display: none;
      }
      #ryu-chat-badge.show { display: inline-block; }
    `;
    document.head.appendChild(style);
  }

  /* ── BUILD DOM ── */
  function buildChat() {
    injectStyles();

    // Hide old chat
    var old = document.getElementById('chat-container');
    if (old) old.style.display = 'none';

    var box = document.createElement('div');
    box.id = 'ryu-chat-box';
    box.classList.add('ryu-chat-hidden');
    box.innerHTML = `
      <div id="ryu-chat-header">
        <span id="ryu-chat-header-title">
          <span id="ryu-chat-status"></span>
          💬 CHAT <span id="ryu-chat-badge"></span>
        </span>
        <button id="ryu-chat-toggle-btn">▲</button>
      </div>
      <div id="ryu-chat-messages"></div>
      <div id="ryu-chat-input-wrap">
        <button id="ryu-chat-emoji-btn">😊</button>
        <input id="ryu-chat-input" type="text" placeholder="Enter للكتابة…" maxlength="120" autocomplete="off" spellcheck="false">
      </div>
    `;
    document.body.appendChild(box);

    var picker = document.createElement('div');
    picker.id = 'ryu-emoji-picker';
    EMOJIS.forEach(function(em) {
      var btn = document.createElement('button');
      btn.className = 'ryu-emoji-btn';
      btn.textContent = em;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var inp = document.getElementById('ryu-chat-input');
        if (!inp) return;
        var s = inp.selectionStart || inp.value.length;
        inp.value = inp.value.slice(0, s) + em + inp.value.slice(inp.selectionEnd || s);
        inp.selectionStart = inp.selectionEnd = s + em.length;
        inp.focus();
      });
      picker.appendChild(btn);
    });
    document.body.appendChild(picker);

    wireChat();
  }

  /* ── ABLY CONNECT ── */
  function connectAbly() {
    if (typeof Ably === 'undefined') {
      // Load Ably SDK
      var script = document.createElement('script');
      script.src = 'https://cdn.ably.com/lib/ably.min-1.js';
      script.onload = function() { initAbly(); };
      script.onerror = function() { addMessage('', '⚠️ تعذر تحميل الشات', false, true); };
      document.head.appendChild(script);
    } else {
      initAbly();
    }
  }

  function initAbly() {
    try {
      ablyClient = new Ably.Realtime({ key: ABLY_KEY, clientId: getMyNick() + '_' + Math.random().toString(36).slice(2,6) });

      ablyClient.connection.on('connected', function() {
        var status = document.getElementById('ryu-chat-status');
        if (status) status.classList.add('connected');
        addMessage('', '✅ Chat connected. Press Enter to type.', false, true);
        subscribeChannel();
      });

      ablyClient.connection.on('disconnected', function() {
        var status = document.getElementById('ryu-chat-status');
        if (status) status.classList.remove('connected');
        addMessage('', '🔴 انقطع الاتصال...', false, true);
      });

      ablyClient.connection.on('failed', function() {
        addMessage('', '❌ فشل الاتصال بالشات', false, true);
      });

    } catch(e) {
      addMessage('', '❌ خطأ في الشات: ' + e.message, false, true);
    }
  }

  function subscribeChannel() {
    try {
      chatChannel = ablyClient.channels.get(CHANNEL_NAME);
      chatChannel.subscribe('msg', function(message) {
        var data = message.data;
        if (!data) return;
        var isOwn = (data.nick === getMyNick());
        addMessage(data.nick, data.text, isOwn, false);
      });
    } catch(e) {}
  }

  /* ── SEND MESSAGE ── */
  function sendMessage(text) {
    if (!text || !text.trim()) return;
    text = text.trim();
    if (!chatChannel) {
      addMessage('', '⚠️ الشات مش متصل', false, true);
      return;
    }
    var nick = getMyNick();
    try {
      chatChannel.publish('msg', { nick: nick, text: text });
    } catch(e) {
      addMessage('', '⚠️ فشل الإرسال', false, true);
    }
  }

  /* ── ADD MESSAGE TO UI ── */
  function nickColor(nick) {
    var hash = 0;
    for (var i = 0; i < nick.length; i++) hash = (hash * 31 + nick.charCodeAt(i)) >>> 0;
    var hue = hash % 360;
    return 'hsl(' + hue + ', 70%, 68%)';
  }

  function addMessage(nick, text, isOwn, isSystem) {
    var container = document.getElementById('ryu-chat-messages');
    if (!container) return;

    var now = new Date();
    var time = ('0'+now.getHours()).slice(-2) + ':' + ('0'+now.getMinutes()).slice(-2);

    var div = document.createElement('div');
    div.className = 'ryu-chat-msg' + (isSystem ? ' system-msg' : '');

    if (isSystem) {
      div.textContent = text;
    } else {
      var timeEl = document.createElement('span');
      timeEl.className = 'ryu-chat-time';
      timeEl.textContent = time;

      var nickEl = document.createElement('span');
      nickEl.className = 'ryu-chat-nick' + (isOwn ? ' own' : '');
      if (!isOwn) nickEl.style.color = nickColor(nick);
      nickEl.textContent = nick + ':';

      div.appendChild(timeEl);
      div.appendChild(nickEl);
      div.appendChild(document.createTextNode(' ' + text));
    }

    if (container.firstChild) container.insertBefore(div, container.firstChild);
    else container.appendChild(div);

    while (container.children.length > 100) container.removeChild(container.lastChild);

    if (!isOwn && !isSystem) {
      unreadCount++;
      var badge = document.getElementById('ryu-chat-badge');
      if (badge && !chatOpen) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.add('show');
      }
    }
  }

  /* ── OPEN / CLOSE INPUT ── */
  function openInput() {
    chatOpen = true;
    unreadCount = 0;
    var inp = document.getElementById('ryu-chat-input');
    var emojiBtn = document.getElementById('ryu-chat-emoji-btn');
    var badge = document.getElementById('ryu-chat-badge');
    if (inp) { inp.classList.add('active'); inp.focus(); }
    if (emojiBtn) emojiBtn.classList.add('active');
    if (badge) { badge.textContent = ''; badge.classList.remove('show'); }
  }
  function closeInput() {
    chatOpen = false; emojiPickerOpen = false;
    var inp = document.getElementById('ryu-chat-input');
    var emojiBtn = document.getElementById('ryu-chat-emoji-btn');
    var picker = document.getElementById('ryu-emoji-picker');
    if (inp) { inp.classList.remove('active'); inp.blur(); inp.value = ''; }
    if (emojiBtn) emojiBtn.classList.remove('active');
    if (picker) picker.classList.remove('open');
  }

  /* ── COLLAPSE ── */
  function setCollapsed(c) {
    _collapsed = c;
    var msgs = document.getElementById('ryu-chat-messages');
    var wrap = document.getElementById('ryu-chat-input-wrap');
    var btn = document.getElementById('ryu-chat-toggle-btn');
    if (msgs) msgs.classList.toggle('collapsed', c);
    if (wrap) wrap.classList.toggle('collapsed', c);
    if (btn) btn.textContent = c ? '▼' : '▲';
  }

  /* ── SHOW / HIDE BOX ── */
  function showChatBox() {
    chatVisible = true;
    var box = document.getElementById('ryu-chat-box');
    if (box) box.classList.remove('ryu-chat-hidden');
  }

  /* ── WIRE EVENTS ── */
  function wireChat() {
    var inp = document.getElementById('ryu-chat-input');
    var emojiBtn = document.getElementById('ryu-chat-emoji-btn');
    var picker = document.getElementById('ryu-emoji-picker');
    var header = document.getElementById('ryu-chat-header');
    var toggleBtn = document.getElementById('ryu-chat-toggle-btn');

    header.addEventListener('click', function(e) {
      if (toggleBtn.contains(e.target)) return;
      if (!chatOpen && !_collapsed) openInput();
    });

    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      setCollapsed(!_collapsed);
    });

    emojiBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      emojiPickerOpen = !emojiPickerOpen;
      if (emojiPickerOpen) {
        var box = document.getElementById('ryu-chat-box');
        if (box) {
          var r = box.getBoundingClientRect();
          // #ryu-chat-box is anchored to the bottom of the screen (bottom: 10px),
          // so r.bottom sits right at the edge of the viewport. Anchoring the
          // picker's *top* there pushed it off-screen below the fold.
          // Anchor it by `bottom` instead so it opens upward, above the chat box.
          picker.style.left = r.left + 'px';
          picker.style.top = 'auto';
          picker.style.bottom = (window.innerHeight - r.top + 6) + 'px';
        }
      }
      picker.classList.toggle('open', emojiPickerOpen);
    });

    inp.addEventListener('keydown', function(e) {
      e.stopPropagation();
      if (e.key === 'Enter' || e.keyCode === 13) {
        var val = inp.value.trim();
        inp.value = '';
        emojiPickerOpen = false;
        picker.classList.remove('open');
        if (val) sendMessage(val);
        else closeInput();
      } else if (e.key === 'Escape') {
        closeInput();
      }
    });
    inp.addEventListener('keyup', function(e) { e.stopPropagation(); });
    inp.addEventListener('keypress', function(e) { e.stopPropagation(); });

    // Global Enter to open chat
    document.addEventListener('keydown', function(e) {
      if (!chatVisible || _collapsed || chatOpen) return;
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'Enter' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        openInput();
      }
    }, true);

    // Close emoji picker on outside click
    document.addEventListener('click', function(e) {
      if (!emojiPickerOpen) return;
      if (!picker.contains(e.target) && !emojiBtn.contains(e.target)) {
        emojiPickerOpen = false;
        picker.classList.remove('open');
      }
    }, true);
  }

  /* ── DETECT GAME START ── */
  function detectGameStart() {
    var lobby = document.querySelector('.lobby-overlay');
    if (!lobby) { showChatBox(); connectAbly(); return; }

    var obs = new MutationObserver(function() {
      var hidden = lobby.style.display === 'none' || window.getComputedStyle(lobby).display === 'none';
      if (hidden) { showChatBox(); connectAbly(); obs.disconnect(); }
    });
    obs.observe(lobby, { attributes: true, attributeFilter: ['style','class'] });

    // Also check after delay
    setTimeout(function() {
      var hidden = lobby.style.display === 'none' || window.getComputedStyle(lobby).display === 'none';
      if (hidden && !chatVisible) { showChatBox(); connectAbly(); }
    }, 3000);
  }

  /* ── INIT ── */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    buildChat();
    detectGameStart();
  }

  init();

  globalThis.__ryuChat = { show: showChatBox, send: sendMessage, add: addMessage };
})();
