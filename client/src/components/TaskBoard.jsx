import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export default function TaskBoard({ username }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search.trim()) params.search = search.trim();
      const data = await getTasks(params);
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleCreate(taskData) {
    const created = await createTask(taskData);
    setTasks((prev) => [created, ...prev]);
    setShowForm(false);
  }

  async function handleUpdate(id, changes) {
    const updated = await updateTask(id, changes);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setEditingTask(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleToggleComplete(task) {
    await handleUpdate(task.id, { completed: !task.completed });
  }

  const activeCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="task-board" data-testid="task-board">
      {/* Board header */}
      <div className="task-board__header">
        <div>
          <h2 className="task-board__title">My Tasks</h2>
          <p className="task-board__subtitle" data-testid="active-count">
            {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          data-testid="add-task-btn"
        >
          + Add Task
        </button>
      </div>

      {/* Search */}
      <div className="task-board__search">
        <input
          type="search"
          className="form-input"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="search-input"
          aria-label="Search tasks"
        />
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" role="tablist" data-testid="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            className={`filter-tab ${filter === f.value ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(f.value)}
            data-testid={`filter-${f.value}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add / Edit form */}
      {(showForm || editingTask) && (
        <TaskForm
          initialData={editingTask}
          onSubmit={editingTask
            ? (data) => handleUpdate(editingTask.id, data)
            : handleCreate}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {/* Task list */}
      {error && (
        <div className="alert alert--error" data-testid="board-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="task-list--empty" data-testid="tasks-loading">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="task-list--empty" data-testid="tasks-empty">
          {search ? `No tasks match "${search}"` : 'No tasks here — add one!'}
        </div>
      ) : (
        <ul className="task-list" data-testid="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggleComplete(task)}
              onEdit={() => { setShowForm(false); setEditingTask(task); }}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
