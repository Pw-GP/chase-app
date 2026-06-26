'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

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

const PILL_BG: Record<string,string> = { RFI:'rgba(26,50,112,0.08)', APR:'rgba(26,122,64,0.10)', VAR:'rgba(153,102,0,0.10)', DEF:'rgba(196,32,32,0.10)', ACT:'rgba(26,20,16,0.07)' }
const PILL_COL: Record<string,string> = { RFI:'#1a3270', APR:'#1a4a33', VAR:'#5c3e00', DEF:'#6e1f1f', ACT:'#555' }

function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    const element = el
    function onMove(e: MouseEvent) {
      const r = element.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      element.style.transform = `perspective(700px) rotateY(${x*4}deg) rotateX(${-y*4}deg) translateY(-2px)`
      element.style.boxShadow = `${-x*8}px ${-y*8}px 24px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)`
    }
    function onLeave() { element.style.transform = ''; element.style.boxShadow = '' }
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
  return (
    <div className="landing">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fade-up-1 { animation: fadeUp 0.65s ease 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.65s ease 0.18s both; }
        .fade-up-3 { animation: fadeUp 0.65s ease 0.32s both; }
        .fade-up-4 { animation: fadeUp 0.65s ease 0.44s both; }
        .float-a { animation: floatA 4s ease-in-out infinite; }
        .float-b { animation: floatB 5s ease-in-out infinite 0.8s; }
        .float-c { animation: floatC 4.5s ease-in-out infinite 1.5s; }
        .pricing-card { transition: transform 0.18s, box-shadow 0.18s; }
        .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,.08); }
      `}</style>

      {/* Nav */}
      <nav className="landing-nav">
        <Link href="/" className="landing-logo-wrap">
          <div className="sb-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="landing-wordmark">Chase</span>
        </Link>
        <div style={{ display:'flex', gap:28, alignItems:'center' }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'.08em', color:'rgba(26,20,16,0.45)' }}>For construction teams</span>
          <Link href="/app" style={{ fontSize:12, fontWeight:600, color:'rgba(26,20,16,0.65)', textDecoration:'none' }}>Log in</Link>
          <Link href="/app" className="landing-btn landing-btn-primary" style={{ padding:'9px 22px', fontSize:12 }}>
            Get started free
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-eyebrow fade-up-1">Construction communication, simplified</div>
        <h1 className="landing-h1 fade-up-2">
          Every action.<br/>Every follow-up.
        </h1>
        <div className="landing-sub-orange fade-up-2">Nothing missed.</div>
        <p className="landing-sub fade-up-3">Paste a project email and Chase automatically extracts actions, approvals, RFIs and follow-ups into one clean dashboard.</p>
        <div className="landing-actions fade-up-4">
          <Link href="/app" className="landing-btn landing-btn-primary">
            Start for free
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/demo" className="landing-btn landing-btn-secondary">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            See a demo
          </Link>
        </div>
        <div className="landing-note fade-up-4">No credit card &nbsp;·&nbsp; 5-minute setup &nbsp;·&nbsp; Works with any email client</div>
      </div>

      {/* How it works */}
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
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 4 10 9 10-9"/></>}
                    {i === 1 && <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}
                    {i === 2 && <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>}
                  </svg>
                </div>
                <div className="how-num">{step.n}</div>
              </div>
              <div className="how-card-title">{step.title}</div>
              <div className="how-card-desc">{step.desc}</div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Mock dashboard */}
      <div className="mock-section">
        <div className="how-title-wrap" style={{ marginBottom:32 }}>
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
                  {l:'Open', v:'6', c:'#c04e01', sub:'active'},
                  {l:'Overdue', v:'2', c:'#c42020', sub:'past due'},
                  {l:'Awaiting', v:'4', c:'#996600', sub:'no reply'},
                  {l:'Closed', v:'8', c:'#1a7a40', sub:'resolved'},
                  {l:'Total', v:'20', c:'#1a1410', sub:'all items'},
                ].map(k => (
                  <div key={k.l} className="mock-kpi" style={{ borderBottom:`2px solid ${k.c}` }}>
                    <div className="mock-kpi-label">{k.l}</div>
                    <div className="mock-kpi-val" style={{ color:k.c }}>{k.v}</div>
                    <div className="mock-kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>
              <table className="mock-table">
                <thead>
                  <tr>{['No.','Type','Description','Responsibility','Due','Status'].map((h,i) => <th key={h} style={{ textAlign:i===5?'right':'left' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {MOCK_ITEMS.map(item => (
                    <tr key={item.num}>
                      <td><span style={{ fontFamily:'monospace',fontSize:10,color:'#999' }}>{item.num}</span></td>
                      <td><span style={{ background:PILL_BG[item.type]||'rgba(26,20,16,0.07)',color:PILL_COL[item.type]||'#555',padding:'1px 6px',borderRadius:3,fontSize:9.5,fontWeight:700 }}>{item.type}</span></td>
                      <td style={{ fontWeight:600,color:'#1a1410',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.title}</td>
                      <td style={{ color:'rgba(26,20,16,0.55)' }}>{item.resp}</td>
                      <td style={{ color:item.ov?'#c42020':'rgba(26,20,16,0.45)',fontWeight:item.ov?600:400 }}>{item.due}</td>
                      <td style={{ textAlign:'right' }}><span style={{ background:item.ov?'rgba(196,32,32,0.10)':'rgba(153,102,0,0.10)',color:item.ov?'#6e1f1f':'#5c3e00',padding:'2px 8px',borderRadius:10,fontSize:9.5,fontWeight:700 }}>{item.ov?'Overdue':item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Pricing */}
      <div className="pricing-section">
        <div className="pricing-title">Simple, honest pricing</div>
        <div className="pricing-sub">Free during beta while we onboard construction teams.</div>
        <div className="pricing-grid">
          {PRICING.map(p => (
            <TiltCard key={p.tier} className={`pricing-card ${p.featured?'featured':''}`}>
              <div className="pricing-tier">{p.tier}</div>
              <div className="pricing-desc">{p.desc}</div>
              <div className="pricing-features">
                {p.features.map(f => (
                  <div key={f} className="pricing-feature">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#1a7a40" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
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
