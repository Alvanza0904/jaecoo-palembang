/**
 * Step 8.6 Brand Assets.
 * Uses global/site assignments; Header + Footer already resolve these through
 * getSiteBrandAssets(). Favicon/OG remain on the existing metadata source.
 */
'use client'
import { useEffect, useState } from 'react'
import { ContentImageField } from '@/components/admin/content/ContentImageField'
import styles from './brand-assets.module.css'

type A={slot_key:string;breakpoint:string|null;media_assets?:{id:string;public_url:string|null;alt_text:string|null;focal_x:number|null;focal_y:number|null}}
export function BrandAssetsEditor(){
 const [a,setA]=useState<A[]>([]); const [loading,setLoading]=useState(true)
 useEffect(()=>{fetch('/api/admin/content-media?content_type=global&content_key=site').then(r=>r.json()).then(j=>setA(j.assignments??[])).finally(()=>setLoading(false))},[])
 const get=(slot:string)=>a.find(x=>x.slot_key===slot&&x.breakpoint===null)?.media_assets
 return <div className={styles.page}><span className={styles.eyebrow}>Admin / Brand Assets</span><h1>Brand Assets</h1><p className={styles.lead}>Single source untuk brand imagery: content_media → media_assets → Supabase Storage.</p>
 {loading?<p>Memuat…</p>:<div className={styles.grid}><div className={styles.card}><h2>Logo</h2><ContentImageField label="Primary logo" contentType="global" contentKey="site" slotKey="logo" initial={get('logo')&&{id:get('logo')!.id,url:get('logo')!.public_url??undefined,alt:get('logo')!.alt_text,focal_x:get('logo')!.focal_x,focal_y:get('logo')!.focal_y}}/></div><div className={styles.card}><h2>Logo Light</h2><ContentImageField label="Light / transparent logo" contentType="global" contentKey="site" slotKey="logo_light" initial={get('logo_light')&&{id:get('logo_light')!.id,url:get('logo_light')!.public_url??undefined,alt:get('logo_light')!.alt_text,focal_x:get('logo_light')!.focal_x,focal_y:get('logo_light')!.focal_y}}/></div><div className={styles.card}><h2>Logo Dark</h2><ContentImageField label="Dark-surface logo" contentType="global" contentKey="site" slotKey="logo_dark" initial={get('logo_dark')&&{id:get('logo_dark')!.id,url:get('logo_dark')!.public_url??undefined,alt:get('logo_dark')!.alt_text,focal_x:get('logo_dark')!.focal_x,focal_y:get('logo_dark')!.focal_y}}/></div></div>}
 <div className={styles.note}><strong>Favicon & OG Image:</strong> architecture metadata saat ini masih menggunakan source Next.js existing; tidak dibuat sistem kedua pada Step 8.6.</div>
 </div>
}
