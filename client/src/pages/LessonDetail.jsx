import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/lesson-detail.css';

export default function LessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarked, setIsMarked] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [submittingMark, setSubmittingMark] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data);
      setIsMarked(response.data.is_completed || false);
      if (response.data.quiz) {
        setQuiz(response.data.quiz);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lesson');
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      setSubmittingMark(true);
      await api.post(`/courses/lessons/${lessonId}/complete`);
      setIsMarked(true);
    } catch (err) {
      console.error('Error marking lesson as read:', err);
    } finally {
      setSubmittingMark(false);
    }
  };

  const handleSelectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmittingQuiz(true);
      const answers = {};
      Object.entries(selectedAnswers).forEach(([qId, answerIndex]) => {
        answers[qId] = answerIndex;
      });

      const response = await api.post(`/courses/quizzes/${quiz.id}/submit`, {
        answers
      });

      setQuizResult(response.data);
      setQuizSubmitted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
        <Link to="/courses" className="btn btn-secondary">← Back to Courses</Link>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="page">
        <div className="alert alert-error">Lesson not found</div>
      </div>
    );
  }

  const readingTimeMinutes = Math.ceil((lesson.content?.split(/\s+/).length || 0) / 200);

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: '2rem' }}>
          <Link to="/courses" style={{ color: 'var(--primary)' }}>Courses</Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
          <Link to={`/courses/${lesson.course_id}`} style={{ color: 'var(--primary)' }}>
            {lesson.course_name}
          </Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text)' }}>{lesson.title}</span>
        </div>

        {/* Lesson Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{lesson.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span>📖 {readingTimeMinutes} min read</span>
            {isMarked && <span className="badge badge-green">✓ Read</span>}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <ReactMarkdown className="lesson-content">
            {lesson.content}
          </ReactMarkdown>
        </div>

        {/* Key Takeaway */}
        {lesson.key_takeaway && (
          <div className="card" style={{
            borderLeft: '4px solid var(--primary)',
            backgroundColor: '#FFF9F5',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>Key Takeaway</h3>
            <p>{lesson.key_takeaway}</p>
          </div>
        )}

        {/* Mark as Read Button */}
        <button
          className={`btn ${isMarked ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleMarkAsRead}
          disabled={isMarked || submittingMark}
          style={{ marginBottom: '2rem' }}
        >
          {submittingMark ? 'Marking...' : isMarked ? '✓ Marked as Read' : 'Mark as Read'}
        </button>

        {/* Quiz Section */}
        {quiz && isMarked && (
          <div style={{ marginTop: '3rem' }}>
            <div className="section-header">
              <h2>📝 Quiz</h2>
            </div>

            {!quizSubmitted ? (
              <div className="card">
                {quiz.questions?.map((question, qIdx) => (
                  <div key={question.id} style={{ marginBottom: '2rem' }}>
                    <p style={{ fontWeight: '600', marginBottom: '1rem' }}>
                      {qIdx + 1}. {question.question_text}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {question.options?.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          className={`btn ${selectedAnswers[question.id] === optIdx ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => handleSelectAnswer(question.id, optIdx)}
                          style={{ textAlign: 'left' }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-primary"
                  onClick={handleSubmitQuiz}
                  disabled={submittingQuiz || Object.keys(selectedAnswers).length !== quiz.questions?.length}
                >
                  {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            ) : quizResult ? (
              <div className="card">
                <div style={{
                  textAlign: 'center',
                  marginBottom: '2rem',
                  padding: '2rem',
                  backgroundColor: quizResult.passed ? '#DCFCE7' : '#FEE2E2',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <h3 style={{ marginTop: 0, color: quizResult.passed ? '#15803D' : '#B91C1C' }}>
                    {quizResult.passed ? '🎉 You Passed!' : '❌ Try Again'}
                  </h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {quizResult.score}/{quizResult.total_questions}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>+{quizResult.points_earned} points earned</p>
                </div>

                {quiz.questions?.map((question, qIdx) => {
                  const userAnswer = selectedAnswers[question.id];
                  const explanation = quizResult.explanations?.[question.id];
                  const isCorrect = userAnswer === quizResult.correct_answers?.[question.id];

                  return (
                    <div
                      key={question.id}
                      style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2',
                        borderLeft: `4px solid ${isCorrect ? '#15803D' : '#B91C1C'}`
                      }}
                    >
                      <p style={{ fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                        {qIdx + 1}. {question.question_text}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Your answer:</strong> {question.options?.[userAnswer]}
                      </p>
                      {!isCorrect && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Correct answer:</strong> {question.options?.[quizResult.correct_answers?.[question.id]]}
                        </p>
                      )}
                      {explanation && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                          {explanation}
                        </p>
                      )}
                    </div>
                  );
                })}

                {quizResult.previous_attempts?.length > 0 && (
                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <h3>Previous Attempts</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {quizResult.previous_attempts.map((attempt, idx) => (
                        <div key={idx} style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--bg)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Attempt {quizResult.previous_attempts.length - idx}</span>
                          <span style={{ fontWeight: '600' }}>
                            {attempt.score}/{attempt.total_questions}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Back to Course */}
        <Link to={`/courses/${lesson.course_id}`} className="btn btn-outline" style={{ marginTop: '2rem' }}>
          ← Back to Course
        </Link>
      </div>
    </div>
  );
}
