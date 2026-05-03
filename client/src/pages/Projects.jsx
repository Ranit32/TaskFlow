import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = () => {
    projectAPI.getAll().then(res => setProjects(res.data.projects)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await projectAPI.create(form);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#6366f1' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>📁 Projects</h2>
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}</p>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {projects.map(p => {
            const progress = p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0;
            return (
              <Link key={p._id} to={`/projects/${p._id}`} className="project-card"
                style={{ '--project-color': p.color }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                  <span className="badge badge-member" style={{ marginLeft: 'auto' }}>
                    {p.members?.length} member{p.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="project-card-name">{p.name}</div>
                <div className="project-card-desc">
                  {p.description || 'No description provided.'}
                </div>
                <div className="project-card-footer">
                  <div className="project-progress">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.doneCount}/{p.taskCount} tasks</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: p.color }} />
                    </div>
                  </div>
                  <div className="project-members-stack" style={{ marginLeft: 12 }}>
                    {p.members?.slice(0, 3).map(m => (
                      <div key={m.user?._id} className="avatar-sm" title={m.user?.name}>
                        {m.user?.name?.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button id="create-project-submit" className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating…' : 'Create Project'}
          </button>
        </>}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input className="form-input" placeholder="e.g. Website Redesign"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="What is this project about?"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setForm({ ...form, color: c })}
                style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid white' : '3px solid transparent', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
