'use client';
import {useState,useEffect} from 'react';
const R=n=>'₹'+Math.round(n).toLocaleString('en-IN');
function Checkout({lines,sub,clear,close}){
 const [f,setF]=useState({name:'',phone:'',address:'',code:''}),[pm,setPm]=useState([]),[tier,setTier]=useState('regular'),[sel,setSel]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(null);
 const set=(k,v)=>setF({...f,[k]:v});
 useEffect(()=>{const t=setTimeout(()=>fetch('/api/payments?code='+encodeURIComponent(f.code)).then(r=>r.json()).then(d=>{setPm(d.methods);setTier(d.tier);setSel(s=>d.methods.some(m=>m.id==s)?s:(d.methods[0]||{}).id||'')}),250);return()=>clearTimeout(t)},[f.code]);
 const ship=sub>=1999?0:99,m=pm.find(x=>x.id==sel),adj=m?Math.round(sub*m.adj/100):0,total=sub+ship-adj;
 async function pay(){setErr('');setBusy(true);await new Promise(r=>setTimeout(r,1200));
  const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,method:sel,items:lines.map(l=>({id:l.p.id,qty:l.q}))})});
  const d=await r.json();setBusy(false);if(!r.ok)return setErr(d.error||'Something went wrong.');clear();setDone(d)}
 if(done)return <div className="pan mid"><h2>Order placed</h2><p>Your order <b>{done.id}</b> is confirmed for {R(done.total)}. This is a demo payment, so nothing was charged.</p><button className="btn" onClick={close}>Keep shopping</button></div>;
 return <div className="pan mid"><div className="rw"><h2>Checkout</h2><button onClick={close}>Close</button></div>
 <label>Full name<input value={f.name} maxLength={60} autoComplete="name" onChange={e=>set('name',e.target.value)}/></label>
 <label>Mobile number<input value={f.phone} maxLength={10} inputMode="numeric" autoComplete="tel" onChange={e=>set('phone',e.target.value)}/></label>
 <label>Delivery address<input value={f.address} maxLength={200} autoComplete="street-address" onChange={e=>set('address',e.target.value)}/></label>
 <label>Customer code (VIP or wholesale, optional)<input value={f.code} maxLength={30} onChange={e=>set('code',e.target.value)}/></label>
 {tier!='regular'&&<p className="ok">{tier} payment options unlocked.</p>}
 <div className="mu">Payment method</div>
 {pm.map(x=><label key={x.id} className={'pay'+(sel==x.id?' on':'')}><input type="radio" name="pm" checked={sel==x.id} onChange={()=>setSel(x.id)}/><span>{x.label}{x.adj!=0&&<small>{x.adj>0?x.adj+'% off':-x.adj+'% handling fee'}</small>}</span></label>)}
 <div className="rw"><span>Subtotal</span><span>{R(sub)}</span></div><div className="rw"><span>Shipping</span><span>{ship?R(ship):'Free'}</span></div>
 {adj!=0&&<div className="rw"><span>{adj>0?'Payment discount':'Handling fee'}</span><span>{adj>0?'−':'+'}{R(Math.abs(adj))}</span></div>}
 <div className="rw tot"><span>Total</span><span>{R(total)}</span></div>
 <p className="er">{err}</p><button className="btn wide" disabled={busy||!sel} onClick={pay}>{busy?'Processing demo payment…':'Pay '+R(total)}</button>
 <p className="mu">Demo payment: no card or UPI details are collected and no money moves.</p></div>;
}
export default function Shop({products}){
 const [cat,setCat]=useState('All'),[cart,setCart]=useState({}),[bag,setBag]=useState(false),[co,setCo]=useState(false);
 useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('bag'))||{})}catch{}},[]);
 const save=c=>{setCart(c);try{localStorage.setItem('bag',JSON.stringify(c))}catch{}};
 const add=(id,d=1)=>{const c={...cart,[id]:(cart[id]||0)+d};if(c[id]<=0)delete c[id];save(c)};
 const lines=Object.entries(cart).map(([id,q])=>({p:products.find(p=>p.id==id),q})).filter(l=>l.p);
 const sub=lines.reduce((s,l)=>s+l.p.price*l.q,0),count=lines.reduce((s,l)=>s+l.q,0),cats=['All',...new Set(products.map(p=>p.cat))];
 const hero=[[2,'4%','22%',-8],[7,'30%','2%',4],[4,'54%','26%',10]];
 return <>
 <header className="top"><div className="logo">ZD STORZ</div><button className="btn" onClick={()=>setBag(true)}>Bag ({count})</button></header>
 <section className="hero"><div><h1>Sharp cuts for the season ahead.</h1><p>Oversized tees, linen shirts, tapered chinos and layers worth keeping. New pieces land every Friday.</p><a href="#shop"><button className="btn gold">Shop the collection</button></a></div>
  <div className="stack">{hero.map(([i,l,t,r])=>{const p=products[i];return p&&<div key={i} className="art" style={{left:l,top:t,transform:`rotate(${r}deg)`}}><img src={p.img} alt={p.name}/></div>})}</div></section>
 <div className="strip"><span>Free shipping over ₹1,999</span><span>7-day easy returns</span><span>Secure checkout</span><span>Cash on delivery available</span></div>
 <section id="shop" className="sec"><h2>New and trending</h2><div className="pills">{cats.map(c=><button key={c} className={c==cat?'on':''} onClick={()=>setCat(c)}>{c}</button>)}</div>
  <div className="grid">{products.filter(p=>cat=='All'||p.cat==cat).map(p=><article key={p.id} className="card"><div className="pic">{p.tag&&<span className="tag">{p.tag}</span>}<img src={p.img} alt={p.name} loading="lazy"/><button className="btn quick" onClick={()=>add(p.id)}>Add to bag</button></div><div className="inf"><h3>{p.name}</h3><div className="mu">{p.cat}</div><div><b>{R(p.price)}</b>{p.old>0&&<s>{R(p.old)}</s>}</div></div></article>)}</div></section>
 <footer className="foot"><div className="logo">ZD STORZ</div><p>Menswear for everyday. Demo store: payments are simulated.</p></footer>
 {bag&&<div className="ov" onClick={e=>e.target==e.currentTarget&&setBag(false)}><div className="pan"><div className="rw"><h2>Your bag</h2><button onClick={()=>setBag(false)}>Close</button></div>
  {lines.map(({p,q})=><div key={p.id} className="rw"><div><b>{p.name}</b><div className="mu">{R(p.price)} × {q}</div></div><div><button onClick={()=>add(p.id,-1)}>−</button> <button onClick={()=>add(p.id)}>+</button></div></div>)}
  {lines.length?<><div className="rw tot"><span>Subtotal</span><span>{R(sub)}</span></div><button className="btn wide" onClick={()=>{setBag(false);setCo(true)}}>Continue to checkout</button></>:<p className="mu">Your bag is empty. Add something from the collection.</p>}</div></div>}
 {co&&<div className="ov mid" onClick={e=>e.target==e.currentTarget&&setCo(false)}><Checkout lines={lines} sub={sub} clear={()=>save({})} close={()=>setCo(false)}/></div>}
 </>;
}
