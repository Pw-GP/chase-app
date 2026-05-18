'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { Project, PROJECT_COLORS } from '@/types'
import { getProjects, saveProjects, getItems } from '@/lib/store'
import { RegisterItem } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [items, setItems]       = useState<RegisterItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')

  const load = useCallback(() => {
    setProjects(getProjects())
    setItems(getItems())
  }, [])

  useEffect(() => {
    load()
    // Reload when storage changes (paste email page adds items)
    window.addEventListener('storage', load)
    window.addEventListener('chase:refresh', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('chase:refresh', load)
    }
  }, [load])

  function addProject() {
    if (!newName.trim()) return
    const p: Project = {
      id: 'p' + Date.now(),
      name: newName.trim(),
      code: newCode.trim() || newName.slice(0, 3).toUpperCase(),
      color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      createdAt: new Date().toISOString(),
    }
    const updated = [...projects, p]
    saveProjects(updated)
    setProjects(updated)
    setNewName('')
    setNewCode('')
    setShowModal(false)
  }

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        items={items}
        onAddProject={() => setShowModal(true)}
      />

      <div className="main-area">
        {children}
      </div>

      {/* New project modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New project</div>
            <div className="modal-sub">Add a project to start tracking its register.</div>
            <div className="modal-field">
              <label className="modal-label">Project name</label>
              <input
                className="modal-input"
                placeholder="e.g. 300 Collins Street"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && addProject()}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Project code</label>
              <input
                className="modal-input"
                placeholder="e.g. COL-300"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addProject()}
              />
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
