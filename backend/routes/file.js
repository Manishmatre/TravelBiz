const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/upload');
const activityController = require('../controllers/activityController');

// All routes protected
router.use(protect);

// Upload file (admin, agent)
router.post('/', authorize('admin', 'agent'), upload.single('file'), fileController.uploadFile);
// List files (admin, agent)
router.get('/', authorize('admin', 'agent'), fileController.getFiles);
// Activity log route
router.get('/activity', activityController.getActivities);
// Get file by ID
router.get('/:id', authorize('admin', 'agent'), fileController.getFileById);
// Delete file
router.delete('/:id', authorize('admin', 'agent'), fileController.deleteFile);

module.exports = router; 