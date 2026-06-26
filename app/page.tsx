'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const ROLES = ['Architects','Contractors','Project managers','Engineers','Consultants','Client-side PMs']

const HOW_STEPS = [
  { n:'01', title:'Paste email', desc:'Paste a consultant, contractor or project email chain into Chase.' },
  { n:'02', title:'AI extracts actions', desc:'Chase identifies actions, approvals, RFIs, due dates and responsible parties automatically.' },
  { n:'03', title:'Track accountability', desc:'View overdue items, pending responses and project follow-ups from one dashboard.' },
]

const PRICING = [
  { tier:'Solo teams', desc:'For individual project professionals', features:['Unlimited items','Up to 3 projects','AI email parsing','CSV export'] },
  { tier:'Growing teams', desc:'For small firms and project teams', features:['Everything in Solo','Up to 15 users','Unlimited projects','Priority support'], featured:true },
  { tier:'Enterprise', desc:'For large practices and contractors', features:['Everything in Team','Unlimited users','Custom onboarding','API access'] },
]

const MOCK_ITEMS = [
  { num:'RFI-03', type:'RFI', title:'Awaiting hydraulic coordination — Level 5', resp:'Services Eng.', due:'04/03/26', ov:true, status:'Waiting' },
  { num:'APR-03', type:'APR', title:'Facade shop drawing approval pending', resp:'Client', due:'08/04/26', ov:true, status:'Pending' },
  { num:'VAR-02', type:'VAR', title:'Revised door schedule — 14 additional doors', resp:'BuildCorp', due:'15/05/26', ov:false, status:'Pending' },
  { num:'DEF-01', type:'DEF', title:'Cracked render panel — Level 2 west facade', resp:'BuildCorp', due:'22/05/26', ov:false, status:'Open' },
  { num:'ACT-01', type:'ACT', title:'Fire consultant review outstanding', resp:'FireSafe Eng.', due:'26/05/26', ov:false, status:'Open' },
]

const PILL_BG: Record<string,string> = { RFI:'#edf1fc', APR:'#eaf3ee', VAR:'#f8f1e4', DEF:'#f8eded', ACT:'#f0f0ee' }
const PILL_COL: Record<string,string> = { RFI:'#1a3270', APR:'#1a4a33', VAR:'#5c3e00', DEF:'#6e1f1f', ACT:'#29343a' }

function useTilt(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    const element = el
    function onMove(e: MouseEvent) {
      const r = element.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      element.style.transform = `perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-3px)`
      element.style.boxShadow = `${-x*12}px ${-y*12}px 32px rgba(42,79,168,0.10), 0 4px 20px rgba(41,52,58,0.08)`
    }
    function onLeave() {
      element.style.transform = ''; element.style.boxShadow = ''
    }
    element.addEventListener('mousemove', onMove)
    element.addEventListener('mouseleave', onLeave)
    return () => { element.removeEventListener('mousemove', onMove); element.removeEventListener('mouseleave', onLeave) }
  }, [ref])
}

function TiltCard({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref)
  return <div ref={ref} className={className} style={{ ...style, transition:'transform 0.18s ease, box-shadow 0.18s ease' }}>{children}</div>
}

export default function LandingPage() {
  const cursorDot = useRef<HTMLDivElement>(null)
  const cursorRing = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (cursorDot.current) {
        cursorDot.current.style.left = e.clientX + 'px'
        cursorDot.current.style.top = e.clientY + 'px'
        cursorDot.current.style.opacity = '1'
      }
    }
    window.addEventListener('mousemove', onMove)

    let raf: number
    function animate() {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.1
      ring.current.y += (mouse.current.y - ring.current.y) * 0.1
      if (cursorRing.current) {
        cursorRing.current.style.left = ring.current.x + 'px'
        cursorRing.current.style.top = ring.current.y + 'px'
      }
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="landing" style={{ cursor:'none' }}>

      {/* Custom cursor */}
      <div ref={cursorDot} style={{
        position:'fixed', pointerEvents:'none', zIndex:9999,
        width:8, height:8, borderRadius:'50%',
        background:'#ffffff',
        transform:'translate(-50%,-50%)',
        opacity:0, transition:'opacity 0.3s',
      }}/>
      <div ref={cursorRing} style={{
        position:'fixed', pointerEvents:'none', zIndex:9998,
        width:32, height:32, borderRadius:'50%',
        border:'1.5px solid rgba(255,255,255,0.55)',
        transform:'translate(-50%,-50%)',
        background:'rgba(255,255,255,0.04)',
      }}/>

      <style>{`
        .landing * { cursor: none !important; }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .float-a { animation: floatA 4s ease-in-out infinite; }
        .float-b { animation: floatB 5s ease-in-out infinite 0.8s; }
        .float-c { animation: floatC 4.5s ease-in-out infinite 1.5s; }
        .fade-up-1 { animation: fadeUp 0.7s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.7s ease 0.25s both; }
        .fade-up-3 { animation: fadeUp 0.7s ease 0.4s both; }
        .role-pill { transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .role-pill:hover { background:#edf1fc; border-color:#2a4fa8; color:#1a3270; }
        .pricing-card { transition: transform 0.18s, box-shadow 0.18s; }
        .pricing-card:hover { transform: translateY(-5px); box-shadow: 0 10px 32px rgba(42,79,168,0.10); }
        .mock-kpi { transition: transform 0.15s, box-shadow 0.15s; }
        .mock-kpi:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(41,52,58,0.10); }
        .landing-btn { transition: opacity 0.15s, background 0.15s, transform 0.15s; }
        .landing-btn:hover { transform: translateY(-1px); }
        .roles-scroll-wrap { overflow: hidden; position: relative; }
        .roles-scroll { display: flex; gap: 8px; width: max-content; animation: scrollLeft 22s linear infinite; }
        .roles-scroll:hover { animation-play-state: paused; }
      `}</style>

      <nav className="landing-nav">
        <Link href="/" className="landing-logo-wrap">
          <div className="sb-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="landing-wordmark">Chase</span>
        </Link>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.70)', padding:'5px 10px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:4 }}>For construction teams</span>
          <Link href="/app" className="landing-btn landing-btn-secondary">Log in</Link>
          <Link href="/app" className="landing-btn landing-btn-primary">Get started free</Link>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="landing-eyebrow fade-up-1">Construction communication, simplified</div>
        <h1 className="landing-h1 fade-up-2">Every action. Every follow-up. <em>Nothing missed.</em></h1>
        <p className="landing-sub fade-up-3">Paste a project email and Chase automatically extracts actions, approvals, RFIs and follow-ups into one clean dashboard.</p>
        <div className="landing-actions fade-up-3">
          <Link href="/app" className="landing-btn landing-btn-primary">Start for free</Link>
          <Link href="/demo" className="landing-btn landing-btn-secondary">See a demo</Link>
        </div>
        <div className="landing-note fade-up-3">No credit card &nbsp;·&nbsp; 5-minute setup &nbsp;·&nbsp; Works with any email client</div>
      </div>

      <div className="how-section">
        <div className="how-title-wrap">
          <div className="section-eyebrow">Workflow</div>
          <div className="section-title">How Chase works</div>
        </div>
        <div className="how-grid">
          {HOW_STEPS.map((step, i) => (
            <TiltCard key={step.n} className={`how-card float-${['a','b','c'][i]}`}>
              <div className="how-card-top">
                <div className="how-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 4 10 9 10-9"/></>}
                    {i === 1 && <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
                    {i === 2 && <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>}
                  </svg>
                </div>
                <div className="how-num">{step.n}</div>
              </div>
              <div className="how-card-title">{step.title}</div>
              <div className="how-card-desc">{step.desc}</div>
              {i < 2 && <div className="how-arrow">→</div>}
            </TiltCard>
          ))}
        </div>
      </div>

      <div className="mock-section">
        <div className="how-title-wrap" style={{ marginBottom:28 }}>
          <div className="section-eyebrow">Dashboard</div>
          <div className="section-title">Everything in one place</div>
        </div>
        <TiltCard className="mock-wrap" style={{ maxWidth:900, margin:'0 auto' }}>
          <div className="mock-titlebar">
            <div className="mock-dots">
              <div className="mock-dot" style={{ background:'#ff5f57' }} />
              <div className="mock-dot" style={{ background:'#febc2e' }} />
              <div className="mock-dot" style={{ background:'#28c840' }} />
            </div>
            <div className="mock-url">Chase — 300 Collins Street</div>
          </div>
          <div className="mock-body">
            <div className="mock-sidebar">
              <div className="mock-nav-label">Menu</div>
              {['⊞ Dashboard','✉ Paste email','◫ Projects'].map((item, i) => (
                <div key={item} className={`mock-nav-item ${i===0?'active':'inactive'}`}>{item}</div>
              ))}
              <div className="mock-nav-label" style={{ marginTop:12 }}>Projects</div>
              <div className="mock-nav-item inactive">
                <div style={{ width:5,height:5,borderRadius:'50%',background:'#2a4fa8',marginRight:4,display:'inline-block' }} />
                300 Collins St
              </div>
            </div>
            <div className="mock-main">
              <div className="mock-topbar">
                <div><div className="mock-page-title">300 Collins Street</div><div className="mock-page-meta">COL-300 · 20 items</div></div>
                <div style={{ display:'flex',gap:6 }}>
                  <div className="mock-btn secondary">↓ Export</div>
                  <div className="mock-btn primary">＋ New</div>
                </div>
              </div>
              <div className="mock-kpis">
                {[
                  {l:'Open', v:'6', c:'#2a4fa8', sub:'active'},
                  {l:'Overdue', v:'2', c:'#a83232', sub:'past due'},
                  {l:'Awaiting', v:'4', c:'#8a5e00', sub:'no reply'},
                  {l:'Closed', v:'8', c:'#2e6645', sub:'resolved'},
                  {l:'Total', v:'20', c:'#29343a', sub:'all items'},
                ].map(k => (
                  <div key={k.l} className="mock-kpi" style={{ borderBottom:`2px solid ${k.c}` }}>
                    <div className="mock-kpi-label" style={{ color:'#a89f92' }}>{k.l}</div>
                    <div className="mock-kpi-val" style={{ color:k.c }}>{k.v}</div>
                    <div className="mock-kpi-sub" style={{ color:'#a89f92' }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <table className="mock-table">
                <thead>
                  <tr>{['No.','Type','Description','Responsibility','Due','Status'].map((h,i) => <th key={h} style={{ textAlign:i===5?'right':'left' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {MOCK_ITEMS.map(item => (
                    <tr key={item.num} style={{ background:item.ov?'rgba(168,50,50,.025)':undefined }}>
                      <td><span style={{ fontFamily:'monospace',fontSize:10,color:'#a89f92' }}>{item.num}</span></td>
                      <td><span style={{ background:PILL_BG[item.type]||'#f0f0ee',color:PILL_COL[item.type]||'#29343a',padding:'1px 6px',borderRadius:3,fontSize:9.5,fontWeight:600 }}>{item.type}</span></td>
                      <td style={{ fontWeight:600,color:'#29343a',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.title}</td>
                      <td style={{ color:'#61706b' }}>{item.resp}</td>
                      <td style={{ color:item.ov?'#a83232':'#a89f92',fontWeight:item.ov?600:400 }}>{item.due}</td>
                      <td style={{ textAlign:'right' }}><span style={{ background:item.ov?'#f8eded':'#f8f1e4',color:item.ov?'#6e1f1f':'#5c3e00',padding:'2px 8px',borderRadius:10,fontSize:9.5,fontWeight:600 }}>{item.ov?'Overdue':item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TiltCard>
      </div>

      <div className="pricing-section">
        <div className="pricing-title">Early access</div>
        <div className="pricing-sub">Free during beta while we onboard construction teams.</div>
        <div className="pricing-grid">
          {PRICING.map(p => (
            <TiltCard key={p.tier} className={`pricing-card ${p.featured?'featured':''}`}>
              <div className="pricing-tier">{p.tier}</div>
              <div className="pricing-desc">{p.desc}</div>
              <div className="pricing-features">
                {p.features.map(f => (
                  <div key={f} className="pricing-feature">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#2e6645" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/app" className="pricing-cta">Contact us for early access</Link>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  )
}
