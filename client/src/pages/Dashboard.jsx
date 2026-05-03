import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card" style={{ '--accent-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const STATUS_BADGE = { todo: 'badge-todo', 'in-progress': 'badge-in-progress', done: 'badge-done' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const { stats, myTasks, recentTasks } = data || {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>👋 Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p>Here's what's happening across your projects</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">➕ New Project</Link>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard icon="📁" value={stats?.totalProjects} label="Total Projects" color="var(--accent)" />
        <StatCard icon="📋" value={stats?.totalTasks} label="Total Tasks" color="#3b82f6" />
        <StatCard icon="⏳" value={stats?.inProgressTasks} label="In Progress" color="#f59e0b" />
        <StatCard icon="✅" value={stats?.doneTasks} label="Completed" color="#10b981" />
        <StatCard icon="🔴" value={stats?.overdueTasks} label="Overdue" color="#ef4444" />
        <StatCard icon="🔥" value={stats?.highPriority} label="High Priority" color="#f97316" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* My Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>📌 My Tasks</h3>
            <Link to="/my-tasks" style={{ fontSize: 12, color: 'var(--accent-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {myTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">🎉</div>
              <p>All caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTasks?.slice(0, 5).map(task => {
                const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
                return (
                  <div key={task._id} className="card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{task.title}</span>
                      <span className={`badge ${STATUS_BADGE[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        📁 {task.project?.name}
                      </span>
                      {task.dueDate && (
                        <span className={`due-date ${overdue ? 'overdue' : ''}`} style={{ marginLeft: 'auto' }}>
                          📅 {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>🕐 Recent Tasks</h3>
            <Link to="/projects" style={{ fontSize: 12, color: 'var(--accent-light)', textDecoration: 'none' }}>Projects →</Link>
          </div>
          {recentTasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📋</div>
              <p>No tasks yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTasks?.slice(0, 6).map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className={`badge ${STATUS_BADGE[task.status]}`} style={{ flexShrink: 0 }}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {format(new Date(task.createdAt), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
