'use client'
import { useUser } from '@clerk/nextjs'
export default function SettingsPage() {
  const { user } = useUser()
  return (
    <>
      <div className="topbar"><div><div className="topbar-title">Settings</div><div className="topbar-meta">Manage your account</div></div></div>
      <div className="page-content"><div className="settings-page">
        <div className="settings-card">
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}><div style={{fontSize:11,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)'}}>Profile</div></div>
          <div className="settings-row"><div><div className="settings-label">Name</div></div><div style={{fontSize:12.5}}>{user?.fullName||'—'}</div></div>
          <div className="settings-row"><div><div className="settings-label">Email</div></div><div style={{fontSize:12.5}}>{user?.emailAddresses[0]?.emailAddress||'—'}</div></div>
          <div className="settings-row"><div><div className="settings-label">Login</div><div className="settings-sub">Managed via Microsoft</div></div><span className="status-tag st-approved" style={{fontSize:11.5,padding:'3px 10px'}}>Connected</span></div>
        </div>
        <div className="settings-card">
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}><div style={{fontSize:11,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)'}}>AI</div></div>
          <div style={{padding:'14px 18px'}}><div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--r)',fontSize:12}}><span style={{color:'var(--green-d)'}}>✓</span><span style={{color:'var(--text2)'}}>Anthropic API key configured</span></div></div>
        </div>
        <div className="settings-card">
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}><div style={{fontSize:11,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text3)'}}>Plan</div></div>
          <div className="settings-row"><div><div className="settings-label">Current plan</div><div className="settings-sub">Free beta access</div></div><span className="status-tag st-approved" style={{fontSize:11.5,padding:'3px 10px'}}>Beta — Free</span></div>
        </div>
      </div></div>
    </>
  )
}
