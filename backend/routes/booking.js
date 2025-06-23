const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
router.put('/:id/status', bookingController.updateBookingStatus);
router.get('/driver', protect, bookingController.getBookingsByDriver);
router.post('/repair-assignments', protect, authorize('admin'), bookingController.repairAssignments);

module.exports = router; 