/**
 * Step 8.6 Homepage CMS UI.
 * Text content is shown from the actual current frontend source and is not
 * editable here unless a persistent source already exists. Images use the
 * shared content_media -> media_assets architecture.
 */
'use client'
import { useEffect, useMemo, useState } from 'react'
import { ContentImageField } from '@/components/admin/content/ContentImageField'
import styles from './homepage.module.css'

type Model = { id:string; slug:string; name:string; sort_order:number; published:boolean }
type Assignment = { id:string; slot_key:string; breakpoint:string|null; media_asset_id:string; media_assets?: {id:string;filename:string;public_url:string|null;alt_text:string|null;width:number|null;height:number|null;focal_x:number|null;focal_y:number|null}|null }

const sections = [
  { id:'hero', title:'Hero', description:'Hero utama homepage. Image sudah CMS-ready; text saat ini berasal dari page.tsx.', slots:[['hero','desktop'],['hero','mobile']] },
  { id:'experience', title:'Experience', description:'Text saat ini hardcoded di HomeExperience.tsx. Image dapat dikelola.', slots:[['experience','desktop'],['experience','mobile']] },
  { id:'technology', title:'Technology', description:'Text/pillars saat ini hardcoded di HomeExperience.tsx. Image dapat dikelola.', slots:[['technology','desktop'],['technology','mobile']] },
  { id:'promo', title:'Promo', description:'Promo memakai source lib/data/promos.ts; image mengikuti content_media promo-001/cover.', slots:[['promo','desktop'],['promo','mobile']] },
  { id:'about', title:'About', description:'Copy saat ini hardcoded di HomeExperience.tsx. Image dapat dikelola.', slots:[['about','desktop'],['about','mobile']] },
  { id:'journal', title:'Journal', description:'Article source saat ini lib/data/news.ts; bukan CMS artikel penuh pada Step 8.6.', slots:[['journal','desktop'],['journal','mobile']] },
  { id:'dealer_location', title:'Dealer Location', description:'Dealer identity/address tetap dari lib/data/site.ts. Background image CMS-ready.', slots:[['dealer_location','desktop'],['dealer_location','mobile']] },
  { id:'final_cta', title:'Final CTA', description:'Copy/CTA saat ini hardcoded di HomeExperience.tsx. Image dapat dikelola.', slots:[['final_cta','desktop'],['final_cta','mobile']] },
] as const

function Section({ id,title,description, assignments }:{id:string;title:string;description:string;assignments:Assignment[]}) {
  const namespace = id==='promo' ? 'promo' : id==='journal' ? 'news' : 'home'
  const key = id==='promo' ? 'promo-001' : id==='journal' ? 'news-001' : 'home'
  const slot = id==='promo'||id==='journal' ? 'cover' : id
  const scoped=assignments.filter(a => a.slot_key===slot)
  const find=(bp:string)=>scoped.find(a=>a.breakpoint===bp && a.media_assets)?.media_assets ?? undefined
  const universal=()=>scoped.find(a=>a.breakpoint===null && a.media_assets)?.media_assets ?? undefined
  return <details className={styles.card} id={id}>
    <summary className={styles.summary}><div><span className={styles.eyebrow}>Homepage</span><h2>{title}</h2><p>{description}</p></div><span className={styles.chevron}>＋</span></summary>
    <div className={styles.body}>
      <div className={styles.sourceNote}><strong>Source of truth:</strong> {id==='promo'?'lib/data/promos.ts + content_media':'frontend source saat ini + content_media untuk image'}</div>
      <div className={styles.grid}>
        <ContentImageField label="Desktop image" contentType={namespace} contentKey={key} slotKey={slot} breakpoint="desktop" initial={find('desktop') ?? universal()} />
        <ContentImageField label="Mobile image (optional)" contentType={namespace} contentKey={key} slotKey={slot} breakpoint="mobile" initial={find('mobile')} />
      </div>
      <div className={styles.dependency}>
        <strong>Text editing:</strong> belum tersedia tanpa membuat source CMS kedua. Dependency: <code>{id==='journal'?'Step 8.7 article CMS':id==='dealer_location'?'site settings CMS berikutnya':'Step 8.7 homepage content schema'}</code>.
      </div>
    </div>
  </details>
}

export function HomepageEditor({ initialModels, loadError }:{initialModels:Model[];loadError:string|null}) {
  const [assignments,setAssignments]=useState<Assignment[]>([])
  const [loading,setLoading]=useState(true)
  const [models,setModels]=useState(initialModels)
  const [savingOrder,setSavingOrder]=useState(false)
  const [orderMessage,setOrderMessage]=useState('')
  useEffect(()=>{ (async()=>{ try { const r=await fetch('/api/admin/content-media?content_type=home&content_key=home'); const j=await r.json(); if(r.ok)setAssignments(j.assignments??[]) } finally { setLoading(false) } })() },[])
  async function move(i:number,dir:-1|1){
    const next=[...models]; const j=i+dir; if(j<0||j>=next.length)return
    ;[next[i],next[j]]=[next[j],next[i]]
    setModels(next); setSavingOrder(true); setOrderMessage('')
    try {
      await Promise.all(next.map((m,idx)=>fetch(`/api/admin/models/${m.slug}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sort_order:idx+1})})))
      setOrderMessage('Urutan model tersimpan ✓')
    } catch { setOrderMessage('Gagal menyimpan urutan model.') } finally { setSavingOrder(false) }
  }
  // Promo/journal are different namespaces; load them separately so the picker
  // still uses the exact source-of-truth keys.
  useEffect(()=>{ if(!loading) Promise.all([
    fetch('/api/admin/content-media?content_type=promo&content_key=promo-001').then(r=>r.json()),
    fetch('/api/admin/content-media?content_type=news&content_key=news-001').then(r=>r.json())
  ]).then(([p,n])=>setAssignments(a=>[...a,...(p.assignments??[]),(n.assignments??[])])) },[loading])
  const homeAssignments=useMemo(()=>assignments, [assignments])
  return <div className={styles.page}>
    <div className={styles.header}><div><span className={styles.eyebrow}>Admin / Homepage</span><h1>Homepage</h1><p>Kelola section yang benar-benar digunakan homepage saat ini. Image memakai Media Library bersama.</p></div></div>
    {loadError&&<div className={styles.error}>Gagal memuat models: {loadError}</div>}
    <div className={styles.modelCard}>
      <div><span className={styles.eyebrow}>Existing source</span><h2>Model Slider</h2><p>Tanpa tabel homepage_models. Urutan memakai <code>models.sort_order</code>.</p></div>
      <div className={styles.modelList}>{models.filter(m=>m.published).map((m,i)=><div className={styles.modelRow} key={m.id}><span className={styles.order}>{i+1}</span><strong>{m.name}</strong><span className={styles.slug}>{m.slug}</span><button onClick={()=>move(i,-1)} disabled={i===0||savingOrder}>↑</button><button onClick={()=>move(i,1)} disabled={i===models.length-1||savingOrder}>↓</button></div>)}</div>
      {orderMessage&&<div className={styles.success}>{orderMessage}</div>}
    </div>
    {loading?<div className={styles.loading}>Memuat media assignments…</div>:sections.map(s=><Section key={s.id} id={s.id} title={s.title} description={s.description} assignments={homeAssignments.filter(a=>a.slot_key===s.id|| (s.id==='promo'&&a.slot_key==='cover') || (s.id==='journal'&&a.slot_key==='cover'))}/>)}
  </div>
}
