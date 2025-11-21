const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  images: [{
    url: String,
    public_id: String
  }],
  category: {
    type: String,
    enum: ['beach', 'cabins', 'tropical', 'views', 'lake', 'design', 'mansions', 'tiny', 'camping', 'skiing'],
    required: true
  },
  roomType: {
    type: String,
    enum: ['entire-home', 'private-room', 'shared-room'],
    required: true
  },
  beds: {
    type: Number,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  maxGuests: {
    type: Number,
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
propertySchema.index({ title: 'text', description: 'text', location: 'text' });
propertySchema.index({ category: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ location: 1 });

module.exports = mongoose.model("Property", propertySchema);

