const Location = require('../models/Location');
const Vehicle = require('../models/Vehicle');

// Update or create vehicle location (now always creates for history)
exports.updateLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed, status } = req.body;
    // Check agency access
    const vehicle = await Vehicle.findOne({ _id: vehicleId, agencyId: req.user.agencyId });
    if (!vehicle) {
      return res.status(403).json({ message: 'Forbidden: vehicle not in your agency' });
    }
    // Always create a new location document for history
    const location = await Location.create({
      vehicleId,
      latitude,
      longitude,
      speed,
      status,
      updatedAt: new Date(),
      agencyId: req.user.agencyId,
    });
    // Emit real-time update (latest only)
    const io = req.app.get('io');
    io.emit('locationUpdate', location);
    res.json(location);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get current location for a vehicle (latest)
exports.getLocationByVehicle = async (req, res) => {
  try {
    // Check agency access
    const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, agencyId: req.user.agencyId });
    if (!vehicle) {
      return res.status(403).json({ message: 'Forbidden: vehicle not in your agency' });
    }
    const location = await Location.findOne({ vehicleId: req.params.vehicleId }).sort({ updatedAt: -1 });
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all vehicle locations (latest for each vehicle)
exports.getAllLocations = async (req, res) => {
  try {
    // Only vehicles in this agency
    const vehicles = await Vehicle.find({ agencyId: req.user.agencyId }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);
    // For each vehicle, get the latest location
    const locations = await Promise.all(vehicleIds.map(async (vid) => {
      return await Location.findOne({ vehicleId: vid }).sort({ updatedAt: -1 });
    }));
    res.json(locations.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get location history for a vehicle in a time range
exports.getLocationHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { from, to } = req.query;
    // Check agency access
    const vehicle = await Vehicle.findOne({ _id: vehicleId, agencyId: req.user.agencyId });
    if (!vehicle) {
      return res.status(403).json({ message: 'Forbidden: vehicle not in your agency' });
    }
    const query = { vehicleId };
    if (from || to) {
      query.updatedAt = {};
      if (from) query.updatedAt.$gte = new Date(from);
      if (to) query.updatedAt.$lte = new Date(to);
    }
    const history = await Location.find(query).sort({ updatedAt: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};