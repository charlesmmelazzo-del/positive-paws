const express = require('express');
const bcrypt = require('bcryptjs');
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

// POST /api/admin/users - Create a new user (admin sets password directly)
router.post('/users', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with that email already exists' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/admin/users/:id/reset-password - Admin resets a user's password
router.post('/users/:id/reset-password', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email',
      [password_hash, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password updated successfully', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
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

// POST /api/admin/cleanup-scenarios - Remove duplicate scenarios, keep lowest ID per name
router.post('/cleanup-scenarios', async (req, res) => {
  const client = await require('../db').pool.connect();
  try {
    await client.query('BEGIN');

    // Find duplicate scenario names and the ID to keep (lowest) vs delete
    const dupResult = await client.query(`
      SELECT name, MIN(id) AS keep_id, ARRAY_AGG(id ORDER BY id) AS all_ids
      FROM scenarios
      GROUP BY name
      HAVING COUNT(*) > 1
    `);

    let deletedScenarios = 0;
    let updatedLogs = 0;

    for (const row of dupResult.rows) {
      const keepId = row.keep_id;
      const deleteIds = row.all_ids.filter(id => id !== keepId);

      // Re-point any training logs that reference duplicate IDs → keep the canonical one
      const logUpdate = await client.query(
        `UPDATE dog_training_logs SET scenario_id = $1 WHERE scenario_id = ANY($2::int[])`,
        [keepId, deleteIds]
      );
      updatedLogs += logUpdate.rowCount;

      // Delete tips for the duplicate scenarios
      await client.query(
        `DELETE FROM scenario_tips WHERE scenario_id = ANY($1::int[])`,
        [deleteIds]
      );

      // Delete the duplicate scenarios
      const delResult = await client.query(
        `DELETE FROM scenarios WHERE id = ANY($1::int[])`,
        [deleteIds]
      );
      deletedScenarios += delResult.rowCount;
    }

    await client.query('COMMIT');

    const remaining = await client.query('SELECT COUNT(*) FROM scenarios');
    res.json({
      message: 'Cleanup complete',
      duplicates_found: dupResult.rows.length,
      scenarios_deleted: deletedScenarios,
      training_logs_updated: updatedLogs,
      scenarios_remaining: parseInt(remaining.rows[0].count),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Cleanup error:', err);
    res.status(500).json({ error: 'Cleanup failed: ' + err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
