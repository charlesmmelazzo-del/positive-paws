import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/admin-dashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actingUserId, setActingUserId] = useState(null);

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [createLoading, setCreateLoading] = useState(false);

  // Reset password state
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (user?.id === userId) {
      setActionMessage({ type: 'error', text: 'You cannot change your own role' });
      return;
    }
    try {
      setActingUserId(userId);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setActionMessage({ type: 'success', text: `✓ User role updated to ${newRole}` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update user role' });
    } finally {
      setActingUserId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      setActionMessage({ type: 'error', text: 'All fields are required' });
      return;
    }
    try {
      setCreateLoading(true);
      const res = await api.post('/admin/users', createForm);
      setUsers(prev => [res.data, ...prev]);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      setShowCreateForm(false);
      setActionMessage({ type: 'success', text: `✓ User ${res.data.name} created successfully` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create user' });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!resetPassword || resetPassword.length < 6) {
      setActionMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      setResetLoading(true);
      await api.post(`/admin/users/${userId}/reset-password`, { password: resetPassword });
      setResetUserId(null);
      setResetPassword('');
      setActionMessage({ type: 'success', text: '✓ Password reset successfully' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to reset password' });
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (user?.id === userId) {
      setActionMessage({ type: 'error', text: 'You cannot delete your own account' });
      return;
    }
    const userToDelete = users.find(u => u.id === userId);
    if (!window.confirm(`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      setActingUserId(userId);
      await api.delete(`/admin/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setActionMessage({ type: 'success', text: '✓ User deleted successfully' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete user' });
    } finally {
      setActingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <button onClick={fetchDashboardData} className="btn btn-secondary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🛠️ Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Manage users, monitor activity, and maintain the platform
          </p>
        </div>

        {actionMessage && (
          <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{ marginBottom: '1.5rem' }}>
            {actionMessage.text}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid-4" style={{ marginBottom: '3rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Total Users</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{stats.total_users}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Total Dogs</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{stats.total_dogs}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Training Sessions</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{stats.training_sessions}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Lesson Completions</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary)' }}>{stats.lesson_completions}</p>
            </div>
          </div>
        )}

        {/* Create User */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showCreateForm ? '1.5rem' : 0 }}>
            <h2 style={{ margin: 0 }}>➕ Create New User</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setShowCreateForm(!showCreateForm); setCreateForm({ name: '', email: '', password: '', role: 'user' }); }}
            >
              {showCreateForm ? 'Cancel' : '+ New User'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateUser}>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Name</label>
                  <input className="input" type="text" placeholder="Full name" value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="email@example.com" value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" placeholder="Min. 6 characters" value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          )}
        </div>

        {/* Users Table */}
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>👥 Users</h2>

          {users.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No users found</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Member Since</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => {
                    const isCurrentUser = user?.id === userItem.id;
                    const createdDate = new Date(userItem.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    });
                    return (
                      <tr key={userItem.id} style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: isCurrentUser ? 'var(--bg)' : 'transparent',
                        opacity: actingUserId === userItem.id ? 0.6 : 1
                      }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {String(userItem.id).substring(0, 8)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {userItem.name}
                          {isCurrentUser && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> (you)</span>}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{userItem.email}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span className={`badge ${userItem.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{createdDate}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-outline btn-sm"
                              onClick={() => handleRoleChange(userItem.id, userItem.role === 'admin' ? 'user' : 'admin')}
                              disabled={isCurrentUser || actingUserId === userItem.id}
                              style={{ opacity: isCurrentUser ? 0.5 : 1, cursor: isCurrentUser ? 'not-allowed' : 'pointer' }}
                              title={isCurrentUser ? 'Cannot change your own role' : ''}>
                              {userItem.role === 'admin' ? 'Make User' : 'Make Admin'}
                            </button>
                            <button className="btn btn-outline btn-sm"
                              onClick={() => { setResetUserId(resetUserId === userItem.id ? null : userItem.id); setResetPassword(''); }}
                              disabled={actingUserId === userItem.id}>
                              Reset Pwd
                            </button>
                            <button className="btn btn-outline btn-sm"
                              style={{ color: '#DC2626', borderColor: '#DC2626', opacity: isCurrentUser ? 0.5 : 1, cursor: isCurrentUser ? 'not-allowed' : 'pointer' }}
                              onClick={() => handleDeleteUser(userItem.id)}
                              disabled={isCurrentUser || actingUserId === userItem.id}
                              title={isCurrentUser ? 'Cannot delete your own account' : ''}>
                              Delete
                            </button>
                          </div>
                          {resetUserId === userItem.id && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                              <input className="input" type="password" placeholder="New password" value={resetPassword}
                                onChange={e => setResetPassword(e.target.value)}
                                style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem', maxWidth: '160px' }} />
                              <button className="btn btn-primary btn-sm" onClick={() => handleResetPassword(userItem.id)} disabled={resetLoading}>
                                {resetLoading ? '...' : 'Save'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
