import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import {sign} from '@/lib/auth';
const tries=new Map();
export async function POST(req){
 const ip=req.headers.get('x-forwarded-for')||'local',n=tries.get(ip)||{c:0,t:Date.now()};
 if(Date.now()-n.t>9e5){n.c=0;n.t=Date.now()}
 tries.set(ip,n);
 if(n.c>=5)return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});
 const b=await req.json().catch(()=>({}));
 const a=db.prepare('select * from admins where email=?').get(String(b.email||'').toLowerCase());
 if(!a||!bcrypt.compareSync(String(b.password||''),a.hash)){n.c++;return NextResponse.json({error:'Wrong email or password.'},{status:401})}
 n.c=0;
 const res=NextResponse.json({ok:true});
 res.cookies.set('t',await sign(a.email),{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:28800});
 return res;
}
