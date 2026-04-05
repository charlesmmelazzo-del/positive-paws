import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/DogProfile.css';

const RatingStars = ({ rating, onRatingChange, interactive = false }) => {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
};

export default function DogProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dog, setDog] = useState(null);
  const [users, setUsers] = useState([]);
  const [scenarioStats, setScenarioStats] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('stats');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [scenarios, setScenarios] = useState([]);

  const [logFormData, setLogFormData] = useState({
    scenario_id: '',
    success_rating: 3,
    notes: '',
    behavior_tags: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    gender: 'unknown',
    photo_url: '',
    bio: ''
  });

  const [milestoneFormData, setMilestoneFormData] = useState({
    name: '',
    type: 'achievement',
    notes: ''
  });

  useEffect(() => {
    fetchDogProfile();
    fetchScenarios();
  }, [id]);

  const fetchDogProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/dogs/${id}`);
      const data = response.data;
      setDog(data);
      setUsers(data.users || []);
      setScenarioStats(data.scenario_stats || []);
      setRecentLogs(data.recent_logs || []);
      setMilestones(data.milestones || []);

      // Set edit form with current dog data
      setEditFormData({
        name: data.name,
        breed: data.breed || '',
        age: data.age_years?.toString() || '',
        weight: data.weight_lbs?.toString() || '',
        gender: data.gender || 'unknown',
        photo_url: data.photo_url || '',
        bio: data.bio || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dog profile');
      console.error('Error fetching dog profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await api.get('/scenarios');
      setScenarios(response.data);
      if (response.data.length > 0) {
        setLogFormData(prev => ({
          ...prev,
          scenario_id: response.data[0].id.toString()
        }));
      }
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    }
  };

  const handleLogSessionSubmit = async (e) => {
    e.preventDefault();
    if (!logFormData.scenario_id) {
      alert('Please select a scenario');
      return;
    }

    try {
      await api.post(`/dogs/${id}/logs`, {
        scenario_id: parseInt(logFormData.scenario_id),
        success_rating: logFormData.success_rating,
        notes: logFormData.notes || null,
        behavior_tags: logFormData.behavior_tags ? logFormData.behavior_tags.split(',').map(t => t.trim()) : []
      });

      setLogFormData({
        scenario_id: logFormData.scenario_id,
        success_rating: 3,
        notes: '',
        behavior_tags: ''
      });

      fetchDogProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log session');
      console.error('Error logging session:', err);
    }
  };

  const handleEditDogSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      alert('Dog name is required');
      return;
    }

    try {
      await api.put(`/dogs/${id}`, {
        name: editFormData.name,
        breed: editFormData.breed || null,
        age_years: editFormData.age ? parseInt(editFormData.age) : null,
        weight_lbs: editFormData.weight ? parseFloat(editFormData.weight) : null,
        gender: editFormData.gender,
        photo_url: editFormData.photo_url || null,
        bio: editFormData.bio || null
      });

      setShowEditModal(false);
      fetchDogProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update dog');
      console.error('Error updating dog:', err);
    }
  };

  const handleAddMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneFormData.name.trim()) {
      alert('Milestone name is required');
      return;
    }

    try {
      await api.post(`/dogs/${id}/milestones`, {
        milestone_name: milestoneFormData.name,
        milestone_type: milestoneFormData.type,
        notes: milestoneFormData.notes || null
      });

      setMilestoneFormData({
        name: '',
        type: 'achievement',
        notes: ''
      });
      setShowAddMilestoneModal(false);
      fetchDogProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add milestone');
      console.error('Error adding milestone:', err);
    }
  };

  const handleLogFormChange = (e) => {
    const { name, value } = e.target;
    setLogFormData(prev => ({
      ...prev,
      [name]: name === 'success_rating' ? parseInt(value) : value
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMilestoneFormChange = (e) => {
    const { name, value } = e.target;
    setMilestoneFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (error || !dog) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">
            {error || 'Dog not found'}
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dogs')}>
            Back to My Dogs
          </button>
        </div>
      </div>
    );
  }

  const isConnectedUser = users.some(u => u.id === user?.id);

  return (
    <div className="page">
      <div className="container">
        {/* Dog Header */}
        <div className="dog-header">
          <div className="dog-header-avatar">
            {dog.photo_url ? (
              <img src={dog.photo_url} alt={dog.name} />
            ) : (
              <span>🐕</span>
            )}
          </div>

          <div className="dog-header-info">
            <h1>{dog.name}</h1>
            <div className="dog-details">
              {dog.breed && <span>{dog.breed}</span>}
              {dog.age_years && <span>Age: {dog.age_years}</span>}
              {dog.weight_lbs && <span>Weight: {dog.weight_lbs} lbs</span>}
              {dog.gender && <span>Gender: {dog.gender}</span>}
            </div>
          </div>

          <div className="training-score-card">
            <div className="training-score-label">Training Score</div>
            <div className="training-score-value">{dog.training_score || 0}%</div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${dog.training_score || 0}%` }}
              ></div>
            </div>
          </div>

          {isConnectedUser && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowEditModal(true)}
            >
              Edit Dog
            </button>
          )}
        </div>

        {/* Users Section */}
        {users.length > 0 && (
          <div className="users-section">
            <h3>Trainers</h3>
            <div className="users-list">
              {users.map(u => (
                <div key={u.id} className="user-badge">
                  {u.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Training Stats
          </button>
          <button
            className={`tab ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            Training Log
          </button>
          <button
            className={`tab ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            Milestones
          </button>
        </div>

        {/* Training Stats Tab */}
        {activeTab === 'stats' && (
          <div className="tab-content">
            <h2>Scenario Performance</h2>
            {scenarioStats.length === 0 ? (
              <div className="empty-state">
                <p>No training data yet. Start logging sessions to see stats.</p>
              </div>
            ) : (
              <div className="grid-3">
                {scenarioStats.map(stat => (
                  <div key={stat.id} className="card">
                    <h3>{stat.name}</h3>
                    <div className="stat-item">
                      <span className="stat-label">Average Rating:</span>
                      <RatingStars rating={Math.round(stat.avg_rating || 0)} />
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Sessions:</span>
                      <span className="stat-value">{stat.session_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Training Log Tab */}
        {activeTab === 'log' && (
          <div className="tab-content">
            <div className="log-section">
              <h2>Log Training Session</h2>
              <form onSubmit={handleLogSessionSubmit} className="log-form">
                <div className="form-group">
                  <label htmlFor="scenario_id">Scenario *</label>
                  <select
                    id="scenario_id"
                    name="scenario_id"
                    className="input"
                    value={logFormData.scenario_id}
                    onChange={handleLogFormChange}
                  >
                    <option value="">Select a scenario</option>
                    {scenarios.map(scenario => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="success_rating">Success Rating</label>
                  <div className="rating-input">
                    <RatingStars
                      rating={logFormData.success_rating}
                      onRatingChange={(rating) =>
                        setLogFormData(prev => ({
                          ...prev,
                          success_rating: rating
                        }))
                      }
                      interactive={true}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="input"
                    value={logFormData.notes}
                    onChange={handleLogFormChange}
                    placeholder="What went well? What could improve?"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="behavior_tags">Behavior Tags (comma-separated)</label>
                  <input
                    type="text"
                    id="behavior_tags"
                    name="behavior_tags"
                    className="input"
                    value={logFormData.behavior_tags}
                    onChange={handleLogFormChange}
                    placeholder="e.g., focused, distracted, energetic"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Log Session
                </button>
              </form>
            </div>

            <div className="divider"></div>

            <div className="logs-section">
              <h2>Recent Training Log</h2>
              {recentLogs.length === 0 ? (
                <div className="empty-state">
                  <p>No training logs yet. Log a session to get started!</p>
                </div>
              ) : (
                <div className="logs-list">
                  {recentLogs.map(log => (
                    <div key={log.id} className="log-item card">
                      <div className="log-header">
                        <h4>{log.scenario_name}</h4>
                        <span className="log-date">
                          {new Date(log.logged_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="log-rating">
                        <RatingStars rating={log.success_rating} />
                      </div>
                      {log.notes && (
                        <p className="log-notes">{log.notes}</p>
                      )}
                      {log.behavior_tags && log.behavior_tags.length > 0 && (
                        <div className="log-tags">
                          {log.behavior_tags.map((tag, idx) => (
                            <span key={idx} className="badge badge-teal">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="log-by">Logged by {log.logged_by}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="tab-content">
            <div className="milestone-section">
              <h2>Add Milestone</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddMilestoneModal(true)}
              >
                Add New Milestone
              </button>
            </div>

            <div className="divider"></div>

            <div className="milestones-section">
              <h2>Achievements</h2>
              {milestones.length === 0 ? (
                <div className="empty-state">
                  <p>No milestones yet. Add one to celebrate progress!</p>
                </div>
              ) : (
                <div className="milestones-list">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="milestone-item card">
                      <div className="milestone-header">
                        <h4>{milestone.milestone_name}</h4>
                        <span className="milestone-type badge badge-orange">
                          {milestone.milestone_type}
                        </span>
                      </div>
                      <p className="milestone-date">
                        Achieved on {new Date(milestone.achieved_at).toLocaleDateString()}
                      </p>
                      {milestone.notes && (
                        <p className="milestone-notes">{milestone.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dog Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowEditModal(false)}
            >
              ✕
            </button>
            <h2>Edit Dog</h2>
            <form onSubmit={handleEditDogSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Dog Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  className="input"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  placeholder="Enter dog's name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-breed">Breed</label>
                <input
                  type="text"
                  id="edit-breed"
                  name="breed"
                  className="input"
                  value={editFormData.breed}
                  onChange={handleEditFormChange}
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-age">Age (years)</label>
                  <input
                    type="number"
                    id="edit-age"
                    name="age"
                    className="input"
                    value={editFormData.age}
                    onChange={handleEditFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-weight">Weight (lbs)</label>
                  <input
                    type="number"
                    id="edit-weight"
                    name="weight"
                    className="input"
                    value={editFormData.weight}
                    onChange={handleEditFormChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-gender">Gender</label>
                  <select
                    id="edit-gender"
                    name="gender"
                    className="input"
                    value={editFormData.gender}
                    onChange={handleEditFormChange}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-photo_url">Photo URL</label>
                <input
                  type="url"
                  id="edit-photo_url"
                  name="photo_url"
                  className="input"
                  value={editFormData.photo_url}
                  onChange={handleEditFormChange}
                  placeholder="https://example.com/dog.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-bio">Bio / Notes</label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  className="input"
                  value={editFormData.bio}
                  onChange={handleEditFormChange}
                  placeholder="Tell us about your dog..."
                  rows="4"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="modal-overlay" onClick={() => setShowAddMilestoneModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowAddMilestoneModal(false)}
            >
              ✕
            </button>
            <h2>Add Milestone</h2>
            <form onSubmit={handleAddMilestoneSubmit}>
              <div className="form-group">
                <label htmlFor="milestone-name">Milestone Name *</label>
                <input
                  type="text"
                  id="milestone-name"
                  name="name"
                  className="input"
                  value={milestoneFormData.name}
                  onChange={handleMilestoneFormChange}
                  placeholder="e.g., Learned Sit Command"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="milestone-type">Type</label>
                <select
                  id="milestone-type"
                  name="type"
                  className="input"
                  value={milestoneFormData.type}
                  onChange={handleMilestoneFormChange}
                >
                  <option value="achievement">Achievement</option>
                  <option value="breakthrough">Breakthrough</option>
                  <option value="certification">Certification</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="milestone-notes">Notes</label>
                <textarea
                  id="milestone-notes"
                  name="notes"
                  className="input"
                  value={milestoneFormData.notes}
                  onChange={handleMilestoneFormChange}
                  placeholder="Additional details about this milestone..."
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
