const Vehicle = require('../models/Vehicle');
const { cloudinary } = require('../utils/upload');
const Activity = require('../models/Activity');
const User = require('../models/User');

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
      agencyId: req.user.agencyId,
    });
    // Log activity
    const activity = await Activity.create({
      actionType: 'create',
      entityType: 'Vehicle',
      entityId: vehicle._id,
      entityName: vehicle.name,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
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
    let filter = { agencyId: req.user.agencyId };
    if (status) filter.status = status;
    if (vehicleType) filter.vehicleType = vehicleType;
    const vehicles = await Vehicle.find(filter)
      .populate('assignedClient', 'name email')
      .populate('assignedDriver', 'name email _id');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId }).populate('assignedClient', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
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
      agencyId: req.user.agencyId,
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
    const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
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
      agencyId: req.user.agencyId,
      details: { numberPlate: deletedVehicle.numberPlate }
    });
    req.app.get('io').emit('activity', activity);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Maintenance ---
exports.getVehicleMaintenance = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle.maintenance || []);
};

exports.addVehicleMaintenance = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  vehicle.maintenance.push(req.body);
  await vehicle.save();
  res.status(201).json(vehicle.maintenance[vehicle.maintenance.length - 1]);
};

exports.updateVehicleMaintenance = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const maint = vehicle.maintenance.id(req.params.maintId);
  if (!maint) return res.status(404).json({ message: 'Maintenance record not found' });
  Object.assign(maint, req.body);
  await vehicle.save();
  res.json(maint);
};

exports.deleteVehicleMaintenance = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const maint = vehicle.maintenance.id(req.params.maintId);
  if (!maint) return res.status(404).json({ message: 'Maintenance record not found' });
  maint.remove();
  await vehicle.save();
  res.json({ message: 'Maintenance record deleted' });
};

// --- Fuel Logs ---
exports.getVehicleFuelLogs = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle.fuelLogs || []);
};

exports.addVehicleFuelLog = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  vehicle.fuelLogs.push(req.body);
  await vehicle.save();
  res.status(201).json(vehicle.fuelLogs[vehicle.fuelLogs.length - 1]);
};

exports.updateVehicleFuelLog = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const log = vehicle.fuelLogs.id(req.params.fuelId);
  if (!log) return res.status(404).json({ message: 'Fuel log not found' });
  Object.assign(log, req.body);
  await vehicle.save();
  res.json(log);
};

exports.deleteVehicleFuelLog = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const log = vehicle.fuelLogs.id(req.params.fuelId);
  if (!log) return res.status(404).json({ message: 'Fuel log not found' });
  log.remove();
  await vehicle.save();
  res.json({ message: 'Fuel log deleted' });
};

// --- Assignments ---
exports.getVehicleAssignments = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId })
    .populate({ path: 'assignments.driver', select: 'name email' });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle.assignments || []);
};

exports.addVehicleAssignment = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  // Conflict check: is this vehicle already assigned to a driver?
  const alreadyAssigned = vehicle.assignments.find(a => a.status !== 'Unassigned');
  if (alreadyAssigned) {
    return res.status(409).json({ message: 'This vehicle is already assigned to a driver.' });
  }
  // Conflict check: is this driver already assigned to another vehicle?
  if (req.body.driver) {
    const driver = await User.findById(req.body.driver);
    if (driver && driver.assignedVehicle && String(driver.assignedVehicle) !== String(vehicle._id)) {
      return res.status(409).json({ message: 'This driver is already assigned to another vehicle.' });
    }
  }
  vehicle.assignments.push(req.body);
  // Set persistent assignedDriver field
  if (req.body.driver && req.body.status !== 'Unassigned') {
    vehicle.assignedDriver = req.body.driver;
  }
  await vehicle.save();
  // Update assignedVehicle on user if status is not 'Unassigned'
  if (req.body.driver && req.body.status !== 'Unassigned') {
    await User.findByIdAndUpdate(req.body.driver, { assignedVehicle: vehicle._id });
  }
  res.status(201).json(vehicle.assignments[vehicle.assignments.length - 1]);
};

exports.updateVehicleAssignment = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const assign = vehicle.assignments.id(req.params.assignId);
  if (!assign) return res.status(404).json({ message: 'Assignment not found' });
  // Conflict check: if updating to assigned, make sure no other assignment is active
  if (req.body.status !== 'Unassigned') {
    const otherAssigned = vehicle.assignments.find(a => a._id.toString() !== assign._id.toString() && a.status !== 'Unassigned');
    if (otherAssigned) {
      return res.status(409).json({ message: 'This vehicle is already assigned to another driver.' });
    }
    if (req.body.driver) {
      const driver = await User.findById(req.body.driver);
      if (driver && driver.assignedVehicle && String(driver.assignedVehicle) !== String(vehicle._id)) {
        return res.status(409).json({ message: 'This driver is already assigned to another vehicle.' });
      }
    }
  }
  Object.assign(assign, req.body);
  // Update persistent assignedDriver field
  if (req.body.driver && req.body.status !== 'Unassigned') {
    vehicle.assignedDriver = req.body.driver;
  }
  if (req.body.status === 'Unassigned') {
    vehicle.assignedDriver = null;
  }
  await vehicle.save();
  // Update assignedVehicle on user
  if (req.body.driver) {
    if (req.body.status === 'Unassigned') {
      await User.findOneAndUpdate({ _id: req.body.driver, assignedVehicle: vehicle._id }, { assignedVehicle: null });
    } else {
      await User.findByIdAndUpdate(req.body.driver, { assignedVehicle: vehicle._id });
    }
  }
  res.json(assign);
};

exports.deleteVehicleAssignment = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const assign = vehicle.assignments.id(req.params.assignId);
  if (!assign) return res.status(404).json({ message: 'Assignment not found' });
  // If this assignment was assigned, clear assignedVehicle on the user
  if (assign.driver && assign.status !== 'Unassigned') {
    await User.findOneAndUpdate({ _id: assign.driver, assignedVehicle: vehicle._id }, { assignedVehicle: null });
  }
  vehicle.assignments.pull(assign._id);
  await vehicle.save();
  res.json({ message: 'Assignment deleted' });
};

// --- Documents ---
exports.getVehicleDocuments = async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(vehicle.documents || []);
};

// Add a new document to a vehicle
exports.addVehicleDocument = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!req.file || !req.file.path) return res.status(400).json({ message: 'File is required' });
    console.log('Uploaded file:', req.file); // Debug log
    const { type, expiryDate, notes } = req.body;
    // Use Cloudinary public URL for fileUrl
    const fileUrl = req.file.path || req.file.filename || req.file.url;
    const doc = {
      type,
      expiryDate,
      notes,
      fileUrl,
      uploadedAt: new Date(),
    };
    vehicle.documents.push(doc);
    await vehicle.save();
    res.status(201).json(vehicle.documents[vehicle.documents.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a document from a vehicle
exports.deleteVehicleDocument = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const doc = vehicle.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.remove();
    await vehicle.save();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get the vehicle assigned to the current user (driver)
exports.getAssignedVehicle = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const user = await User.findById(userId).populate('assignedVehicle');
    if (!user || !user.assignedVehicle) {
      return res.status(404).json({ message: 'No assigned vehicle found' });
    }
    res.json(user.assignedVehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 