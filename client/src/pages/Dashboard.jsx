import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/index.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user stats
        const statsResponse = await api.get('/leaderboard/me');
        setStats(statsResponse.data);

        // Fetch user's dogs
        const dogsResponse = await api.get('/dogs/my');
        setDogs(Array.isArray(dogsResponse.data) ? dogsResponse.data : []);

        // Fetch courses
        const coursesResponse = await api.get('/courses');
        setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data.slice(0, 3) : []);

        // Fetch scenarios
        const scenariosResponse = await api.get('/scenarios');
        setScenarios(Array.isArray(scenariosResponse.data) ? scenariosResponse.data.slice(0, 4) : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="loading-center">
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        {/* Header with greeting and quick actions */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>
            {getGreeting()}, {user?.name || 'Friend'}! 🐾
          </h1>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {/* Quick action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <button
              onClick={() => navigate('/training')}
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              📝 Log Training
            </button>
            <button
              onClick={() => navigate('/dogs')}
              className="btn btn-secondary"
              style={{ whiteSpace: 'nowrap' }}
            >
              🐕 Add Dog
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="btn btn-outline"
              style={{ whiteSpace: 'nowrap' }}
            >
              📚 Start Course
            </button>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                Total Points
              </p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary)' }}>
                {stats.points || 0}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                Lessons Completed
              </p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--secondary)' }}>
                {stats.lessonsCompleted || 0}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                Quizzes Passed
              </p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: '#22C55E' }}>
                {stats.quizzesPassed || 0}
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                My Dogs
              </p>
              <p style={{ fontSize: '36px', fontWeight: '700', color: '#F59E0B' }}>
                {dogs.length}
              </p>
            </div>
          </div>
        )}

        {/* My Dogs Section */}
        <div style={{ marginBottom: '40px' }}>
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>🐕 My Dogs</h2>
          </div>

          {dogs.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '18px', marginBottom: '16px' }}>No dogs added yet</p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                Add your first dog to get started with training
              </p>
              <Link to="/dogs" className="btn btn-primary">
                Add Your First Dog
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {dogs.slice(0, 3).map((dog) => (
                <Link
                  key={dog.id}
                  to={`/dogs/${dog.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card card-clickable" style={{ padding: '24px', height: '100%' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                      {dog.breed?.emoji || '🐕'}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                      {dog.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                      {dog.breed?.name || 'Mixed Breed'} • {dog.age || '?'} years old
                    </p>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Training Score
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min((dog.trainingScore || 0), 100)}%`,
                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                          }}
                        ></div>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', marginTop: '4px' }}>
                        {dog.trainingScore || 0}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {dogs.length > 3 && (
                <Link
                  to="/dogs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <div className="card card-clickable" style={{ padding: '24px', width: '100%', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>
                      View all {dogs.length} dogs →
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Continue Learning Section */}
        {courses.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div className="section-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>📚 Continue Learning</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card card-clickable" style={{ padding: '24px', height: '100%' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📖</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                      {course.description || 'Learn dog training techniques'}
                    </p>

                    {/* Progress bar */}
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min((course.progress || 0), 100)}%`,
                          background: 'var(--secondary)',
                        }}
                      ></div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {course.progress || 0}% complete
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Training Scenarios Section */}
        {scenarios.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div className="section-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>🎯 Recent Training Scenarios</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {scenarios.slice(0, 4).map((scenario) => (
                <Link
                  key={scenario.id}
                  to="/scenarios"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card card-clickable" style={{ padding: '20px', textAlign: 'center', height: '100%' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                      {scenario.emoji || '🎯'}
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                      {scenario.title || scenario.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {scenario.difficulty || 'Intermediate'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/scenarios" className="btn btn-outline">
                View All Scenarios →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
