const Booking = require('../models/Booking');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { vehicle, startDate, pickup, payment } = req.body;
    // Validate required fields
    if (!pickup) return res.status(400).json({ message: 'Pickup location is required' });
    if (!payment || !payment.mode || !payment.amountPaid) return res.status(400).json({ message: 'Payment details are required' });
    // Prevent double booking for the same vehicle and date
    if (vehicle && startDate) {
      const conflict = await Booking.findOne({ vehicle, startDate: new Date(startDate) });
      if (conflict) {
        return res.status(409).json({ message: 'This vehicle is already booked for the selected date/time.' });
      }
    }
    const booking = await Booking.create(req.body);
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