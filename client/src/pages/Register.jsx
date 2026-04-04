import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/index.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required inputs
      if (!name || !email || !password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Basic email validation
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Password length check
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Call API to register
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        bio: bio || null,
      });

      // Update auth context
      if (response.data && response.data.token) {
        login(response.data.user, response.data.token);
        // Navigate to dogs page so they can add their first dog
        navigate('/dogs');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '450px', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐾</div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              Join Positive Paws
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
              Create your account and start training today
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Full Name <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Email Address <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Password <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                At least 6 characters
              </p>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="bio" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                About Yourself <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <textarea
                id="bio"
                className="input"
                placeholder="Tell us a bit about yourself and your dog training experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }}></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--primary)',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
