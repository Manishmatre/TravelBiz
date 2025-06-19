const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actionType: { type: String, required: true }, // e.g., create, update, delete
  entityType: { type: String, required: true }, // e.g., Client, Vehicle, File
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityName: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByName: { type: String },
  details: { type: Object }, // Optional: extra info about the action
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = mongoose.model('Activity', activitySchema); 