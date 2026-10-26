import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
const g=globalThis,prod=process.env.NODE_ENV==='production',building=process.env.NEXT_PHASE==='phase-production-build';
if(!g._db){
 const file=building?':memory:':(process.env.DB_PATH||'store.db');
 if(!building)fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});
 const db=new Database(file);db.pragma('journal_mode=WAL');db.pragma('foreign_keys=ON');
 db.exec(`create table if not exists products(id integer primary key,name text not null,cat text not null,price integer not null,old integer default 0,tag text default '',color text not null,img text default '');
 create table if not exists payments(id text primary key,label text not null,adj integer default 0,regular integer default 1,vip integer default 1,wholesale integer default 1);
 create table if not exists customers(code text primary key,tier text not null);
 create table if not exists orders(id text primary key,name text,phone text,address text,tier text,method text,total integer,items text,created text default current_timestamp);
 create table if not exists admins(email text primary key,hash text not null)`);
 if(!db.prepare('select count(*) c from products').get().c){
  const ip=db.prepare('insert into products(name,cat,price,old,tag,color,img) values(?,?,?,?,?,?,?)');
  [['Oversized Drop-Shoulder Tee','T-Shirts',999,1299,'New','#8c2a3f'],['Boxy Heavyweight Tee','T-Shirts',1199,0,'Trending','#2b2b2e'],['Linen Camp Collar Shirt','Shirts',1899,2499,'New','#7f9a88'],['Oxford Button-Down','Shirts',1799,0,'','#8aa5c8'],
  ['Tapered Stretch Chinos','Bottoms',2199,2799,'Trending','#b08d5b'],['Pleated Wide-Leg Trousers','Bottoms',2499,0,'New','#4a4f5a'],['Relaxed Cargo Pants','Bottoms',2299,0,'','#6b7355'],['Zip Track Jacket','Outerwear',2999,3699,'Trending','#1f3a5f'],
  ['Quilted Liner Jacket','Outerwear',3499,0,'New','#5e0f21'],['Pique Polo','T-Shirts',1399,1699,'','#d8c9a3'],['Denim Overshirt','Shirts',2699,0,'Trending','#3d5a80'],['Everyday Hoodie','Outerwear',2399,2899,'','#8b8b8b']].forEach((p,i)=>ip.run(...p,'/products/'+(i+1)+'.svg'));
  const pp=db.prepare('insert into payments values(?,?,?,?,?,?)');
  [['upi','UPI (GPay, PhonePe, Paytm)',3,1,1,0],['card','Credit / Debit card',0,1,1,1],['nb','Net banking',0,1,1,1],['cod','Cash on delivery',-2,1,0,0],['bt','Bank transfer (invoice)',5,0,1,1]].forEach(p=>pp.run(...p));
 }
 // Customer codes come from .env and are refreshed on every start
 const v=process.env.VIP_CODE||(prod?'':'VIP2026'),w=process.env.WHOLESALE_CODE||(prod?'':'WHOLE2026');
 if(v||w){db.prepare('delete from customers').run();const c=db.prepare('insert or ignore into customers values(?,?)');if(v)c.run(v.trim().toUpperCase(),'vip');if(w)c.run(w.trim().toUpperCase(),'wholesale')}
 if(!db.prepare('select 1 from admins').get()){
  const em=(process.env.ADMIN_EMAIL||'').trim().toLowerCase(),pw=process.env.ADMIN_PASSWORD||'';
  if(prod&&!building&&(!em||pw.length<12))throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in .env before the first start.');
  db.prepare('insert into admins values(?,?)').run(em||'admin@zdstorz.local',bcrypt.hashSync(pw||'ChangeMe!2026',12));
 }
 g._db=db;
}
export const tierOf=code=>g._db.prepare('select tier from customers where code=?').get(String(code||'').trim().toUpperCase())?.tier||'regular';
export default g._db;
