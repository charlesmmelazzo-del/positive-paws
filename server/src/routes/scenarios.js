const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/scenarios - List all scenarios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*,
        COUNT(st.id) AS tip_count
      FROM scenarios s
      LEFT JOIN scenario_tips st ON st.scenario_id = s.id
      GROUP BY s.id
      ORDER BY s.order_index
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// GET /api/scenarios/:id - Get scenario with tips
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const scenarioResult = await db.query('SELECT * FROM scenarios WHERE id = $1', [req.params.id]);
    if (scenarioResult.rows.length === 0) return res.status(404).json({ error: 'Scenario not found' });

    const tipsResult = await db.query(`
      SELECT * FROM scenario_tips WHERE scenario_id = $1 ORDER BY order_index
    `, [req.params.id]);

    res.json({ ...scenarioResult.rows[0], tips: tipsResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scenario' });
  }
});

// GET /api/scenarios/:id/logs - Get training logs for a scenario (across dogs the user owns)
router.get('/:id/logs', authenticateToken, async (req, res) => {
  const { dog_id } = req.query;
  try {
    let query = `
      SELECT dtl.*, u.name AS logged_by, d.name AS dog_name, d.photo_url AS dog_photo
      FROM dog_training_logs dtl
      JOIN users u ON dtl.user_id = u.id
      JOIN dogs d ON dtl.dog_id = d.id
      JOIN user_dogs ud ON ud.dog_id = d.id AND ud.user_id = $1
      WHERE dtl.scenario_id = $2
    `;
    const params = [req.user.id, req.params.id];

    if (dog_id) {
      query += ` AND dtl.dog_id = $3`;
      params.push(dog_id);
    }

    query += ` ORDER BY dtl.logged_at DESC LIMIT 50`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
