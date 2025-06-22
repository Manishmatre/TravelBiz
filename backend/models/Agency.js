const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  
  // Contact Information
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  
  // Social Media
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  
  // Branding
  logo: { type: String, default: '' },
  primaryColor: { type: String, default: '#3b82f6' }, // Default blue-500
  secondaryColor: { type: String, default: '#60a5fa' }, // Default blue-400
  
  // Business Information
  businessHours: {
    monday: { type: String, default: '9:00 AM - 6:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
    thursday: { type: String, default: '9:00 AM - 6:00 PM' },
    friday: { type: String, default: '9:00 AM - 6:00 PM' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  
  // Relationships
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agency', agencySchema);
