import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, deleteProject, getAllUsers } from '../utils/api';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', memberIds: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [pRes, uRes] = await Promise.all([getProjects(), isAdmin ? getAllUsers() : Promise.resolve({ data: [] })]);
      setProjects(pRes.data);
      setUsers(uRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(form);
      setShowModal(false);
      setForm({ name: '', description: '', memberIds: [] });
      load();
    } catch (e) { alert('Error creating project'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await deleteProject(id); load(); } catch (e) { alert('Error deleting'); }
  };

  const toggleMember = (userId) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(userId)
        ? f.memberIds.filter(id => id !== userId)
        : [...f.memberIds, userId]
    }));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <div>No projects yet. {isAdmin ? 'Create your first project!' : 'Ask your admin to add you to a project.'}</div>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card">
              <div className="project-name">{p.name}</div>
              <div className="project-desc">{p.description || 'No description'}</div>
              <div className="project-footer">
                <span className="members-count">👥 {p.members?.length || 0} members</span>
                {isAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Awesome Project" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What is this project about?" style={{ resize: 'vertical' }} />
              </div>
              {users.length > 0 && (
                <div className="form-group">
                  <label>Add Members</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                    {users.map(u => (
                      <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text)' }}>
                        <input type="checkbox" checked={form.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} />
                        {u.name} ({u.email}) — {u.role}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
