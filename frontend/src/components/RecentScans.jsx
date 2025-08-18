import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RecentScans = ({ limit = 5 }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/scan/recent');
      setScans(response.data.data.slice(0, limit));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch recent scans:', error);
      setLoading(false);
    }
  };

  const getThreatLevelStyle = (level) => {
    const styles = {
      CRITICAL: { color: '#ff0040', backgroundColor: 'rgba(255, 0, 64, 0.2)' },
      HIGH: { color: '#ffff00', backgroundColor: 'rgba(255, 255, 0, 0.2)' },
      MEDIUM: { color: '#ff8c00', backgroundColor: 'rgba(255, 140, 0, 0.2)' },
      LOW: { color: '#00d4ff', backgroundColor: 'rgba(0, 212, 255, 0.2)' },
      MINIMAL: { color: '#00ff41', backgroundColor: 'rgba(0, 255, 65, 0.2)' },
    };
    return styles[level] || { color: '#9ca3af', backgroundColor: 'rgba(156, 163, 175, 0.2)' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div 
      className="rounded-xl p-6"
      style={{ 
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(0, 255, 65, 0.3)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center" style={{ color: '#00ff41' }}>
          <FiClock className="mr-2" />
          RECENT SCANS
        </h2>
        <Link
          to="/scans"
          className="text-sm flex items-center transition-colors"
          style={{ color: '#00ff41' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(0, 255, 65, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#00ff41'}
        >
          View All <FiExternalLink className="ml-1" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="h-16 rounded-lg animate-pulse"
              style={{ backgroundColor: '#2a2a2a' }}
            ></div>
          ))}
        </div>
      ) : scans.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No scans yet</p>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <motion.div
              key={scan._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                border: '1px solid rgba(0, 255, 65, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.1)';
              }}
            >
              <div className="flex-1">
                <p className="text-white font-mono text-sm truncate">{scan.url}</p>
                <p className="text-gray-500 text-xs mt-1">{formatDate(scan.timestamp)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={getThreatLevelStyle(scan.threatLevel)}
                >
                  {scan.threatLevel}
                </span>
                <span className="font-bold" style={{ color: '#00ff41' }}>{scan.threatScore}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentScans;