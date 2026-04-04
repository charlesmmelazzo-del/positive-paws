const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats - Dashboard overview
router.get('/stats', async (req, res) => {
  try {
    const [users, dogs, sessions, completions] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM users'),
      db.query('SELECT COUNT(*) AS count FROM dogs'),
      db.query('SELECT COUNT(*) AS count FROM dog_training_logs'),
      db.query('SELECT COUNT(*) AS count FROM user_lesson_progress WHERE completed = true'),
    ]);

    const recentUsers = await db.query(`
      SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10
    `);

    res.json({
      total_users: parseInt(users.rows[0].count),
      total_dogs: parseInt(dogs.rows[0].count),
      total_training_sessions: parseInt(sessions.rows[0].count),
      total_lesson_completions: parseInt(completions.rows[0].count),
      recent_users: recentUsers.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, u.role, u.total_points, u.created_at,
        COUNT(DISTINCT ud.dog_id) AS dogs_count,
        COUNT(DISTINCT ulp.lesson_id) FILTER (WHERE ulp.completed = true) AS lessons_completed
      FROM users u
      LEFT JOIN user_dogs ud ON ud.user_id = u.id
      LEFT JOIN user_lesson_progress ulp ON ulp.user_id = u.id
      GROUP BY u.id ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id/role - Change user role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  try {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own admin account' });
  }
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
