import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const categories = [
  { label: "Beach", value: "beach" },
  { label: "Cabins", value: "cabins" },
  { label: "Tropical", value: "tropical" },
  { label: "Amazing views", value: "views" },
  { label: "Lake", value: "lake" },
  { label: "Design", value: "design" },
  { label: "Mansions", value: "mansions" },
  { label: "Tiny homes", value: "tiny" },
  { label: "Camping", value: "camping" },
  { label: "Skiing", value: "skiing" }
];

const amenitiesList = [
  "wifi", "kitchen", "parking", "pool", "hot-tub", "washer", 
  "dryer", "ac", "heating", "workspace", "tv", "bbq", "fireplace"
];

export default function CreateProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    category: "",
    roomType: "",
    beds: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    amenities: []
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length + images.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} is not an image file`);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} is larger than 5MB`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(invalidFiles.join(', '));
      return;
    }

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError("");
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index) => {
    // Revoke object URL
    if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Property title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return false;
    }
    if (!formData.category) {
      setError("Category is required");
      return false;
    }
    if (!formData.roomType) {
      setError("Room type is required");
      return false;
    }
    if (!formData.bedrooms || parseInt(formData.bedrooms) < 1) {
      setError("Number of bedrooms is required");
      return false;
    }
    if (!formData.beds || parseInt(formData.beds) < 1) {
      setError("Number of beds is required");
      return false;
    }
    if (!formData.bathrooms || parseFloat(formData.bathrooms) < 0.5) {
      setError("Number of bathrooms is required");
      return false;
    }
    if (!formData.maxGuests || parseInt(formData.maxGuests) < 1) {
      setError("Maximum guests is required");
      return false;
    }
    if (images.length === 0) {
      setError("Please upload at least one image");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('=== Frontend: Preparing FormData ===');
      console.log('Form data state:', formData);
      console.log('Images count:', images.length);
      
      const submitData = new FormData();
      
      // Append form data - ensure no empty strings for required fields
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.price.toString());
      submitData.append('location', formData.location.trim());
      submitData.append('category', formData.category);
      submitData.append('roomType', formData.roomType);
      submitData.append('beds', formData.beds.toString());
      submitData.append('bedrooms', formData.bedrooms.toString());
      submitData.append('bathrooms', formData.bathrooms.toString());
      submitData.append('maxGuests', formData.maxGuests.toString());
      
      // Append address as JSON
      submitData.append('address', JSON.stringify(formData.address));
      
      // Append amenities as JSON
      submitData.append('amenities', JSON.stringify(formData.amenities));

      // Append images
      images.forEach((image, index) => {
        console.log(`Appending image ${index + 1}:`, image.name, image.type, image.size);
        submitData.append('images', image);
      });

      // Log FormData contents (for debugging)
      console.log('FormData entries:');
      for (let pair of submitData.entries()) {
        if (pair[0] === 'images') {
          console.log(`${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      console.log('Sending request to /properties...');
      const response = await api.post('/properties', submitData);

      if (response.data) {
        alert('Property created successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response) {
        let errorMsg = error.response.data?.msg || error.response.data?.message || `Error: ${error.response.status}`;
        
        // Show detailed error if available
        if (error.response.data?.error) {
          errorMsg += `: ${error.response.data.error}`;
        }
        if (error.response.data?.details) {
          errorMsg += ` (${error.response.data.details})`;
        }
        
        // Show validation errors if present
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.join(', ');
        }
        
        // Show missing fields if present
        if (error.response.data?.missing) {
          const missingFields = Object.entries(error.response.data.missing)
            .filter(([_, isMissing]) => isMissing)
            .map(([field]) => field);
          if (missingFields.length > 0) {
            errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
          }
        }
        
        setError(errorMsg);
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(error.message || "Failed to create property. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
              <p className="text-gray-600">Share your space with travelers around the world</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    placeholder="Cozy beachfront apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  placeholder="Describe your property in detail..."
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Display Name *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  placeholder="Miami Beach, Florida"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Street address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                />
                <input
                  type="text"
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="entire-home">Entire Home</option>
                    <option value="private-room">Private Room</option>
                    <option value="shared-room">Shared Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beds *
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    required
                    min="0.5"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Guests *
                  </label>
                  <input
                    type="number"
                    name="maxGuests"
                    value={formData.maxGuests}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="w-4 h-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {amenity.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Photos</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#FF385C] transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block"
                >
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-2 font-medium">
                    Click to upload photos of your property
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload up to 10 photos (JPEG, PNG, JPG) - Max 5MB each
                  </p>
                  {images.length > 0 && (
                    <p className="text-sm text-[#FF385C] mt-2">
                      {images.length} {images.length === 1 ? 'image' : 'images'} selected
                    </p>
                  )}
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="px-6 py-3 bg-[#FF385C] text-white rounded-lg hover:bg-[#E61E4D] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

