const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Client = require('../models/Client');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { vehicle, startDate, endDate, agent, status, pickup, destination } = req.body;

    // Sanitize driver field
    if (req.body.driver === '') {
      delete req.body.driver;
    }

    // Validate required fields
    if (!pickup || !pickup.name) return res.status(400).json({ message: 'Pickup location name is required' });
    if (!destination || !destination.name) return res.status(400).json({ message: 'Destination location name is required' });
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

// Get all bookings, with optional filters
exports.getBookings = async (req, res) => {
  let filter = {};
  try {
    if (req.query.client) filter.client = req.query.client;
    if (req.query.agent) filter.agent = req.query.agent;
    if (req.query.status) filter.status = req.query.status;

    // Fetch raw bookings and manually populate to avoid populate issues with schema drift
    const rawBookings = await Booking.find(filter).lean();

    const bookings = await Promise.all(rawBookings.map(async (booking) => {
      try {
        // Gracefully handle potentially missing linked documents
        const client = booking.client ? await Client.findById(booking.client).select('name email').lean() : null;
        const vehicle = booking.vehicle ? await Vehicle.findById(booking.vehicle).select('name numberPlate').lean() : null;
        const agent = booking.agent ? await User.findById(booking.agent).select('name email').lean() : null;
        const driver = booking.driver ? await User.findById(booking.driver).select('name email').lean() : null;
  
        // Ensure pickup and destination are in the object format for consistency
        const normalizedBooking = { ...booking };
        if (typeof booking.pickup === 'string') {
          normalizedBooking.pickup = { name: booking.pickup };
        }
        if (typeof booking.destination === 'string') {
          normalizedBooking.destination = { name: booking.destination };
        }
  
        return {
          ...normalizedBooking,
          client,
          vehicle,
          agent,
          driver,
        };
      } catch (e) {
        console.error(`Skipping booking due to error: ${booking._id}`, e);
        return null; // Return null for bookings that cause an error
      }
    }));
      
    res.json(bookings.filter(b => b !== null)); // Filter out nulls before sending
  } catch (err) {
    // Enhanced error logging
    console.error("Error in getBookings controller:", {
      message: err.message,
      stack: err.stack,
      query: req.query,
      filter: filter,
    });
    res.status(500).json({ 
      message: 'An internal server error occurred while fetching bookings.',
      error: err.message,
      filterUsed: filter,
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'client', select: 'name email phone avatarUrl' })
      .populate({ path: 'vehicle', select: 'name numberPlate vehicleType status photoUrl' })
      .populate({ path: 'agent', select: 'name email' })
      .populate({ path: 'driver', select: 'name email phone status licenseNumber licenseExpiry avatarUrl' })
      .lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { vehicle, status } = req.body;
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

// Update only the status of a booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bookings for the driver based on their assigned vehicle
exports.getBookingsByDriver = async (req, res) => {
  try {
    const driverId = req.user?._id;
    if (!driverId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Fetch bookings where the driver is assigned
    const bookings = await Booking.find({ driver: driverId })
      .populate('client', 'name email')
      .populate('vehicle', 'name numberPlate')
      .populate('agent', 'name email');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings by driver:', err);
    res.status(500).json({ message: 'Server error while fetching trips' });
  }
}; 