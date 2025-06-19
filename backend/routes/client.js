const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes protected
router.use(protect);

// Create client (admin, agent)
router.post('/', authorize('admin', 'agent'), clientController.createClient);
// Get all clients (admin, agent)
router.get('/', authorize('admin', 'agent'), clientController.getClients);
// Get client by ID
router.get('/:id', authorize('admin', 'agent'), clientController.getClientById);
// Update client
router.put('/:id', authorize('admin', 'agent'), clientController.updateClient);
// Delete client
router.delete('/:id', authorize('admin', 'agent'), clientController.deleteClient);

module.exports = router; 