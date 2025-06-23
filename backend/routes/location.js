const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes protected
router.use(protect);

// Update vehicle location (admin, agent, driver)
router.post('/update', authorize('admin', 'agent', 'driver'), locationController.updateLocation);
// Get current location for a vehicle
router.get('/:vehicleId', authorize('admin', 'agent', 'driver'), locationController.getLocationByVehicle);
// Get all vehicle locations (for map)
router.get('/', authorize('admin', 'agent', 'driver'), locationController.getAllLocations);
// Get location history for a vehicle
router.get('/history/:vehicleId', authorize('admin', 'agent', 'driver'), locationController.getLocationHistory);
// Get current location for a driver
router.get('/driver/:driverId', authorize('admin', 'agent', 'driver'), locationController.getLocationByDriver);

module.exports = router; 