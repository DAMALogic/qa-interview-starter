const express = require('express');
const router = express.Router();

/**
 * Shared in-memory user store.
 *
 * NOTE: auth.js owns the same USERS array conceptually; in a real app this
 * would be a database. For the interview starter we keep it simple and export
 * the array so both route files share the same reference.
 */
const USERS = [
  { id: '1', username: 'admin',  displayName: 'Admin User',  password: 'password123' },
  { id: '2', username: 'tester', displayName: 'Test Engineer', password: 'tester123' },
];

// Export so auth.js can import and validate against the same store
module.exports.USERS = USERS;

// Auth middleware — identical pattern to tasks.js
function requireAuth(req, res, next) {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized — please log in' });
  }
  next();
}

function currentUser(req) {
  return USERS.find((u) => u.username === req.session.username);
}

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile (no password).
 */
router.get('/profile', requireAuth, (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password, ...safeUser } = user;
  return res.status(200).json(safeUser);
});

/**
 * PUT /api/users/profile
 * Update display name.
 * Body: { displayName }
 */
router.put('/profile', requireAuth, (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { displayName } = req.body;

  if (displayName === undefined || displayName === null) {
    return res.status(400).json({ error: 'displayName is required' });
  }

  const trimmed = String(displayName).trim();

  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'Display name cannot be blank' });
  }

  if (trimmed.length > 50) {
    return res.status(400).json({ error: 'Display name must be 50 characters or fewer' });
  }

  user.displayName = trimmed;

  const { password, ...safeUser } = user;
  return res.status(200).json(safeUser);
});

/**
 * PUT /api/users/profile/password
 * Change password.
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.put('/profile/password', requireAuth, (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      error: 'currentPassword, newPassword, and confirmPassword are all required',
    });
  }

  if (user.password !== currentPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirmation do not match' });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must differ from the current password' });
  }

  user.password = newPassword;
  return res.status(200).json({ message: 'Password updated successfully' });
});

module.exports.router = router;
