const File = require('../models/File');
const Client = require('../models/Client');
const { cloudinary } = require('../utils/upload');
const Activity = require('../models/Activity');

// Upload a file
exports.uploadFile = async (req, res) => {
  try {
    const { title, fileType, clientId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const file = await File.create({
      title,
      fileType,
      clientId,
      uploadedBy: req.user._id,
      fileUrl: req.file.path || req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      agencyId: req.user.agencyId,
    });
    // Link file to client
    await Client.findByIdAndUpdate(clientId, { $push: { files: file._id } });
    await file.save();
    // Log activity
    const activity = await Activity.create({
      actionType: 'create',
      entityType: 'File',
      entityId: file._id,
      entityName: file.title,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
      details: { fileType: file.fileType }
    });
    req.app.get('io').emit('activity', activity);
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all files (filter by client, fileType, date)
exports.getFiles = async (req, res) => {
  try {
    const { clientId, fileType, startDate, endDate } = req.query;
    let filter = { agencyId: req.user.agencyId };
    if (clientId) filter.clientId = clientId;
    if (fileType) filter.fileType = fileType;
    if (startDate || endDate) {
      filter.uploadDate = {};
      if (startDate) filter.uploadDate.$gte = new Date(startDate);
      if (endDate) filter.uploadDate.$lte = new Date(endDate);
    }
    const files = await File.find(filter).populate('clientId', 'name').populate('uploadedBy', 'name email');
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, agencyId: req.user.agencyId }).populate('clientId', 'name').populate('uploadedBy', 'name email');
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete file (from Cloudinary and DB)
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, agencyId: req.user.agencyId }); // already enforced
    if (!file) return res.status(404).json({ message: 'File not found' });
    // Remove file from Cloudinary
    if (file.fileUrl) {
      // Extract public_id from URL
      const publicId = file.fileUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy('travelbiz_uploads/' + publicId, { resource_type: 'auto' });
    }
    const deletedFile = await file.deleteOne();
    // Log activity
    const activity = await Activity.create({
      actionType: 'delete',
      entityType: 'File',
      entityId: deletedFile._id,
      entityName: deletedFile.title,
      performedBy: req.user.id,
      performedByName: req.user.name,
      agencyId: req.user.agencyId,
      details: { fileType: deletedFile.fileType }
    });
    req.app.get('io').emit('activity', activity);
    // Remove file ref from client
    await Client.findByIdAndUpdate(file.clientId, { $pull: { files: file._id } });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 