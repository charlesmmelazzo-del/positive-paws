import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Dogs.css';

export default function Dogs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [allDogs, setAllDogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFormData, setAddFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    gender: 'unknown',
    photo_url: '',
    bio: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMyDogs();
  }, []);

  const fetchMyDogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dogs/my');
      setDogs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dogs');
      console.error('Error fetching dogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDogs = async () => {
    try {
      const response = await api.get('/dogs');
      setAllDogs(response.data);
    } catch (err) {
      console.error('Error fetching all dogs:', err);
    }
  };

  const handleAddDogClick = () => {
    setAddFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      gender: 'unknown',
      photo_url: '',
      bio: ''
    });
    setShowAddModal(true);
  };

  const handleFindDogClick = () => {
    setSearchQuery('');
    setAllDogs([]);
    fetchAllDogs();
    setShowFindModal(true);
  };

  const handleAddDogSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      alert('Dog name is required');
      return;
    }

    try {
      await api.post('/dogs', {
        name: addFormData.name,
        breed: addFormData.breed || null,
        age_years: addFormData.age ? parseInt(addFormData.age) : null,
        weight_lbs: addFormData.weight ? parseFloat(addFormData.weight) : null,
        gender: addFormData.gender,
        photo_url: addFormData.photo_url || null,
        bio: addFormData.bio || null
      });
      setShowAddModal(false);
      setSuccessMessage('Dog added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMyDogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add dog');
      console.error('Error adding dog:', err);
    }
  };

  const handleConnectDog = async (dogId) => {
    try {
      await api.post(`/dogs/${dogId}/connect`);
      setSuccessMessage('Dog connected to your profile!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowFindModal(false);
      fetchMyDogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to connect dog');
      console.error('Error connecting dog:', err);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredDogs = allDogs.filter(dog =>
    dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dog.breed && dog.breed.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h1>🐕 My Dogs</h1>
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleAddDogClick}>
              Add New Dog
            </button>
            <button className="btn btn-secondary" onClick={handleFindDogClick}>
              Find Existing Dog
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="dogs-section">
          <h2>My Dogs</h2>
          {loading ? (
            <div className="loading-center">
              <div className="spinner"></div>
            </div>
          ) : dogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐕</div>
              <h3>No dogs yet</h3>
              <p>Start by adding your dog to begin tracking their training progress.</p>
              <button className="btn btn-primary" onClick={handleAddDogClick}>
                Add Your First Dog
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {dogs.map(dog => (
                <div key={dog.id} className="card">
                  <div className="dog-avatar">
                    {dog.photo_url ? (
                      <img src={dog.photo_url} alt={dog.name} />
                    ) : (
                      <span>🐕</span>
                    )}
                  </div>
                  <div className="dog-info">
                    <h3>{dog.name}</h3>
                    {dog.breed && <p className="breed">{dog.breed}</p>}
                    <div className="dog-meta">
                      {dog.age && <span>Age: {dog.age}</span>}
                      {dog.gender && <span>Gender: {dog.gender}</span>}
                    </div>
                  </div>
                  <div className="training-score">
                    <div className="score-label">Training Score</div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${dog.training_score || 0}%` }}
                      ></div>
                    </div>
                    <div className="score-value">{dog.training_score || 0}%</div>
                  </div>
                  {dog.user_count > 0 && (
                    <div className="badge badge-blue">
                      {dog.user_count} trainer{dog.user_count !== 1 ? 's' : ''}
                    </div>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/dogs/${dog.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Dog Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowAddModal(false)}
            >
              ✕
            </button>
            <h2>Add New Dog</h2>
            <form onSubmit={handleAddDogSubmit}>
              <div className="form-group">
                <label htmlFor="name">Dog Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={addFormData.name}
                  onChange={handleAddFormChange}
                  placeholder="Enter dog's name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="breed">Breed</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  className="input"
                  value={addFormData.breed}
                  onChange={handleAddFormChange}
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age (years)</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    className="input"
                    value={addFormData.age}
                    onChange={handleAddFormChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight (lbs)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    className="input"
                    value={addFormData.weight}
                    onChange={handleAddFormChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="input"
                    value={addFormData.gender}
                    onChange={handleAddFormChange}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="photo_url">Photo URL</label>
                <input
                  type="url"
                  id="photo_url"
                  name="photo_url"
                  className="input"
                  value={addFormData.photo_url}
                  onChange={handleAddFormChange}
                  placeholder="https://example.com/dog.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio / Notes</label>
                <textarea
                  id="bio"
                  name="bio"
                  className="input"
                  value={addFormData.bio}
                  onChange={handleAddFormChange}
                  placeholder="Tell us about your dog..."
                  rows="4"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Dog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Find Existing Dog Modal */}
      {showFindModal && (
        <div className="modal-overlay" onClick={() => setShowFindModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowFindModal(false)}
            >
              ✕
            </button>
            <h2>Find Existing Dog</h2>
            <div className="search-box">
              <input
                type="text"
                className="input"
                placeholder="Search by name or breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {allDogs.length === 0 ? (
              <div className="loading-center">
                <div className="spinner"></div>
              </div>
            ) : filteredDogs.length === 0 ? (
              <div className="empty-state">
                <p>No dogs found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="dogs-list">
                {filteredDogs.map(dog => (
                  <div key={dog.id} className="dog-list-item">
                    <div className="dog-list-avatar">
                      {dog.photo_url ? (
                        <img src={dog.photo_url} alt={dog.name} />
                      ) : (
                        <span>🐕</span>
                      )}
                    </div>
                    <div className="dog-list-info">
                      <h4>{dog.name}</h4>
                      {dog.breed && <p>{dog.breed}</p>}
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleConnectDog(dog.id)}
                    >
                      Add to My Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
