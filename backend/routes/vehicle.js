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

// --- Maintenance ---
router.get('/:id/maintenance', authorize('admin', 'agent'), vehicleController.getVehicleMaintenance);
router.post('/:id/maintenance', authorize('admin', 'agent'), vehicleController.addVehicleMaintenance);
router.put('/:id/maintenance/:maintId', authorize('admin', 'agent'), vehicleController.updateVehicleMaintenance);
router.delete('/:id/maintenance/:maintId', authorize('admin', 'agent'), vehicleController.deleteVehicleMaintenance);

// --- Fuel Logs ---
router.get('/:id/fuel', authorize('admin', 'agent'), vehicleController.getVehicleFuelLogs);
router.post('/:id/fuel', authorize('admin', 'agent'), vehicleController.addVehicleFuelLog);
router.put('/:id/fuel/:fuelId', authorize('admin', 'agent'), vehicleController.updateVehicleFuelLog);
router.delete('/:id/fuel/:fuelId', authorize('admin', 'agent'), vehicleController.deleteVehicleFuelLog);

// --- Assignments ---
router.get('/:id/assignments', authorize('admin', 'agent'), vehicleController.getVehicleAssignments);
router.post('/:id/assignments', authorize('admin', 'agent'), vehicleController.addVehicleAssignment);
router.put('/:id/assignments/:assignId', authorize('admin', 'agent'), vehicleController.updateVehicleAssignment);
router.delete('/:id/assignments/:assignId', authorize('admin', 'agent'), vehicleController.deleteVehicleAssignment);

// --- Documents ---
router.get('/:id/documents', authorize('admin', 'agent'), vehicleController.getVehicleDocuments);
router.post('/:id/documents', authorize('admin', 'agent'), upload.single('file'), vehicleController.addVehicleDocument);
router.delete('/:id/documents/:docId', authorize('admin', 'agent'), vehicleController.deleteVehicleDocument);

module.exports = router; 