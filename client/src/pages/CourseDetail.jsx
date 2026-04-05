import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/CourseDetail.css';

const DIFFICULTY_BADGES = {
  beginner: 'badge-green',
  intermediate: 'badge-blue',
  advanced: 'badge-orange'
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
      setLessons(response.data.lessons || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    return DIFFICULTY_BADGES[difficulty] || 'badge-purple';
  };

  const getCompletionPercentage = () => {
    if (!course || course.lesson_count === 0) return 0;
    return Math.round((course.completed_lessons / course.lesson_count) * 100);
  };

  const getLessonStatus = (lesson) => {
    if (lesson.completed) {
      return { icon: '✅', label: 'Completed' };
    }
    return { icon: '📖', label: 'In Progress' };
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">
            {error || 'Course not found'}
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="page">
      <div className="container">
        {/* Course Header */}
        <div className="course-detail-header">
          <div className="course-header-content">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/courses')}
            >
              ← Back to Courses
            </button>

            <div className="course-title-section">
              <div className="course-emoji-large">
                {course.thumbnail_emoji}
              </div>
              <div className="course-title-info">
                <h1>{course.title}</h1>
                <div className="course-meta">
                  <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {course.description && (
              <p className="course-description">
                {course.description}
              </p>
            )}

            {course.book_source || course.author ? (
              <div className="course-source-info">
                <h3>About this book</h3>
                {course.book_source && (
                  <p><strong>Source:</strong> {course.book_source}</p>
                )}
                {course.author && (
                  <p><strong>Author:</strong> {course.author}</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="overall-progress">
          <h2>Course Progress</h2>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {course.completed_lessons} of {course.lesson_count} lessons completed ({completionPercentage}%)
          </p>
        </div>

        {/* Lessons List */}
        <div className="lessons-section">
          <h2>Lessons</h2>
          {lessons.length === 0 ? (
            <div className="empty-state">
              <p>No lessons available for this course yet.</p>
            </div>
          ) : (
            <div className="lessons-list">
              {lessons.map((lesson, index) => {
                const status = getLessonStatus(lesson);

                return (
                  <div
                    key={lesson.id}
                    className="lesson-item card card-clickable"
                  >
                    <div className="lesson-number">
                      {index + 1}
                    </div>

                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      {lesson.reading_time_minutes && (
                        <p className="lesson-meta">
                          {lesson.reading_time_minutes} min read
                        </p>
                      )}
                    </div>

                    <div className="lesson-status">
                      <span className="status-icon">{status.icon}</span>
                      {lesson.quiz_passed && (
                        <span className="quiz-badge badge badge-green">
                          Quiz Passed
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/lessons/${lesson.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {lesson.completed ? 'Review' : 'Read'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
