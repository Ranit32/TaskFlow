import { format, isPast } from 'date-fns';

const PRIORITY_COLORS = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
const STATUS_COLORS = { todo: 'badge-todo', 'in-progress': 'badge-in-progress', done: 'badge-done' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function TaskCard({ task, onClick, onStatusChange, canAdmin }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const initials = task.assignedTo?.name?.split(' ')?.map(n => n[0])?.join('')?.slice(0, 2) || null;

  const handleStatusClick = (e, status) => {
    e.stopPropagation();
    onStatusChange?.(task._id, status);
  };

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`} onClick={() => onClick?.(task)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div className="task-card-title">{task.title}</div>
        <span className={`badge ${PRIORITY_COLORS[task.priority]}`} style={{ flexShrink: 0, fontSize: 10 }}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.4 }}>
          {task.description.length > 80 ? task.description.slice(0, 80) + '…' : task.description}
        </p>
      )}

      <div className="task-card-meta">
        {task.dueDate && (
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            📅 {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {isOverdue && <span className="badge badge-overdue" style={{ fontSize: 10 }}>Overdue</span>}

        {initials && (
          <div className="task-assignee">
            <div className="avatar-xs">{initials}</div>
            <span>{task.assignedTo.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
