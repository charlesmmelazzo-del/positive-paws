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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsRes, dogsRes] = await Promise.all([
          api.get('/leaderboard/me').catch(() => ({ data: null })),
          api.get('/dogs/my').catch(() => ({ data: [] }))
        ]);

        setStats(statsRes.data);
        setDogs(Array.isArray(dogsRes.data) ? dogsRes.data : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load some dashboard data');
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

        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '6px' }}>
            {getGreeting()}, {user?.name || 'Friend'}! 🐾
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            What would you like to do today?
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Primary Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '48px'
        }}>
          <div
            className="card card-clickable"
            onClick={() => navigate('/scenarios')}
            style={{
              padding: '32px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '2px solid #86EFAC',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#15803D', marginBottom: '10px' }}>
              Start an Activity
            </h2>
            <p style={{ color: '#166534', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              Pick a training scenario, get expert tips, and log how your session went.
            </p>
            <div style={{ marginTop: '20px' }}>
              <span style={{
                display: 'inline-block',
                background: '#15803D',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Browse Activities →
              </span>
            </div>
          </div>

          <div
            className="card card-clickable"
            onClick={() => navigate('/courses')}
            style={{
              padding: '32px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '2px solid #93C5FD',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1D4ED8', marginBottom: '10px' }}>
              Take a Course
            </h2>
            <p style={{ color: '#1E3A8A', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              Structured lessons to build your dog training knowledge from the ground up.
            </p>
            <div style={{ marginTop: '20px' }}>
              <span style={{
                display: 'inline-block',
                background: '#1D4ED8',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Browse Courses →
              </span>
            </div>
          </div>

          <div
            className="card card-clickable"
            onClick={() => navigate('/dogs')}
            style={{
              padding: '32px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
              border: '2px solid #FDBA74',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐕</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#C2410C', marginBottom: '10px' }}>
              My Dogs
            </h2>
            <p style={{ color: '#9A3412', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              View training history, success rates, milestones, and manage your dogs.
            </p>
            <div style={{ marginTop: '20px' }}>
              <span style={{
                display: 'inline-block',
                background: '#C2410C',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {dogs.length > 0 ? `View ${dogs.length} Dog${dogs.length !== 1 ? 's' : ''} →` : 'Add a Dog →'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Your Progress</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>Total Points</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
                  {stats.points || 0}
                </p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>Lessons Done</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--secondary)', margin: 0 }}>
                  {stats.lessonsCompleted || 0}
                </p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>Quizzes Passed</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#22C55E', margin: 0 }}>
                  {stats.quizzesPassed || 0}
                </p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>Dogs</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B', margin: 0 }}>
                  {dogs.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dogs Quick List */}
        {dogs.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>🐕 Training History</h2>
              <Link to="/dogs" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                Manage all dogs →
              </Link>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Click a dog to see their training sessions, success rates, and milestones.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {dogs.map(dog => (
                <Link key={dog.id} to={`/dogs/${dog.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-clickable" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0
                    }}>
                      {dog.photo_url ? (
                        <img src={dog.photo_url} alt={dog.name}
                          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : '🐕'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '16px', margin: '0 0 4px 0', color: 'var(--text)' }}>
                        {dog.name}
                      </p>
                      {dog.breed && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 8px 0' }}>
                          {dog.breed}
                        </p>
                      )}
                      <div>
                        <div className="progress-bar" style={{ height: '6px', marginBottom: '2px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(dog.training_score || 0, 100)}%`,
                              background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
                            }}
                          />
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', margin: 0 }}>
                          {dog.training_score || 0}% training score
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
