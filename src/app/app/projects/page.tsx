'use client'
import { useState, useEffect } from 'react'
import { Project, PROJECT_COLORS } from '@/types'
import { getProjects, saveProjects, getItems, isClosed } from '@/lib/store'
import { showToast } from '@/components/ui'
import Link from 'next/link'

export default function ProjectsPage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [items, setItems]         = useState<ReturnType<typeof getItems>>([])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName]     = useState('')
  const [newCode, setNewCode]     = useState('')

  useEffect(() => {
    setProjects(getProjects())
    setItems(getItems())
  }, [])

  function addProject() {
    if (!newName.trim()) return
    const p: Project = {
      id:        'p' + Date.now(),
      name:      newName.trim(),
      code:      newCode.trim() || newName.slice(0, 3).toUpperCase(),
      color:     PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
      createdAt: new Date().toISOString(),
    }
    const updated = [...projects, p]
    saveProjects(updated)
    setProjects(updated)
    window.dispatchEvent(new Event('chase:refresh'))
    setNewName('')
    setNewCode('')
    setShowModal(false)
    showToast('Project created')
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Projects</div>
          <div className="topbar-meta">{projects.length} projects</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New project</button>
        </div>
      </div>

      <div className="page-content">
        <div className="projects-grid">
          {projects.map(p => {
            const pItems  = items.filter(i => i.projectId === p.id)
            const openN   = pItems.filter(i => !isClosed(i)).length
            return (
              <Link key={p.id} href={`/app?project=${p.id}`} className="project-card">
                <div className="project-code">
                  <div style={{ width:5,height:5,borderRadius:'50%',background:p.color }} />
                  {p.code}
                </div>
                <div className="project-name">{p.name}</div>
                <div className="project-stats">
                  <span className="project-stat"><strong>{pItems.length}</strong> items</span>
                  <span className="project-stat"><strong>{openN}</strong> open</span>
                </div>
              </Link>
            )
          })}
          <button className="new-project-card" onClick={() => setShowModal(true)}>
            + New project
          </button>
        </div>
      </div>

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
                autoFocus
                onChange={e => setNewName(e.target.value)}
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
    </>
  )
}
