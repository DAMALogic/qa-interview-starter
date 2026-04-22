const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory task store (seeded with sample data)
const tasks = [
  {
    id: uuidv4(),
    title: 'Write test plan for login flow',
    priority: 'High',
    dueDate: '2025-06-01',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Automate regression suite',
    priority: 'High',
    dueDate: '2025-06-15',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Review accessibility report',
    priority: 'Medium',
    dueDate: '2025-05-20',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Set up CI pipeline for tests',
    priority: 'Medium',
    dueDate: '2025-05-30',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Document known bugs in v2.1',
    priority: 'Low',
    dueDate: '2025-06-10',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized — please log in' });
  }
  next();
}

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * GET /api/tasks
 * Query params: ?status=active|completed|all  &search=<string>
 */
router.get('/', requireAuth, (req, res) => {
  const { status, search } = req.query;
  let result = [...tasks];

  if (status === 'active') result = result.filter((t) => !t.completed);
  if (status === 'completed') result = result.filter((t) => t.completed);

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }

  return res.status(200).json(result);
});

/**
 * POST /api/tasks
 * Body: { title, priority, dueDate }
 */
router.post('/', requireAuth, (req, res) => {
  const { title, priority, dueDate } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
    });
  }

  const task = {
    id: uuidv4(),
    title: title.trim(),
    priority: priority || 'Medium',
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  return res.status(201).json(task);
});

/**
 * PUT /api/tasks/:id
 * Body: { title?, priority?, dueDate?, completed? }
 */
router.put('/:id', requireAuth, (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, priority, dueDate, completed } = req.body;

  if (title !== undefined) {
    if (title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    task.title = title.trim();
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
      });
    }
    task.priority = priority;
  }

  if (dueDate !== undefined) task.dueDate = dueDate;
  if (completed !== undefined) task.completed = Boolean(completed);

  return res.status(200).json(task);
});

/**
 * DELETE /api/tasks/:id
 */
router.delete('/:id', requireAuth, (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  const [deleted] = tasks.splice(index, 1);
  return res.status(200).json({ message: 'Task deleted', task: deleted });
});

module.exports = router;
