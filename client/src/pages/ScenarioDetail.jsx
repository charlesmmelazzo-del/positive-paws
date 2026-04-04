import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/scenario-detail.css';

export default function ScenarioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scenario, setScenario] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [successRating, setSuccessRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [behaviorTags, setBehaviorTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    fetchScenarioAndDogs();
  }, [id]);

  const fetchScenarioAndDogs = async () => {
    try {
      setLoading(true);
      const [scenarioRes, dogsRes] = await Promise.all([
        api.get(`/scenarios/${id}`),
        api.get('/dogs/my')
      ]);
      setScenario(scenarioRes.data);
      setDogs(dogsRes.data);
      if (dogsRes.data.length > 0) {
        setSelectedDogId(dogsRes.data[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load scenario');
      console.error('Error fetching scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!selectedDogId || successRating === 0) {
      setSubmitMessage({ type: 'error', text: 'Please select a dog and rating' });
      return;
    }

    try {
      setSubmitting(true);
      const tags = behaviorTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await api.post(`/dogs/${selectedDogId}/logs`, {
        scenario_id: id,
        success_rating: successRating,
        notes,
        behavior_tags: tags
      });

      setSubmitMessage({
        type: 'success',
        text: '✓ Training session logged successfully!'
      });
      setNotes('');
      setBehaviorTags('');
      setSuccessRating(0);

      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (err) {
      setSubmitMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to log training session'
      });
      console.error('Error logging session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading scenario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <button onClick={() => navigate('/scenarios')} className="btn btn-secondary">
            ← Back to Scenarios
          </button>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">Scenario not found</div>
        </div>
      </div>
    );
  }

  const colorMap = {
    orange: '#FFE8DF',
    yellow: '#FEF9C3',
    green: '#DCFCE7',
    pink: '#FCE7F3',
    blue: '#DBEAFE',
    purple: '#F3E8FF',
    red: '#FEE2E2',
    teal: '#CCFBF1',
    indigo: '#E0E7FF',
    cyan: '#CFFAFE'
  };

  const tipsByType = {
    do: scenario.tips?.filter(t => t.type === 'do') || [],
    dont: scenario.tips?.filter(t => t.type === 'dont') || [],
    why: scenario.tips?.filter(t => t.type === 'why') || [],
    reward: scenario.tips?.filter(t => t.type === 'reward') || []
  };

  return (
    <div className="page">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/scenarios')}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          ← Back to Scenarios
        </button>

        {/* Scenario Header */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          marginBottom: '3rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: colorMap[scenario.color] || colorMap.blue,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            flexShrink: 0
          }}>
            {scenario.icon}
          </div>
          <div>
            <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              {scenario.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {scenario.description}
            </p>
          </div>
        </div>

        {/* Tips Sections */}
        <div style={{ marginBottom: '3rem' }}>
          {/* DO Section */}
          {tipsByType.do.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✅ DO
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tipsByType.do.map(tip => (
                  <div
                    key={tip.id}
                    className="card"
                    style={{
                      borderLeft: '4px solid #15803D',
                      backgroundColor: '#F0FDF4'
                    }}
                  >
                    <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem' }}>
                      {tip.tip_title}
                    </p>
                    <p style={{ marginBottom: 0, color: 'var(--text)' }}>
                      {tip.tip_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DON'T Section */}
          {tipsByType.dont.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ❌ DON'T
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tipsByType.dont.map(tip => (
                  <div
                    key={tip.id}
                    className="card"
                    style={{
                      borderLeft: '4px solid #B91C1C',
                      backgroundColor: '#FEF2F2'
                    }}
                  >
                    <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem' }}>
                      {tip.tip_title}
                    </p>
                    <p style={{ marginBottom: 0, color: 'var(--text)' }}>
                      {tip.tip_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WHY IT WORKS Section */}
          {tipsByType.why.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🤔 WHY IT WORKS
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tipsByType.why.map(tip => (
                  <div
                    key={tip.id}
                    className="card"
                    style={{
                      borderLeft: '4px solid #0369A1',
                      backgroundColor: '#F0F9FF'
                    }}
                  >
                    <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem' }}>
                      {tip.tip_title}
                    </p>
                    <p style={{ marginBottom: 0, color: 'var(--text)' }}>
                      {tip.tip_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REWARD TIPS Section */}
          {tipsByType.reward.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#C2410C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎁 REWARD TIPS
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tipsByType.reward.map(tip => (
                  <div
                    key={tip.id}
                    className="card"
                    style={{
                      borderLeft: '4px solid #C2410C',
                      backgroundColor: '#FEF3C7'
                    }}
                  >
                    <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem' }}>
                      {tip.tip_title}
                    </p>
                    <p style={{ marginBottom: 0, color: 'var(--text)' }}>
                      {tip.tip_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Log Training Session Form */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>📊 Log a Training Session</h2>

          {submitMessage && (
            <div className={`alert ${submitMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
              style={{ marginBottom: '1.5rem' }}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmitLog}>
            {/* Dog Selection */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="dog-select" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Select Your Dog
              </label>
              {dogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No dogs found. Add a dog to your profile first.
                </p>
              ) : (
                <select
                  id="dog-select"
                  className="input"
                  value={selectedDogId}
                  onChange={(e) => setSelectedDogId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select a dog...</option>
                  {dogs.map(dog => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name} ({dog.breed})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Success Rating */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Success Rating
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSuccessRating(rating)}
                    style={{
                      fontSize: '2rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: rating <= successRating ? 1 : 0.3,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {successRating > 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {successRating === 1 && 'Needs improvement'}
                  {successRating === 2 && 'Fair'}
                  {successRating === 3 && 'Good'}
                  {successRating === 4 && 'Great'}
                  {successRating === 5 && 'Excellent!'}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="notes" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Notes (optional)
              </label>
              <textarea
                id="notes"
                className="input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the session go? Any observations?"
                style={{ width: '100%', minHeight: '100px', fontFamily: 'inherit' }}
              />
            </div>

            {/* Behavior Tags */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="tags" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Behavior Tags (comma-separated, optional)
              </label>
              <input
                id="tags"
                type="text"
                className="input"
                value={behaviorTags}
                onChange={(e) => setBehaviorTags(e.target.value)}
                placeholder="e.g., jumping, pulling, focus, heel"
                style={{ width: '100%' }}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Enter tags separated by commas to track specific behaviors
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !selectedDogId || successRating === 0}
            >
              {submitting ? 'Logging...' : 'Log Training Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
