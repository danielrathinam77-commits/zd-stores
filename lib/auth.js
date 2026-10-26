import {SignJWT,jwtVerify} from 'jose';
import {cookies} from 'next/headers';
const key=()=>{const s=process.env.AUTH_SECRET;if(!s||s.length<32){if(process.env.NODE_ENV==='production')throw new Error('Set AUTH_SECRET (32+ characters)');return new TextEncoder().encode('dev-only-secret-change-me-0123456789')}return new TextEncoder().encode(s)};
export const sign=email=>new SignJWT({email}).setProtectedHeader({alg:'HS256'}).setExpirationTime('8h').sign(key());
export async function admin(){try{const t=(await cookies()).get('t')?.value;return t?(await jwtVerify(t,key())).payload.email:null}catch{return null}}
