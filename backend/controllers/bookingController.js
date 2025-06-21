const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { vehicle, startDate, endDate, agent, status } = req.body;
    // Validate required fields
    if (!req.body.pickup) return res.status(400).json({ message: 'Pickup location is required' });
    if (!req.body.payment || !req.body.payment.mode || !req.body.payment.amountPaid) return res.status(400).json({ message: 'Payment details are required' });
    // Prevent overlapping bookings for the same vehicle
    if (vehicle && startDate) {
      const overlap = await Booking.findOne({
        vehicle,
        status: { $nin: ['Cancelled', 'Completed'] },
        $or: [
          { startDate: { $lte: new Date(endDate || startDate) }, endDate: { $gte: new Date(startDate) } },
          { startDate: { $lte: new Date(startDate) }, endDate: { $exists: false } },
        ],
      });
      if (overlap) {
        return res.status(409).json({ message: 'This vehicle is already booked for the selected time range.' });
      }
    }
    const booking = await Booking.create(req.body);
    // If booking is confirmed, update vehicle and driver assignment
    if (vehicle && status === 'Confirmed') {
      await Vehicle.findByIdAndUpdate(vehicle, { status: 'on-trip', assignedTrip: booking._id });
      if (agent) {
        await User.findByIdAndUpdate(agent, { assignedVehicle: vehicle });
      }
    }
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('bookingCreated', booking);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bookings, or by client if client param is present
exports.getBookings = async (req, res) => {
  try {
    const filter = req.query.client ? { client: req.query.client } : {};
    const bookings = await Booking.find(filter)
      .populate('client', 'name email')
      .populate('vehicle', 'name numberPlate')
      .populate('agent', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email')
      .populate('vehicle', 'name numberPlate')
      .populate('agent', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // If booking is completed or cancelled, update vehicle and driver status
    if (booking.vehicle && ['Completed', 'Cancelled'].includes(booking.status)) {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'available', assignedTrip: null });
      if (booking.agent) {
        await User.findByIdAndUpdate(booking.agent, { assignedVehicle: null });
      }
    }
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('bookingUpdated', booking);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('bookingDeleted', booking._id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 