'use client'
import { useState, useEffect } from 'react'
import { ExtractedAction, RegisterItem, RegisterType, REGISTER_TYPES, STATUSES, DISCIPLINES, ItemStatus } from '@/types'
import { getProjects, getItems, addItem, nextNumber } from '@/lib/store'
import { IconMail, IconPlus, showToast } from '@/components/ui'
import { useRouter } from 'next/navigation'

const SAMPLE = `From: dave.singh@buildcorp.com.au
To: p.walsh@graypuksand.com.au
Subject: RFI — Hydraulic coordination response required — Level 5 wet areas

Hi Paraic,

Following our coordination meeting on 14 February, we are still awaiting the hydraulic consultant's response on the revised wet area layout for Level 5.

The services rough-in is scheduled to commence in 3 weeks and this is now on the critical path. Without confirmation on the floor waste and drainage point locations, the concretor cannot proceed with the slab formwork.

Could you please follow up with the hydraulic engineer and confirm a response date? We need this resolved by 4 March at the latest.

Regards,
Dave Singh
Site Manager — BuildCorp`

export default function PasteEmailPage() {
  const router = useRouter()
  const [emailText, setEmailText]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [extracted, setExtracted]   = useState<ExtractedAction | null>(null)
  const [error, setError]           = useState('')
  const [projects, setProjects]     = useState<ReturnType<typeof getProjects>>([])
  const [form, setForm]             = useState<Partial<ExtractedAction & { projectId: string; notes: string }>>({})

  useEffect(() => { setProjects(getProjects()) }, [])

  function upd<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function extract() {
    if (!emailText.trim()) { showToast('Paste an email first'); return }
    setLoading(true); setExtracted(null); setError('')
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText }),
      })
      if (!res.ok) throw new Error('Failed')
      const data: ExtractedAction = await res.json()
      setExtracted(data)
      setForm({
        title: data.title, summary: data.summary, action_required: data.action_required,
        responsible_party: data.responsible_party, company: data.company,
        discipline: data.discipline, due_date: data.due_date,
        register_type: data.register_type, priority: data.priority,
        status: data.status ?? (STATUSES[data.register_type]?.[0]),
        suggested_follow_up_email: data.suggested_follow_up_email,
        projectId: projects[0]?.id ?? '', notes: '',
      })
    } catch { setError('Could not extract. Check your API key in Settings.') }
    setLoading(false)
  }

  function save() {
    if (!form.title?.trim()) { showToast('Please enter a title'); return }
    const allItems = getItems()
    const type = form.register_type ?? 'ACT'
    const item: RegisterItem = {
      id: 'i' + Date.now(), number: nextNumber(allItems, type), type,
      projectId: form.projectId ?? projects[0]?.id ?? 'p1',
      title: form.title ?? '', summary: form.summary, actionRequired: form.action_required,
      responsible: form.responsible_party ?? '', company: form.company,
      discipline: form.discipline ?? 'Other',
      issued: new Date().toISOString().split('T')[0],
      dueDate: form.due_date ?? '', status: form.status ?? 'Open',
      priority: form.priority ?? 'Medium', notes: form.notes ?? '',
      emailText, followUp: '', suggestedFollowUp: form.suggested_follow_up_email,
      createdAt: new Date().toISOString(),
    }
    addItem(item)
    window.dispatchEvent(new Event('chase:refresh'))
    showToast(`${item.number} saved`)
    router.push('/app')
  }

  const statuses = form.register_type ? (STATUSES as Record<string, ItemStatus[]>)[form.register_type] ?? ['Open'] : ['Open']

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Paste email</div>
          <div className="topbar-meta">Paste any project email — Chase extracts the action automatically</div>
        </div>
      </div>
      <div className="page-content">
        <div className="paste-layout">
          <div className="paste-col">
            <div>
              <div className="paste-col-title">Email</div>
              <div className="paste-col-sub">Paste a consultant, contractor or site email</div>
            </div>
            <textarea
              className="email-textarea"
              value={emailText}
              onChange={e => setEmailText(e.target.value)}
              placeholder={"Paste an email or email chain here…\n\nChase will identify:\n· The action required\n· Who is responsible\n· When it is due\n· Which register type it belongs to"}
            />
            <div style={{ display:'flex', gap:7 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={extract} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width:13,height:13 }} /> Extracting…</> : <>✦  Extract with AI</>}
              </button>
              <button className="btn" onClick={() => { setEmailText(SAMPLE); setExtracted(null); setError('') }}>
                Load sample
              </button>
            </div>
          </div>

          <div className="paste-col">
            <div>
              <div className="paste-col-title">Extracted action</div>
              <div className="paste-col-sub">Review and edit before saving to the register</div>
            </div>

            {!extracted && !error && (
              <div className="extract-empty">
                <div className="extract-empty-icon"><IconMail /></div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>Paste an email to get started</div>
                <div style={{ fontSize:12, maxWidth:220, lineHeight:1.6 }}>Chase will extract the action, responsible party, due date and register type automatically.</div>
              </div>
            )}

            {error && (
              <div style={{ padding:'14px 16px', background:'var(--red-l)', border:'1px solid var(--border)', borderRadius:'var(--rl)', fontSize:12.5, color:'var(--red-d)' }}>{error}</div>
            )}

            {extracted && (
              <div className="extract-card">
                <div className="extract-header">
                  <span className="ai-badge">AI extracted</span>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>Review and edit before saving</span>
                </div>
                <div className="extract-body">
                  <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
                    <div className="form-label">Title</div>
                    <input style={{ width:'100%', border:'none', background:'transparent', padding:0, fontFamily:'var(--f)', fontSize:13.5, fontWeight:600, color:'var(--text)', outline:'none' }}
                      value={form.title ?? ''} onChange={e => upd('title', e.target.value)} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
                    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
                      <div className="form-label">Register type</div>
                      <select className="form-select" value={form.register_type ?? 'ACT'}
                        onChange={e => { const t = e.target.value as RegisterType; upd('register_type', t); upd('status', (STATUSES as Record<string, ItemStatus[]>)[t]?.[0]) }}>
                        {REGISTER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)' }}>
                      <div className="form-label">Status</div>
                      <select className="form-select" value={form.status ?? ''} onChange={e => upd('status', e.target.value as ItemStatus)}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
                      <div className="form-label">Responsible party</div>
                      <input className="form-input" value={form.responsible_party ?? ''} onChange={e => upd('responsible_party', e.target.value)} placeholder="Name or company" />
                    </div>
                    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)' }}>
                      <div className="form-label">Due date</div>
                      <input className="form-input" type="date" value={form.due_date ?? ''} onChange={e => upd('due_date', e.target.value)} />
                    </div>
                    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
                      <div className="form-label">Discipline</div>
                      <select className="form-select" value={form.discipline ?? 'Other'} onChange={e => upd('discipline', e.target.value)}>
                        {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)' }}>
                      <div className="form-label">Project</div>
                      <select className="form-select" value={form.projectId ?? ''} onChange={e => upd('projectId', e.target.value)}>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)' }}>
                    <div className="form-label">Action required</div>
                    <textarea className="form-textarea" style={{ minHeight:52 }} value={form.action_required ?? ''} onChange={e => upd('action_required', e.target.value)} placeholder="What specifically needs to happen?" />
                  </div>
                  <div style={{ padding:'11px 16px' }}>
                    <div className="form-label">Notes</div>
                    <textarea className="form-textarea" style={{ minHeight:40 }} value={form.notes ?? ''} onChange={e => upd('notes', e.target.value)} placeholder="Any additional context…" />
                  </div>
                </div>
                <div className="extract-footer">
                  <button className="btn btn-primary" style={{ flex:1 }} onClick={save}>Save to register</button>
                  <button className="btn" onClick={() => { setExtracted(null); setEmailText(''); setError('') }}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
