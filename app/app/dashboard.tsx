'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { RegisterType, REGISTER_TYPES, CLOSED_STATUSES, STATUSES, DISCIPLINES } from '@/types'
import { StatusTag, TypePill, IconDownload, IconPlus, IconSearch, showToast } from '@/components/ui'
import DetailDrawer from '@/components/DetailDrawer'
import Link from 'next/link'

function isOverdue(item: any) {
  if (!item.due_date || CLOSED_STATUSES.includes(item.status)) return false
  return new Date(item.due_date + 'T23:59:59') < new Date()
}
function isAwaiting(item: any) {
  return ['Waiting Response','Pending','Submitted'].includes(item.status) && !isOverdue(item)
}
function isDueThisWeek(item: any) {
  if (!item.due_date || CLOSED_STATUSES.includes(item.status)) return false
  const d = new Date(item.due_date), n = new Date(), w = new Date()
  w.setDate(n.getDate()+7); return d >= n && d <= w
}
function isClosed(item: any) { return CLOSED_STATUSES.includes(item.status) }
function fmtDate(d: string) {
  if (!d) return '—'
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-AU',{day:'2-digit',month:'2-digit',year:'2-digit'}) } catch { return d }
}

const EMPTY_FORM = { title:'', type:'RFI', responsible:'', company:'', discipline:'Other', due_date:'', status:'Open', priority:'Medium', notes:'', project_id:'' }

export default function Dashboard() {
  const searchParams = useSearchParams()
  const selProject = searchParams.get('project')
  const urlType = searchParams.get('type') as RegisterType | null

  const [items, setItems] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [activeCard, setActiveCard] = useState<string|null>(null)
  const [activeType, setActiveType] = useState<RegisterType|'all'>(urlType ?? 'all')
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // New item modal
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState<any>({...EMPTY_FORM})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [ir, pr] = await Promise.all([fetch('/api/items'), fetch('/api/projects')])
    if (ir.ok) setItems(await ir.json())
    if (pr.ok) setProjects(await pr.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('chase:refresh', load)
    return () => window.removeEventListener('chase:refresh', load)
  }, [load])

  useEffect(() => { setActiveType(urlType ?? 'all') }, [urlType])

  function openNew() {
    setNewForm({ ...EMPTY_FORM, project_id: selProject || projects[0]?.id || '' })
    setShowNew(true)
  }

  function updNew(k: string, v: any) { setNewForm((p: any) => ({ ...p, [k]: v })) }

  async function saveNew() {
    if (!newForm.title?.trim()) { showToast('Please enter a title'); return }
    setSaving(true)
    const type = newForm.type || 'RFI'
    const allItems = items
    const nums = allItems.filter((i: any)=>i.type===type).map((i: any)=>{const m=i.number.match(/(\d+)$/);return m?parseInt(m[1]):0})
    const next = nums.length ? Math.max(...nums)+1 : 1
    const number = `${type}-${String(next).padStart(2,'0')}`
    const body = {
      number, type,
      project_id: newForm.project_id || projects[0]?.id,
      title: newForm.title,
      responsible: newForm.responsible,
      company: newForm.company,
      discipline: newForm.discipline || 'Other',
      issued: new Date().toISOString().split('T')[0],
      due_date: newForm.due_date || null,
      status: newForm.status || 'Open',
      priority: newForm.priority || 'Medium',
      notes: newForm.notes || '',
      action_required: newForm.action_required || '',
    }
    const res = await fetch('/api/items', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    if (!res.ok) { showToast('Error saving'); setSaving(false); return }
    showToast(`${number} saved`)
    setShowNew(false)
    load()
    setSaving(false)
  }

  const scoped = selProject ? items.filter(i => i.project_id === selProject) : items
  const openCount    = scoped.filter(i => !isClosed(i) && !isOverdue(i) && !isAwaiting(i)).length
  const overdueCount = scoped.filter(i => isOverdue(i)).length
  const awaitCount   = scoped.filter(i => isAwaiting(i)).length
  const weekCount    = scoped.filter(i => isDueThisWeek(i)).length
  const closedCount  = scoped.filter(i => isClosed(i)).length
  const proj = selProject ? projects.find(p => p.id === selProject) : null

  const filtered = scoped.filter(item => {
    if (activeType !== 'all' && item.type !== activeType) return false
    if (activeCard === 'overdue' && !isOverdue(item)) return false
    if (activeCard === 'await' && !isAwaiting(item)) return false
    if (activeCard === 'week' && !isDueThisWeek(item)) return false
    if (activeCard === 'closed' && !isClosed(item)) return false
    if (activeCard === 'open' && (isClosed(item)||isOverdue(item)||isAwaiting(item))) return false
    if (search) {
      const q = search.toLowerCase()
      if (!item.title?.toLowerCase().includes(q) && !item.number?.toLowerCase().includes(q) && !item.responsible?.toLowerCase().includes(q)) return false
    }
    return true
  })

  function exportCSV() {
    const headers = ['Number','Type','Title','Project','Responsibility','Discipline','Issued','Due','Status','Notes']
    const rows = filtered.map(i => { const p = projects.find((pp:any) => pp.id === i.project_id); return [i.number,i.type,i.title,p?.name??'',i.responsible,i.discipline,i.issued,i.due_date,i.status,i.notes] })
    const csv = [headers,...rows].map(r => r.map((c:any) => `"${(c??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='chase-register.csv'; a.click()
    showToast('Exported')
  }

  const kpis = [
    { key:'open',    label:'Open',              val:openCount,    cls:'c-blue',  sub:'active' },
    { key:'overdue', label:'Overdue',           val:overdueCount, cls:'c-red',   sub:'past due' },
    { key:'await',   label:'Awaiting Response', val:awaitCount,   cls:'c-amber', sub:'no reply' },
    { key:'week',    label:'Due This Week',     val:weekCount,    cls:'c-amber', sub:'next 7 days' },
    { key:'closed',  label:'Closed',            val:closedCount,  cls:'c-green', sub:'resolved' },
    { key:null,      label:'Total',             val:scoped.length,cls:'',        sub:'all items' },
  ]

  const newStatuses = (STATUSES as any)[newForm.type] ?? ['Open']

  if (loading) return <div style={{padding:40,color:'var(--text3)'}}>Loading…</div>

  return (
    <>
      {/* New Item Modal */}
      {showNew && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--surface)',borderRadius:'var(--rl)',width:560,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,.16)'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>New item</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>Add a new action, RFI or follow-up item</div>
              </div>
              <button onClick={()=>setShowNew(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'var(--text3)'}}>×</button>
            </div>
            <div style={{padding:'0'}}>
              {/* Title */}
              <div style={{padding:'14px 24px',borderBottom:'1px solid var(--border)'}}>
                <div className="form-label">Title</div>
                <input className="form-input" style={{width:'100%'}} placeholder="e.g. Awaiting hydraulic engineer response" value={newForm.title} onChange={e=>updNew('title',e.target.value)} autoFocus/>
              </div>
              {/* Type + Status */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
                <div style={{padding:'12px 24px',borderRight:'1px solid var(--border)'}}>
                  <div className="form-label">Type</div>
                  <select className="form-select" value={newForm.type} onChange={e=>{updNew('type',e.target.value);updNew('status',(STATUSES as any)[e.target.value]?.[0]??'Open')}}>
                    {REGISTER_TYPES.map((t:any)=><option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div style={{padding:'12px 24px'}}>
                  <div className="form-label">Status</div>
                  <select className="form-select" value={newForm.status} onChange={e=>updNew('status',e.target.value)}>
                    {newStatuses.map((s:string)=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {/* Responsible + Company */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
                <div style={{padding:'12px 24px',borderRight:'1px solid var(--border)'}}>
                  <div className="form-label">Responsible party</div>
                  <input className="form-input" style={{width:'100%'}} placeholder="Name" value={newForm.responsible} onChange={e=>updNew('responsible',e.target.value)}/>
                </div>
                <div style={{padding:'12px 24px'}}>
                  <div className="form-label">Company</div>
                  <input className="form-input" style={{width:'100%'}} placeholder="Company" value={newForm.company} onChange={e=>updNew('company',e.target.value)}/>
                </div>
              </div>
              {/* Due date + Discipline */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
                <div style={{padding:'12px 24px',borderRight:'1px solid var(--border)'}}>
                  <div className="form-label">Due date</div>
                  <input className="form-input" type="date" style={{width:'100%'}} value={newForm.due_date} onChange={e=>updNew('due_date',e.target.value)}/>
                </div>
                <div style={{padding:'12px 24px'}}>
                  <div className="form-label">Discipline</div>
                  <select className="form-select" value={newForm.discipline} onChange={e=>updNew('discipline',e.target.value)}>
                    {(DISCIPLINES as string[]).map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {/* Project */}
              <div style={{padding:'12px 24px',borderBottom:'1px solid var(--border)'}}>
                <div className="form-label">Project</div>
                <select className="form-select" value={newForm.project_id} onChange={e=>updNew('project_id',e.target.value)}>
                  {projects.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {/* Action required */}
              <div style={{padding:'12px 24px',borderBottom:'1px solid var(--border)'}}>
                <div className="form-label">Action required</div>
                <textarea className="form-textarea" style={{minHeight:72,width:'100%'}} placeholder="Describe the action required…" value={newForm.action_required||''} onChange={e=>updNew('action_required',e.target.value)}/>
              </div>
              {/* Notes */}
              <div style={{padding:'12px 24px',borderBottom:'1px solid var(--border)'}}>
                <div className="form-label">Notes</div>
                <textarea className="form-textarea" style={{minHeight:52,width:'100%'}} placeholder="Optional notes…" value={newForm.notes} onChange={e=>updNew('notes',e.target.value)}/>
              </div>
            </div>
            <div style={{padding:'16px 24px',display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn" onClick={()=>setShowNew(false)}>Cancel</button>
              <Link href="/app/paste-email" className="btn" style={{textDecoration:'none'}}>Paste email instead</Link>
              <button className="btn btn-primary" onClick={saveNew} disabled={saving}>{saving?'Saving…':'Save to register'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <div>
          <div className="topbar-title">{proj ? proj.name : 'Dashboard'}</div>
          <div className="topbar-meta">{proj ? `${proj.code} · ${scoped.length} items` : `All projects · ${items.length} items`}</div>
        </div>
        <div className="topbar-actions">
          <button className="btn" onClick={exportCSV}><IconDownload /> Export</button>
          <button className="btn btn-primary" onClick={openNew}><IconPlus /> New</button>
        </div>
      </div>
      <div className="page-content">
        <div className="kpi-row">
          {kpis.map(k => (
            <div key={k.label} className={`kpi-card ${k.cls} ${activeCard===k.key?'active':''}`}
              onClick={() => k.key && setActiveCard(activeCard===k.key?null:k.key)}
              style={{ cursor: k.key?'pointer':'default' }}>
              <div className="kpi-label">{k.label}</div>
              <div className={`kpi-value ${k.cls}`}>{k.val}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
        <div className="register-card">
          <div className="register-header">
            <div><span className="register-title">Register</span><span className="register-meta">— {filtered.length} item{filtered.length!==1?'s':''}</span></div>
            <div className="type-tabs">
              <button className={`type-tab ${activeType==='all'?'active':''}`} onClick={()=>{setActiveType('all');setActiveCard(null)}}>All</button>
              {REGISTER_TYPES.map(t => (
                <button key={t.id} className={`type-tab ${activeType===t.id?'active':''}`}
                  onClick={()=>{setActiveType(t.id as RegisterType);setActiveCard(null)}}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="search-row">
            <IconSearch />
            <input className="search-input" placeholder="Search number, title, responsibility…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="table-wrap">
            <table className="reg-table">
              <thead><tr>
                <th style={{width:72}}>No.</th><th style={{width:48}}>Type</th><th>Description</th>
                <th style={{width:110}}>Responsibility</th><th style={{width:74}}>Issued</th>
                <th style={{width:100,textAlign:'right'}}>Status</th>
              </tr></thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={6} className="empty-row">No items match.</td></tr>
                  : filtered.map(item => {
                      const ov = isOverdue(item)
                      return (
                        <tr key={item.id} className={ov?'overdue':''} onClick={()=>setDetail(item)}>
                          <td><span className="item-number">{item.number}</span></td>
                          <td><TypePill type={item.type} /></td>
                          <td><span className="item-title">{item.title}</span></td>
                          <td style={{fontSize:11.5}}>{item.responsible||'—'}</td>
                          <td style={{fontSize:11.5,color:'var(--text3)'}}>{fmtDate(item.issued)}</td>
                          <td style={{textAlign:'right'}}><StatusTag status={item.status} overdue={ov} /></td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {detail && (
        <div style={{position:'absolute',inset:0}}>
          <DetailDrawer item={detail} onClose={()=>setDetail(null)} onUpdated={()=>{load();setDetail((d:any)=>d?{...d}:null)}} projects={projects} />
        </div>
      )}
    </>
  )
}
