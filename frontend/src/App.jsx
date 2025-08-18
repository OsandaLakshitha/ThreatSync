import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scans from './pages/scans';
import Charts from './pages/Charts';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-white" style={{ backgroundColor: '#0a0a0a' }}>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#00ff41',
              border: '1px solid #00ff41',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="scans" element={<Scans />} />
            <Route path="charts" element={<Charts />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;