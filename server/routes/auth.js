const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Import the shared user store so auth and profile routes stay in sync
const { USERS } = require('./users');

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, username }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = uuidv4();
  req.sessions.set(token, { userId: user.id, username: user.username });

  return res.status(200).json({ token, username: user.username });
});

/**
 * POST /api/auth/logout
 * Headers: x-auth-token
 */
router.post('/logout', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (token) req.sessions.delete(token);
  return res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Returns current user info
 */
router.get('/me', (req, res) => {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(200).json({ username: req.session.username });
});

module.exports = router;
