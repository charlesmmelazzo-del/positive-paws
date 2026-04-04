import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const dogsRes = await api.get('/dogs/my');
      setDogs(dogsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await api.put('/auth/profile', {
        name: editForm.name,
        bio: editForm.bio,
        avatar: editForm.avatar
      });
      updateUser(response.data);
      setProfile(response.data);
      setSubmitMessage({
        type: 'success',
        text: '✓ Profile updated successfully!'
      });
      setEditMode(false);
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (err) {
      setSubmitMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update profile'
      });
      console.error('Error updating profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  // Check earned achievements
  const achievements = [
    {
      id: 'first-steps',
      icon: '🐾',
      name: 'First Steps',
      description: 'Completed first lesson',
      earned: (user?.lessons_completed || 0) >= 1
    },
    {
      id: 'bookworm',
      icon: '📚',
      name: 'Bookworm',
      description: 'Completed 5 lessons',
      earned: (user?.lessons_completed || 0) >= 5
    },
    {
      id: 'quiz-master',
      icon: '🧠',
      name: 'Quiz Master',
      description: 'Passed 5 quizzes',
      earned: (user?.quizzes_passed || 0) >= 5
    },
    {
      id: 'dedicated',
      icon: '🏋️',
      name: 'Dedicated Trainer',
      description: 'Logged 10 training sessions',
      earned: (user?.sessions_logged || 0) >= 10
    },
    {
      id: 'top-trainer',
      icon: '🌟',
      name: 'Top Trainer',
      description: 'Earned 100 points',
      earned: (user?.total_points || 0) >= 100
    }
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Profile Header */}
        <div className="card" style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3rem',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {user?.avatar || user?.name?.substring(0, 1) || '👤'}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              {user?.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              {user?.email}
            </p>
            {user?.bio && (
              <p style={{ margin: '0 0 1rem 0' }}>
                {user.bio}
              </p>
            )}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Member since {memberSinceDate}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{
            textAlign: 'center',
            backgroundColor: '#FFF9F5'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
              Total Points
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
              {user?.total_points || 0}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
              Lessons Completed
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
              {user?.lessons_completed || 0}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
              Quizzes Passed
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
              {user?.quizzes_passed || 0}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
              Rank
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>
              #{user?.rank || '?'}
            </p>
          </div>
        </div>

        {submitMessage && (
          <div className={`alert ${submitMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{ marginBottom: '1.5rem' }}>
            {submitMessage.text}
          </div>
        )}

        {/* Edit Profile Section */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: editMode ? '1.5rem' : 0
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>Edit Profile</h2>
            {!editMode && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditMode(true)}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleSaveProfile}>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="name" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="input"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="bio" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="input"
                  value={editForm.bio}
                  onChange={handleEditFormChange}
                  placeholder="Tell us about yourself..."
                  style={{ width: '100%', minHeight: '100px', fontFamily: 'inherit' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="avatar" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Avatar (emoji or URL)
                </label>
                <input
                  id="avatar"
                  type="text"
                  name="avatar"
                  className="input"
                  value={editForm.avatar}
                  onChange={handleEditFormChange}
                  placeholder="e.g., 🐕 or https://example.com/avatar.jpg"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditMode(false);
                    setEditForm({
                      name: user?.name || '',
                      bio: user?.bio || '',
                      avatar: user?.avatar || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Name
                </p>
                <p style={{ margin: 0 }}>{user?.name || 'Not set'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                  Avatar
                </p>
                <p style={{ margin: 0, fontSize: '1.5rem' }}>{user?.avatar || '—'}</p>
              </div>
              {user?.bio && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>
                    Bio
                  </p>
                  <p style={{ margin: 0 }}>{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Dogs Section */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>🐕 My Dogs</h2>
          {dogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              You haven't added any dogs yet. Add your first furry friend!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dogs.map(dog => (
                <Link
                  key={dog.id}
                  to={`/dogs/${dog.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF0E6';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}>
                    🐕
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      {dog.name}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                      {dog.breed}
                    </p>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Badges Section */}
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>🏆 Achievements</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  opacity: achievement.earned ? 1 : 0.5,
                  backgroundColor: achievement.earned ? '#FFF9F5' : '#F3F4F6',
                  border: `1px solid ${achievement.earned ? 'var(--primary)' : 'var(--border)'}`
                }}
              >
                <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
                  {achievement.icon}
                </p>
                <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>
                  {achievement.name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  {achievement.description}
                </p>
                {!achievement.earned && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Locked
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
