import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

// Category data
const categories = [
  { label: "Beach", icon: "🏖️", value: "beach" },
  { label: "Cabins", icon: "🏠", value: "cabins" },
  { label: "Tropical", icon: "🌴", value: "tropical" },
  { label: "Amazing views", icon: "🏞️", value: "views" },
  { label: "Lake", icon: "🌊", value: "lake" },
  { label: "Design", icon: "🎨", value: "design" },
  { label: "Mansions", icon: "🏰", value: "mansions" },
  { label: "Tiny homes", icon: "🐛", value: "tiny" },
  { label: "Camping", icon: "⛺", value: "camping" },
  { label: "Skiing", icon: "⛷️", value: "skiing" }
];

// Filter options
const filterOptions = {
  price: [
    { label: "Any price", value: "any" },
    { label: "$0 - $100", value: "0-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "$200+", value: "200+" }
  ],
  rooms: [
    { label: "Any type", value: "any" },
    { label: "Private rooms", value: "private-room" },
    { label: "Entire homes", value: "entire-home" },
    { label: "Shared rooms", value: "shared-room" }
  ],
  beds: [
    { label: "Any beds", value: "any" },
    { label: "1+ beds", value: "1" },
    { label: "2+ beds", value: "2" },
    { label: "3+ beds", value: "3" }
  ]
};

// Search Modal Component
const SearchModal = ({ isOpen, onClose, onSearch, searchQuery, setSearchQuery }) => {
  const [activeTab, setActiveTab] = useState("stays");
  
  const popularSearches = [
    "Beachfront properties",
    "Cabins in the woods", 
    "Tropical getaways",
    "Mountain views",
    "City apartments",
    "Luxury villas"
  ];

  const recentSearches = [
    "New York",
    "Los Angeles",
    "Miami Beach",
    "Tokyo"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 max-w-2xl">
              <div className="flex border border-gray-300 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full outline-none text-lg font-medium"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onSearch(searchQuery);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Tabs */}
          <div className="flex gap-8 border-b border-gray-200">
            {["Stays", "Experiences", "Online Experiences"].map((tab) => (
              <button
                key={tab}
                className={`pb-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase().replace(' ', '-')
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Recent Searches */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Recent searches</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(search);
                  onSearch(search);
                }}
                className="px-4 py-3 border border-gray-300 rounded-full hover:border-gray-500 transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {search}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Popular searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(search);
                  onSearch(search);
                }}
                className="text-left p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{search}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-6">Browse by category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  setSearchQuery(category.label);
                  onSearch(category.label);
                }}
                className="flex flex-col items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-center">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    price: "any",
    rooms: "any",
    beds: "any"
  });
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, searchQuery, selectedCategory, filters, sortBy]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (filters.price !== 'any') {
        const [min, max] = filters.price.split('-');
        if (min) params.append('priceMin', min);
        if (max && max !== '+') params.append('priceMax', max);
      }
      if (filters.rooms !== 'any') params.append('roomType', filters.rooms);
      if (filters.beds !== 'any') params.append('beds', filters.beds);
      
      const response = await api.get(`/properties?${params.toString()}`);
      
      if (response.data && response.data.properties) {
        setProperties(response.data.properties);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Apply sorting
    switch (sortBy) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Recommended - keep original order from API
        break;
    }

    setFilteredProperties(filtered);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSearch = (query = searchQuery) => {
    setSearchQuery(query);
    setShowSearchModal(false);
    fetchProperties(); // Refetch with new search query
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFilters({
      price: "any",
      rooms: "any",
      beds: "any"
    });
    setSortBy("recommended");
    fetchProperties(); // Refetch without filters
  };

  const toggleFavorite = async (propertyId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // TODO: Implement favorite functionality
      console.log("Toggle favorite for property:", propertyId);
      // You'll need to add a favorites endpoint in your backend
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const PropertyCard = ({ property }) => (
    <Link to={`/property/${property._id || property.id}`} className="block group">
      <div className="flex flex-col gap-2 cursor-pointer">
        <div className="relative overflow-hidden rounded-xl aspect-square">
          <img
            src={property.images && property.images[0] ? property.images[0].url : '/default-property.jpg'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button 
            onClick={(e) => toggleFavorite(property._id || property.id, e)}
            className="absolute top-3 right-3 p-2 bg-white rounded-full hover:scale-110 transition-transform"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <svg className="w-4 h-4 text-[#FF385C]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">
                {property.rating || "New"}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm truncate">{property.location}</p>
          <p className="text-gray-500 text-sm">
            {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''} • {property.beds} bed{property.beds !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <span className="font-semibold">${property.price}</span>
            <span className="text-gray-500 text-sm">night</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const CategoryButton = ({ category }) => (
    <button
      onClick={() => handleCategorySelect(category.value)}
      className={`flex flex-col items-center gap-2 transition-transform min-w-[70px] ${
        selectedCategory === category.value 
          ? 'text-black border-b-2 border-black' 
          : 'text-gray-500 hover:text-black'
      }`}
    >
      <div className={`p-3 rounded-full border hover:border-black transition-colors ${
        selectedCategory === category.value ? 'border-black' : 'border-gray-300'
      }`}>
        <span className="text-xl">{category.icon}</span>
      </div>
      <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
    </button>
  );

  const FilterButton = ({ label, options, filterType }) => (
    <div className="relative group">
      <button className="px-4 py-2 border border-gray-300 rounded-full hover:border-gray-500 transition-colors text-sm font-medium">
        {label}
      </button>
      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <div className="p-2">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(filterType, option.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                filters[filterType] === option.value
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const loadMore = async () => {
    // TODO: Implement pagination
    console.log("Load more functionality to be implemented");
  };

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF385C] rounded-full"></div>
              <span className="text-xl font-bold text-[#FF385C]">NestAway</span>
            </Link>

            {/* Search Bar - Now clickable to open modal */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="w-full flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex-1 border-r border-gray-300 px-4 text-left">
                    <span className="text-sm font-semibold">
                      {searchQuery || "Anywhere"}
                    </span>
                  </div>
                  <div className="flex-1 border-r border-gray-300 px-4 text-left">
                    <span className="text-sm text-gray-600">Any week</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 text-gray-600">
                    <span className="text-sm">Add guests</span>
                    <div className="w-8 h-8 bg-[#FF385C] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    Hello, {user?.firstName?.split(" ")[0]}
                  </span>
                  <Link
                    to="/create-property"
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Add your place
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-[#FF385C] text-white rounded-full hover:bg-[#E61E4D] transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-[#FF385C] text-white rounded-full hover:bg-[#E61E4D] transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Categories and Filters */}
          <div className="flex items-center justify-between">
            {/* Categories Scroll */}
            <div className="flex gap-8 overflow-x-auto flex-1 scrollbar-hide">
              {categories.map(category => (
                <CategoryButton key={category.value} category={category} />
              ))}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:border-gray-500 transition-colors text-sm font-medium ml-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex gap-4 flex-wrap">
                <FilterButton label="Price" options={filterOptions.price} filterType="price" />
                <FilterButton label="Type of place" options={filterOptions.rooms} filterType="rooms" />
                <FilterButton label="Beds" options={filterOptions.beds} filterType="beds" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {filteredProperties.length} properties found
            {selectedCategory && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
            {searchQuery && ` for "${searchQuery}"`}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sorted by:</span>
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="border-none font-medium focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property._id || property.id} property={property} />
              ))}
            </div>

            {/* Show More */}
            <div className="text-center mt-12">
              <button 
                onClick={loadMore}
                className="border border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Show more
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E61E4D] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}