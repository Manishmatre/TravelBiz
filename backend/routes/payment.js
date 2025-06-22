const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect, authorize('admin', 'agent'));

// Routes for payments related to a specific client
router.route('/client/:clientId')
  .get(paymentController.getPaymentsByClient)
  .post(paymentController.createPayment);

// Routes for a specific payment
router.route('/:paymentId')
  .put(paymentController.updatePayment)
  .delete(paymentController.deletePayment);

module.exports = router; 