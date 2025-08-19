const Scan = require('../models/Scan');
const ThreatStats = require('../models/ThreatStats');
const axios = require('axios');

// Helper function to determine IOC type
const getIOCType = (ioc) => {
  // Remove protocol if present
  const cleanedIOC = ioc.replace(/^https?:\/\//, '').trim();
  
  // IP address patterns
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  // Hash patterns
  const md5Pattern = /^[a-fA-F0-9]{32}$/;
  const sha1Pattern = /^[a-fA-F0-9]{40}$/;
  const sha256Pattern = /^[a-fA-F0-9]{64}$/;
  
  // URL pattern (must start with http:// or https://)
  const urlPattern = /^https?:\/\/.+/;
  
  // Domain pattern - improved to handle subdomains and TLDs better
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$/;
  
  // Check if it's a full URL
  if (urlPattern.test(ioc)) {
    return 'url';
  }
  
  // Check the cleaned IOC (without protocol)
  const domainPart = cleanedIOC.split('/')[0].split(':')[0]; // Remove path and port
  
  // Check for IP addresses
  if (ipv4Pattern.test(domainPart) || ipv6Pattern.test(domainPart)) {
    return 'ip';
  }
  
  // Check for hashes
  if (md5Pattern.test(cleanedIOC) || sha1Pattern.test(cleanedIOC) || sha256Pattern.test(cleanedIOC)) {
    return 'hash';
  }
  
  // Check for domain
  if (domainPattern.test(domainPart)) {
    return 'domain';
  }
  
  // If nothing matches, treat as domain (most common case)
  return 'domain';
};

// Known safe domains
const SAFE_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'amazon.com',
  'microsoft.com', 'apple.com', 'wikipedia.org', 'linkedin.com', 'instagram.com',
  'netflix.com', 'reddit.com', 'github.com', 'stackoverflow.com', 'cloudflare.com',
  'mozilla.org', 'wordpress.com', 'adobe.com', 'spotify.com', 'paypal.com',
  'yahoo.com', 'bing.com', 'ebay.com', 'dropbox.com', 'slack.com'
];

// Known suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /bit\.ly/, /tinyurl\.com/, /goo\.gl/, /ow\.ly/, /is\.gd/, /buff\.ly/,
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
  /[0-9a-f]{32,}/, // Potential hashes in domain
  /\.tk$/, /\.ml$/, /\.ga$/, /\.cf$/, // Free domains often used for scams
  /[0-9]{4,}/, // Many numbers in domain
  /-{3,}/, // Multiple hyphens
  /xn--/, // Punycode (internationalized domains that might be spoofing)
];

// Malicious keywords
const MALICIOUS_KEYWORDS = [
  'phishing', 'malware', 'virus', 'trojan', 'ransomware', 'botnet',
  'crack', 'keygen', 'hack', 'exploit', 'payload', 'c2server',
  'free-money', 'earn-cash', 'bitcoin-generator', 'paypal-gift'
];

// Calculate realistic threat score
const calculateThreatScore = (url, scanResults) => {
  let score = 0;
  const reasons = [];
  
  // Check if it's a known safe domain
  const domain = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
  if (SAFE_DOMAINS.some(safe => domain.includes(safe))) {
    score = 0;
    reasons.push('Trusted domain');
    return { score, threatLevel: 'MINIMAL', reasons };
  }

  // Check for suspicious patterns
  let suspiciousCount = 0;
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(url)) {
      suspiciousCount++;
      score += 15;
    }
  });
  if (suspiciousCount > 0) {
    reasons.push(`${suspiciousCount} suspicious patterns detected`);
  }

  // Check for malicious keywords
  let maliciousCount = 0;
  MALICIOUS_KEYWORDS.forEach(keyword => {
    if (url.toLowerCase().includes(keyword)) {
      maliciousCount++;
      score += 25;
    }
  });
  if (maliciousCount > 0) {
    reasons.push(`${maliciousCount} malicious keywords found`);
  }

  // Check domain age (simulated)
  if (scanResults.whoisxml?.domainAgeDays < 30) {
    score += 20;
    reasons.push('Recently registered domain');
  } else if (scanResults.whoisxml?.domainAgeDays > 365) {
    score -= 10;
    reasons.push('Established domain (>1 year)');
  }

  // URL shortener penalty
  if (/bit\.ly|tinyurl|goo\.gl|ow\.ly/.test(url)) {
    score += 10;
    reasons.push('URL shortener detected');
  }

  // Check for IP address instead of domain
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    score += 20;
    reasons.push('Direct IP address access');
  }

  // Simulated VirusTotal results (more realistic)
  if (scanResults.virustotal?.positives > 0) {
    score += scanResults.virustotal.positives * 5;
    reasons.push(`${scanResults.virustotal.positives} security vendors flagged`);
  }

  // Simulated port scan results
  const openPorts = scanResults.shodan?.ports?.length || 0;
  if (openPorts > 20) {
    score += 15;
    reasons.push('Excessive open ports');
  } else if (openPorts > 10) {
    score += 10;
    reasons.push('Multiple open ports');
  }

  // OTX threat intelligence
  if (scanResults.otx?.pulseCount > 0) {
    score += scanResults.otx.pulseCount * 10;
    reasons.push(`Found in ${scanResults.otx.pulseCount} threat feeds`);
  }

  // Normalize score
  score = Math.min(100, Math.max(0, score));

  // Determine threat level
  let threatLevel = 'MINIMAL';
  if (score >= 80) threatLevel = 'CRITICAL';
  else if (score >= 60) threatLevel = 'HIGH';
  else if (score >= 40) threatLevel = 'MEDIUM';
  else if (score >= 20) threatLevel = 'LOW';

  return { score, threatLevel, reasons };
};

// Generate realistic tags
// Generate realistic tags
const generateTags = (url, scanResults, threatScore) => {
  const tags = [];
  const domain = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();

  // Safe domain tags
  if (SAFE_DOMAINS.some(safe => domain.includes(safe))) {
    tags.push('trusted', 'verified');
    return tags;
  }

  // Threat level tags
  if (threatScore >= 80) tags.push('dangerous');
  if (threatScore >= 60) tags.push('suspicious');
  
  // Only add malware tag if there are actual detections
  if (scanResults.virustotal?.positives > 5) {
    tags.push('malware');
  }
  if (scanResults.virustotal?.positives > 10) {
    tags.push('confirmed-threat');
  }
  
  // URL characteristics
  if (/bit\.ly|tinyurl|goo\.gl/.test(url)) tags.push('url-shortener');
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) tags.push('ip-address');
  if (scanResults.whoisxml?.domainAgeDays < 7) tags.push('newly-registered');
  if (scanResults.whoisxml?.domainAgeDays < 30) tags.push('recent-domain');
  
  // Port scan tags
  if (scanResults.shodan?.ports?.length > 10) tags.push('exposed');
  if (scanResults.shodan?.ports?.includes(22)) tags.push('ssh-open');
  if (scanResults.shodan?.ports?.includes(3389)) tags.push('rdp-open');
  
  // Threat intelligence tags
  if (scanResults.otx?.pulseCount > 0) tags.push('known-threat');
  
  // Only add clean tag if no threats detected
  if (threatScore === 0 && scanResults.virustotal?.positives === 0) {
    tags.push('clean', 'safe');
  }

  // Remove duplicates
  return [...new Set(tags)];
};

// Main scan function
// Main scan function - Updated scanResults section
exports.scanURL = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Clean and validate input
    const cleanedUrl = url.trim();
    if (!cleanedUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid URL, IP, domain, or hash',
      });
    }
    
    const type = getIOCType(cleanedUrl);
    
    // Extract domain for analysis
    let domain = cleanedUrl.replace(/^https?:\/\//, '').split('/')[0].split(':')[0].toLowerCase();
    
    // For IP addresses, use the IP as the domain
    if (type === 'ip') {
      domain = cleanedUrl;
    }
    
    // For hashes, we'll skip domain-based checks
    if (type === 'hash') {
      domain = 'hash-analysis';
    }

    // Check various threat indicators
    const isSafeDomain = SAFE_DOMAINS.some(safe => domain.includes(safe));
    const isSuspicious = SUSPICIOUS_PATTERNS.some(pattern => pattern.test(cleanedUrl));
    const hasMaliciousKeywords = MALICIOUS_KEYWORDS.some(keyword => cleanedUrl.toLowerCase().includes(keyword));
    
    // Check for specific malicious indicators
    const hasPhishingIndicators = /paypal|amazon|microsoft|apple|bank|secure|account|verify|suspended|locked/i.test(cleanedUrl) && 
                                  !SAFE_DOMAINS.some(safe => domain.includes(safe));
    
    const hasSuspiciousTLD = /\.(tk|ml|ga|cf|click|download|top)$/i.test(domain);
    const hasIPAddress = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain);
    const isURLShortener = /bit\.ly|tinyurl|goo\.gl|ow\.ly|is\.gd|buff\.ly|short\.link/i.test(domain);

    // More realistic malware detection logic
    let virusTotalPositives = 0;
    
    if (isSafeDomain) {
      // Known safe domains should have 0 detections
      virusTotalPositives = 0;
    } else if (hasMaliciousKeywords) {
      // Domains with malicious keywords get high detections
      virusTotalPositives = Math.floor(Math.random() * 10) + 10;
    } else if (hasPhishingIndicators) {
      // Phishing indicators get moderate detections
      virusTotalPositives = Math.floor(Math.random() * 8) + 5;
    } else if (hasSuspiciousTLD || isURLShortener) {
      // Suspicious TLDs or URL shorteners might have some detections
      virusTotalPositives = Math.floor(Math.random() * 3) + 1;
    } else if (hasIPAddress) {
      // IP addresses might trigger a few detections
      virusTotalPositives = Math.floor(Math.random() * 2);
    } else {
      // Regular domains should typically have 0 detections
      // Only add detections if there are other suspicious patterns
      virusTotalPositives = isSuspicious ? Math.floor(Math.random() * 2) : 0;
    }

    const scanResults = {
      virustotal: {
        positives: virusTotalPositives,
        total: 70,
        status: 'SUCCESS',
      },
      shodan: {
        ports: type === 'ip' ? 
          (isSuspicious ? [22, 80, 443, 3389, 8080, 8443].filter(() => Math.random() > 0.3) : [80, 443].filter(() => Math.random() > 0.5)) : 
          [],
        org: 'Example Organization',
        country: 'United States',
        status: type === 'ip' ? 'SUCCESS' : 'SKIPPED',
      },
      otx: {
        pulseCount: (hasMaliciousKeywords || hasPhishingIndicators) ? Math.floor(Math.random() * 3) + 1 : 0,
        status: 'SUCCESS',
      },
      whoisxml: {
        domainAgeDays: type === 'domain' ? 
          (isSafeDomain ? Math.floor(Math.random() * 3650) + 365 : 
           hasSuspiciousTLD ? Math.floor(Math.random() * 30) :
           Math.floor(Math.random() * 730) + 30) : 
          null,
        registrar: 'Example Registrar',
        status: type === 'domain' ? 'SUCCESS' : 'SKIPPED',
      },
    };

    const { score, threatLevel, reasons } = calculateThreatScore(cleanedUrl, scanResults);
    const tags = generateTags(cleanedUrl, scanResults, score);

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
    if (hasIPAddress) {
      anomalies.push('Direct IP address instead of domain name');
    }

    // MITRE techniques
    const mitreTechniques = [];
    if (scanResults.shodan.ports.length > 0) {
      mitreTechniques.push('T1046 - Network Service Scanning');
    }
    if (scanResults.virustotal.positives > 0) {
      mitreTechniques.push('T1071 - Application Layer Protocol');
    }
    if (hasPhishingIndicators || hasMaliciousKeywords) {
      mitreTechniques.push('T1566 - Phishing');
    }

    // Save scan to database
    const scan = new Scan({
      url: cleanedUrl,
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