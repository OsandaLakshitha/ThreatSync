const Scan = require('../models/Scan');
const ThreatStats = require('../models/ThreatStats');
const axios = require('axios');

// Helper function to determine IOC type
const getIOCType = (ioc) => {
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const urlPattern = /^https?:\/\/.+/;
  const md5Pattern = /^[a-fA-F0-9]{32}$/;
  const sha256Pattern = /^[a-fA-F0-9]{64}$/;
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (ipv4Pattern.test(ioc)) return 'ip';
  if (urlPattern.test(ioc)) return 'url';
  if (md5Pattern.test(ioc) || sha256Pattern.test(ioc)) return 'hash';
  if (domainPattern.test(ioc)) return 'domain';
  return 'unknown';
};

// Calculate threat score
const calculateThreatScore = (scanResults) => {
  let score = 0;
  const reasons = [];

  if (scanResults.virustotal?.positives > 0) {
    score += scanResults.virustotal.positives * 10;
    reasons.push(`${scanResults.virustotal.positives} malware detections`);
  }

  if (scanResults.shodan?.ports?.length > 0) {
    score += scanResults.shodan.ports.length * 5;
    reasons.push(`${scanResults.shodan.ports.length} open ports`);
  }

  if (scanResults.otx?.pulseCount > 0) {
    score += scanResults.otx.pulseCount * 15;
    reasons.push(`${scanResults.otx.pulseCount} threat pulses`);
  }

  if (scanResults.whoisxml?.domainAgeDays < 30) {
    score += 20;
    reasons.push('Newly registered domain');
  }

  score = Math.min(100, Math.max(0, score));

  let threatLevel = 'MINIMAL';
  if (score >= 80) threatLevel = 'CRITICAL';
  else if (score >= 60) threatLevel = 'HIGH';
  else if (score >= 40) threatLevel = 'MEDIUM';
  else if (score >= 20) threatLevel = 'LOW';

  return { score, threatLevel, reasons };
};

// Generate tags based on scan results
const generateTags = (scanResults, threatScore) => {
  const tags = [];

  if (threatScore >= 80) tags.push('dangerous');
  if (threatScore >= 60) tags.push('suspicious');
  if (scanResults.virustotal?.positives > 0) tags.push('malware');
  if (scanResults.virustotal?.positives > 10) tags.push('confirmed-threat');
  if (scanResults.shodan?.ports?.length > 10) tags.push('exposed');
  if (scanResults.whoisxml?.domainAgeDays < 7) tags.push('newly-registered');
  if (scanResults.otx?.pulseCount > 0) tags.push('known-threat');
  if (scanResults.whoisxml?.domainAgeDays < 30) tags.push('scam-risk');

  return tags;
};

// Main scan function
exports.scanURL = async (req, res) => {
  try {
    const { url } = req.body;
    const type = getIOCType(url);

    // Simulate API calls (replace with actual API calls)
    const scanResults = {
      virustotal: {
        positives: Math.floor(Math.random() * 20),
        total: 70,
        status: 'SUCCESS',
      },
      shodan: {
        ports: type === 'ip' ? [22, 80, 443, 3389].filter(() => Math.random() > 0.5) : [],
        org: 'Example Organization',
        country: 'United States',
        status: type === 'ip' ? 'SUCCESS' : 'SKIPPED',
      },
      otx: {
        pulseCount: Math.floor(Math.random() * 5),
        status: 'SUCCESS',
      },
      whoisxml: {
        domainAgeDays: type === 'domain' ? Math.floor(Math.random() * 3650) : null,
        registrar: 'Example Registrar',
        status: type === 'domain' ? 'SUCCESS' : 'SKIPPED',
      },
    };

    const { score, threatLevel, reasons } = calculateThreatScore(scanResults);
    const tags = generateTags(scanResults, score);

    // Detect anomalies
    const anomalies = [];
    if (scanResults.shodan.ports.length > 10) {
      anomalies.push('Excessive open ports detected');
    }
    if (scanResults.whoisxml?.domainAgeDays < 7) {
      anomalies.push('Domain registered within last week');
    }
    if (scanResults.virustotal.positives > 15) {
      anomalies.push('High malware detection rate');
    }

    // MITRE techniques
    const mitreTechniques = [];
    if (scanResults.shodan.ports.length > 0) {
      mitreTechniques.push('T1046 - Network Service Scanning');
    }
    if (scanResults.virustotal.positives > 0) {
      mitreTechniques.push('T1071 - Application Layer Protocol');
    }

    // Save scan to database
    const scan = new Scan({
      url,
      type,
      threatScore: score,
      threatLevel,
      tags,
      scanResults,
      anomalies,
      mitreTechniques,
    });

    await scan.save();

    // Update stats
    await updateStats(threatLevel);

    res.json({
      success: true,
      data: scan,
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan URL',
    });
  }
};

// Update threat statistics
const updateStats = async (threatLevel) => {
  try {
    let stats = await ThreatStats.findOne();
    if (!stats) {
      stats = new ThreatStats();
    }

    stats.totalScans += 1;
    
    if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH') {
      stats.threatsBlocked += 1;
    }

    switch (threatLevel) {
      case 'CRITICAL':
        stats.criticalThreats += 1;
        break;
      case 'HIGH':
        stats.highThreats += 1;
        break;
      case 'MEDIUM':
        stats.mediumThreats += 1;
        break;
      case 'LOW':
        stats.lowThreats += 1;
        break;
      case 'MINIMAL':
        stats.minimalThreats += 1;
        break;
    }

    stats.lastUpdated = Date.now();
    await stats.save();
  } catch (error) {
    console.error('Stats update error:', error);
  }
};

// Get recent scans
exports.getRecentScans = async (req, res) => {
  try {
    const scans = await Scan.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: scans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scans',
    });
  }
};