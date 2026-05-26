'use client'
import { useState, useEffect, useRef } from 'react'
import { REGISTER_TYPES, STATUSES, DISCIPLINES } from '@/types'
import { IconMail, showToast } from '@/components/ui'
import { useRouter } from 'next/navigation'

const SAMPLE = `From: dave.singh@buildcorp.com.au
To: p.walsh@graypuksand.com.au
Subject: RFI — Hydraulic coordination response required — Level 5 wet areas

Hi Paraic,

Following our coordination meeting on 14 February, we are still awaiting the hydraulic consultant's response on the revised wet area layout for Level 5.

The services rough-in is scheduled to commence in 3 weeks and this is now on the critical path.

Could you please follow up with the hydraulic engineer and confirm a response date? We need this resolved by 4 March at the latest.

Regards,
Dave Singh
Site Manager — BuildCorp`

const PROJECT_COLORS = ['#2a4fa8','#2e6645','#a83232','#8a5e00','#5c3070','#1a6b6b']

export default function PasteEmailInner() {
  const router = useRouter()
  const [emailText, setEmailText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracted, setExtracted] = useState<any>(null)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [form, setForm] = useState<any>({})

  // Project inline creation
  const [projectSearch, setProjectSearch] = useState('')
  const [showProjectDrop, setShowProjectDrop] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const projectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/projects').then(r=>r.json()).then((data) => {
      setProjects(data)
    })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
        setShowProjectDrop(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function upd(k: string, v: any) { setForm((prev: any) => ({ ...prev, [k]: v })) }

  const selectedProject = projects.find(p => p.id === form.project_id)
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))

  async function createAndSelectProject(name: string) {
    if (!name.trim()) return
    setCreatingProject(true)
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color })
    })
    if (res.ok) {
      const newProject = await res.json()
      setProjects(prev => [...prev, newProject])
      upd('project_id', newProject.id)
      setProjectSearch('')
      setShowProjectDrop(false)
      showToast(`Project "${name.trim()}" created`)
    } else {
      showToast('Error creating project')
    }
    setCreatingProject(false)
  }

  async function extract() {
    if (!emailText.trim()) { showToast('Paste an email first'); return }
    setLoading(true); setExtracted(null); setError('')
    try {
      const res = await fetch('/api/extract', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({emailText}) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setExtracted(data)
      setForm({ title:data.title, action_required:data.action_required, responsible_party:data.responsible_party,
        company:data.company, discipline:data.discipline, due_date:data.due_date, register_type:data.register_type,
        priority:data.priority, status:data.status??((STATUSES as any)[data.register_type]?.[0]),
        suggested_follow_up:data.suggested_follow_up_email, project_id:projects[0]?.id??'', notes:'' })
    } catch { setError('Could not extract. Check your API key in Settings.') }
    setLoading(false)
  }

  async function save() {
    if (!form.title?.trim()) { showToast('Please enter a title'); return }
    const type = form.register_type ?? 'ACT'
    const itemsRes = await fetch('/api/items')
    const allItems = itemsRes.ok ? await itemsRes.json() : []
    const nums = allItems.filter((i: any)=>i.type===type).map((i: any)=>{const m=i.number.match(/(\d+)$/);return m?parseInt(m[1]):0})
    const next = nums.length ? Math.max(...nums)+1 : 1
    const number = `${type}-${String(next).padStart(2,'0')}`

    const body = {
      number, type, project_id: form.project_id||projects[0]?.id,
      title: form.title, action_required: form.action_required,
      responsible: form.responsible_party, company: form.company,
      discipline: form.discipline||'Other',
      issued: new Date().toISOString().split('T')[0],
      due_date: form.due_date||null, status: form.status||'Open',
      priority: form.priority||'Medium', notes: form.notes||'',
      email_text: emailText, suggested_follow_up: form.suggested_follow_up,
    }
    const res = await fetch('/api/items', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    if (!res.ok) { showToast('Error saving'); return }
    window.dispatchEvent(new Event('chase:refresh'))
    showToast(`${number} saved`)
    router.push('/app')
  }

  const statuses = form.register_type ? (STATUSES as any)[form.register_type] ?? ['Open'] : ['Open']

  return (
    <>
      <div className="topbar">
        <div><div className="topbar-title">Paste email</div><div className="topbar-meta">Paste any project email — Chase extracts the action automatically</div></div>
      </div>
      <div className="page-content">
        <div className="paste-layout">
          <div className="paste-col">
            <div><div className="paste-col-title">Email</div><div className="paste-col-sub">Paste a consultant, contractor or site email</div></div>
            <textarea className="email-textarea" value={emailText} onChange={e=>setEmailText(e.target.value)}
              placeholder={"Paste an email or email chain here…\n\nChase will identify:\n· The action required\n· Who is responsible\n· When it is due\n· Which register type it belongs to"} />
            <div style={{display:'flex',gap:7}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={extract} disabled={loading}>
                {loading?<><span className="spinner" style={{width:13,height:13}}/> Extracting…</>:<>✦  Extract with AI</>}
              </button>
              <button className="btn" onClick={()=>{setEmailText(SAMPLE);setExtracted(null);setError('')}}>Load sample</button>
            </div>
          </div>
          <div className="paste-col">
            <div><div className="paste-col-title">Extracted action</div><div className="paste-col-sub">Review and edit before saving</div></div>
            {!extracted&&!error&&<div className="extract-empty"><div className="extract-empty-icon"><IconMail/></div><div style={{fontSize:13,fontWeight:600,color:'var(--text2)'}}>Paste an email to get started</div><div style={{fontSize:12,maxWidth:220,lineHeight:1.6}}>Chase will extract the action, responsible party, due date and register type automatically.</div></div>}
            {error&&<div style={{padding:'14px 16px',background:'var(--red-l)',border:'1px solid var(--border)',borderRadius:'var(--rl)',fontSize:12.5,color:'var(--red-d)'}}>{error}</div>}
            {extracted&&<div className="extract-card">
              <div className="extract-header"><span className="ai-badge">AI extracted</span><span style={{fontSize:11,color:'var(--text3)'}}>Review and edit before saving</span></div>
              <div className="extract-body">
                <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}>
                  <div className="form-label">Title</div>
                  <input style={{width:'100%',border:'none',background:'transparent',padding:0,fontFamily:'var(--f)',fontSize:13.5,fontWeight:600,color:'var(--text)',outline:'none'}} value={form.title??''} onChange={e=>upd('title',e.target.value)}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
                  <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)'}}>
                    <div className="form-label">Register type</div>
                    <select className="form-select" value={form.register_type??'ACT'} onChange={e=>{upd('register_type',e.target.value);upd('status',(STATUSES as any)[e.target.value]?.[0])}}>
                      {REGISTER_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)'}}>
                    <div className="form-label">Status</div>
                    <select className="form-select" value={form.status??''} onChange={e=>upd('status',e.target.value)}>
                      {statuses.map((s: string)=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)'}}>
                    <div className="form-label">Responsible party</div>
                    <input className="form-input" value={form.responsible_party??''} onChange={e=>upd('responsible_party',e.target.value)}/>
                  </div>
                  <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)'}}>
                    <div className="form-label">Due date</div>
                    <input className="form-input" type="date" value={form.due_date??''} onChange={e=>upd('due_date',e.target.value)}/>
                  </div>
                  <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)'}}>
                    <div className="form-label">Discipline</div>
                    <select className="form-select" value={form.discipline??'Other'} onChange={e=>upd('discipline',e.target.value)}>
                      {DISCIPLINES.map((d: string)=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)'}}>
                    <div className="form-label">Project</div>
                    <div ref={projectRef} style={{position:'relative'}}>
                      <div style={{display:'flex',gap:4,alignItems:'center'}}>
                        <div
                          onClick={()=>setShowProjectDrop(v=>!v)}
                          style={{flex:1,cursor:'pointer',padding:'4px 8px',borderRadius:'var(--r)',border:'1px solid var(--border)',background:'var(--bg)',fontSize:12,color:selectedProject?'var(--text)':'var(--text3)',minHeight:28,display:'flex',alignItems:'center'}}
                        >
                          {selectedProject ? (
                            <span style={{display:'flex',alignItems:'center',gap:5}}>
                              <span style={{width:7,height:7,borderRadius:'50%',background:selectedProject.color,display:'inline-block'}}/>
                              {selectedProject.name}
                            </span>
                          ) : 'Select or create project'}
                        </div>
                        <button
                          onClick={()=>{setShowProjectDrop(true);setTimeout(()=>document.getElementById('proj-search')?.focus(),50)}}
                          style={{width:24,height:24,borderRadius:'var(--r)',border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',fontSize:14,color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
                          title="Add new project"
                        >+</button>
                      </div>
                      {showProjectDrop && (
                        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--rl)',boxShadow:'0 4px 16px rgba(0,0,0,.08)',zIndex:100}}>
                          <div style={{padding:'6px 8px',borderBottom:'1px solid var(--border)'}}>
                            <input
                              id="proj-search"
                              autoFocus
                              placeholder="Search or type new project name…"
                              value={projectSearch}
                              onChange={e=>setProjectSearch(e.target.value)}
                              onKeyDown={e=>{ if(e.key==='Enter' && projectSearch.trim() && filteredProjects.length===0) createAndSelectProject(projectSearch) }}
                              style={{width:'100%',border:'none',background:'transparent',outline:'none',fontSize:12,fontFamily:'var(--f)',color:'var(--text)'}}
                            />
                          </div>
                          <div style={{maxHeight:160,overflowY:'auto'}}>
                            {filteredProjects.map(p=>(
                              <div key={p.id} onClick={()=>{upd('project_id',p.id);setShowProjectDrop(false);setProjectSearch('')}} style={{padding:'7px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6,color:'var(--text)'}}
                                onMouseEnter={e=>(e.currentTarget.style.background='var(--bg)')}
                                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                              >
                                <span style={{width:7,height:7,borderRadius:'50%',background:p.color,display:'inline-block',flexShrink:0}}/>
                                {p.name}
                              </div>
                            ))}
                            {projectSearch.trim() && !filteredProjects.find(p=>p.name.toLowerCase()===projectSearch.toLowerCase()) && (
                              <div
                                onClick={()=>createAndSelectProject(projectSearch)}
                                style={{padding:'7px 12px',cursor:'pointer',fontSize:12,color:'var(--harbour)',display:'flex',alignItems:'center',gap:6,borderTop: filteredProjects.length?'1px solid var(--border)':'none'}}
                                onMouseEnter={e=>(e.currentTarget.style.background='var(--bg)')}
                                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                              >
                                {creatingProject ? 'Creating…' : `+ Create "${projectSearch.trim()}"`}
                              </div>
                            )}
                            {filteredProjects.length===0 && !projectSearch.trim() && (
                              <div style={{padding:'10px 12px',fontSize:12,color:'var(--text3)'}}>No projects yet — type a name to create one</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)'}}>
                  <div className="form-label">Action required</div>
                  <textarea className="form-textarea" style={{minHeight:52}} value={form.action_required??''} onChange={e=>upd('action_required',e.target.value)}/>
                </div>
                <div style={{padding:'11px 16px'}}>
                  <div className="form-label">Notes</div>
                  <textarea className="form-textarea" style={{minHeight:40}} value={form.notes??''} onChange={e=>upd('notes',e.target.value)}/>
                </div>
              </div>
              <div className="extract-footer">
                <button className="btn btn-primary" style={{flex:1}} onClick={save}>Save to register</button>
                <button className="btn" onClick={()=>{setExtracted(null);setEmailText('');setError('')}}>Clear</button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </>
  )
}
