import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/scenario-detail.css';

const TIP_CONFIG = {
  do:     { label: '✅ What To Do',      badgeBg: '#15803D', cardBg: '#F0FDF4', border: '#15803D', titleColor: '#14532D', textColor: '#166534' },
  dont:   { label: '❌ What To Avoid',   badgeBg: '#B91C1C', cardBg: '#FEF2F2', border: '#B91C1C', titleColor: '#7F1D1D', textColor: '#991B1B' },
  why:    { label: '🧠 Why It Works',    badgeBg: '#0369A1', cardBg: '#F0F9FF', border: '#0369A1', titleColor: '#0C4A6E', textColor: '#075985' },
  reward: { label: '🎁 Reward Strategy', badgeBg: '#B45309', cardBg: '#FFFBEB', border: '#B45309', titleColor: '#78350F', textColor: '#92400E' },
};

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
  const [currentTip, setCurrentTip] = useState(0);
  const [viewedTips, setViewedTips] = useState(new Set([0]));
  const touchStartX = useRef(null);

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
        text: '✓ Training session logged! Great work.'
      });
      setNotes('');
      setBehaviorTags('');
      setSuccessRating(0);

      setTimeout(() => setSubmitMessage(null), 4000);
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
            ← Back to Activities
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

  const allTips = scenario.tips?.slice().sort((a, b) => a.order_index - b.order_index) || [];
  const hasTips = allTips.length > 0;

  const goToTip = (index) => {
    setCurrentTip(index);
    setViewedTips(prev => new Set([...prev, index]));
  };

  const handlePrev = () => { if (currentTip > 0) goToTip(currentTip - 1); };
  const handleNext = () => { if (currentTip < allTips.length - 1) goToTip(currentTip + 1); };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  const ratingLabels = ['', 'Needs work', 'Getting there', 'Good', 'Great', 'Excellent!'];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate('/scenarios')}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          ← Back to Activities
        </button>

        {/* Scenario Header */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
          marginBottom: '2.5rem',
          padding: '2rem',
          backgroundColor: colorMap[scenario.color] || '#EFF6FF',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'white',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {scenario.icon}
          </div>
          <div>
            <h1 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '28px' }}>
              {scenario.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: 0, fontSize: '16px' }}>
              {scenario.description}
            </p>
          </div>
        </div>

        {/* Training Guide */}
        {scenario.guide && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📖 Training Guide
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #F8F7FF 0%, #F0F9FF 100%)',
              border: '1px solid #DDD6FE',
              borderLeft: '4px solid #7C3AED',
              borderRadius: '12px',
              padding: '1.5rem 2rem',
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 0, marginBottom: '1rem' }}>
                Expert-backed techniques from professional trainers
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {scenario.guide.split('\n').filter(line => line.trim()).map((line, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#7C3AED',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>{i + 1}</span>
                    <span style={{ color: '#1E1B4B', lineHeight: '1.65', fontSize: '14.5px' }}>
                      {line.replace(/^•\s*/, '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Training Tips Carousel */}
        {hasTips && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>💡 Training Tips</h2>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                {viewedTips.size} of {allTips.length} viewed
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '99px', marginBottom: '1.25rem' }}>
              <div style={{
                height: '100%',
                borderRadius: '99px',
                background: '#7C3AED',
                width: `${(viewedTips.size / allTips.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Card */}
            {(() => {
              const tip = allTips[currentTip];
              const cfg = TIP_CONFIG[tip.tip_type] || TIP_CONFIG.do;
              return (
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    background: cfg.cardBg,
                    border: `1px solid ${cfg.border}`,
                    borderLeft: `5px solid ${cfg.border}`,
                    borderRadius: '12px',
                    padding: '1.75rem',
                    minHeight: '160px',
                    position: 'relative',
                    userSelect: 'none',
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    background: cfg.badgeBg,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    padding: '4px 12px',
                    borderRadius: '99px',
                    marginBottom: '1rem'
                  }}>
                    {cfg.label}
                  </span>
                  {tip.tip_title && (
                    <p style={{ fontWeight: '700', margin: '0 0 8px 0', color: cfg.titleColor, fontSize: '16px' }}>
                      {tip.tip_title}
                    </p>
                  )}
                  <p style={{ margin: 0, color: cfg.textColor, lineHeight: '1.7', fontSize: '15px' }}>
                    {tip.tip_text}
                  </p>
                </div>
              );
            })()}

            {/* Nav controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button
                onClick={handlePrev}
                disabled={currentTip === 0}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '8px 18px', cursor: currentTip === 0 ? 'default' : 'pointer',
                  opacity: currentTip === 0 ? 0.3 : 1, fontWeight: '600', fontSize: '14px'
                }}
              >
                ← Prev
              </button>

              {/* Dots */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {allTips.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToTip(i)}
                    style={{
                      width: i === currentTip ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '99px',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s ease',
                      background: i === currentTip ? '#7C3AED' : viewedTips.has(i) ? '#C4B5FD' : '#E5E7EB',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentTip === allTips.length - 1}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '8px 18px', cursor: currentTip === allTips.length - 1 ? 'default' : 'pointer',
                  opacity: currentTip === allTips.length - 1 ? 0.3 : 1, fontWeight: '600', fontSize: '14px'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '2px solid var(--border)', marginBottom: '2.5rem' }}></div>

        {/* Log Training Session Form */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '6px', fontSize: '22px' }}>📋 Log This Session</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1.5rem' }}>
            Record how training went so you can track progress over time.
          </p>

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
                Which dog? *
              </label>
              {dogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No dogs found. <a href="/dogs" style={{ color: 'var(--primary)' }}>Add a dog first</a>.
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
                      {dog.name}{dog.breed ? ` (${dog.breed})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Success Rating */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                How did it go? *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                      opacity: rating <= successRating ? 1 : 0.25,
                      transform: rating <= successRating ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s'
                    }}
                  >
                    ⭐
                  </button>
                ))}
                {successRating > 0 && (
                  <span style={{
                    marginLeft: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {ratingLabels[successRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="notes" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Notes <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span>
              </label>
              <textarea
                id="notes"
                className="input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What went well? What needs more work?"
                style={{ width: '100%', minHeight: '90px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Behavior Tags */}
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="tags" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Behavior tags <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional, comma-separated)</span>
              </label>
              <input
                id="tags"
                type="text"
                className="input"
                value={behaviorTags}
                onChange={(e) => setBehaviorTags(e.target.value)}
                placeholder="e.g., jumping, pulling, focused, calm"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !selectedDogId || successRating === 0}
              style={{ minWidth: '180px' }}
            >
              {submitting ? 'Saving...' : '✓ Log Training Session'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
