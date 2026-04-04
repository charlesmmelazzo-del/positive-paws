import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/leaderboard.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('trainers');
  const [trainers, setTrainers] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const [trainersRes, dogsRes, meRes] = await Promise.all([
        api.get('/leaderboard/users'),
        api.get('/leaderboard/dogs'),
        api.get('/leaderboard/me')
      ]);
      setTrainers(trainersRes.data);
      setDogs(dogsRes.data);
      setMyStats(meRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <button onClick={fetchLeaderboardData} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topThree = trainers.slice(0, 3);
  const restTrainers = trainers.slice(3);

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🏆 Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            See who's leading in the Positive Paws community
          </p>
        </div>

        {/* My Stats Card */}
        {myStats && (
          <div className="card" style={{
            marginBottom: '2rem',
            backgroundColor: '#FFF9F5',
            borderLeft: '4px solid var(--primary)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📊 Your Stats</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Rank
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
                  #{myStats.rank}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Points
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {myStats.total_points}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Lessons
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {myStats.lessons_completed}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Quizzes
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {myStats.quizzes_passed}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Dogs
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {myStats.dogs_count}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <button
            className={`tab ${activeTab === 'trainers' ? 'active' : ''}`}
            onClick={() => setActiveTab('trainers')}
          >
            👥 Trainers
          </button>
          <button
            className={`tab ${activeTab === 'dogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('dogs')}
          >
            🐕 Top Dogs
          </button>
        </div>

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <div>
            {/* Podium */}
            {topThree.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '2rem',
                marginBottom: '3rem',
                minHeight: '300px'
              }}>
                {/* 2nd Place */}
                {topThree[1] && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#C0C0C0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      {topThree[1].avatar || topThree[1].name.substring(0, 1)}
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {topThree[1].name}
                    </p>
                    <div style={{
                      backgroundColor: '#E5E7EB',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '1rem',
                      width: '120px'
                    }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                        2️⃣
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {topThree[1].total_points} pts
                      </p>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: '#FFD700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      marginBottom: '0.5rem'
                    }}>
                      {topThree[0].avatar || topThree[0].name.substring(0, 1)}
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                      {topThree[0].name}
                    </p>
                    <div style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '1rem',
                      width: '140px'
                    }}>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                        1️⃣
                      </p>
                      <p style={{ margin: 0, fontSize: '1rem' }}>
                        {topThree[0].total_points} pts
                      </p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#CD7F32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      {topThree[2].avatar || topThree[2].name.substring(0, 1)}
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {topThree[2].name}
                    </p>
                    <div style={{
                      backgroundColor: '#E5E7EB',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '1rem',
                      width: '120px'
                    }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                        3️⃣
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {topThree[2].total_points} pts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full Rankings Table */}
            {trainers.length > 0 && (
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Full Rankings</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Rank</th>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Name</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Points</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Lessons</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Quizzes</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Dogs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainers.map((trainer, idx) => (
                        <tr
                          key={trainer.id}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: user?.id === trainer.id ? 'var(--bg)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                              }}>
                                {trainer.avatar || trainer.name.substring(0, 1)}
                              </div>
                              <span>
                                {trainer.name}
                                {user?.id === trainer.id && (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> (you)</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>
                            {trainer.total_points}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {trainer.lessons_completed}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {trainer.quizzes_passed}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {trainer.dogs_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Dogs Tab */}
        {activeTab === 'dogs' && (
          <div className="card">
            {dogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                No dogs yet. Adopt your first furry friend!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Rank</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Dog Name</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Training Score</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Sessions</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Scenarios</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Trainers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dogs.map((dog, idx) => (
                      <tr
                        key={dog.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: '500' }}>
                            {dog.name}
                          </span>
                          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {dog.breed}
                          </p>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{
                            width: '100%',
                            maxWidth: '150px',
                            margin: '0 auto'
                          }}>
                            <div className="progress-bar">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${Math.min(dog.training_score, 100)}%`,
                                  backgroundColor: 'var(--secondary)'
                                }}
                              />
                            </div>
                            <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                              {dog.training_score}%
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {dog.sessions_count}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {dog.scenarios_practiced}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {dog.trainers_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
