const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/dogs - List all dogs (for selecting an existing dog)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM user_dogs ud WHERE ud.dog_id = d.id) AS owner_count,
        (SELECT AVG(dtl.success_rating) FROM dog_training_logs dtl WHERE dtl.dog_id = d.id) AS avg_rating,
        (SELECT COUNT(*) FROM dog_training_logs dtl WHERE dtl.dog_id = d.id) AS log_count
      FROM dogs d
      LEFT JOIN users u ON d.created_by_user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// GET /api/dogs/my - Dogs connected to the current user
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, ud.relationship, ud.is_primary, ud.added_at,
        u.name AS created_by_name,
        (SELECT COUNT(*) FROM user_dogs ud2 WHERE ud2.dog_id = d.id) AS owner_count,
        (SELECT AVG(dtl.success_rating) FROM dog_training_logs dtl WHERE dtl.dog_id = d.id) AS avg_rating,
        (SELECT COUNT(*) FROM dog_training_logs dtl WHERE dtl.dog_id = d.id) AS log_count
      FROM dogs d
      JOIN user_dogs ud ON d.id = ud.dog_id
      LEFT JOIN users u ON d.created_by_user_id = u.id
      WHERE ud.user_id = $1
      ORDER BY ud.is_primary DESC, ud.added_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your dogs' });
  }
});

// GET /api/dogs/:id - Get single dog with full stats
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const dogResult = await db.query(`
      SELECT d.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM user_dogs ud WHERE ud.dog_id = d.id) AS owner_count
      FROM dogs d
      LEFT JOIN users u ON d.created_by_user_id = u.id
      WHERE d.id = $1
    `, [req.params.id]);

    if (dogResult.rows.length === 0) return res.status(404).json({ error: 'Dog not found' });
    const dog = dogResult.rows[0];

    // Get associated users
    const usersResult = await db.query(`
      SELECT u.id, u.name, u.avatar_url, ud.relationship, ud.is_primary, ud.added_at
      FROM users u JOIN user_dogs ud ON u.id = ud.user_id
      WHERE ud.dog_id = $1 ORDER BY ud.is_primary DESC, ud.added_at ASC
    `, [req.params.id]);

    // Get training logs
    const logsResult = await db.query(`
      SELECT dtl.*, u.name AS logged_by, s.name AS scenario_name, s.icon AS scenario_icon
      FROM dog_training_logs dtl
      LEFT JOIN users u ON dtl.user_id = u.id
      LEFT JOIN scenarios s ON dtl.scenario_id = s.id
      WHERE dtl.dog_id = $1
      ORDER BY dtl.logged_at DESC LIMIT 20
    `, [req.params.id]);

    // Get scenario stats
    const scenarioStats = await db.query(`
      SELECT s.id, s.name, s.icon, s.color,
        AVG(dtl.success_rating) AS avg_rating,
        COUNT(dtl.id) AS session_count,
        MAX(dtl.logged_at) AS last_logged
      FROM scenarios s
      LEFT JOIN dog_training_logs dtl ON dtl.scenario_id = s.id AND dtl.dog_id = $1
      GROUP BY s.id, s.name, s.icon, s.color
      ORDER BY s.order_index
    `, [req.params.id]);

    // Get milestones
    const milestonesResult = await db.query(`
      SELECT dm.*, u.name AS logged_by
      FROM dog_milestones dm LEFT JOIN users u ON dm.user_id = u.id
      WHERE dm.dog_id = $1 ORDER BY dm.created_at DESC
    `, [req.params.id]);

    res.json({
      ...dog,
      users: usersResult.rows,
      recent_logs: logsResult.rows,
      scenario_stats: scenarioStats.rows,
      milestones: milestonesResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dog' });
  }
});

// POST /api/dogs - Create a new dog
router.post('/', authenticateToken, async (req, res) => {
  const { name, breed, age_years, weight_lbs, gender, photo_url, bio } = req.body;
  if (!name) return res.status(400).json({ error: 'Dog name is required' });

  try {
    const dogResult = await db.query(`
      INSERT INTO dogs (name, breed, age_years, weight_lbs, gender, photo_url, bio, created_by_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [name, breed, age_years, weight_lbs, gender || 'unknown', photo_url, bio, req.user.id]);

    const dog = dogResult.rows[0];

    // Automatically link to the creator
    await db.query(`
      INSERT INTO user_dogs (user_id, dog_id, relationship, is_primary)
      VALUES ($1, $2, 'owner', true)
    `, [req.user.id, dog.id]);

    res.status(201).json(dog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create dog' });
  }
});

// POST /api/dogs/:id/connect - Connect existing dog to user profile
router.post('/:id/connect', authenticateToken, async (req, res) => {
  const { relationship } = req.body;
  try {
    // Check dog exists
    const dogCheck = await db.query('SELECT id FROM dogs WHERE id = $1', [req.params.id]);
    if (dogCheck.rows.length === 0) return res.status(404).json({ error: 'Dog not found' });

    // Check not already connected
    const existing = await db.query(
      'SELECT id FROM user_dogs WHERE user_id = $1 AND dog_id = $2',
      [req.user.id, req.params.id]
    );
    if (existing.rows.length > 0) return res.status(409).json({ error: 'You are already connected to this dog' });

    await db.query(`
      INSERT INTO user_dogs (user_id, dog_id, relationship) VALUES ($1, $2, $3)
    `, [req.user.id, req.params.id, relationship || 'co-owner']);

    res.json({ message: 'Dog added to your profile!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to connect dog' });
  }
});

// PUT /api/dogs/:id - Update dog (only connected users)
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, breed, age_years, weight_lbs, gender, photo_url, bio } = req.body;
  try {
    // Check user is connected to this dog
    const access = await db.query(
      'SELECT id FROM user_dogs WHERE user_id = $1 AND dog_id = $2',
      [req.user.id, req.params.id]
    );
    if (access.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You must be connected to this dog to edit it' });
    }

    const result = await db.query(`
      UPDATE dogs SET
        name = COALESCE($1, name),
        breed = COALESCE($2, breed),
        age_years = COALESCE($3, age_years),
        weight_lbs = COALESCE($4, weight_lbs),
        gender = COALESCE($5, gender),
        photo_url = COALESCE($6, photo_url),
        bio = COALESCE($7, bio),
        updated_at = NOW()
      WHERE id = $8 RETURNING *
    `, [name, breed, age_years, weight_lbs, gender, photo_url, bio, req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dog' });
  }
});

// POST /api/dogs/:id/logs - Add a training log entry
router.post('/:id/logs', authenticateToken, async (req, res) => {
  const { scenario_id, success_rating, notes, behavior_tags } = req.body;
  if (!success_rating) return res.status(400).json({ error: 'Success rating is required' });

  try {
    // Check user is connected to this dog
    const access = await db.query(
      'SELECT id FROM user_dogs WHERE user_id = $1 AND dog_id = $2',
      [req.user.id, req.params.id]
    );
    if (access.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You must be connected to this dog to log training' });
    }

    const result = await db.query(`
      INSERT INTO dog_training_logs (dog_id, user_id, scenario_id, success_rating, notes, behavior_tags)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [req.params.id, req.user.id, scenario_id || null, success_rating, notes || null, JSON.stringify(behavior_tags || [])]);

    // Update dog training score
    await db.query(`
      UPDATE dogs SET training_score = (
        SELECT ROUND(AVG(success_rating) * 20)
        FROM dog_training_logs WHERE dog_id = $1
      ) WHERE id = $1
    `, [req.params.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log training session' });
  }
});

// POST /api/dogs/:id/milestones - Add a milestone
router.post('/:id/milestones', authenticateToken, async (req, res) => {
  const { milestone_name, milestone_type, notes } = req.body;
  if (!milestone_name) return res.status(400).json({ error: 'Milestone name is required' });

  try {
    const result = await db.query(`
      INSERT INTO dog_milestones (dog_id, user_id, milestone_name, milestone_type, achieved, achieved_at, notes)
      VALUES ($1, $2, $3, $4, true, NOW(), $5) RETURNING *
    `, [req.params.id, req.user.id, milestone_name, milestone_type || 'general', notes]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add milestone' });
  }
});

module.exports = router;
