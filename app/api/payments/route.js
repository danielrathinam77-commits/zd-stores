import db,{tierOf} from '@/lib/db';
export function GET(req){
 const tier=tierOf(new URL(req.url).searchParams.get('code'));
 return Response.json({tier,methods:db.prepare(`select id,label,adj from payments where ${tier}=1`).all()});
}
