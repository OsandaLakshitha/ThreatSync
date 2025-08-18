import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, title, value, color, loading }) => {
  const colorMap = {
    green: '#00ff41',
    red: '#ff0040',
    yellow: '#ffff00',
    purple: '#bd00ff',
  };

  const colorValue = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${colorValue}50`,
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 20px ${colorValue}20`,
      }}
            onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 30px ${colorValue}40, 0 0 60px ${colorValue}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 20px ${colorValue}20`;
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="text-3xl" style={{ color: colorValue }} />
        <div 
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: colorValue }}
        ></div>
      </div>
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">{title}</h3>
      {loading ? (
        <div className="h-8 rounded animate-pulse" style={{ backgroundColor: '#2a2a2a' }}></div>
      ) : (
        <p className="text-3xl font-bold" style={{ color: colorValue }}>
          {value.toLocaleString()}
        </p>
      )}
    </motion.div>
  );
};

export default StatsCard;