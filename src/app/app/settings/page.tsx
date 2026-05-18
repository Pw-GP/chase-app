'use client'
import { useState, useEffect } from 'react'
import { showToast } from '@/components/ui'

const KEY = 'chase:profile'

interface Profile {
  name: string
  email: string
  firm: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    name:  'Paraic Walsh',
    email: 'pwalsh@graypuksand.com.au',
    firm:  'Gray Puksand',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) setProfile(JSON.parse(saved))
    } catch {}
  }, [])

  function save() {
    localStorage.setItem(KEY, JSON.stringify(profile))
    showToast('Profile saved')
  }

  function upd(k: keyof Profile, v: string) {
    setProfile(prev => ({ ...prev, [k]: v }))
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Settings</div>
          <div className="topbar-meta">Manage your account and preferences</div>
        </div>
      </div>

      <div className="page-content">
        <div className="settings-page">

          {/* AI configuration */}
          <div className="settings-card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)' }}>
                AI Configuration
              </div>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', marginBottom:4 }}>Anthropic API key</div>
              <div style={{ fontSize:11.5, color:'var(--text3)', marginBottom:12, lineHeight:1.6 }}>
                Your API key is stored securely as an environment variable on the server and is never exposed to the browser. To update it, edit your <code style={{ fontFamily:'var(--fm)', fontSize:11, background:'var(--bg)', padding:'1px 4px', borderRadius:3 }}>.env.local</code> file and restart the app.
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', fontSize:12 }}>
                <span style={{ color:'var(--green-d)' }}>✓</span>
                <span style={{ color:'var(--text2)' }}>API key configured via ANTHROPIC_API_KEY environment variable</span>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="settings-card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)' }}>
                Profile
              </div>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Name</div>
              </div>
              <input
                className="settings-input"
                style={{ width:200 }}
                value={profile.name}
                onChange={e => upd('name', e.target.value)}
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Email</div>
              </div>
              <input
                className="settings-input"
                style={{ width:240 }}
                value={profile.email}
                onChange={e => upd('email', e.target.value)}
              />
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Firm</div>
              </div>
              <input
                className="settings-input"
                style={{ width:200 }}
                value={profile.firm}
                onChange={e => upd('firm', e.target.value)}
              />
            </div>
            <div style={{ padding:'14px 18px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-primary" onClick={save}>Save profile</button>
            </div>
          </div>

          {/* Plan */}
          <div className="settings-card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)' }}>
                Plan
              </div>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Current plan</div>
                <div className="settings-sub">Free beta access</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="status-tag st-approved" style={{ fontSize:11.5, padding:'3px 10px' }}>Beta — Free</span>
                <button className="btn btn-primary" style={{ fontSize:11 }}>Manage</button>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="settings-card">
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--text3)' }}>
                Data
              </div>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Storage</div>
                <div className="settings-sub">Items and projects stored in browser localStorage</div>
              </div>
              <button
                className="btn"
                style={{ fontSize:11, color:'var(--red-d)', borderColor:'var(--red-l)' }}
                onClick={() => {
                  if (confirm('Clear all Chase data from this browser? This cannot be undone.')) {
                    localStorage.removeItem('chase:items')
                    localStorage.removeItem('chase:projects')
                    window.dispatchEvent(new Event('chase:refresh'))
                    showToast('Data cleared')
                  }
                }}
              >
                Clear all data
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
