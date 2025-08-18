const express = require('express');
const router = express.Router();
const ThreatStats = require('../models/ThreatStats');

router.get('/', async (req, res) => {
  try {
    let stats = await ThreatStats.findOne();
    if (!stats) {
      stats = new ThreatStats();
      await stats.save();
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

module.exports = router;