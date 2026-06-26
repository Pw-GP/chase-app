'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const EXTRACTIONS = [
  {
    color: '#D86112',
    bg: 'rgba(216,97,18,0.10)',
    type: 'ACTION',
    title: 'Issue revised fire drawings',
    meta: 'Due Friday · Assigned to BuildCorp',
  },
  {
    color: '#1A7A40',
    bg: 'rgba(26,122,64,0.10)',
    type: 'APPROVAL',
    title: 'Level 3 facade panel — Pending client sign-off',
    meta: 'Client · Awaiting response',
  },
  {
    color: '#1A3270',
    bg: 'rgba(26,50,112,0.10)',
    type: 'RFI',
    title: 'Hydraulic coordination at riser shaft',
    meta: 'RFI-26 · Services engineer',
  },
  {
    color: '#996600',
    bg: 'rgba(153,102,0,0.10)',
    type: 'FOLLOW-UP',
    title: 'Structural consultant response 4 days overdue',
    meta: 'Overdue · Escalate now',
  },
]

function HeroDemo() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 2700),
      setTimeout(() => setPhase(4), 3100),
      setTimeout(() => setPhase(5), 3500),
      setTimeout(() => setPhase(6), 3900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="l-demo-wrap">
      {/* Incoming email */}
      <div className={`l-email-card${phase >= 1 ? ' visible' : ''}`}>
        <div className="l-email-header">
          <div className="l-email-icon">
            <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 4 10 9 10-9"/></svg>
          </div>
          <div className="l-email-meta">
            <div className="l-email-label">Incoming email</div>
            <div className="l-email-from">Marcus Webb — Project Architect</div>
          </div>
        </div>
        <div className="l-email-subject">Level 3 Corridor — Fire Rating Coordination</div>
        <div className="l-email-body">
          Hi team, following the site meeting yesterday we need{' '}
          <span className="l-email-highlight">revised fire drawings issued by Friday.</span>{' '}
          The{' '}
          <span className="l-email-highlight">Level 3 facade approval is still pending client sign-off</span>
          {' '}— please chase. Also{' '}
          <span className="l-email-highlight">RFI-26 from the hydraulic engineer</span>{' '}
          has been sitting for two weeks and{' '}
          <span className="l-email-highlight">structural is now 4 days overdue</span>{' '}
          on their coordination response.
        </div>
      </div>

      {/* AI arrow */}
      <div className={`l-arrow${phase >= 2 ? ' visible' : ''}`}>
        <div className="l-arrow-line">
          <div className="l-arrow-label">AI extraction</div>
          <div className="l-arrow-icon">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
        </div>
      </div>

      {/* Extracted items */}
      <div className="l-extractions">
        {EXTRACTIONS.map((item, i) => (
          <div key={i} className={`l-extract-item${phase >= i + 3 ? ' visible' : ''}`}>
            <div className="l-extract-check" style={{ background: item.color }}>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="l-extract-type" style={{ color: item.color }}>{item.type}</div>
              <div className="l-extract-title">{item.title}</div>
              <div className="l-extract-meta">{item.meta}</div>
            </div>
            <div style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: item.bg, color: item.color, alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>
              Logged
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="landing">

      {/* Nav */}
      <nav className="l-nav">
        <Link href="/" className="l-nav-logo">
          <div className="l-nav-logomark">
            <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span className="l-nav-brand">Chase</span>
        </Link>
        <div className="l-nav-links">
          {['Product','Solutions','Pricing','Resources'].map(l => (
            <a key={l} href="#" className="l-nav-link">{l}</a>
          ))}
        </div>
        <div className="l-nav-actions">
          <a href="/app" className="l-btn l-btn-ghost">Log In</a>
          <Link href="/app" className="l-btn l-btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="l-hero">
        <div className="l-hero-left">
          <div className="l-eyebrow">Built for construction teams</div>
          <h1 className="l-h1">
            Every action.<br/>
            Every follow-up.<br/>
            <em>Nothing missed.</em>
          </h1>
          <p className="l-body">
            Paste a project email and Chase automatically extracts actions, approvals, RFIs and follow-ups — so your team stops chasing and starts delivering.
          </p>
          <div className="l-actions">
            <Link href="/app" className="l-btn l-btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Start for free
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#" className="l-btn l-btn-ghost" style={{ padding: '12px 28px', fontSize: 15 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch demo
            </a>
          </div>
          <div className="l-note">
            <span>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              No credit card
            </span>
            <span>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              5-minute setup
            </span>
            <span>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Any email client
            </span>
          </div>
        </div>
        <div className="l-hero-right">
          <HeroDemo />
        </div>
      </div>

      {/* Social proof strip */}
      <div className="l-proof">
        <div className="l-proof-label">Trusted by construction and design teams</div>
        <div className="l-proof-firms">
          {['Architecture firms','General contractors','Project managers','Engineering consultants','Development managers'].map(f => (
            <span key={f} className="l-proof-firm">{f}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="l-section">
        <div className="l-section-eyebrow">What Chase does</div>
        <h2 className="l-section-title">
          The register you never<br/>have to chase
        </h2>
        <p className="l-section-sub">
          Every project email contains hidden obligations. Chase finds them, logs them, and tracks them until they&rsquo;re resolved.
        </p>
        <div className="l-features-grid">
          {[
            {
              n: '01',
              icon: (
                <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 4 10 9 10-9"/></svg>
              ),
              title: 'Email intelligence',
              desc: 'Paste any project email — Chase reads it like an experienced PM and pulls out every commitment, request and deadline.',
            },
            {
              n: '02',
              icon: (
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ),
              title: 'Automatic due dates',
              desc: 'Relative dates ("by Friday", "end of month") are resolved to absolute deadlines so nothing slips through the cracks.',
            },
            {
              n: '03',
              icon: (
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              ),
              title: 'Live accountability',
              desc: 'See who owes what, what\'s overdue, and what\'s been sitting without a response — across every project, at a glance.',
            },
            {
              n: '04',
              icon: (
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              ),
              title: 'Smart follow-ups',
              desc: 'Chase generates professional follow-up emails drafted in your tone — ready to send in one click.',
            },
            {
              n: '05',
              icon: (
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              ),
              title: 'Project registers',
              desc: 'Separate RFIs, Approvals, Variations, Defects and Site Instructions into dedicated registers — automatically.',
            },
            {
              n: '06',
              icon: (
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ),
              title: 'Team collaboration',
              desc: 'Assign items, add notes, track responses and keep the whole project team aligned without a single extra meeting.',
            },
          ].map(f => (
            <div key={f.n} className="l-feature">
              <div className="l-feature-num">{f.n}</div>
              <div className="l-feature-icon">{f.icon}</div>
              <div className="l-feature-title">{f.title}</div>
              <div className="l-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="l-how">
        <div className="l-section-eyebrow">Workflow</div>
        <h2 className="l-section-title">Up and running<br/>in minutes</h2>
        <div className="l-how-steps">
          {[
            {
              n: '01',
              title: 'Paste an email',
              desc: 'Copy any project email — from consultants, contractors, or clients — and paste it directly into Chase.',
            },
            {
              n: '02',
              title: 'AI extracts everything',
              desc: 'Chase identifies every action item, approval, RFI, variation, defect and follow-up with responsible parties and due dates.',
            },
            {
              n: '03',
              title: 'Track and resolve',
              desc: 'Monitor your live register, generate follow-up emails, and close items as they get resolved.',
            },
          ].map(s => (
            <div key={s.n}>
              <div className="l-step-num">{s.n}</div>
              <div className="l-step-title">{s.title}</div>
              <div className="l-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="l-cta">
        <div className="l-cta-inner">
          <h2 className="l-cta-title">
            Stop chasing.<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Start delivering.</em>
          </h2>
          <p className="l-cta-sub">
            Join construction teams who use Chase to keep projects on track without the email chaos.
          </p>
          <div className="l-cta-actions">
            <Link href="/app" className="l-btn l-btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
              Get started free
            </Link>
            <a href="#" className="l-btn l-btn-ghost" style={{ padding: '14px 32px', fontSize: 15 }}>
              Talk to us
            </a>
          </div>
          <p className="l-cta-note">Free during beta &nbsp;·&nbsp; No card required &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-footer-brand">
          <div className="l-nav-logomark" style={{ width: 24, height: 24, borderRadius: 6 }}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="l-footer-name">Chase</span>
          <span className="l-footer-copy">© 2025</span>
        </div>
        <div className="l-footer-links">
          {['Privacy','Terms','Contact'].map(l => (
            <a key={l} href="#" className="l-footer-link">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
