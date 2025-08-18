import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const ScanInput = ({ onScanComplete }) => {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL to scan');
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/scan/analyze', { url });
      setResult(response.data.data);
      toast.success('Scan completed successfully');
      if (onScanComplete) onScanComplete();
    } catch (error) {
      toast.error('Failed to scan URL');
    } finally {
      setScanning(false);
    }
  };

  const getThreatLevelColor = (level) => {
    const colors = {
      CRITICAL: '#ff0040',
      HIGH: '#ffff00',
      MEDIUM: '#ff8c00',
      LOW: '#00d4ff',
      MINIMAL: '#00ff41',
    };
    return colors[level] || '#9ca3af';
  };

  return (
    <div 
      className="rounded-xl p-8"
      style={{ 
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(0, 255, 65, 0.3)'
      }}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#00ff41' }}>
        <FiSearch className="mr-3" />
        THREAT SCANNER
      </h2>

      <form onSubmit={handleScan} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL, IP, Domain, or Hash to scan..."
            className="w-full px-6 py-4 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid rgba(0, 255, 65, 0.3)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00ff41';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 65, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={scanning}
          />
          <button
            type="submit"
            disabled={scanning}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 font-bold rounded-lg transition-all duration-300"
            style={{
              backgroundColor: '#00ff41',
              color: '#000000',
              opacity: scanning ? 0.5 : 1,
              cursor: scanning ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!scanning) {
                e.target.style.backgroundColor = 'rgba(0, 255, 65, 0.8)';
                e.target.style.transform = 'translateY(-50%) scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#00ff41';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            {scanning ? (
              <FiLoader className="animate-spin text-xl" />
            ) : (
              'SCAN'
            )}
          </button>
        </div>
      </form>

      {/* Scan Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 rounded-lg"
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(0, 255, 65, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: '#00ff41' }}>SCAN RESULT</h3>
            <span 
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{
                color: getThreatLevelColor(result.threatLevel),
                border: `1px solid ${getThreatLevelColor(result.threatLevel)}`,
              }}
            >
              {result.threatLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Target</p>
              <p className="text-white font-mono">{result.url}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Threat Score</p>
              <div className="flex items-center space-x-2">
                <div 
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#2a2a2a' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${result.threatScore}%`,
                      backgroundColor: result.threatScore >= 80 ? '#ff0040' :
                                     result.threatScore >= 60 ? '#ffff00' :
                                     result.threatScore >= 40 ? '#ff8c00' :
                                     result.threatScore >= 20 ? '#00d4ff' :
                                     '#00ff41'
                    }}
                  ></div>
                </div>
                <span className="text-white font-bold">{result.threatScore}/100</span>
              </div>
            </div>
          </div>

          {result.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid rgba(0, 255, 65, 0.3)',
                      color: '#00ff41',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.anomalies.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Anomalies Detected</p>
              <ul className="space-y-1">
                {result.anomalies.map((anomaly, index) => (
                  <li key={index} className="text-sm flex items-center" style={{ color: '#ffff00' }}>
                    <span className="mr-2">⚠️</span> {anomaly}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ScanInput;