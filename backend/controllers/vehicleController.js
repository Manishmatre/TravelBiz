const Vehicle = require('../models/Vehicle');
const { cloudinary } = require('../utils/upload');
const Activity = require('../models/Activity');

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { name, vehicleType, numberPlate, insuranceExpiry, assignedClient, assignedTrip, driverName, driverContact, status } = req.body;
    let photoUrl = undefined;
    if (req.file && req.file.path) {
      photoUrl = req.file.path;
    }
    const vehicle = await Vehicle.create({
      name,
      vehicleType,
      numberPlate,
      insuranceExpiry,
      assignedClient,
      assignedTrip,
      driverName,
      driverContact,
      status,
      photoUrl,
    });
    // Log activity
    const activity = await Activity.create({
      actionType: 'create',
      entityType: 'Vehicle',
      entityId: vehicle._id,
      entityName: vehicle.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      details: { numberPlate: vehicle.numberPlate }
    });
    req.app.get('io').emit('activity', activity);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all vehicles (filter by status/type)
exports.getVehicles = async (req, res) => {
  try {
    const { status, vehicleType } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (vehicleType) filter.vehicleType = vehicleType;
    const vehicles = await Vehicle.find(filter).populate('assignedClient', 'name email');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedClient', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    // If new photo uploaded, update Cloudinary URL
    if (req.file && req.file.path) {
      vehicle.photoUrl = req.file.path;
    }
    Object.assign(vehicle, req.body);
    const updatedVehicle = await vehicle.save();
    // Log activity
    const activity = await Activity.create({
      actionType: 'update',
      entityType: 'Vehicle',
      entityId: updatedVehicle._id,
      entityName: updatedVehicle.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      details: req.body
    });
    req.app.get('io').emit('activity', activity);
    res.json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete vehicle (and photo from Cloudinary)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    // Remove photo from Cloudinary
    if (vehicle.photoUrl) {
      const publicId = vehicle.photoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy('travelbiz_uploads/' + publicId, { resource_type: 'image' });
    }
    const deletedVehicle = await vehicle.deleteOne();
    // Log activity
    const activity = await Activity.create({
      actionType: 'delete',
      entityType: 'Vehicle',
      entityId: deletedVehicle._id,
      entityName: deletedVehicle.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      details: { numberPlate: deletedVehicle.numberPlate }
    });
    req.app.get('io').emit('activity', activity);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 