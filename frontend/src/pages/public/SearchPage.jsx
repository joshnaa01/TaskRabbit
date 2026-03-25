import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';

import SearchBar from '../../components/search/SearchBar';
import FilterBar from '../../components/search/FilterBar';
import ServiceCard from '../../components/search/ServiceCard';
import { MapPin, Navigation, FilterX } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const { coords, loading: geoLoading, error: geoError } = useLocation();
  const [params, setParams] = useState({
    keyword: searchParams.get('keyword') || '',
    radius: 10,
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: 0
  });

  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch nearby services whenever params or coords change
  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return;

    const fetchServices = async () => {
      setSearchLoading(true);
      try {
        const res = await api.get('/services/nearby', {
          params: {
            lat: coords.lat,
            lng: coords.lng,
            radius: params.radius,
            keyword: params.keyword,
            category: params.category,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            rating: params.rating
          }
        });
        setResults(res.data.data || []);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchServices();
  }, [coords, params]);

  const handleFilterChange = useCallback((newFilters) => {
    setParams(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback((newSearch) => {
    setParams(prev => ({ ...prev, ...newSearch }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <div className="max-w-7xl mx-auto px-8 w-full py-8">
        
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
            {params.keyword ? `Search Results for "${params.keyword}"` : 'Discover Top Experts'}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">
            {results.length > 0 ? `Found ${results.length} verified pros in your area` : 'Showing premium services within your vicinity'}
          </p>
        </div>

        <SearchBar onSearch={handleSearch} initialKeyword={params.keyword} />

        <div className="flex items-center gap-2 mb-6 bg-blue-50 w-fit px-3 py-1.5 rounded-lg text-[9px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">
           <MapPin className="w-3 h-3" /> 
           Showing results within <span className="text-slate-900 font-black px-1.5">{params.radius} km</span>
        </div>

        <FilterBar onFilterChange={handleFilterChange} categories={categories} />

        <div className="pt-6">
          {geoLoading ? (
            <div className="h-72 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
              <Navigation className="w-10 h-10 text-blue-600 animate-pulse mb-4" />
              <h3 className="text-lg font-black text-slate-800">Locating you...</h3>
            </div>
          ) : geoError ? (
             <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 text-center">
              <MapPin className="w-12 h-12 text-red-500 mb-6 opacity-20" />
              <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Location Required</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-sm leading-relaxed text-sm">To find nearby services, please enable location access in your browser.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 text-xs"
              >
                Enable Permissions
              </button>
            </div>
          ) : searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-12 text-center">
              <div className="bg-slate-50 p-8 rounded-full mb-8 border border-slate-100">
                 <FilterX className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No experts found?</h3>
              <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed text-sm">No services matched your current filters within {params.radius}km. Try expanding your radius!</p>
              <button 
                onClick={() => setParams(p => ({ ...p, radius: 50 }))}
                className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 text-sm"
              >
                Look within 50km
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
