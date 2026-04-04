import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/scenarios.css';

export default function Scenarios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/scenarios');
      setScenarios(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load scenarios');
      console.error('Error fetching scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleScenarioClick = (scenarioId) => {
    navigate(`/scenarios/${scenarioId}`);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <button onClick={fetchScenarios} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🎯 Training Scenarios</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
            Learn how to handle common situations with your dog
          </p>
        </div>

        {/* Scenarios Grid */}
        {scenarios.length === 0 ? (
          <div className="empty-state">
            <p>No scenarios available yet.</p>
          </div>
        ) : (
          <div className="grid-3">
            {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className="card card-clickable"
                onClick={() => handleScenarioClick(scenario.id)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              >
                {/* Icon Background */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colorMap[scenario.color] || colorMap.blue,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {scenario.icon}
                </div>

                {/* Content */}
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                  {scenario.name}
                </h3>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  lineHeight: '1.5'
                }}>
                  {scenario.description}
                </p>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {scenario.category && (
                    <span className="badge badge-blue">
                      {scenario.category}
                    </span>
                  )}
                  {scenario.tip_count && (
                    <span className="badge badge-orange">
                      💡 {scenario.tip_count} tips
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
