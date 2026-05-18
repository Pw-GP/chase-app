'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { RegisterItem, RegisterType, REGISTER_TYPES, CLOSED_STATUSES } from '@/types'
import { getItems, getProjects, isOverdue, isDueThisWeek, isClosed, isAwaiting, fmtDate } from '@/lib/store'
import { StatusTag, TypePill, IconDownload, IconPlus, IconSearch, showToast } from '@/components/ui'
import DetailDrawer from '@/components/DetailDrawer'
import Link from 'next/link'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const selProject   = searchParams.get('project')
  const filterType   = searchParams.get('type') as RegisterType | null

  const [items, setItems]       = useState<RegisterItem[]>([])
  const [projects, setProjects] = useState<ReturnType<typeof getProjects>>([])
  const [search, setSearch]     = useState('')
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<RegisterType | 'all'>('all')
  const [detail, setDetail]     = useState<RegisterItem | null>(null)

  const load = useCallback(() => { setItems(getItems()); setProjects(getProjects()) }, [])

  useEffect(() => {
    load()
    window.addEventListener('chase:refresh', load)
    return () => window.removeEventListener('chase:refresh', load)
  }, [load])

  useEffect(() => { if (filterType) setActiveType(filterType) }, [filterType])

  const scoped = selProject ? items.filter(i => i.projectId === selProject) : items
  const openCount    = scoped.filter(i => !isClosed(i) && !isOverdue(i) && !isAwaiting(i)).length
  const overdueCount = scoped.filter(i => isOverdue(i)).length
  const awaitCount   = scoped.filter(i => isAwaiting(i)).length
  const weekCount    = scoped.filter(i => isDueThisWeek(i)).length
  const closedCount  = scoped.filter(i => isClosed(i)).length
  const totalCount   = scoped.length
  const proj = selProject ? projects.find(p => p.id === selProject) : null

  const filtered = scoped.filter(item => {
    if (activeType !== 'all' && item.type !== activeType) return false
    if (activeCard === 'overdue' && !isOverdue(item)) return false
    if (activeCard === 'await'   && !isAwaiting(item)) return false
    if (activeCard === 'week'    && !isDueThisWeek(item)) return false
    if (activeCard === 'closed'  && !isClosed(item)) return false
    if (activeCard === 'open'    && (isClosed(item) || isOverdue(item) || isAwaiting(item))) return false
    if (search) {
      const q = search.toLowerCase()
      if (!item.title.toLowerCase().includes(q) && !item.number.toLowerCase().includes(q) && !(item.responsible ?? '').toLowerCase().includes(q)) return false
    }
    return true
  })

  function exportCSV() {
    const headers = ['Number','Type','Title','Project','Responsibility','Discipline','Issued','Due','Status','Notes']
    const rows = filtered.map(i => { const p = projects.find(pp => pp.id === i.projectId); return [i.number,i.type,i.title,p?.name??'',i.responsible,i.discipline,i.issued,i.dueDate,i.status,i.notes] })
    const csv = [headers,...rows].map(r => r.map(c => `"${(c??'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='chase-register.csv'; a.click()
    showToast('Exported')
  }

  const kpis = [
    { key:'open',    label:'Open',              val:openCount,    cls:'c-blue',  sub:'active' },
    { key:'overdue', label:'Overdue',           val:overdueCount, cls:'c-red',   sub:'past due' },
    { key:'await',   label:'Awaiting Response', val:awaitCount,   cls:'c-amber', sub:'no reply' },
    { key:'week',    label:'Due This Week',     val:weekCount,    cls:'c-amber', sub:'next 7 days' },
    { key:'closed',  label:'Closed',            val:closedCount,  cls:'c-green', sub:'resolved' },
    { key:null,      label:'Total',             val:totalCount,   cls:'',        sub:'all items' },
  ]

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">{proj ? proj.name : 'Dashboard'}</div>
          <div className="topbar-meta">{proj ? `${proj.code} · ${scoped.length} items` : `All projects · ${items.length} items`}</div>
        </div>
        <div className="topbar-actions">
          <button className="btn" onClick={exportCSV}><IconDownload /> Export</button>
          <Link href="/app/paste-email" className="btn btn-primary"><IconPlus /> New</Link>
        </div>
      </div>

      <div className="page-content">
        <div className="kpi-row">
          {kpis.map(k => (
            <div key={k.label} className={`kpi-card ${k.cls} ${activeCard === k.key ? 'active' : ''}`}
              onClick={() => k.key && setActiveCard(activeCard === k.key ? null : k.key)}
              style={{ cursor: k.key ? 'pointer' : 'default' }}>
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
                <button key={t.id} className={`type-tab ${activeType===t.id?'active':''}`} onClick={()=>{setActiveType(t.id as RegisterType);setActiveCard(null)}}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="search-row">
            <IconSearch />
            <input className="search-input" placeholder="Search number, title, responsibility…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-wrap">
            <table className="reg-table">
              <thead>
                <tr>
                  <th style={{width:72}}>No.</th><th style={{width:48}}>Type</th><th>Description</th>
                  <th style={{width:110}}>Responsibility</th><th style={{width:74}}>Issued</th>
                  <th style={{width:100,textAlign:'right'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} className="empty-row">No items match your filters.</td></tr>
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
          <DetailDrawer item={detail} onClose={()=>setDetail(null)} onUpdated={()=>{load();setDetail(d=>d?{...d}:null)}} />
        </div>
      )}
    </>
  )
}
