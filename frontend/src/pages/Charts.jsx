import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPieChart, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Charts = () => {
  const [chartData, setChartData] = useState({
    threatLevels: {},
    tagCounts: {},
    dailyScans: {},
    totalScans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/threats/chart-data');
      setChartData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setLoading(false);
    }
  };

  // Prepare data for charts
  const threatLevelData = Object.entries(chartData.threatLevels).map(([level, count]) => ({
    name: level,
    value: count,
  }));

  const tagData = Object.entries(chartData.tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({
      tag,
      count,
    }));

  const dailyData = Object.entries(chartData.dailyScans)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-7)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans: count,
    }));

  const COLORS = {
    CRITICAL: '#ff0040',
    HIGH: '#ffff00',
    MEDIUM: '#ff8c00',
    LOW: '#00d4ff',
    MINIMAL: '#00ff41',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg"
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(0, 255, 65, 0.5)',
          }}
        >
          <p className="font-semibold" style={{ color: '#00ff41' }}>{label}</p>
                    <p className="text-white">{`Value: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#00ff41' }}>THREAT ANALYTICS</h1>
        <p className="text-gray-400">Visual analysis of security threats and patterns</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="rounded-xl p-6 h-96 animate-pulse"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(0, 255, 65, 0.3)',
              }}
            >
              <div className="h-8 rounded mb-4" style={{ backgroundColor: '#2a2a2a' }}></div>
              <div className="h-full rounded" style={{ backgroundColor: '#2a2a2a' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Threat Level Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(0, 255, 65, 0.3)',
            }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: '#00ff41' }}>
              <FiPieChart className="mr-2" />
              THREAT LEVEL DISTRIBUTION
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatLevelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {threatLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tag Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(0, 255, 65, 0.3)',
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: '#00ff41' }}>
                <FiBarChart2 className="mr-2" />
                TOP THREAT TAGS
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="tag" 
                      stroke="#00ff41"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#00ff41" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#00ff41" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Daily Scans Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(0, 255, 65, 0.3)',
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: '#00ff41' }}>
                <FiTrendingUp className="mr-2" />
                DAILY SCAN ACTIVITY
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="date" stroke="#00ff41" />
                    <YAxis stroke="#00ff41" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#00ff41" 
                      strokeWidth={2}
                      dot={{ fill: '#00ff41', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-6"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(0, 255, 65, 0.3)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase mb-2">Total Scans</p>
                <p className="text-3xl font-bold" style={{ color: '#00ff41' }}>{chartData.totalScans}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase mb-2">Critical Threats</p>
                <p className="text-3xl font-bold" style={{ color: '#ff0040' }}>{chartData.threatLevels.CRITICAL || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase mb-2">High Risk</p>
                <p className="text-3xl font-bold" style={{ color: '#ffff00' }}>{chartData.threatLevels.HIGH || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase mb-2">Safe Scans</p>
                <p className="text-3xl font-bold" style={{ color: '#00ff41' }}>{chartData.threatLevels.MINIMAL || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Charts;