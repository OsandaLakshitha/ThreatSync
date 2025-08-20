import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const AccountSuspended = () => {
  const { logout } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <FiAlertTriangle style={{ 
          fontSize: '4rem', 
          color: '#ff0041',
          marginBottom: '1rem'
        }} />
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold',
          color: '#ff0041',
          marginBottom: '1rem'
        }}>
          ACCOUNT SUSPENDED
        </h1>
        <p style={{ 
          color: '#666',
          marginBottom: '2rem',
          maxWidth: '400px'
        }}>
          Your account has been temporarily suspended. Please contact the administrator to restore access.
        </p>
        <button
          onClick={logout}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'transparent',
            color: '#00ff41',
            border: '1px solid #00ff41',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Return to Login
        </button>
      </motion.div>
    </div>
  );
};

export default AccountSuspended;