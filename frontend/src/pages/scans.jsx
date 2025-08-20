import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiTag } from 'react-icons/fi';
import axios from 'axios';

const Scans = () => {
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');

  useEffect(() => {
    fetchScans();
  }, []);

  useEffect(() => {
    filterScans();
  }, [scans, searchTerm, filterLevel]);

  const fetchScans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/scan/recent');
      setScans(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch scans:', error);
      setLoading(false);
    }
  };

  const filterScans = () => {
    let filtered = scans;

    if (searchTerm) {
      filtered = filtered.filter(scan =>
        scan.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLevel !== 'ALL') {
      filtered = filtered.filter(scan => scan.threatLevel === filterLevel);
    }

    setFilteredScans(filtered);
  };

  const getThreatLevelStyle = (level) => {
    const styles = {
      CRITICAL: { 
        color: '#ff0040', 
        borderColor: '#ff0040', 
        backgroundColor: 'rgba(255, 0, 64, 0.1)' 
      },
      HIGH: { 
        color: '#ffff00', 
        borderColor: '#ffff00', 
        backgroundColor: 'rgba(255, 255, 0, 0.1)' 
      },
      MEDIUM: { 
        color: '#ff8c00', 
        borderColor: '#ff8c00', 
        backgroundColor: 'rgba(255, 140, 0, 0.1)' 
      },
      LOW: { 
        color: '#00d4ff', 
        borderColor: '#00d4ff', 
        backgroundColor: 'rgba(0, 212, 255, 0.1)' 
      },
      MINIMAL: { 
        color: '#00ff41', 
        borderColor: '#00ff41', 
        backgroundColor: 'rgba(0, 255, 65, 0.1)' 
      },
    };
    return styles[level] || { 
      color: '#9ca3af', 
      borderColor: '#9ca3af', 
      backgroundColor: 'rgba(156, 163, 175, 0.1)' 
    };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#00ff41' }}>SCAN HISTORY</h1>
        <p className="text-gray-400">View and analyze all security scans</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl p-6 mb-6"
        style={{ 
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(0, 255, 65, 0.3)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors"
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid rgba(0, 255, 65, 0.2)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00ff41';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 255, 65, 0.2)';
              }}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-white focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid rgba(0, 255, 65, 0.2)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00ff41';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 255, 65, 0.2)';
              }}
            >
              <option value="ALL">All Threat Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="MINIMAL">Minimal</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Scans Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl overflow-hidden"
        style={{ 
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(0, 255, 65, 0.3)'
        }}
      >
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-20 rounded-lg animate-pulse"
                  style={{ backgroundColor: '#2a2a2a' }}
                ></div>
              ))}
            </div>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No scans found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ 
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
              }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Threat Level</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(0, 255, 65, 0.1)' }}>
                {filteredScans.map((scan) => (
                  <motion.tr
                    key={scan._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(42, 42, 42, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-white font-mono text-sm truncate max-w-xs">{scan.url}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400 text-sm uppercase">{scan.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          ...getThreatLevelStyle(scan.threatLevel),
                          border: `1px solid ${getThreatLevelStyle(scan.threatLevel).borderColor}`
                        }}
                      >
                        {scan.threatLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-20 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: '#2a2a2a' }}
                        >
                          <div
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${scan.threatScore}%`,
                              backgroundColor: scan.threatScore >= 80 ? '#ff0040' :
                                             scan.threatScore >= 60 ? '#ffff00' :
                                             scan.threatScore >= 40 ? '#ff8c00' :
                                             scan.threatScore >= 20 ? '#00d4ff' :
                                             '#00ff41'
                            }}
                          ></div>
                        </div>
                        <span className="text-white font-bold text-sm">{scan.threatScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {scan.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: '#2a2a2a',
                              border: '1px solid rgba(0, 255, 65, 0.2)',
                              color: '#00ff41',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {scan.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-400">
                            +{scan.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {/* {formatDate(scan.timestamp)} */}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Scans;