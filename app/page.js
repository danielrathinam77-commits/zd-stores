import db from '@/lib/db';
import Shop from '@/components/Shop';
export const dynamic='force-dynamic';
export default function Page(){return <Shop products={db.prepare('select * from products').all()}/>}
