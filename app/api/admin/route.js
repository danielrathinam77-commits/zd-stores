import {z} from 'zod';
import db from '@/lib/db';
import {admin} from '@/lib/auth';
const f=z.number().int().min(0).max(1);
const U=z.object({id:z.string().max(20),label:z.string().trim().min(2).max(40),adj:z.number().int().min(-20).max(50),regular:f,vip:f,wholesale:f});
const no=()=>Response.json({error:'Unauthorized'},{status:401});
export async function GET(){
 if(!await admin())return no();
 return Response.json({payments:db.prepare('select * from payments').all(),orders:db.prepare('select id,name,phone,address,tier,method,total,created from orders order by created desc limit 100').all()});
}
export async function PUT(req){
 if(!await admin())return no();
 const p=U.safeParse(await req.json().catch(()=>null));
 if(!p.success)return Response.json({error:'Invalid values'},{status:400});
 const v=p.data;
 db.prepare('update payments set label=?,adj=?,regular=?,vip=?,wholesale=? where id=?').run(v.label,v.adj,v.regular,v.vip,v.wholesale,v.id);
 return Response.json({ok:true});
}
