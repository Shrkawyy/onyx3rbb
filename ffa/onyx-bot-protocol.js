/* Senpa v4 packets, grounded in the bundled client. No renderer or page globals. */
(function (g) {
  'use strict';
  class Reader {
    constructor(buffer) { this.v = new DataView(buffer); this.i = 0; }
    u8() { return this.v.getUint8(this.i++); }
    u16() { const n = this.v.getUint16(this.i, true); this.i += 2; return n; }
    u32() { const n = this.v.getUint32(this.i, true); this.i += 4; return n; }
    i32() { const n = this.v.getInt32(this.i, true); this.i += 4; return n; }
    skip(n) { if (this.i + n > this.v.byteLength) throw Error('Truncated packet'); this.i += n; }
  }
  function stringPacket(op, text, long) {
    text = String(text || '').slice(0, long ? 65535 : 255);
    const b = new Uint8Array(1 + (long ? 2 : 1) + text.length * 2), v = new DataView(b.buffer);
    b[0] = op; if (long) v.setUint16(1, text.length, true); else b[1] = text.length;
    for (let i = 0; i < text.length; i++) v.setUint16(1 + (long ? 2 : 1) + i * 2, text.charCodeAt(i), true);
    return b;
  }
  class Protocol {
    constructor(send, emit, alloc) {
      this.send = send; this.emit = emit; this.alloc = alloc || (() => {});
      this.ready = false; this.ids = []; this.cells = new Map(); this.pending = new Map();
      this.lastAlive = []; this.name = 'Bot'; this.token = 'null';
    }
    receive(buffer) {
      const r = new Reader(buffer), op = r.u8();
      if (op === 8) this.send(stringPacket(13, this.token, true));
      if (op === 7) { this.ready = false; this.emit({type: 'blocked', reason: 'CAPTCHA required — connection stopped'}); return; }
      if (op === 0) {
        this.border = r.u32(); this.clientId = r.u16(); const n = r.u8();
        if (!n) throw Error('Server returned no player slots');
        this.ids = Array.from({length: n}, () => r.u16());
        this.cells.clear(); this.pending.clear(); this.lastAlive = []; this.ready = true;
        this.send(stringPacket(10, this.name)); this.send(stringPacket(11, ''));
        this.emit({type: 'ready', slots: n, border: this.border});
      }
      if (op === 20 && this.ready) {
        for (let n = r.u16(); n > 0; n--) { r.u32(); this.cells.delete(r.u32()); }
        for (let n = r.u16(); n > 0; n--) {
          const id = r.u32(); if (!id) break;
          const x = r.i32(), y = r.i32(), radius = r.u16(), kind = r.u8(); let pid = -1;
          if (kind === 0) { pid = r.u16(); r.skip(3); }
          else if (kind === 2) r.skip(3);
          else if (kind === 5) { const len = r.u16(), start = r.i; r.skip(len); this.alloc(8, new Uint8Array(buffer.slice(start, start + len))); }
          else if (![1, 3, 4].includes(kind)) throw Error('Unsupported cell kind ' + kind);
          if (this.ids.includes(pid)) this.cells.set(id, {pid, x, y, radius});
        }
        for (let n = r.u16(); n > 0; n--) {
          const id = r.u32(), x = r.i32(), y = r.i32(), radius = r.u16();
          const cell = this.cells.get(id); if (cell) Object.assign(cell, {x, y, radius});
        }
        for (let n = r.u16(); n > 0; n--) { const id = r.u32(); if (!id) break; this.cells.delete(id); }
        const alive = this.ids.map((pid, tab) => [...this.cells.values()].some(c => c.pid === pid) ? tab : -1).filter(t => t >= 0);
        const died = this.lastAlive.filter(tab => !alive.includes(tab));
        alive.forEach(tab => this.pending.delete(tab)); this.lastAlive = alive;
        this.emit({type: 'world', alive, died, cells: this.cells.size});
      }
    }
    spawn() {
      if (!this.ready) return;
      this.ids.forEach((pid, tab) => {
        if (!this.lastAlive.includes(tab) && !this.pending.has(tab)) {
          this.pending.set(tab, Date.now()); this.send(new Uint8Array([0, tab]));
        }
      });
    }
    move(x, y) {
      if (!this.ready || !Number.isFinite(x) || !Number.isFinite(y)) return;
      this.ids.forEach((pid, tab) => {
        const b = new Uint8Array(11), v = new DataView(b.buffer); b[0] = 20; b[2] = tab;
        v.setInt32(3, x, true); v.setInt32(7, y, true); this.send(b);
      });
    }
    action(op) { if (this.ready) this.lastAlive.forEach(tab => this.send(new Uint8Array([op, tab, op === 22 ? 1 : 0]))); }
  }
  g.OnyxBotProtocol = Protocol;
  if (typeof module !== 'undefined') module.exports = {Protocol, stringPacket};
})(typeof self !== 'undefined' ? self : globalThis);
