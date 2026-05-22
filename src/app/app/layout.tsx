'use client'
import { useState, useEffect, useCallback } from 'react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import { Project, PROJECT_COLORS } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')

  const loadProjects = useCallback(async () => {
    const res = await fetch('/api/projects')
    if (res.ok) setProjects(await res.json())
  }, [])

  const loadItemCount = useCallback(async () => {
    const res = await fetch('/api/items')
    if (res.ok) {
      const items = await res.json()
      setItemCount(items.length)
      const now = new Date()
      setOverdueCount(items.filter((i: any) => {
        if (!i.due_date || ['Closed','Accepted','Paid','Approved','Done','Actioned','Rectified'].includes(i.status)) return false
        return new Date(i.due_date) < now
      }).length)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadItemCount()
    window.addEventListener('chase:refresh', loadProjects)
    window.addEventListener('chase:refresh', loadItemCount)
    return () => {
      window.removeEventListener('chase:refresh', loadProjects)
      window.removeEventListener('chase:refresh', loadItemCount)
    }
  }, [loadProjects, loadItemCount])

  async function addProject() {
    if (!newName.trim()) return
    const body = {
      name: newName.trim(),
      code: newCode.trim() || newName.slice(0, 3).toUpperCase(),
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
    }
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      await loadProjects()
      window.dispatchEvent(new Event('chase:refresh'))
    }
    setNewName(''); setNewCode(''); setShowModal(false)
  }

  const userName = user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User'
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        itemCount={itemCount}
        overdueCount={overdueCount}
        onAddProject={() => setShowModal(true)}
        userName={userName}
        userInitials={initials}
      />
      <div className="main-area">{children}</div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New project</div>
            <div className="modal-sub">Add a project to start tracking its register.</div>
            <div className="modal-field">
              <label className="modal-label">Project name</label>
              <input className="modal-input" placeholder="e.g. 300 Collins Street" value={newName}
                onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && addProject()} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Project code</label>
              <input className="modal-input" placeholder="e.g. COL-300" value={newCode}
                onChange={e => setNewCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && addProject()} />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addProject}>Create project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
