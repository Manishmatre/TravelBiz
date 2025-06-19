const Location = require('../models/Location');
const Vehicle = require('../models/Vehicle');

// Update or create vehicle location
exports.updateLocation = async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed, status } = req.body;
    // Check agency access
    const vehicle = await Vehicle.findOne({ _id: vehicleId, agencyId: req.user.agencyId });
    if (!vehicle) {
      return res.status(403).json({ message: 'Forbidden: vehicle not in your agency' });
    }
    let location = await Location.findOne({ vehicleId });
    if (location) {
      location.latitude = latitude;
      location.longitude = longitude;
      location.speed = speed;
      location.status = status;
      location.updatedAt = new Date();
      await location.save();
    } else {
      location = await Location.create({ vehicleId, latitude, longitude, speed, status });
    }
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('locationUpdate', location);
    res.json(location);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get current location for a vehicle
exports.getLocationByVehicle = async (req, res) => {
  try {
    // Check agency access
    const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, agencyId: req.user.agencyId });
    if (!vehicle) {
      return res.status(403).json({ message: 'Forbidden: vehicle not in your agency' });
    }
    const location = await Location.findOne({ vehicleId: req.params.vehicleId });
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all vehicle locations (for map display)
exports.getAllLocations = async (req, res) => {
  try {
    // Only vehicles in this agency
    const vehicles = await Vehicle.find({ agencyId: req.user.agencyId }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);
    const locations = await Location.find({ vehicleId: { $in: vehicleIds } });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};