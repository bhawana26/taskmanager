import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllTasks, getMyTasks, getOverdueTasks, getProjects } from '../utils/api';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, done: 0, overdue: 0, projects: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, overdueRes, projectsRes] = await Promise.all([
          isAdmin ? getAllTasks() : getMyTasks(),
          getOverdueTasks(),
          getProjects()
        ]);
        const tasks = tasksRes.data;
        setStats({
          total: tasks.length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          done: tasks.filter(t => t.status === 'DONE').length,
          overdue: overdueRes.data.length,
          projects: projectsRes.data.length
        });
        setRecentTasks(tasks.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  const statusBadge = (status) => {
    const cls = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in_progress', DONE: 'badge-done' };
    const label = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
    return <span className={`badge ${cls[status]}`}>{label[status]}</span>;
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text2)', marginTop: '0.25rem' }}>Here's what's happening today</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-value">{stats.projects}</div>
          <div className="stat-label">Projects</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <p style={{ color: 'var(--text2)' }}>No tasks yet. Head to Tasks to create your first one!</p>
        ) : (
          <div className="tasks-list">
            {recentTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    {statusBadge(task.status)}
                    <span className={`badge badge-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                    {task.project && <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>📁 {task.project.name}</span>}
                    {task.dueDate && <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>📅 {task.dueDate}</span>}
                  </div>
                </div>
                {task.assignee && (
                  <div style={{ color: 'var(--text2)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    👤 {task.assignee.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
