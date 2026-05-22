'use client'
import { useState } from 'react'
import Link from 'next/link'
import { RegisterItem, RegisterType, REGISTER_TYPES, CLOSED_STATUSES } from '@/types'
import { StatusTag, TypePill, IconDownload, IconPlus, IconSearch, IconLogo } from '@/components/ui'
import DetailDrawer from '@/components/DetailDrawer'

const DEMO_PROJECTS = [
  { id:'p1', name:'300 Collins Street', code:'COL-300', color:'#2a4fa8', createdAt:'' },
  { id:'p2', name:'Fitzroy Mixed-Use',  code:'FIT-MU',  color:'#2e6645', createdAt:'' },
]

const DEMO_ITEMS: RegisterItem[] = [
  { id:'i01',type:'RFI',number:'RFI-01',projectId:'p1',title:'Confirm slab penetration prior to PT pour',responsible:'Gray Puksand',discipline:'Structure',issued:'2026-01-15',dueDate:'2026-01-29',status:'Closed',notes:'Confirmed acceptable.',emailText:'Hi Paraic,\n\nWe need written confirmation that the 150mm circular penetration at gridline B/7 on Level 3 is acceptable prior to commencing the PT pour scheduled for Monday.\n\nRegards,\nDave Singh\nBuildCorp',followUp:'',createdAt:''},
  { id:'i02',type:'RFI',number:'RFI-02',projectId:'p1',title:'Facade panel fixings at Level 7 parapet',responsible:'BVN Engineering',discipline:'Structure',issued:'2026-02-03',dueDate:'2026-02-17',status:'Closed',notes:'Confirmed.',emailText:'',followUp:'',createdAt:''},
  { id:'i03',type:'RFI',number:'RFI-03',projectId:'p1',title:'Awaiting hydraulic coordination response — Level 5',responsible:'Services Eng.',discipline:'Services',issued:'2026-02-18',dueDate:'2026-03-04',status:'Waiting Response',notes:'Chased twice. No response.',emailText:'Hi Sarah,\n\nFollowing our coordination meeting on 14 February, we are still awaiting the hydraulic consultant\'s response on the revised wet area layout for Level 5.\n\nRegards,\nParaic Walsh',followUp:'',createdAt:''},
  { id:'i04',type:'RFI',number:'RFI-04',projectId:'p1',title:'Structural setdown clarification — entry lobby',responsible:'Gray Puksand',discipline:'Architecture',issued:'2026-03-10',dueDate:'2026-03-24',status:'Open',notes:'',emailText:'',followUp:'',createdAt:''},
  { id:'i05',type:'APR',number:'APR-01',projectId:'p1',title:'Concrete mix design — podium slab B2',responsible:'BuildCorp',discipline:'Structure',issued:'2026-01-20',dueDate:'2026-02-03',status:'Approved',notes:'Approved. 40MPa.',emailText:'',followUp:'',createdAt:''},
  { id:'i06',type:'APR',number:'APR-02',projectId:'p1',title:'Waterproofing membrane system — basement',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-02-28',dueDate:'2026-03-14',status:'Pending',notes:'Awaiting test certificates.',emailText:'',followUp:'',createdAt:''},
  { id:'i07',type:'APR',number:'APR-03',projectId:'p1',title:'Facade shop drawing approval — Level 3 to 8',responsible:'Client',discipline:'Architecture',issued:'2026-03-25',dueDate:'2026-04-08',status:'Pending',notes:'Samples at client office.',emailText:'Hi,\n\nThe facade contractor has submitted shop drawings for Levels 3–8 for your approval. Fabrication lead time is 10 weeks — we need approval by 8 April.\n\nRegards,\nParaic Walsh',followUp:'',createdAt:''},
  { id:'i08',type:'SUB',number:'SUB-01',projectId:'p1',title:'Steel shop drawings — columns Level 1 to 5',responsible:'Steel Co.',discipline:'Structure',issued:'2026-02-10',dueDate:'2026-02-24',status:'Approved',notes:'Approved 24.02.26.',emailText:'',followUp:'',createdAt:''},
  { id:'i09',type:'VAR',number:'VAR-01',projectId:'p1',title:'Additional concrete pumping — Level 3 pour',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-03-05',dueDate:'',status:'Approved',notes:'Approved $4,200 + GST.',emailText:'',followUp:'',createdAt:''},
  { id:'i10',type:'VAR',number:'VAR-02',projectId:'p1',title:'Revised door schedule — 14 additional doors',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-04-10',dueDate:'',status:'Pending',notes:'Under assessment.',emailText:'',followUp:'',createdAt:''},
  { id:'i11',type:'EOT',number:'EOT-01',projectId:'p1',title:'Inclement weather — 3 days — February 2026',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-02-14',dueDate:'2026-02-14',status:'Accepted',notes:'3 days accepted.',emailText:'',followUp:'',createdAt:''},
  { id:'i12',type:'DEF',number:'DEF-01',projectId:'p1',title:'Cracked render panel — Level 2 west facade',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-04-08',dueDate:'2026-04-22',status:'Open',notes:'',emailText:'',followUp:'',createdAt:''},
  { id:'i13',type:'SI', number:'SI-01', projectId:'p1',title:'Change floor finish to polished concrete — Level 1',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-03-28',dueDate:'2026-04-11',status:'Actioned',notes:'Confirmed actioned.',emailText:'',followUp:'',createdAt:''},
  { id:'i14',type:'ACT',number:'ACT-01',projectId:'p1',title:'Fire consultant review outstanding — sprinkler coordination',responsible:'FireSafe Eng.',discipline:'Fire',issued:'2026-04-01',dueDate:'2026-04-15',status:'Open',notes:'',emailText:'Hi Paraic,\n\nThe fire consultant\'s review of the revised sprinkler layout for Levels 6–9 is still outstanding. The mechanical contractor cannot proceed until this is resolved.\n\nDave Singh\nBuildCorp',followUp:'',createdAt:''},
]

function isOverdue(item: RegisterItem) {
  if (!item.dueDate || CLOSED_STATUSES.includes(item.status)) return false
  return new Date(item.dueDate + 'T23:59:59') < new Date()
}
function isAwaiting(item: RegisterItem) {
  return ['Waiting Response','Pending','Submitted'].includes(item.status) && !isOverdue(item)
}
function isClosed(item: RegisterItem) { return CLOSED_STATUSES.includes(item.status) }
function fmtDate(d: string) {
  if (!d) return '—'
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-AU',{day:'2-digit',month:'2-digit',year:'2-digit'}) } catch { return d }
}

export default function DemoInner() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<RegisterType|'all'>('all')
  const [detail, setDetail] = useState<RegisterItem|null>(null)

  const items = DEMO_ITEMS
  const openCount    = items.filter(i=>!isClosed(i)&&!isOverdue(i)&&!isAwaiting(i)).length
  const overdueCount = items.filter(i=>isOverdue(i)).length
  const awaitCount   = items.filter(i=>isAwaiting(i)).length
  const closedCount  = items.filter(i=>isClosed(i)).length

  const filtered = items.filter(item => {
    if (activeType !== 'all' && item.type !== activeType) return false
    if (search) {
      const q = search.toLowerCase()
      if (!item.title.toLowerCase().includes(q) && !item.number.toLowerCase().includes(q) && !item.responsible.toLowerCase().includes(q)) return false
    }
    return true
  })

  const kpis = [
    { label:'Open',              val:openCount,    cls:'c-blue',  sub:'active' },
    { label:'Overdue',           val:overdueCount, cls:'c-red',   sub:'past due' },
    { label:'Awaiting Response', val:awaitCount,   cls:'c-amber', sub:'no reply' },
    { label:'Closed',            val:closedCount,  cls:'c-green', sub:'resolved' },
    { label:'Total',             val:items.length, cls:'',        sub:'all items' },
  ]

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-mark"><IconLogo /></div>
          <div className="sb-name">Chase</div>
        </div>
        <div className="sb-group">
          <div className="nav-item active"><span>⊞</span> Dashboard</div>
          <Link href="/app/paste-email" className="nav-item"><span>✉</span> Paste email</Link>
        </div>
        <div className="sb-group">
          <div className="sb-label">Projects</div>
          {DEMO_PROJECTS.map(p => (
            <div key={p.id} className="proj-item">
              <div className="proj-dot" style={{ background:p.color }}/>
              {p.name}
            </div>
          ))}
        </div>
        <div className="sb-group">
          <div className="sb-label">Register</div>
          <div className={`type-item ${activeType==='all'?'active':''}`} onClick={()=>setActiveType('all')} style={{cursor:'pointer'}}>
            <div className="type-dot" style={{background:'var(--harbour)'}}/>
            All <span className="type-count">{items.length}</span>
          </div>
          {REGISTER_TYPES.map(t=>(
            <div key={t.id} className={`type-item ${activeType===t.id?'active':''}`} onClick={()=>setActiveType(t.id as RegisterType)} style={{cursor:'pointer'}}>
              <div className="type-dot" style={{background:t.color}}/>
              {t.label} <span className="type-count">{items.filter(i=>i.type===t.id).length}</span>
            </div>
          ))}
        </div>
        <div className="sb-footer">
          <div className="avatar">D</div>
          <div>
            <div className="user-name">Demo User</div>
            <div className="user-role">Preview mode</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Demo banner */}
        <div style={{background:'#2a4fa8',color:'#fff',padding:'8px 24px',fontSize:12,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span>👋 You are viewing a demo — data is sample only</span>
          <Link href="/" style={{color:'#fff',fontSize:11,opacity:.8}}>← Back to homepage</Link>
        </div>

        <div className="topbar">
          <div>
            <div className="topbar-title">Dashboard — Demo</div>
            <div className="topbar-meta">300 Collins Street · {items.length} items</div>
          </div>
          <div className="topbar-actions">
            <Link href="/" className="btn">← Back</Link>
            <Link href="/sign-in" className="btn btn-primary"><IconPlus /> Sign up free</Link>
          </div>
        </div>

        <div className="page-content">
          <div className="kpi-row" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
            {kpis.map(k=>(
              <div key={k.label} className={`kpi-card ${k.cls}`}>
                <div className="kpi-label">{k.label}</div>
                <div className={`kpi-value ${k.cls}`}>{k.val}</div>
                <div className="kpi-sub">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="register-card">
            <div className="register-header">
              <div><span className="register-title">Register</span><span className="register-meta">— {filtered.length} items</span></div>
              <div className="type-tabs">
                <button className={`type-tab ${activeType==='all'?'active':''}`} onClick={()=>setActiveType('all')}>All</button>
                {REGISTER_TYPES.map(t=>(
                  <button key={t.id} className={`type-tab ${activeType===t.id?'active':''}`} onClick={()=>setActiveType(t.id as RegisterType)}>{t.label}</button>
                ))}
              </div>
            </div>
            <div className="search-row">
              <IconSearch />
              <input className="search-input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="table-wrap">
              <table className="reg-table">
                <thead><tr>
                  <th style={{width:72}}>No.</th><th style={{width:48}}>Type</th><th>Description</th>
                  <th style={{width:110}}>Responsibility</th><th style={{width:74}}>Issued</th>
                  <th style={{width:100,textAlign:'right'}}>Status</th>
                </tr></thead>
                <tbody>
                  {filtered.map(item=>{
                    const ov=isOverdue(item)
                    return (
                      <tr key={item.id} className={ov?'overdue':''} onClick={()=>setDetail(item)}>
                        <td><span className="item-number">{item.number}</span></td>
                        <td><TypePill type={item.type}/></td>
                        <td><span className="item-title">{item.title}</span></td>
                        <td style={{fontSize:11.5}}>{item.responsible||'—'}</td>
                        <td style={{fontSize:11.5,color:'var(--text3)'}}>{fmtDate(item.issued)}</td>
                        <td style={{textAlign:'right'}}><StatusTag status={item.status} overdue={ov}/></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {detail && (
          <div style={{position:'absolute',inset:0}}>
            <DetailDrawer item={detail} onClose={()=>setDetail(null)} onUpdated={()=>{}} />
          </div>
        )}
      </div>
    </div>
  )
}
