import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiAlertTriangle, FiSearch, FiActivity, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import ScanInput from '../components/ScanInput';
import RecentScans from '../components/RecentScans';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    criticalThreats: 0,
    highThreats: 0,
  });
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch statistics');
      setLoading(false);
    }
  };

  const handleScanComplete = () => {
    fetchStats();
  };

  return (
    <div className="p-8">
      {/* Logout Button */}
      <div style={{ 
        position: 'absolute', 
        top: '2rem', 
        right: '2rem' 
      }}>
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

      {/* Welcome Message */}
      <div style={{ 
        marginBottom: '1rem',
        color: '#00ff41'
      }}>
        Welcome, {user?.username}
      </div>

      {/* Rest of your existing dashboard code... */}
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div 
          className="inline-block p-8 rounded-2xl shadow-2xl"
          style={{ 
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(0, 255, 65, 0.3)',
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)'
          }}
        >
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#00ff41' }}>
            THREATSYNC NEURAL INTERFACE
          </h1>
          <p className="text-xl text-gray-400">
            [CLASSIFIED THREAT INTELLIGENCE SYSTEM]
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div 
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#00ff41' }}
            ></div>
            <div 
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#00ff41', animationDelay: '0.5s' }}
            ></div>
            <div 
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#00ff41', animationDelay: '1s' }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          icon={FiSearch}
          title="Total Scans"
          value={stats.totalScans}
          color="green"
          loading={loading}
        />
        <StatsCard
          icon={FiShield}
          title="Threats Blocked"
          value={stats.threatsBlocked}
          color="red"
          loading={loading}
        />
        <StatsCard
          icon={FiAlertTriangle}
          title="Critical Threats"
          value={stats.criticalThreats}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          icon={FiActivity}
          title="High Risk Threats"
          value={stats.highThreats}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Scan Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <ScanInput onScanComplete={handleScanComplete} />
      </motion.div>

      {/* Recent Scans Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <RecentScans limit={5} />
      </motion.div>
    </div>
  );
};

export default Dashboard;