import { useState } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskForm({ initialData, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [priority, setPriority] = useState(initialData?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(initialData);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), priority, dueDate: dueDate || null });
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="task-form-wrapper" data-testid="task-form">
      <form onSubmit={handleSubmit} noValidate>
        <h3 className="task-form__title">
          {isEditing ? 'Edit Task' : 'New Task'}
        </h3>

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            data-testid="task-title-input"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-priority" className="form-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              data-testid="task-priority-select"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date" className="form-label">
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-testid="task-due-date-input"
            />
          </div>
        </div>

        {error && (
          <div className="alert alert--error" data-testid="task-form-error" role="alert">
            {error}
          </div>
        )}

        <div className="task-form__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            data-testid="task-form-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
            data-testid="task-form-submit"
          >
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
