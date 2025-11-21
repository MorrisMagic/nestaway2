import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get("/properties");
      setProperties(response.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search filters:", searchFilters);
  };

  const updateFilters = (key, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const PropertyCard = ({ property }) => (
    <Link to={`/property/${property.id}`} className="block">
      <div className="flex flex-col gap-2 cursor-pointer group">
        <div className="relative overflow-hidden rounded-xl aspect-square">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button className="absolute top-3 right-3 p-2 bg-white rounded-full hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#FF385C]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-sm font-medium">{property.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">{property.location}</p>
          <p className="text-gray-500 text-sm">{property.dates}</p>
          
          <div className="flex items-center gap-1">
            <span className="font-semibold">${property.price}</span>
            <span className="text-gray-500 text-sm">night</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const CategoryButton = ({ icon, label }) => (
    <button className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
      <div className="p-4 rounded-full border border-gray-200 hover:border-gray-400">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF385C] rounded-full"></div>
              <span className="text-xl font-bold text-[#FF385C]">NestAway</span>
            </Link>

            {/* Search Bar - Medium screens and up */}
            <div className="hidden md:flex items-center border border-gray-300 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex divide-x">
                <button className="px-4 font-semibold">Anywhere</button>
                <button className="px-4 text-gray-500">Any week</button>
                <button className="px-4 text-gray-500">Add guests</button>
              </div>
              <div className="w-8 h-8 bg-[#FF385C] rounded-full p-2 ml-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="hidden md:block text-sm font-medium">Become a Host</button>
              <div className="flex items-center gap-2 border border-gray-300 rounded-full p-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-4">
            <div className="flex items-center border border-gray-300 rounded-full py-3 px-4 shadow-sm">
              <svg className="w-5 h-5 text-[#FF385C] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="flex-1">
                <div className="font-semibold text-sm">Anywhere</div>
                <div className="text-xs text-gray-500">Any week · Add guests</div>
              </div>
              <div className="w-8 h-8 border border-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex overflow-x-auto gap-8 pb-8 -mx-4 px-4 scrollbar-hide">
          <CategoryButton 
            label="Beach" 
            icon={<span className="text-2xl">🏖️</span>}
          />
          <CategoryButton 
            label="Cabins" 
            icon={<span className="text-2xl">🏠</span>}
          />
          <CategoryButton 
            label="Tropical" 
            icon={<span className="text-2xl">🌴</span>}
          />
          <CategoryButton 
            label="Amazing views" 
            icon={<span className="text-2xl">🏞️</span>}
          />
          <CategoryButton 
            label="Lake" 
            icon={<span className="text-2xl">🌊</span>}
          />
          <CategoryButton 
            label="Design" 
            icon={<span className="text-2xl">🎨</span>}
          />
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-12">
          <button className="border border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Show more
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button className="hover:underline">Help Center</button></li>
                <li><button className="hover:underline">AirCover</button></li>
                <li><button className="hover:underline">Safety information</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button className="hover:underline">NestAway.org</button></li>
                <li><button className="hover:underline">Support refugees</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hosting</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button className="hover:underline">Host your home</button></li>
                <li><button className="hover:underline">AirCover for Hosts</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Netaway</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button className="hover:underline">Newsroom</button></li>
                <li><button className="hover:underline">Careers</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 Netaway, Inc. · Privacy · Terms · Sitemap
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <button className="text-sm font-semibold flex items-center gap-2">
                🌐 English (US)
              </button>
              <button className="text-sm font-semibold">
                $ USD
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}