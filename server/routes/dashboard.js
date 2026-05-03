const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();
router.use(authenticate);
router.get('/', getDashboard);

module.exports = router;
