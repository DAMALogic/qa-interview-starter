const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { router: userRoutes } = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// --- In-memory session store ---
// A simple Map: token -> username
const sessions = new Map();

// Attach session helper to every request
app.use((req, res, next) => {
  const token = req.headers['x-auth-token'];
  req.session = token ? sessions.get(token) : null;
  req.sessions = sessions;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
