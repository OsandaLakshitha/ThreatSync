import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiUser } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', {
        username,
        email
      });
      toast.success('Password reset request submitted. An admin will contact you soon.');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
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
            PASSWORD RESET REQUEST
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
                <FiMail style={{ marginRight: '0.5rem' }} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </button>
          </form>

          <div style={{ 
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <a 
              href="/"
              style={{ 
                color: '#00ff41',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              Back to Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;