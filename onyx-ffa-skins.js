/**
 * Senpa FFA skins + minimap (names + positions).
 * Overlay only — does not change deo.onyx, WASM, spawn, input, or auth.
 *
 * Opcode 11: player skins. Opcode 22: minimap ghosts. Opcode 10: nicks.
 * Positions use the same Ogar mapping as ONYX minimap-nodes:
 *   shrink FFA 0..border → centered map, then (7000 + x) / 14142 * canvasSize
 */
(function (global) {
  'use strict';

  var DEO_EDGE = 14142;
  var DEO_OFFSET = 7000;

  var clients = Object.create(null);
  var players = Object.create(null);
  var nickByPid = Object.create(null);
  var nickByCid = Object.create(null);
  var minimap = Object.create(null);
  var cells = Object.create(null);
  var skinCache = Object.create(null);
  var failedSkins = Object.create(null);
  var border = 0;
  var myClientId = 0;
  var ownPlayerIds = [];
  var camX = 0;
  var camY = 0;
  var spectateX = 0;
  var spectateY = 0;
  var hasSpectate = false;
  var camInited = false;
  var hooked = false;
  var raf = 0;
  var loggedSkins = false;

  function log(msg) {
    console.log('[ONYX-SKINS] ' + msg);
  }

  function Reader(u8) {
    this.u8 = u8;
    this.v = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    this.o = 0;
  }
  Reader.prototype.u8n = function () {
    var n = this.v.getUint8(this.o);
    this.o += 1;
    return n;
  };
  Reader.prototype.i8 = function () {
    var n = this.v.getInt8(this.o);
    this.o += 1;
    return n;
  };
  Reader.prototype.u16 = function () {
    var n = this.v.getUint16(this.o, true);
    this.o += 2;
    return n;
  };
  Reader.prototype.i32 = function () {
    var n = this.v.getInt32(this.o, true);
    this.o += 4;
    return n;
  };
  Reader.prototype.u32 = function () {
    var n = this.v.getUint32(this.o, true);
    this.o += 4;
    return n;
  };
  Reader.prototype.u24 = function () {
    var a = this.u8n();
    var b = this.u8n();
    var c = this.u8n();
    return a | (b << 8) | (c << 16);
  };
  Reader.prototype.utf8 = function () {
    var n = this.u8n();
    var out = '';
    for (var i = 0; i < n && this.o < this.u8.length; i++) out += String.fromCharCode(this.u8n());
    return out;
  };
  Reader.prototype.utf16 = function () {
    var n = this.u8n();
    var out = '';
    for (var i = 0; i < n && this.o + 1 < this.u8.length; i++) out += String.fromCharCode(this.u16());
    return out;
  };

  function shrink() {
    var b = border > 1 ? border : DEO_EDGE;
    return DEO_EDGE / b;
  }

  function toDeo(x, y) {
    var s = shrink();
    return {
      x: x * s - DEO_EDGE / 2,
      y: y * s - DEO_EDGE / 2
    };
  }

  function toMinimapPx(x, y, size) {
    var p = toDeo(x, y);
    return {
      x: (DEO_OFFSET + p.x) / DEO_EDGE * size,
      y: (DEO_OFFSET + p.y) / DEO_EDGE * size
    };
  }

  function skinUrl(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (/^[\w-]{5,8}$/.test(s)) return 'https://i.imgur.com/' + s + '.png';
    return s;
  }

  function loadSkin(url) {
    url = skinUrl(url);
    if (!url || failedSkins[url]) return null;
    var rec = skinCache[url];
    if (rec) return rec.ok ? rec.img : null;
    rec = skinCache[url] = { img: new Image(), ok: false };
    rec.img.onload = function () { rec.ok = true; };
    rec.img.onerror = function () { failedSkins[url] = 1; rec.ok = false; };
    rec.img.src = url;
    return null;
  }

  function hexColor(n) {
    return '#' + ('000000' + ((n >>> 0) & 0xffffff).toString(16)).slice(-6);
  }

  function rememberClientNick(cid, nick) {
    if (!cid || !nick) return;
    nickByCid[cid] = nick;
    var pid;
    for (pid in players) {
      if (players[pid] && players[pid].cid === cid) nickByPid[pid] = nick;
    }
  }

  function parse10(r) {
    var add = r.u8n();
    var i;
    for (i = 0; i < add; i++) {
      var id = r.u16();
      var bot = r.u8n();
      var nick = r.utf16();
      var tag = r.utf16();
      var color = r.u24();
      r.i8();
      var clan = r.utf16();
      clients[id] = {
        id: id,
        bot: !!bot,
        nick: nick,
        tag: tag,
        color: color,
        clan: clan
      };
      rememberClientNick(id, nick);
    }
    var upd = r.u8n();
    for (i = 0; i < upd; i++) {
      var uid = r.u16();
      var flags = r.u8n();
      var row = clients[uid];
      if (flags & 1) {
        var n2 = r.utf16();
        if (row) row.nick = n2;
        rememberClientNick(uid, n2);
      }
      if (flags & 2) {
        var t2 = r.utf16();
        if (row) row.tag = t2;
      }
      if (flags & 4) {
        var c2 = r.u24();
        r.i8();
        if (row) row.color = c2;
      }
      if (flags & 8) {
        var clan2 = r.utf16();
        if (row) row.clan = clan2;
      }
    }
    var del = r.u8n();
    for (i = 0; i < del; i++) {
      var did = r.u16();
      delete clients[did];
    }
  }

  function parse11(r) {
    var add = r.u8n();
    var i;
    for (i = 0; i < add; i++) {
      var pid = r.u16();
      var cid = r.u16();
      var color = r.u24();
      var skin = r.utf8();
      r.u32();
      players[pid] = { pid: pid, cid: cid, color: color, skin: skin };
      if (skin) loadSkin(skin);
      var cl = clients[cid];
      if (cl && cl.nick) nickByPid[pid] = cl.nick;
      else if (nickByCid[cid]) nickByPid[pid] = nickByCid[cid];
    }
    var upd = r.u8n();
    for (i = 0; i < upd; i++) {
      var upid = r.u16();
      var flags = r.u8n();
      var prow = players[upid];
      if (flags & 1) {
        var col = r.u24();
        if (prow) prow.color = col;
      }
      if (flags & 2) {
        var sk = r.utf8();
        if (prow) prow.skin = sk;
        if (sk) loadSkin(sk);
      }
      if (flags & 4) r.u32();
    }
    var del = r.u8n();
    for (i = 0; i < del; i++) {
      var dpid = r.u16();
      delete players[dpid];
    }
    if (!loggedSkins) {
      loggedSkins = true;
      var n = 0;
      for (var k in players) if (players[k].skin) n++;
      log('opcode 11 players=' + Object.keys(players).length + ' withSkin=' + n);
    }
  }

  function parse20(r) {
    var eat = r.u16();
    var i;
    for (i = 0; i < eat; i++) {
      r.u32();
      delete cells[r.u32()];
    }
    var add = r.u16();
    for (i = 0; i < add; i++) {
      var id = r.u32();
      var x = r.i32();
      var y = r.i32();
      var size = r.u16();
      var kind = r.u8n();
      var pid = 0;
      var color = 0xffffff;
      if (kind === 0) {
        pid = r.u16();
        color = r.u24();
      } else if (kind === 2) {
        color = r.u24();
      } else if (kind === 5) {
        r.o += r.u16();
      }
      if (kind === 0) {
        var p = players[pid];
        cells[id] = {
          id: id,
          x: x,
          y: y,
          r: size,
          pid: pid,
          cid: (p && p.cid) || 0,
          color: color,
          skin: (p && p.skin) || '',
          mine: ownPlayerIds.indexOf(pid) !== -1
        };
        if (p && p.skin) loadSkin(p.skin);
      }
    }
    var upd = r.u16();
    for (i = 0; i < upd; i++) {
      var uid = r.u32();
      var ux = r.i32();
      var uy = r.i32();
      var ur = r.u16();
      var cell = cells[uid];
      if (cell) {
        cell.x = ux;
        cell.y = uy;
        cell.r = ur;
      }
    }
    var dead = r.u16();
    for (i = 0; i < dead; i++) {
      var did = r.u32();
      if (!did) break;
      delete cells[did];
    }
  }

  function parse22(r) {
    var count = r.i8();
    if (count < 0) return;
    var now = Date.now();
    var i;
    for (i = 0; i < count; i++) {
      var cid = r.u16();
      var x = r.i32();
      var y = r.i32();
      var size = r.u16();
      var prev = minimap[cid];
      minimap[cid] = {
        cid: cid,
        x: x,
        y: y,
        size: size,
        px: prev ? prev.px + (x - prev.px) * 0.4 : x,
        py: prev ? prev.py + (y - prev.py) * 0.4 : y,
        t: now
      };
    }
    for (var k in minimap) {
      if (now - minimap[k].t > 1200) delete minimap[k];
    }
  }

  function isRealNick(n) {
    return !!(n && n.length && n.indexOf('unnamed#') !== 0 && n !== 'Unnamed' && n !== 'Unnamed cell');
  }

  function nickForClient(cid) {
    if (!cid) return '';
    if (isRealNick(nickByCid[cid])) return nickByCid[cid];
    var cl = clients[cid];
    return cl && isRealNick(cl.nick) ? cl.nick : '';
  }

  function nickForPlayer(pid) {
    if (!pid) return '';
    if (isRealNick(nickByPid[pid])) return nickByPid[pid];
    var p = players[pid];
    if (p) {
      var fromCid = nickForClient(p.cid);
      if (fromCid) return fromCid;
    }
    return '';
  }

  function nickForCellId(id) {
    if (!id) return '';
    var c = cells[id];
    if (!c) return '';
    var n = nickForPlayer(c.pid);
    if (n) return n;
    if (c.cid) {
      n = nickForClient(c.cid);
      if (n) return n;
    }
    var p = players[c.pid];
    if (p) return nickForClient(p.cid);
    return '';
  }

  function onPacket(u8, tab) {
    if (!u8 || !u8.length) return;
    var op = u8[0];
    var r = new Reader(u8);
    r.o = 1;
    try {
      if (op === 0 && u8.length >= 7) {
        border = r.u32();
        myClientId = r.u16();
        var nTabs = r.u8n();
        ownPlayerIds = [];
        for (var t = 0; t < nTabs; t++) ownPlayerIds.push(r.u16());
        return;
      }
      if (op === 1 && u8.length >= 5) {
        border = r.u32();
        return;
      }
      if (op === 10) parse10(r);
      else if (op === 11) parse11(r);
      else if (op === 20) parse20(r);
      else if (op === 22) parse22(r);
      else if (op === 23 && u8.length >= 9) {
        spectateX = r.i32();
        spectateY = r.i32();
        hasSpectate = true;
      }
    } catch (_) {}
  }

  function ownCenterRaw() {
    var sx = 0;
    var sy = 0;
    var n = 0;
    var size = 0;
    for (var id in cells) {
      var c = cells[id];
      if (!c || !c.mine) continue;
      sx += c.x;
      sy += c.y;
      size += c.r;
      n++;
    }
    if (!n) return null;
    return { x: sx / n, y: sy / n, size: size };
  }

  function ensureMinimapCanvas() {
    var hud = document.getElementById('minimap-hud');
    var nodes = document.getElementById('minimap-nodes');
    if (!hud || !nodes) return null;
    var c = document.getElementById('onyx-ffa-minimap-skins');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'onyx-ffa-minimap-skins';
      hud.appendChild(c);
    }
    var w = nodes.width || 200;
    var h = nodes.height || w;
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    c.style.position = 'absolute';
    c.style.left = (nodes.offsetLeft || 0) + 'px';
    c.style.top = (nodes.offsetTop || 0) + 'px';
    c.style.width = (nodes.clientWidth || w) + 'px';
    c.style.height = (nodes.clientHeight || h) + 'px';
    c.style.pointerEvents = 'none';
    c.style.zIndex = '4';
    return c;
  }

  function ensureWorldCanvas() {
    var game = document.getElementById('canvas');
    if (!game) return null;
    var c = document.getElementById('onyx-ffa-world-skins');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'onyx-ffa-world-skins';
      document.body.appendChild(c);
    }
    var w = game.clientWidth || innerWidth;
    var h = game.clientHeight || innerHeight;
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    var rect = game.getBoundingClientRect();
    c.style.position = 'fixed';
    c.style.left = rect.left + 'px';
    c.style.top = rect.top + 'px';
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.style.pointerEvents = 'none';
    c.style.zIndex = '40';
    return c;
  }

  function menuOpen() {
    var main = document.getElementById('mainBlock');
    if (!main) return false;
    return window.getComputedStyle(main).display !== 'none';
  }

  function drawCircleSkin(ctx, img, x, y, r, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (img) ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    else {
      ctx.fillStyle = color || 'rgba(180,180,180,0.55)';
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawNick(ctx, nick, x, y, r) {
    if (!nick) return;
    ctx.font = '11px Titillium Web, ubuntu, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeText(nick, x, y - r - 1);
    ctx.fillText(nick, x, y - r - 1);
  }

  function playerForClient(cid) {
    for (var pid in players) {
      if (players[pid].cid === cid) return players[pid];
    }
    return null;
  }

  function drawMinimap() {
    var canvas = ensureMinimapCanvas();
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    if (!border) return;
    var now = Date.now();
    for (var cid in minimap) {
      var m = minimap[cid];
      if (!m || now - m.t > 1200) continue;
      if (myClientId && m.cid === myClientId) continue;
      m.px += (m.x - m.px) * 0.35;
      m.py += (m.y - m.py) * 0.35;
      var cl = clients[m.cid];
      if (cl && cl.bot) continue;
      var p = playerForClient(m.cid);
      var img = p && p.skin ? loadSkin(p.skin) : null;
      var color = hexColor((p && p.color) || (cl && cl.color) || 0xb4b4b4);
      var pt = toMinimapPx(m.px, m.py, size);
      var r = Math.max(4, Math.min(8, (m.size || 40) * shrink() / DEO_EDGE * size * 0.25));
      drawCircleSkin(ctx, img, pt.x, pt.y, r, color);
      var nick = (cl && cl.nick) || nickByCid[m.cid] || '';
      if (nick) drawNick(ctx, nick, pt.x, pt.y, r);
    }
  }

  function deoZoom(sumRadiiDeo) {
    var view = Math.max(40, sumRadiiDeo || 80);
    var zoom = Math.pow(Math.min(64 / view, 1), 0.4);
    var fit = Math.max(innerWidth / 1920, innerHeight / 1080);
    return Math.max(0.04, Math.min(0.85, zoom * fit));
  }

  function drawWorld() {
    var canvas = ensureWorldCanvas();
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (menuOpen()) return;
    var bn = global.bn;
    var own = ownCenterRaw();
    var s = shrink();
    if (bn && typeof bn.x === 'number' && (bn.isAliveTab1 || bn.isAlive)) {
      camX = bn.x;
      camY = bn.y;
      camInited = true;
    } else if (own) {
      var od = toDeo(own.x, own.y);
      if (!camInited) {
        camX = od.x;
        camY = od.y;
        camInited = true;
      } else {
        camX += (od.x - camX) * 0.35;
        camY += (od.y - camY) * 0.35;
      }
    } else if (hasSpectate) {
      var sd = toDeo(spectateX, spectateY);
      camX += (sd.x - camX) * 0.2;
      camY += (sd.y - camY) * 0.2;
    } else return;
    var zoom = deoZoom(own ? own.size * s : (bn && bn.mass ? Math.sqrt(bn.mass) * 10 : 80));
    var hw = canvas.width / 2;
    var hh = canvas.height / 2;
    for (var id in cells) {
      var cell = cells[id];
      if (!cell || cell.r < 16) continue;
      if (cell.mine) continue;
      if (!cell.skin) continue;
      var d = toDeo(cell.x, cell.y);
      var sx = (d.x - camX) * zoom + hw;
      var sy = (d.y - camY) * zoom + hh;
      var sr = cell.r * s * zoom;
      if (sx + sr < 0 || sy + sr < 0 || sx - sr > canvas.width || sy - sr > canvas.height) continue;
      var img = loadSkin(cell.skin);
      if (!img) continue;
      drawCircleSkin(ctx, img, sx, sy, sr, hexColor(cell.color));
    }
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    try { drawMinimap(); } catch (_) {}
  }

  function toU8(data) {
    if (!data) return null;
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (data.buffer) return new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
    return null;
  }

  function hookSC() {
    var sc = global.SC;
    if (!sc || typeof sc.onMessage !== 'function' || sc.__onyxSkinsHook) return false;
    var orig = sc.onMessage.bind(sc);
    sc.onMessage = function (data, tab) {
      var result = orig(data, tab);
      try { onPacket(toU8(data), tab); } catch (_) {}
      return result;
    };
    if (typeof sc.onClose === 'function') {
      var origClose = sc.onClose.bind(sc);
      sc.onClose = function (tab) {
        clients = Object.create(null);
        players = Object.create(null);
        nickByPid = Object.create(null);
        nickByCid = Object.create(null);
        minimap = Object.create(null);
        cells = Object.create(null);
        hasSpectate = false;
        camInited = false;
        loggedSkins = false;
        return origClose(tab);
      };
    }
    sc.__onyxSkinsHook = true;
    hooked = true;
    log('hooked SC.onMessage for opcode 10/11/20/22');
    return true;
  }

  function boot() {
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (hookSC() || n > 120) clearInterval(t);
    }, 100);
    if (!raf) raf = requestAnimationFrame(loop);
  }

  global.__ONYX_FFA_SKINS__ = { onPacket: onPacket };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
