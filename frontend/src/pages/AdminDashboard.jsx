import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiUserPlus, FiAlertCircle, FiLogOut, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { logout } = useAuth();

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user'
  });

  const [passwordChange, setPasswordChange] = useState({
    newPassword: ''
  });

  // Get token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchUsers();
    fetchPasswordRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: getAuthHeader()
      });
      const allUsers = response.data.users;
      setUsers(allUsers.filter(u => u.role === 'user'));
      setAdmins(allUsers.filter(u => u.role === 'admin'));
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchPasswordRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/password-requests', {
        headers: getAuthHeader()
      });
      setPasswordRequests(response.data.requests);
    } catch (error) {
      console.error('Fetch password requests error:', error);
      toast.error('Failed to fetch password requests');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/create-user', 
        newUser,
        { headers: getAuthHeader() }
      );
      
      toast.success('User created successfully');
      setShowCreateUser(false);
      setNewUser({ username: '', password: '', email: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Create user error:', error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          'Failed to create user';
      toast.error(errorMessage);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/toggle-user-status/${userId}`, 
        { status: currentStatus === 'active' ? 'revoked' : 'active' },
        { headers: getAuthHeader() }
      );
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to update user status');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordChange.newPassword || passwordChange.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/admin/change-password/${selectedUser._id}`, 
        { newPassword: passwordChange.newPassword },
        { headers: getAuthHeader() }
      );
      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordChange({ newPassword: '' });
      setSelectedUser(null);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
    }
  };

  const resolvePasswordRequest = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/password-requests/${requestId}/resolve`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success('Request marked as resolved');
      fetchPasswordRequests();
    } catch (error) {
      console.error('Resolve request error:', error);
      toast.error('Failed to resolve request');
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff41' }}>
          ADMIN CONTROL CENTER
        </h1>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ff0041',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <FiLogOut style={{ marginRight: '0.5rem' }} />
          Logout
        </button>
      </div>

      {/* Password Requests Alert */}
      {passwordRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255, 165, 0, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', color: '#ffa500', marginBottom: '1rem' }}>
            <FiAlertCircle style={{ marginRight: '0.5rem' }} />
            <span>{passwordRequests.length} Password Reset Requests Pending</span>
          </div>
          {passwordRequests.map(request => (
            <div key={request._id} style={{ 
              marginTop: '0.5rem', 
              padding: '0.5rem',
              backgroundColor: '#0a0a0a',
              borderRadius: '0.25rem',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                Username: {request.username} | Email: {request.email} | 
                Date: {new Date(request.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => resolvePasswordRequest(request._id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#00ff41',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Mark Resolved
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Create User Button */}
      <button
        onClick={() => setShowCreateUser(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#00ff41',
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        <FiUserPlus style={{ marginRight: '0.5rem' }} />
        Create New User
      </button>

      {/* Admins Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#00ff41', marginBottom: '1rem' }}>
          ADMINISTRATORS ({admins.length})
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {admins.map(admin => (
            <motion.div
              key={admin._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(0, 255, 65, 0.3)',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#00ff41', fontWeight: 'bold' }}>{admin.username}</h3>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>{admin.email}</p>
                  <p style={{ color: '#ffa500', fontSize: '0.75rem' }}>Admin</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(admin);
                    setShowChangePassword(true);
                  }}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #00ff41',
                    borderRadius: '0.25rem',
                    color: '#00ff41',
                    cursor: 'pointer'
                  }}
                >
                  <FiEdit2 />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Users Section */}
      <div>
        <h2 style={{ fontSize: '1.5rem', color: '#00ff41', marginBottom: '1rem' }}>
          USERS ({users.length})
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {users.map(user => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px solid ${user.status === 'revoked' ? 'rgba(255, 0, 65, 0.3)' : 'rgba(0, 255, 65, 0.3)'}`,
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: user.status === 'revoked' ? '#ff0041' : '#00ff41', fontWeight: 'bold' }}>
                    {user.username}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>{user.email}</p>
                  <p style={{ 
                    color: user.status === 'revoked' ? '#ff0041' : '#00ff41', 
                    fontSize: '0.75rem' 
                  }}>
                    Status: {user.status}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleUserStatus(user._id, user.status)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      border: `1px solid ${user.status === 'revoked' ? '#00ff41' : '#ff0041'}`,
                      borderRadius: '0.25rem',
                      color: user.status === 'revoked' ? '#00ff41' : '#ff0041',
                      cursor: 'pointer'
                    }}
                    title={user.status === 'revoked' ? 'Activate User' : 'Revoke Access'}
                  >
                    {user.status === 'revoked' ? <FiUnlock /> : <FiLock />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowChangePassword(true);
                    }}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #00ff41',
                      borderRadius: '0.25rem',
                      color: '#00ff41',
                      cursor: 'pointer'
                    }}
                    title="Change Password"
                  >
                    <FiEdit2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px'
            }}
          >
            <h2 style={{ color: '#00ff41', marginBottom: '1.5rem' }}>Create New User</h2>
            <form onSubmit={createUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#00ff41', display: 'block', marginBottom: '0.5rem' }}>
                  Username *
                </label>
                <input
                  type="text"                   value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(0, 255, 65, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#00ff41', display: 'block', marginBottom: '0.5rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(0, 255, 65, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#00ff41', display: 'block', marginBottom: '0.5rem' }}>
                  Password * (min 6 characters)
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(0, 255, 65, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#00ff41', display: 'block', marginBottom: '0.5rem' }}>
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(0, 255, 65, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#00ff41',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUser(false);
                    setNewUser({ username: '', password: '', email: '', role: 'user' });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    color: '#ff0041',
                    border: '1px solid #ff0041',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px'
            }}
          >
            <h2 style={{ color: '#00ff41', marginBottom: '1.5rem' }}>
              Change Password for {selectedUser.username}
            </h2>
            <form onSubmit={changePassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#00ff41', display: 'block', marginBottom: '0.5rem' }}>
                  New Password * (min 6 characters)
                </label>
                <input
                  type="password"
                  value={passwordChange.newPassword}
                  onChange={(e) => setPasswordChange({ newPassword: e.target.value })}
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(0, 255, 65, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#00ff41',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setSelectedUser(null);
                    setPasswordChange({ newPassword: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    color: '#ff0041',
                    border: '1px solid #ff0041',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
                