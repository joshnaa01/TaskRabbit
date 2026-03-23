import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';

import SearchBar from '../../components/search/SearchBar';
import FilterSidebar from '../../components/search/FilterSidebar';
import ServiceCard from '../../components/search/ServiceCard';
import { MapPin, Search, Navigation, FilterX } from 'lucide-react';

const SearchPage = () => {
  const { coords, loading: geoLoading, error: geoError } = useLocation();
  const [params, setParams] = useState({
    keyword: '',
    radius: 10,
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: 0
  });

  const { data: categories } = useQuery({
     queryKey: ['categories'],
     queryFn: async () => {
        const res = await api.get('/categories');
        return res.data.data;
     }
  });

  const { data: results, isLoading: searchLoading, refetch } = useQuery({
    queryKey: ['nearby-services', params, coords],
    queryFn: async () => {
      // If no location, don't fetch or return empty (backend will error anyway)
      if (!coords?.lat || !coords?.lng) return { data: [] };
      
      const res = await api.get('/services/nearby', {
        params: {
          lat: coords.lat,
          lng: coords.lng,
          radius: params.radius, // Pass KM value directly, backend handles conversion
          keyword: params.keyword,
          category: params.category,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          rating: params.rating
        }
      });
      return res.data;
    },
    enabled: !!coords?.lat && !!coords?.lng
  });

  const handleFilterChange = useCallback((newFilters) => {
    setParams(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback((newSearch) => {
    setParams(prev => ({ ...prev, ...newSearch }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <div className="max-w-7xl mx-auto px-8 w-full py-12">
        
        {/* Search Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Find Local Experts</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Showing premium services within your vicinity</p>
        </div>

        <SearchBar onSearch={handleSearch} initialKeyword={params.keyword} />

        <div className="flex items-center gap-2 mb-8 bg-blue-50 w-fit px-4 py-2 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">
           <MapPin className="w-3 h-3" /> 
           Showing results within <span className="text-slate-900 font-black px-1.5">{params.radius} km</span> of your location
        </div>

        <div className="flex flex-col lg:flex-row gap-12 pt-8">
          {/* Sidebar */}
          <FilterSidebar onFilterChange={handleFilterChange} categories={categories || []} />

          {/* Main Results Section */}
          <div className="flex-1">
            {geoLoading ? (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
                <Navigation className="w-12 h-12 text-blue-600 animate-pulse mb-6" />
                <h3 className="text-xl font-black text-slate-800">Locating you...</h3>
              </div>
            ) : geoError ? (
               <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-10 text-center">
                <MapPin className="w-16 h-16 text-red-500 mb-8 opacity-20" />
                <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight leading-tight">Location Access Required</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-sm leading-relaxed">To find nearby services, please enable location access in your browser or enter a location manually.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-200"
                >
                  Enable Permissions
                </button>
              </div>
            ) : searchLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2, 4, 5].map(i => (
                  <div key={i} className="h-[500px] bg-slate-100 rounded-[40px] animate-pulse"></div>
                ))}
              </div>
            ) : results?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {results.data.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-20 text-center">
                <div className="bg-slate-50 p-10 rounded-full mb-10 border border-slate-100">
                   <FilterX className="w-16 h-16 text-slate-200" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No experts found?</h3>
                <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto leading-relaxed">No services matched your current filters within {params.radius}km. Try expanding your radius or checking other categories!</p>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setParams(p => ({ ...p, radius: 50 }))}
                     className="px-10 py-5 bg-blue-600 text-white font-black rounded-[24px] hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200"
                   >
                     Look within 50km
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
