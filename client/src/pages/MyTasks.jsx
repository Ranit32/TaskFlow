import { useEffect, useState } from 'react';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { taskAPI } from '../api';

export default function MyTasks() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = () => {
    dashboardAPI.get().then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.updateStatus(taskId, status);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const tasks = data?.myTasks || [];
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>✅ My Tasks</h2>
          <p>{tasks.length} active task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
      </div>

      <div className="tab-bar">
        {[['all', 'All'], ['todo', 'To Do'], ['in-progress', 'In Progress']].map(([val, label]) => (
          <button key={val} className={`tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>No tasks here</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
