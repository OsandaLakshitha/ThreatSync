const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');

router.get('/chart-data', async (req, res) => {
  try {
    const scans = await Scan.find();
    
    // Prepare data for charts
    const threatLevels = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      MINIMAL: 0,
    };

    const tagCounts = {};
    const dailyScans = {};

    scans.forEach(scan => {
      // Count threat levels
      threatLevels[scan.threatLevel]++;

      // Count tags
      scan.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Count daily scans
      const date = new Date(scan.timestamp).toLocaleDateString();
      dailyScans[date] = (dailyScans[date] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        threatLevels,
        tagCounts,
        dailyScans,
        totalScans: scans.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data',
    });
  }
});

module.exports = router;