const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard/users - Top users by points
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id, u.name, u.avatar_url, u.total_points,
        COUNT(DISTINCT ulp.lesson_id) FILTER (WHERE ulp.completed = true) AS lessons_completed,
        COUNT(DISTINCT uqa.id) FILTER (WHERE uqa.passed = true) AS quizzes_passed,
        COUNT(DISTINCT ud.dog_id) AS dogs_count,
        (
          SELECT COUNT(*) FROM user_quiz_attempts uqa2
          WHERE uqa2.user_id = u.id AND uqa2.passed = true
        ) AS total_passes
      FROM users u
      LEFT JOIN user_lesson_progress ulp ON ulp.user_id = u.id
      LEFT JOIN user_quiz_attempts uqa ON uqa.user_id = u.id
      LEFT JOIN user_dogs ud ON ud.user_id = u.id
      GROUP BY u.id
      ORDER BY u.total_points DESC
      LIMIT 50
    `);

    // Add rank
    const ranked = result.rows.map((row, i) => ({ ...row, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user leaderboard' });
  }
});

// GET /api/leaderboard/dogs - Top dogs by training score
router.get('/dogs', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        d.id, d.name, d.breed, d.photo_url, d.training_score,
        COUNT(dtl.id) AS training_sessions,
        AVG(dtl.success_rating) AS avg_success,
        COUNT(DISTINCT dtl.scenario_id) AS scenarios_practiced,
        COUNT(DISTINCT ud.user_id) AS trainer_count
      FROM dogs d
      LEFT JOIN dog_training_logs dtl ON dtl.dog_id = d.id
      LEFT JOIN user_dogs ud ON ud.dog_id = d.id
      GROUP BY d.id
      HAVING COUNT(dtl.id) > 0
      ORDER BY d.training_score DESC, AVG(dtl.success_rating) DESC
      LIMIT 50
    `);

    const ranked = result.rows.map((row, i) => ({ ...row, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dog leaderboard' });
  }
});

// GET /api/leaderboard/me - Current user's stats and rank
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const statsResult = await db.query(`
      SELECT
        u.id, u.name, u.avatar_url, u.total_points,
        COUNT(DISTINCT ulp.lesson_id) FILTER (WHERE ulp.completed = true) AS lessons_completed,
        COUNT(DISTINCT uqa.id) FILTER (WHERE uqa.passed = true) AS quizzes_passed,
        COUNT(DISTINCT ud.dog_id) AS dogs_count,
        COUNT(DISTINCT dtl.id) AS training_sessions_logged
      FROM users u
      LEFT JOIN user_lesson_progress ulp ON ulp.user_id = u.id
      LEFT JOIN user_quiz_attempts uqa ON uqa.user_id = u.id
      LEFT JOIN user_dogs ud ON ud.user_id = u.id
      LEFT JOIN dog_training_logs dtl ON dtl.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.user.id]);

    // Calculate rank
    const rankResult = await db.query(`
      SELECT COUNT(*) + 1 AS rank FROM users WHERE total_points > (
        SELECT total_points FROM users WHERE id = $1
      )
    `, [req.user.id]);

    res.json({
      ...statsResult.rows[0],
      rank: parseInt(rankResult.rows[0].rank),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your stats' });
  }
});

module.exports = router;
