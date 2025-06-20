const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'travelbiz_uploads',
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
    format: undefined, // keep original
    public_id: Date.now() + '-' + file.originalname,
  }),
});

const upload = multer({ storage });

module.exports = { upload, cloudinary }; 