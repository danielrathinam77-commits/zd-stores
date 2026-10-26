import db from '@/lib/db';
export const dynamic='force-dynamic';
export function GET(){db.prepare('select 1').get();return Response.json({ok:true})}
