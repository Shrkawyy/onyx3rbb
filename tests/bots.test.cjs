const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Protocol,stringPacket}=require('../ffa/onyx-bot-protocol.js');
function setup(ids=[101],slotLimit=1) {
 const sent=[],events=[],alloc=[];const p=new Protocol(b=>sent.push([...b]),e=>events.push(e),(...a)=>alloc.push(a));
 p.slotLimit=slotLimit;
 const b=Buffer.alloc(8+ids.length*2);b[0]=0;b.writeUInt32LE(20000,1);b.writeUInt16LE(55,5);b[7]=ids.length;ids.forEach((id,i)=>b.writeUInt16LE(id,8+i*2));
 p.receive(Uint8Array.from(b).buffer);return {p,sent,events,alloc};
}
function world(add=[],eat=[],del=[]) {
 const parts=[];const u8=n=>parts.push(n&255),u16=n=>{u8(n);u8(n>>8)},u32=n=>{u16(n);u16(n>>16)};
 u8(20);u16(eat.length);eat.forEach(id=>{u32(999);u32(id)});u16(add.length);
 add.forEach(([id,pid])=>{u32(id);u32(500);u32(600);u16(40);u8(0);u16(pid);u8(255);u8(255);u8(255)});
 u16(0);u16(del.length);del.forEach(u32);return Uint8Array.from(parts).buffer;
}
for(const [mode,ids] of [['FFA',[101]],['DUAL',[101,102]],['MEGASPLIT',[101]]])test(mode+' spawns every assigned slot, confirms world ownership and respawns dead slots',()=>{
 const {p,sent,events}=setup(ids,ids.length);p.spawn();assert.deepEqual(sent.filter(b=>b[0]===0),ids.map((_,i)=>[0,i]));
 assert.ok(events.some(e=>e.type==='ready'));assert.deepEqual(p.lastAlive,[]);p.spawn();assert.equal(sent.filter(b=>b[0]===0).length,ids.length);
 p.receive(world(ids.map((id,i)=>[i+1,id])));assert.equal(p.lastAlive.length,ids.length);p.action(22);assert.deepEqual(sent.slice(-ids.length),ids.map((_,i)=>[22,i,1]));
 p.receive(world([], [1]));assert.deepEqual(events.at(-1).died,[0]);p.spawn();assert.deepEqual(sent.at(-1),[0,0]);
});
test('movement is signed little endian and sent separately to both DUAL tabs',()=>{const {p,sent}=setup([10,20],2);p.move(-500,700);for(const [i,b] of sent.slice(-2).entries()){assert.deepEqual(b.slice(0,3),[20,0,i]);const v=new DataView(Uint8Array.from(b).buffer);assert.equal(v.getInt32(3,true),-500);assert.equal(v.getInt32(7,true),700);}});
test('captcha blocks spawning; malformed packets fail visibly',()=>{const {p,sent,events}=setup();p.receive(Uint8Array.from([7]).buffer);const n=sent.length;p.spawn();assert.equal(sent.length,n);assert.equal(events.at(-1).type,'blocked');assert.throws(()=>p.receive(Uint8Array.from([0,1]).buffer));});
test('auth uses v4 UInt16 length and UTF16',()=>{const packet=stringPacket(13,'أ'.repeat(300),true);assert.equal(new DataView(packet.buffer).getUint16(1,true),300);assert.equal(packet.length,603);});

test('explicit single-slot limit leaves the other assigned slot unspawned',()=>{
 const a=setup([101,102]),b=setup([201,202]);
 for(const bot of [a,b]) {bot.p.spawn();bot.p.spawn();assert.deepEqual(bot.sent.filter(x=>x[0]===0),[[0,0]]);assert.equal(bot.events.find(e=>e.type==='ready').slots,1);assert.equal(bot.events.find(e=>e.type==='ready').assignedSlots,2);}
 a.p.receive(world([[1,101],[2,102]]));assert.deepEqual(a.p.lastAlive,[0]);
 a.p.action(22);assert.deepEqual(a.sent.at(-1),[22,0,1]);
});

test('pending spawn expires: retry sends bytes, live slots never respawn',()=>{
 const {p,sent}=setup();p.spawn();p.spawn();assert.equal(sent.filter(b=>b[0]===0).length,1);
 p.pending.set(0,Date.now()-8001);p.spawn();assert.equal(sent.filter(b=>b[0]===0).length,2);
 assert.deepEqual(sent.slice(-4),[[10,3,66,0,111,0,116,0],[11,0],[21,0,0],[0,0]]);
 p.receive(world([[1,101]]));p.spawn();assert.equal(sent.filter(b=>b[0]===0).length,2);
});
test('server messages are exposed instead of discarded',()=>{
 const {p,events}=setup();const text=stringPacket(41,'Try later');const b=new Uint8Array(text.length+1);b[0]=41;b[1]=1;b.set(text.slice(1),2);p.receive(b.buffer);
 assert.equal(events.at(-1).msg,'Server message (1): Try later');
});

test('dual connection controls both players and only respawns the dead slot',()=>{
 const {p,sent}=setup([101,102],2);p.spawn();p.receive(world([[1,101],[2,102],[3,102]]));
 assert.deepEqual(p.lastAlive,[0,1]);p.action(23);assert.deepEqual(sent.slice(-2),[[23,0,0],[23,1,0]]);
 p.receive(world([], [1]));p.spawn();assert.deepEqual(sent.at(-1),[0,0]);
 assert.deepEqual(p.lastAlive,[1]);
});
test('UInt16 server-message length does not shift UTF16 characters',()=>{
 const {p,events}=setup();const text=stringPacket(41,'Only 2 hats',true),b=new Uint8Array(text.length+1);
 b[0]=41;b[1]=1;b.set(text.slice(1),2);p.receive(b.buffer);assert.equal(events.at(-1).msg,'Server message (1): Only 2 hats');
});

test('x64 uses six split levels on each live dual slot, capped and defaulting to single split',()=>{
 const {p,sent}=setup([101,102],2);p.receive(world([[1,101],[2,102]]));
 p.action(22,6);assert.deepEqual(sent.slice(-2),[[22,0,6],[22,1,6]]);
 p.action(22,64);assert.deepEqual(sent.slice(-2),[[22,0,6],[22,1,6]]);
 p.action(22);assert.deepEqual(sent.slice(-2),[[22,0,1],[22,1,1]]);
});
