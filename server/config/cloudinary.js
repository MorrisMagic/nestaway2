// Load environment variables first
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
try {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  // Test Cloudinary configuration
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️  Cloudinary credentials are missing in environment variables');
    console.warn('   Please add the following to your .env file:');
    console.warn('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.warn('   CLOUDINARY_API_KEY=your_api_key');
    console.warn('   CLOUDINARY_API_SECRET=your_api_secret');
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    console.log('✅ Cloudinary configured successfully');
  }
} catch (error) {
  console.error('❌ Error configuring Cloudinary:', error);
}

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return {
      folder: 'nestaway/properties',
      format: 'jpg',
      public_id: `property_${timestamp}_${random}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = { cloudinary, upload };