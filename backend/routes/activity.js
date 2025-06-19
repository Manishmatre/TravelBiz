const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, authorize(['admin', 'agent']), getActivities);

module.exports = router; 