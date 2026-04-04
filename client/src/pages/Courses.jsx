import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Courses.css';

const DIFFICULTY_BADGES = {
  beginner: 'badge-green',
  intermediate: 'badge-blue',
  advanced: 'badge-orange'
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = filterDifficulty === 'all'
    ? courses
    : courses.filter(course => course.difficulty === filterDifficulty);

  const getButtonLabel = (course) => {
    if (!course.completed_lessons) {
      return 'Start';
    }
    if (course.completed_lessons >= course.lesson_count) {
      return 'Completed';
    }
    return 'Continue';
  };

  const getButtonDisabled = (course) => {
    return course.completed_lessons >= course.lesson_count;
  };

  const getCompletionPercentage = (course) => {
    if (course.lesson_count === 0) return 0;
    return Math.round((course.completed_lessons / course.lesson_count) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    return DIFFICULTY_BADGES[difficulty] || 'badge-purple';
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div>
            <h1>📚 Training Courses</h1>
            <p className="subtitle">Learn dog training from proven methodologies and expert authors</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Difficulty Filter Tabs */}
        <div className="filter-tabs">
          <div className="tabs">
            <button
              className={`tab ${filterDifficulty === 'all' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('all')}
            >
              All
            </button>
            <button
              className={`tab ${filterDifficulty === 'beginner' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('beginner')}
            >
              Beginner
            </button>
            <button
              className={`tab ${filterDifficulty === 'intermediate' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('intermediate')}
            >
              Intermediate
            </button>
            <button
              className={`tab ${filterDifficulty === 'advanced' ? 'active' : ''}`}
              onClick={() => setFilterDifficulty('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses found</h3>
            <p>Try adjusting your filters or check back soon for new courses.</p>
          </div>
        ) : (
          <div className="grid-2">
            {filteredCourses.map(course => {
              const completionPercentage = getCompletionPercentage(course);
              const buttonLabel = getButtonLabel(course);
              const isDisabled = getButtonDisabled(course);

              return (
                <div key={course.id} className="course-card card card-clickable">
                  <div className="course-header">
                    <div className="course-thumbnail">
                      {course.thumbnail_emoji}
                    </div>
                    <div className="course-header-info">
                      <h3>{course.title}</h3>
                      <div className="course-badges">
                        <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {course.book_source && (
                    <p className="course-source">
                      From: <em>{course.book_source}</em>
                    </p>
                  )}

                  {course.author && (
                    <p className="course-author">
                      by {course.author}
                    </p>
                  )}

                  <div className="course-progress">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span className="progress-percentage">{completionPercentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">
                      {course.completed_lessons} of {course.lesson_count} lessons
                    </p>
                  </div>

                  <button
                    className={`btn btn-primary ${isDisabled ? 'btn-disabled' : ''}`}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    disabled={isDisabled}
                  >
                    {buttonLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
