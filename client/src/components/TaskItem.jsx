const PRIORITY_COLORS = {
  High: 'priority--high',
  Medium: 'priority--medium',
  Low: 'priority--low',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const isOverdue =
    !task.completed &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <li
      className={`task-item ${task.completed ? 'task-item--completed' : ''}`}
      data-testid="task-item"
      data-task-id={task.id}
    >
      <label className="task-item__check-wrapper" aria-label={`Mark "${task.title}" as ${task.completed ? 'active' : 'completed'}`}>
        <input
          type="checkbox"
          className="task-item__checkbox"
          checked={task.completed}
          onChange={onToggle}
          data-testid="task-checkbox"
        />
        <span className="task-item__custom-check" />
      </label>

      <div className="task-item__body">
        <span className="task-item__title" data-testid="task-title">
          {task.title}
        </span>

        <div className="task-item__meta">
          <span
            className={`priority-badge ${PRIORITY_COLORS[task.priority] || ''}`}
            data-testid="task-priority"
          >
            {task.priority}
          </span>

          {task.dueDate && (
            <span
              className={`task-item__due ${isOverdue ? 'task-item__due--overdue' : ''}`}
              data-testid="task-due-date"
              title={isOverdue ? 'Overdue!' : undefined}
            >
              {isOverdue ? '⚠ ' : ''}Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-item__actions">
        <button
          className="btn btn--icon"
          onClick={onEdit}
          aria-label={`Edit "${task.title}"`}
          data-testid="task-edit-btn"
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn btn--icon btn--danger"
          onClick={onDelete}
          aria-label={`Delete "${task.title}"`}
          data-testid="task-delete-btn"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
