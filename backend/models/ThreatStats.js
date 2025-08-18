const mongoose = require('mongoose');

const threatStatsSchema = new mongoose.Schema({
  totalScans: {
    type: Number,
    default: 0,
  },
  threatsBlocked: {
    type: Number,
    default: 0,
  },
  criticalThreats: {
    type: Number,
    default: 0,
  },
  highThreats: {
    type: Number,
    default: 0,
  },
  mediumThreats: {
    type: Number,
    default: 0,
  },
  lowThreats: {
    type: Number,
    default: 0,
  },
  minimalThreats: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ThreatStats', threatStatsSchema);