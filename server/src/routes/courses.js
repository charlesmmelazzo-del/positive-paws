const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses - List all courses with user progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coursesResult = await db.query(`
      SELECT c.*,
        COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT CASE WHEN ulp.completed = true AND ulp.user_id = $1 THEN ulp.lesson_id END) AS completed_lessons
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = $1
      WHERE c.is_published = true
      GROUP BY c.id
      ORDER BY c.order_index
    `, [req.user.id]);

    res.json(coursesResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id - Get full course with lessons and progress
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const courseResult = await db.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (courseResult.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

    const lessonsResult = await db.query(`
      SELECT l.*,
        COALESCE(ulp.completed, false) AS completed,
        ulp.completed_at,
        (SELECT id FROM quizzes WHERE lesson_id = l.id LIMIT 1) AS quiz_id,
        (
          SELECT uqa.passed FROM user_quiz_attempts uqa
          JOIN quizzes q ON uqa.quiz_id = q.id
          WHERE q.lesson_id = l.id AND uqa.user_id = $2
          ORDER BY uqa.attempted_at DESC LIMIT 1
        ) AS quiz_passed,
        (
          SELECT uqa.score FROM user_quiz_attempts uqa
          JOIN quizzes q ON uqa.quiz_id = q.id
          WHERE q.lesson_id = l.id AND uqa.user_id = $2
          ORDER BY uqa.attempted_at DESC LIMIT 1
        ) AS quiz_score
      FROM lessons l
      LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = $2
      WHERE l.course_id = $1
      ORDER BY l.order_index
    `, [req.params.id, req.user.id]);

    res.json({
      ...courseResult.rows[0],
      lessons: lessonsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// GET /api/courses/lessons/:lessonId - Get single lesson with quiz
router.get('/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const lessonResult = await db.query(`
      SELECT l.*, c.title AS course_title, c.id AS course_id,
        COALESCE(ulp.completed, false) AS completed
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = $2
      WHERE l.id = $1
    `, [req.params.lessonId, req.user.id]);

    if (lessonResult.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });

    const quizResult = await db.query(`
      SELECT q.*, json_agg(
        json_build_object(
          'id', qq.id,
          'question', qq.question,
          'options', qq.options,
          'order_index', qq.order_index
        ) ORDER BY qq.order_index
      ) AS questions
      FROM quizzes q
      JOIN quiz_questions qq ON qq.quiz_id = q.id
      WHERE q.lesson_id = $1
      GROUP BY q.id
    `, [req.params.lessonId]);

    // Get previous attempts
    const attemptsResult = quizResult.rows.length > 0 ? await db.query(`
      SELECT score, passed, attempted_at FROM user_quiz_attempts
      WHERE quiz_id = $1 AND user_id = $2
      ORDER BY attempted_at DESC LIMIT 5
    `, [quizResult.rows[0].id, req.user.id]) : { rows: [] };

    res.json({
      ...lessonResult.rows[0],
      quiz: quizResult.rows[0] || null,
      previous_attempts: attemptsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// POST /api/courses/lessons/:lessonId/complete - Mark lesson complete
router.post('/lessons/:lessonId/complete', authenticateToken, async (req, res) => {
  try {
    await db.query(`
      INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completed_at)
      VALUES ($1, $2, true, NOW())
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = NOW()
    `, [req.user.id, req.params.lessonId]);

    // Award points for lesson completion
    await db.query(`
      UPDATE users SET total_points = total_points + 10 WHERE id = $1
    `, [req.user.id]);

    res.json({ message: 'Lesson marked as complete! +10 points' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark lesson complete' });
  }
});

// POST /api/courses/quizzes/:quizId/submit - Submit quiz answers
router.post('/quizzes/:quizId/submit', authenticateToken, async (req, res) => {
  const { answers } = req.body; // { questionId: selectedOptionIndex }
  if (!answers) return res.status(400).json({ error: 'Answers are required' });

  try {
    const questionsResult = await db.query(`
      SELECT id, correct_answer, explanation FROM quiz_questions
      WHERE quiz_id = $1 ORDER BY order_index
    `, [req.params.quizId]);

    const questions = questionsResult.rows;
    let correct = 0;
    const results = questions.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correct++;
      return {
        question_id: q.id,
        user_answer: userAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const quizData = await db.query('SELECT passing_score, lesson_id FROM quizzes WHERE id = $1', [req.params.quizId]);
    const passed = score >= quizData.rows[0].passing_score;

    // Save attempt
    await db.query(`
      INSERT INTO user_quiz_attempts (user_id, quiz_id, score, passed, answers, points_earned)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [req.user.id, req.params.quizId, score, passed, JSON.stringify(answers), passed ? 25 : 5]);

    // Award points
    const points = passed ? 25 : 5;
    await db.query('UPDATE users SET total_points = total_points + $1 WHERE id = $2', [points, req.user.id]);

    // If passed, mark lesson as complete
    if (passed) {
      await db.query(`
        INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completed_at)
        VALUES ($1, $2, true, NOW())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = NOW()
      `, [req.user.id, quizData.rows[0].lesson_id]);
    }

    res.json({ score, passed, correct, total: questions.length, results, points_earned: points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

module.exports = router;
