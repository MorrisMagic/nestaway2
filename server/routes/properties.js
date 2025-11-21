const express = require("express");
const Property = require("../models/Property");
const User = require("../models/User");
const { upload, cloudinary } = require("../config/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET ALL PROPERTIES WITH FILTERING AND PAGINATION
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      priceMin,
      priceMax,
      beds,
      roomType,
      guests
    } = req.query;

    const filter = { isAvailable: true };

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseInt(priceMin);
      if (priceMax) filter.price.$lte = parseInt(priceMax);
    }

    // Beds filter
    if (beds) {
      filter.beds = { $gte: parseInt(beds) };
    }

    // Room type filter
    if (roomType) {
      filter.roomType = roomType;
    }

    // Guests filter
    if (guests) {
      filter.maxGuests = { $gte: parseInt(guests) };
    }

    const properties = await Property.find(filter)
      .populate('host', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET SINGLE PROPERTY
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'firstName lastName')
      .populate('reviews.user', 'firstName lastName');

    if (!property) {
      return res.status(404).json({ msg: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE PROPERTY (HOST ONLY)
router.post("/", authMiddleware, (req, res, next) => {
  console.log('=== Multer Middleware ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('=== Multer Upload Error ===');
      console.error('Full error object:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Error name:', err.name);
      console.error('Error stack:', err.stack);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: "File size too large. Maximum size is 5MB" });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ msg: "Too many files. Maximum is 10 images" });
      }
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ msg: "Only image files are allowed" });
      }
      
      // Check for Cloudinary-specific errors
      if (err.message && (err.message.includes('Cloudinary') || err.message.includes('Invalid API'))) {
        console.error('Cloudinary configuration error detected');
        return res.status(500).json({ 
          msg: "Image upload service error. Please check Cloudinary configuration.",
          error: err.message 
        });
      }
      
      // Return more detailed error
      return res.status(400).json({ 
        msg: "File upload error", 
        error: err.message,
        details: err.toString()
      });
    }
    console.log('Multer processed successfully');
    console.log('Files after multer:', req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      console.log('First file info:', {
        fieldname: req.files[0].fieldname,
        originalname: req.files[0].originalname,
        mimetype: req.files[0].mimetype,
        size: req.files[0].size
      });
    }
    console.log('Body after multer:', req.body ? Object.keys(req.body) : 'no body');
    if (req.body) {
      console.log('Body values:', {
        title: req.body.title,
        category: req.body.category,
        roomType: req.body.roomType,
        price: req.body.price,
        location: req.body.location
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('=== Property Creation Request ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('User ID:', req.userId);
    
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ msg: "Image upload service not configured" });
    }

    const {
      title,
      description,
      price,
      location,
      address,
      coordinates,
      category,
      roomType,
      beds,
      bedrooms,
      bathrooms,
      amenities,
      maxGuests
    } = req.body;

    console.log('Extracted fields:', {
      title: !!title,
      description: !!description,
      price: !!price,
      location: !!location,
      category: !!category,
      roomType: !!roomType,
      beds: !!beds,
      bedrooms: !!bedrooms,
      bathrooms: !!bathrooms,
      maxGuests: !!maxGuests
    });

    // Validate required fields (check for empty strings too)
    const titleValid = title && title.trim().length > 0;
    const descriptionValid = description && description.trim().length > 0;
    const priceValid = price && price.toString().trim().length > 0;
    const locationValid = location && location.trim().length > 0;
    const categoryValid = category && category.trim().length > 0;
    const roomTypeValid = roomType && roomType.trim().length > 0;
    
    if (!titleValid || !descriptionValid || !priceValid || !locationValid || !categoryValid || !roomTypeValid) {
      const missing = {
        title: !titleValid,
        description: !descriptionValid,
        price: !priceValid,
        location: !locationValid,
        category: !categoryValid,
        roomType: !roomTypeValid
      };
      console.log('Validation failed - missing fields:', missing);
      console.log('Actual values received:', {
        title: title,
        description: description ? description.substring(0, 50) + '...' : 'empty',
        price: price,
        location: location,
        category: category,
        roomType: roomType
      });
      return res.status(400).json({ 
        msg: "Please fill in all required fields",
        missing
      });
    }

    // Check if user is verified to become a host
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found for ID:', req.userId);
      return res.status(404).json({ msg: "User not found" });
    }
    console.log('User found:', user.email, 'Verified:', user.verified);
    if (!user.verified) {
      return res.status(400).json({ msg: "Please verify your email to list a property" });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ msg: "At least one image is required" });
    }
    console.log('Files uploaded successfully:', req.files.length);

    // Process uploaded images - CloudinaryStorage returns path and filename
    const images = req.files.map((file, index) => {
      let publicId = file.filename;
      
      // Check if file was uploaded successfully
      if (!file.path) {
        console.error(`File ${index} upload failed - no path returned`);
        throw new Error(`Failed to upload image ${index + 1}`);
      }
      
      // If filename is not available, try to extract public_id from Cloudinary URL
      if (!publicId && file.path) {
        const urlMatch = file.path.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/i);
        if (urlMatch) {
          const pathParts = urlMatch[1].split('/');
          publicId = pathParts[pathParts.length - 1];
        }
      }
      
      // Fallback: generate a public_id if still not available
      if (!publicId) {
        publicId = `property_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }
      
      return {
        url: file.path, // Cloudinary secure URL
        public_id: publicId // Cloudinary public_id
      };
    });

    // Parse JSON fields if they exist
    let parsedAddress = {};
    if (address) {
      try {
        parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        parsedAddress = {};
      }
    }

    let parsedCoordinates = undefined;
    if (coordinates) {
      try {
        parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      } catch (e) {
        parsedCoordinates = undefined;
      }
    }

    let parsedAmenities = [];
    if (amenities) {
      try {
        parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      } catch (e) {
        parsedAmenities = [];
      }
    }

    // Create new property
    const property = new Property({
      title: title.trim(),
      description: description.trim(),
      price: parseInt(price),
      location: location.trim(),
      address: parsedAddress,
      coordinates: parsedCoordinates,
      category,
      roomType,
      beds: parseInt(beds) || 1,
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseFloat(bathrooms) || 1,
      amenities: Array.isArray(parsedAmenities) ? parsedAmenities : [],
      maxGuests: parseInt(maxGuests) || 1,
      images,
      host: req.userId
    });

    await property.save();
    await property.populate('host', 'firstName lastName');

    res.status(201).json({
      msg: "Property created successfully",
      property
    });
  } catch (err) {
    console.error('=== Error creating property ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Handle multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: "File size too large. Maximum size is 5MB" });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ msg: "Too many files. Maximum is 10 images" });
    }
    if (err.message === 'Only image files are allowed!') {
      return res.status(400).json({ msg: "Only image files are allowed" });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({ 
        msg: "Validation error", 
        errors
      });
    }
    
    // Check for Cloudinary errors
    if (err.message && err.message.includes('Cloudinary')) {
      console.error('Cloudinary error:', err);
      return res.status(500).json({ msg: "Image upload failed. Please check Cloudinary configuration." });
    }
    
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET USER'S PROPERTIES
router.get("/user/my-properties", authMiddleware, async (req, res) => {
  try {
    const properties = await Property.find({ host: req.userId })
      .populate('host', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

