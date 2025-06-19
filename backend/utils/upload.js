const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'travelbiz_uploads',
    resource_type: 'auto',
    format: async (req, file) => undefined, // keep original
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary }; 