const express = require('express');
const router = express.Router();
const { scanURL, getRecentScans } = require('../controllers/scanController');

router.post('/analyze', scanURL);
router.get('/recent', getRecentScans);

module.exports = router;