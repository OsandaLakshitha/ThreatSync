import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiBarChart2, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/scans', icon: FiSearch, label: 'Scans' },
    { path: '/charts', icon: FiBarChart2, label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Sidebar */}
      <div 
        className="w-64"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid rgba(0, 255, 65, 0.2)'
        }}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <FiShield className="text-3xl" style={{ color: '#00ff41' }} />
            <h1 className="text-2xl font-bold" style={{ color: '#00ff41' }}>ThreatSync</h1>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200`}
                  style={{
                    backgroundColor: isActive ? 'rgba(0, 255, 65, 0.2)' : 'transparent',
                    color: isActive ? '#00ff41' : '#9ca3af',
                    border: isActive ? '1px solid rgba(0, 255, 65, 0.5)' : '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#00ff41';
                      e.currentTarget.style.backgroundColor = 'rgba(42, 42, 42, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Matrix Rain Effect */}
        <div className="relative h-32 overflow-hidden mt-auto">
          <div className="absolute inset-0 opacity-20">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute text-xs animate-matrix"
                style={{
                  left: `${i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  color: '#00ff41',
                }}
              >
                {[...Array(20)].map((_, j) => (
                  <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;