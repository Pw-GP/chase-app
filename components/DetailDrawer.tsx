'use client'
import { STATUSES, CLOSED_STATUSES, REGISTER_TYPES, DISCIPLINES } from '@/types'
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
  const [followUp, setFollowUp] = useState('')
  const [genLoading, setGenLoading] = useState(false)

  // Editable fields
  const [title, setTitle] = useState(item.title || '')
  const [type, setType] = useState(item.type || 'ACT')
  const [responsible, setResponsible] = useState(item.responsible || '')
  const [company, setCompany] = useState(item.company || '')
  const [discipline, setDiscipline] = useState(item.discipline || '')
  const [dueDate, setDueDate] = useState(item.due_date || '')
  const [actionRequired, setActionRequired] = useState(item.action_required || '')

  const ov = isOverdue({ ...item, due_date: dueDate, status })
  const closed = CLOSED_STATUSES.includes(status)
  const statuses = (STATUSES as any)[type] ?? []

  async function save() {
    await fetch('/api/items', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id:item.id, status, notes, title, type, responsible, company, discipline, due_date:dueDate, action_required:actionRequired })
    })
    showToast('Saved'); onUpdated()
  }

  async function markClosed() {
    const map: Record<string,string> = {RFI:'Closed',APR:'Approved',SUB:'Closed',VAR:'Closed',EOT:'Accepted',DEF:'Closed',SI:'Closed',ACT:'Done'}
    const ns = map[type] ?? 'Closed'
    await fetch('/api/items', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:item.id,status:ns,notes}) })
    setStatus(ns); showToast('Marked '+ns); onUpdated()
  }

  async function generateFollowUp() {
    setGenLoading(true); setFollowUp('')
    try {
      const res = await fetch('/api/extract', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ emailText:`Generate a professional follow-up email for this overdue construction action.\n\nItem: ${item.number} — ${title}\nType: ${type}\nResponsible: ${responsible}\nDue: ${dueDate}\nNotes: ${notes}\n\nReturn only a suggested_follow_up_email field in JSON.` })
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
            <TypePill type={type} />
            {ov && <span className="status-tag st-overdue">Overdue</span>}
          </div>
          <button className="detail-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="detail-scroll">

          {/* Title */}
          <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Title</div>
            <input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              style={{width:'100%',border:'none',background:'transparent',padding:0,fontFamily:'var(--f)',fontSize:14,fontWeight:700,color:'var(--text)',outline:'none'}}
            />
          </div>

          {/* Type + Discipline */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
            <div style={{padding:'11px 16px',borderRight:'1px solid var(--border)'}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Type</div>
              <select className="form-select" value={type} onChange={e=>{setType(e.target.value);setStatus((STATUSES as any)[e.target.value]?.[0]??status)}}>
                {REGISTER_TYPES.map((t:any)=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div style={{padding:'11px 16px'}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Discipline</div>
              <select className="form-select" value={discipline} onChange={e=>setDiscipline(e.target.value)}>
                {(DISCIPLINES as string[]).map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Responsible + Company */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
            <div style={{padding:'11px 16px',borderRight:'1px solid var(--border)'}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Responsible</div>
              <input className="form-input" value={responsible} onChange={e=>setResponsible(e.target.value)} style={{width:'100%'}}/>
            </div>
            <div style={{padding:'11px 16px'}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Company</div>
              <input className="form-input" value={company} onChange={e=>setCompany(e.target.value)} style={{width:'100%'}}/>
            </div>
          </div>

          {/* Issued + Due date */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)'}}>
            <div style={{padding:'11px 16px',borderRight:'1px solid var(--border)'}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Issued</div>
              <div style={{fontSize:12,color:'var(--text2)'}}>{fmtDate(item.issued)}</div>
            </div>
            <div style={{padding:'11px 16px'}}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>Due date</div>
              <input className="form-input" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{width:'100%'}}/>
            </div>
          </div>

          {/* Action required - expanded */}
          <div style={{borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)',padding:'8px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}>Action required</div>
            <textarea className="detail-textarea" value={actionRequired} onChange={e=>setActionRequired(e.target.value)} placeholder="Describe the action required…" style={{minHeight:120,resize:'vertical'}}/>
          </div>

          {/* Notes */}
          <div className="detail-block">
            <textarea className="detail-textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes…" style={{minHeight:72}}/>
          </div>

          {/* Follow-up — only show generated result, not pre-filled */}
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
