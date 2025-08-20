import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(username, password);
    if (!result.success) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem'
        }}
      >
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#00ff41',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            THREATSYNC ACCESS
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#00ff41',
                marginBottom: '0.5rem'
              }}>
                <FiUser style={{ marginRight: '0.5rem' }} />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#00ff41',
                marginBottom: '0.5rem'
              }}>
                <FiLock style={{ marginRight: '0.5rem' }} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#00ff41',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <a 
              href="/forgot-password"
              style={{ 
                color: '#00ff41',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;