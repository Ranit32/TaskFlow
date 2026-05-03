import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import { format, isPast } from 'date-fns';

const COLS = [
  { key: 'todo', label: 'To Do', color: '#94a3b8', dotClass: 'badge-todo' },
  { key: 'in-progress', label: 'In Progress', color: '#60a5fa', dotClass: 'badge-in-progress' },
  { key: 'done', label: 'Done', color: '#34d399', dotClass: 'badge-done' },
];

const PRIORITY_MAP = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
const STATUS_MAP = { todo: 'badge-todo', 'in-progress': 'badge-in-progress', done: 'badge-done' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = project?.members?.some(m => m.user?._id === user?._id && m.role === 'admin') || project?.owner?._id === user?._id;

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectAPI.getOne(id),
        taskAPI.getByProject(id)
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await taskAPI.create(id, { ...taskForm, assignedTo: taskForm.assignedTo || undefined, dueDate: taskForm.dueDate || undefined });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.updateStatus(taskId, status);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    } catch (err) { console.error(err); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await taskAPI.update(selectedTask._id, { ...taskForm, assignedTo: taskForm.assignedTo || null, dueDate: taskForm.dueDate || null });
      setSelectedTask(null);
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setSelectedTask(null);
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await projectAPI.addMember(id, { email: memberEmail, role: memberRole });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add member'); }
    finally { setSaving(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await projectAPI.removeMember(id, userId);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project?.name}"? All tasks will be deleted too.`)) return;
    try {
      await projectAPI.delete(id);
      navigate('/projects');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title, description: task.description || '',
      assignedTo: task.assignedTo?._id || '', priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '', status: task.status
    });
    setSelectedTask(task);
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Link to="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>
              ← Projects
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: project?.color }} />
            <span style={{ fontWeight: 600 }}>{project?.name}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {tasks.length} tasks · {project?.members?.length} members
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>👤 Add Member</button>}
          {isAdmin && <button id="create-task-btn" className="btn btn-primary" onClick={() => setShowTaskModal(true)}>➕ Add Task</button>}
          {isAdmin && project?.owner?._id === user?._id && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>🗑️</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['board', 'list', 'members'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'board' ? '🗂 Board' : t === 'list' ? '📋 List' : '👥 Members'}
          </button>
        ))}
      </div>

      {/* Board View */}
      {tab === 'board' && (
        <div className="kanban-board">
          {COLS.map(col => (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  {col.label}
                </div>
                <span className={`badge ${col.dotClass}`}>{tasksByStatus(col.key).length}</span>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus(col.key).map(task => (
                  <TaskCard key={task._id} task={task} onClick={openEditTask}
                    onStatusChange={handleStatusChange} canAdmin={isAdmin} />
                ))}
                {tasksByStatus(col.key).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {tab === 'list' && (
        tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No tasks yet</h3>
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>Add First Task</button>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Task</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Due Date</th><th></th>
              </tr></thead>
              <tbody>
                {tasks.map(task => {
                  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
                  return (
                    <tr key={task._id} style={{ cursor: 'pointer' }} onClick={() => openEditTask(task)}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{task.description.slice(0, 60)}</div>}
                      </td>
                      <td><span className={`badge ${STATUS_MAP[task.status]}`}>{STATUS_LABELS[task.status]}</span></td>
                      <td><span className={`badge ${PRIORITY_MAP[task.priority]}`}>{task.priority}</span></td>
                      <td>{task.assignedTo ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                          {task.assignedTo.name?.slice(0, 2)?.toUpperCase()}
                        </div>
                        {task.assignedTo.name}
                      </div> : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td className={overdue ? 'due-date overdue' : 'due-date'}>
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                        {overdue && <span className="badge badge-overdue" style={{ marginLeft: 6, fontSize: 10 }}>Overdue</span>}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDeleteTask(task._id)}>🗑️</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>👥 Team Members</h3>
            {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>+ Add Member</button>}
          </div>
          {project?.members?.map(m => (
            <div key={m.user?._id} className="member-row">
              <div className="user-avatar">{m.user?.name?.slice(0, 2)?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user?.email}</div>
              </div>
              <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
              {isAdmin && m.user?._id !== project?.owner?._id && m.user?._id !== user?._id && (
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleRemoveMember(m.user?._id)}>✕</button>
              )}
              {m.user?._id === project?.owner?._id && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner</span>}
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setError(''); }} title="Create Task"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreateTask} disabled={saving}>{saving ? 'Creating…' : 'Create Task'}</button>
        </>}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group"><label className="form-label">Title *</label>
          <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" autoFocus /></div>
        <div className="form-group"><label className="form-label">Description</label>
          <textarea className="form-textarea" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Details…" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select></div>
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
              <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
            </select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Assign To</label>
            <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {project?.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => { setSelectedTask(null); setError(''); }} title="Edit Task"
        footer={<>
          {isAdmin && <button className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => handleDeleteTask(selectedTask?._id)}>Delete</button>}
          <button className="btn btn-secondary" onClick={() => setSelectedTask(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdateTask} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </>}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group"><label className="form-label">Title</label>
          <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} disabled={!isAdmin} /></div>
        <div className="form-group"><label className="form-label">Description</label>
          <textarea className="form-textarea" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} disabled={!isAdmin} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} disabled={!isAdmin}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select></div>
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
              <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
            </select></div>
        </div>
        {isAdmin && <div className="form-row">
          <div className="form-group"><label className="form-label">Assign To</label>
            <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {project?.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
        </div>}
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => { setShowMemberModal(false); setError(''); }} title="Add Member"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddMember} disabled={saving}>{saving ? 'Adding…' : 'Add Member'}</button>
        </>}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-group"><label className="form-label">User Email *</label>
          <input className="form-input" type="email" placeholder="member@example.com" value={memberEmail}
            onChange={e => setMemberEmail(e.target.value)} autoFocus /></div>
        <div className="form-group"><label className="form-label">Role</label>
          <select className="form-select" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
            <option value="member">Member</option><option value="admin">Admin</option>
          </select></div>
      </Modal>
    </div>
  );
}
