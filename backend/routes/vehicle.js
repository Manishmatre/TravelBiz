const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/upload');

// All routes protected
router.use(protect);

// Create vehicle (admin, agent)
router.post('/', authorize('admin', 'agent'), upload.single('photo'), vehicleController.createVehicle);
// Get all vehicles (admin, agent)
router.get('/', authorize('admin', 'agent'), vehicleController.getVehicles);
// Get vehicle by ID
router.get('/:id', authorize('admin', 'agent'), vehicleController.getVehicleById);
// Update vehicle
router.put('/:id', authorize('admin', 'agent'), upload.single('photo'), vehicleController.updateVehicle);
// Delete vehicle
router.delete('/:id', authorize('admin', 'agent'), vehicleController.deleteVehicle);

module.exports = router; 