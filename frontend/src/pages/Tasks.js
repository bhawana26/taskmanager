import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllTasks, getMyTasks, createTask, updateTask, deleteTask, updateTaskStatus, getProjects, getAllUsers } from '../utils/api';

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', projectId: '', assigneeId: '', dueDate: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        isAdmin ? getAllTasks() : getMyTasks(),
        getProjects()
      ]);
      setTasks(tRes.data);
      setProjects(pRes.data);
      if (isAdmin) {
        const uRes = await getAllUsers();
        setUsers(uRes.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isAdmin]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', projectId: '', assigneeId: '', dueDate: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      projectId: task.project?.id || '', assigneeId: task.assignee?.id || '',
      dueDate: task.dueDate || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, projectId: form.projectId || null, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null };
      if (editTask) await updateTask(editTask.id, payload);
      else await createTask(payload);
      setShowModal(false);
      load();
    } catch (e) { alert('Error saving task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { await updateTaskStatus(taskId, status); load(); } catch (e) { alert('Error updating status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(id); load(); } catch (e) { alert('Error deleting'); }
  };

  const filtered = tasks.filter(t => filter === 'ALL' ? true : t.status === filter);
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = (task) => task.dueDate && task.dueDate < today && task.status !== 'DONE';

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
            {f === 'ALL' ? 'All' : STATUS_LABELS[f]}
            <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
              {f === 'ALL' ? tasks.length : tasks.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div>No tasks here. Click "+ New Task" to get started!</div>
        </div>
      ) : (
        <div className="tasks-list">
          {filtered.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-info">
                <div className="task-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {task.title}
                  {isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}
                </div>
                {task.description && <div style={{ color: 'var(--text2)', fontSize: '0.85rem', margin: '0.25rem 0' }}>{task.description}</div>}
                <div className="task-meta" style={{ marginTop: '0.5rem' }}>
                  <span className={`badge badge-${task.status.toLowerCase()}`}>{STATUS_LABELS[task.status]}</span>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>{PRIORITY_LABELS[task.priority]}</span>
                  {task.project && <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>📁 {task.project.name}</span>}
                  {task.assignee && <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>👤 {task.assignee.name}</span>}
                  {task.dueDate && <span style={{ color: isOverdue(task) ? 'var(--red)' : 'var(--text2)', fontSize: '0.82rem' }}>📅 {task.dueDate}</span>}
                </div>
              </div>
              <div className="task-actions">
                <select
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', padding: '0.35rem 0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}>Edit</button>
                {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Del</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Task details..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Project</label>
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">— No Project —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {isAdmin && users.length > 0 && (
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
                    <option value="">— Unassigned —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
