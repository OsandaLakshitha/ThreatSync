const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['ip', 'domain', 'url', 'hash', 'unknown'], // Added 'unknown' as valid type
    required: true,
  },
  threatScore: {
    type: Number,
    default: 0,
  },
  threatLevel: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL'],
    default: 'MINIMAL',
  },
  tags: [{
    type: String,
  }],
  scanResults: {
    virustotal: {
      positives: Number,
      total: Number,
      status: String,
    },
    shodan: {
      ports: [Number],
      org: String,
      country: String,
      status: String,
    },
    otx: {
      pulseCount: Number,
      status: String,
    },
    whoisxml: {
      domainAgeDays: Number,
      registrar: String,
      status: String,
    },
  },
  anomalies: [{
    type: String,
  }],
  mitreTechniques: [{
    type: String,
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scan', scanSchema);