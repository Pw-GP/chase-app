'use client'
import { STATUSES, CLOSED_STATUSES } from '@/types'
import { StatusTag, TypePill, IconClose, IconSend, IconCopy, IconCheck, showToast } from './ui'
import { useState } from 'react'

function fmtDate(d: string) {
  if (!d) return '—'
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-AU',{day:'2-digit',month:'2-digit',year:'2-digit'}) } catch { return d }
}
function isOverdue(item: any) {
  if (!item.due_date || CLOSED_STATUSES.includes(item.status)) return false
  return new Date(item.due_date+'T23:59:59') < new Date()
}

interface Props { item: any; onClose: () => void; onUpdated: () => void }

export default function DetailDrawer({ item, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState(item.status)
  const [notes, setNotes] = useState(item.notes || '')
  const [followUp, setFollowUp] = useState(item.follow_up || item.suggested_follow_up || '')
  const [genLoading, setGenLoading] = useState(false)
  const ov = isOverdue(item)
  const closed = CLOSED_STATUSES.includes(status)
  const statuses = (STATUSES as any)[item.type] ?? []

  async function save() {
    await fetch('/api/items', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:item.id,status,notes}) })
    showToast('Saved'); onUpdated()
  }

  async function markClosed() {
    const map: Record<string,string> = {RFI:'Closed',APR:'Approved',SUB:'Closed',VAR:'Closed',EOT:'Accepted',DEF:'Closed',SI:'Closed',ACT:'Done'}
    const ns = map[item.type] ?? 'Closed'
    await fetch('/api/items', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:item.id,status:ns,notes}) })
    setStatus(ns); showToast('Marked '+ns); onUpdated()
  }

  async function generateFollowUp() {
    setGenLoading(true)
    try {
      const res = await fetch('/api/extract', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ emailText:`Generate a professional follow-up email for this overdue construction action.\n\nItem: ${item.number} — ${item.title}\nType: ${item.type}\nResponsible: ${item.responsible}\nDue: ${item.due_date}\nNotes: ${item.notes}\n\nReturn only a suggested_follow_up_email field in JSON.` })
      })
      const data = await res.json()
      const text = data.suggested_follow_up_email || 'Could not generate.'
      setFollowUp(text)
      await fetch('/api/items', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:item.id,follow_up:text}) })
    } catch { showToast('Error generating follow-up') }
    setGenLoading(false)
  }

  return (
    <div className="detail-overlay">
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-panel">
        <div className="detail-top">
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <span className="item-number" style={{fontSize:10.5}}>{item.number}</span>
            <TypePill type={item.type} />
            {ov && <span className="status-tag st-overdue">Overdue</span>}
          </div>
          <button className="detail-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="detail-scroll">
          <div>
            <div className="detail-title">{item.title}</div>
            <div className="detail-chips"><StatusTag status={status} overdue={ov} />{item.discipline&&<span style={{fontSize:10.5,color:'var(--text3)'}}>{item.discipline}</span>}</div>
          </div>
          <div className="detail-block">
            <div className="detail-row"><span className="detail-label">Responsibility</span><span className="detail-value">{item.responsible||'—'}</span></div>
            {item.company&&<div className="detail-row"><span className="detail-label">Company</span><span className="detail-value">{item.company}</span></div>}
            <div className="detail-row"><span className="detail-label">Issued</span><span className="detail-value">{fmtDate(item.issued)}</span></div>
            <div className="detail-row"><span className="detail-label">Due date</span><span className={`detail-value ${ov?'due-over':''}`}>{fmtDate(item.due_date)}</span></div>
          </div>
          {item.action_required&&<div className="detail-block"><div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',padding:'8px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}>Action required</div><div className="detail-text">{item.action_required}</div></div>}
          {item.email_text&&<details className="detail-block"><summary style={{padding:'9px 12px',fontSize:10,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'space-between',listStyle:'none',background:'var(--bg)',cursor:'pointer'}}>Source email <span style={{fontSize:9,opacity:.6}}>▼ expand</span></summary><div className="detail-email">{item.email_text}</div></details>}
          <div className="detail-block"><textarea className="detail-textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes…"/></div>
          {!closed&&<div>
            <button className="btn" onClick={generateFollowUp} disabled={genLoading} style={{fontSize:10.5,display:'flex',alignItems:'center',gap:5}}>
              {genLoading?<span className="spinner" style={{width:13,height:13}}/>:<IconSend/>} Generate follow-up email
            </button>
            {followUp&&<div style={{marginTop:10}}><div className="follow-up-box">{followUp}</div><button className="btn" style={{marginTop:7,fontSize:10.5,display:'flex',alignItems:'center',gap:5}} onClick={()=>{navigator.clipboard.writeText(followUp);showToast('Copied')}}><IconCopy/> Copy</button></div>}
          </div>}
        </div>
        <div className="detail-actions">
          <select className="status-select" value={status} onChange={e=>setStatus(e.target.value)}>
            {statuses.map((s: string)=><option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{display:'flex',gap:7}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={save}>Save</button>
            {!closed&&<button className="btn" style={{fontSize:10.5,display:'flex',alignItems:'center',gap:5}} onClick={markClosed}><IconCheck/> Close</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
