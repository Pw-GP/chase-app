'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconLogo, IconDashboard, IconMail, IconFolder, IconSettings } from './ui'
import { Project, RegisterItem, REGISTER_TYPES } from '@/types'
import { isOverdue } from '@/lib/store'

interface SidebarProps {
  projects: Project[]
  items: RegisterItem[]
  onAddProject: () => void
}

export default function Sidebar({ projects, items, onAddProject }: SidebarProps) {
  const path = usePathname()
  const overdueCount = items.filter(i => isOverdue(i)).length

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-mark"><IconLogo /></div>
        <div className="sb-name">Chase</div>
      </div>

      <div className="sb-group">
        <Link href="/app" className={`nav-item ${path === '/app' ? 'active' : ''}`}>
          <IconDashboard /> Dashboard
          {overdueCount > 0 && <span className="nav-badge">{overdueCount}</span>}
        </Link>
        <Link href="/app/paste-email" className={`nav-item ${path === '/app/paste-email' ? 'active' : ''}`}>
          <IconMail /> Paste email
        </Link>
        <Link href="/app/projects" className={`nav-item ${path === '/app/projects' ? 'active' : ''}`}>
          <IconFolder /> Projects
        </Link>
        <Link href="/app/settings" className={`nav-item ${path === '/app/settings' ? 'active' : ''}`}>
          <IconSettings /> Settings
        </Link>
      </div>

      <div className="sb-group">
        <div className="sb-label">Projects</div>
        {projects.map(p => (
          <Link key={p.id} href={`/app?project=${p.id}`} className="proj-item">
            <div className="proj-dot" style={{ background: p.color }} />
            {p.name}
          </Link>
        ))}
        <button onClick={onAddProject} style={{ display:'flex',alignItems:'center',gap:7,padding:'4px 8px',borderRadius:'var(--r)',fontSize:11,color:'var(--text4)',cursor:'pointer',background:'none',border:'none',fontFamily:'var(--f)',width:'100%',textAlign:'left' }}>
          + Add project
        </button>
      </div>

      <div className="sb-group">
        <div className="sb-label">Register</div>
        <Link href="/app" className="type-item">
          <div className="type-dot" style={{ background:'var(--harbour)' }} />
          All
          <span className="type-count">{items.length}</span>
        </Link>
        {REGISTER_TYPES.map(t => (
          <Link key={t.id} href={`/app?type=${t.id}`} className="type-item">
            <div className="type-dot" style={{ background: t.color }} />
            {t.label}
            <span className="type-count">{items.filter(i => i.type === t.id).length}</span>
          </Link>
        ))}
      </div>

      <div className="sb-footer">
        <div className="avatar">PW</div>
        <div>
          <div className="user-name">Paraic Walsh</div>
          <div className="user-role">Architect</div>
        </div>
      </div>
    </aside>
  )
}
