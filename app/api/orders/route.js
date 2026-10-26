import {z} from 'zod';
import crypto from 'crypto';
import db,{tierOf} from '@/lib/db';
const S=z.object({name:z.string().trim().min(2).max(60),phone:z.string().regex(/^[6-9]\d{9}$/),address:z.string().trim().min(8).max(200),code:z.string().max(30).optional(),method:z.string().max(20),items:z.array(z.object({id:z.number().int(),qty:z.number().int().min(1).max(20)})).min(1).max(30)});
const bad=(e)=>Response.json({error:e},{status:400});
export async function POST(req){
 const p=S.safeParse(await req.json().catch(()=>null));
 if(!p.success)return bad('Please check your details and try again.');
 const {name,phone,address,code,method,items}=p.data,tier=tierOf(code);
 const m=db.prepare(`select * from payments where id=? and ${tier}=1`).get(method);
 if(!m)return bad('That payment method is not available.');
 let sub=0;
 for(const i of items){const r=db.prepare('select price from products where id=?').get(i.id);if(!r)return bad('An item is no longer available.');sub+=r.price*i.qty}
 const total=sub+(sub>=1999?0:99)-Math.round(sub*m.adj/100),id='NC'+crypto.randomBytes(4).toString('hex').toUpperCase();
 db.prepare('insert into orders(id,name,phone,address,tier,method,total,items) values(?,?,?,?,?,?,?,?)').run(id,name,phone,address,tier,m.label,total,JSON.stringify(items));
 return Response.json({id,total});
}
