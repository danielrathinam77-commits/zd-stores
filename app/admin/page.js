'use client';
import {useState,useEffect} from 'react';
const R=n=>'₹'+n.toLocaleString('en-IN');
export default function Admin(){
 const [d,setD]=useState(null),[f,setF]=useState({email:'',password:''}),[e,setE]=useState('');
 const load=()=>fetch('/api/admin').then(r=>r.ok?r.json():null).then(setD);
 useEffect(()=>{load()},[]);
 async function login(ev){ev.preventDefault();const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)});if(r.ok){setE('');load()}else setE((await r.json()).error)}
 const save=(p,k,v)=>{const n={...p,[k]:v};setD(x=>({...x,payments:x.payments.map(y=>y.id==p.id?n:y)}));fetch('/api/admin',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(n)})};
 if(!d)return <form className="pan mid login" onSubmit={login}><h2>Shop admin</h2><label>Email<input value={f.email} onChange={x=>setF({...f,email:x.target.value})} autoComplete="username"/></label><label>Password<input type="password" value={f.password} onChange={x=>setF({...f,password:x.target.value})} autoComplete="current-password"/></label><p className="er">{e}</p><button className="btn">Sign in</button></form>;
 return <div className="adm"><h1>Payment options</h1><p className="mu">Set a discount (positive %) or a handling fee (negative %) and choose which customer groups see each method. Changes save as you type.</p>
 <div className="wrap"><table><thead><tr><th>Method</th><th>Discount %</th><th>Regular</th><th>VIP</th><th>Wholesale</th></tr></thead><tbody>{d.payments.map(p=><tr key={p.id}><td><input value={p.label} onChange={x=>save(p,'label',x.target.value)}/></td><td><input type="number" value={p.adj} onChange={x=>save(p,'adj',Number(x.target.value)||0)}/></td>{['regular','vip','wholesale'].map(k=><td key={k}><input type="checkbox" checked={!!p[k]} onChange={x=>save(p,k,x.target.checked?1:0)}/></td>)}</tr>)}</tbody></table></div>
 <h1>Orders</h1><div className="wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Group</th><th>Payment</th><th>Total</th><th>Address</th></tr></thead><tbody>{d.orders.map(o=><tr key={o.id}><td>{o.id}</td><td>{o.name}</td><td>{o.phone}</td><td>{o.tier}</td><td>{o.method}</td><td>{R(o.total)}</td><td>{o.address}</td></tr>)}</tbody></table>{!d.orders.length&&<p className="mu">No orders yet.</p>}</div></div>;
}
