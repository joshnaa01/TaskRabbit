import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Map as MapIcon, List, FilterX, Star, Phone, CalendarCheck } from 'lucide-react';
import FilterBar from '../../components/search/FilterBar';
import SearchBar from '../../components/search/SearchBar';
import ServiceCard from '../../components/search/ServiceCard';

// Fix Leaflet marker icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for User
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically update map view based on markers
function MapUpdater({ center, technicians }) {
  const map = useMap();
  useEffect(() => {
    if (technicians.length > 0) {
      // Bounds restricted strictly to technicians
      const bounds = L.latLngBounds(technicians.map(t => [t.provider.location.coordinates[1], t.provider.location.coordinates[0]]));
      
      // Check if user is near enough to include in viewport (< 100km)
      if (center) {
        const userLatLng = L.latLng(center[0], center[1]);
        const closestLatLng = L.latLng(technicians[0].provider.location.coordinates[1], technicians[0].provider.location.coordinates[0]);
        if (userLatLng.distanceTo(closestLatLng) < 100000) {
           bounds.extend(center);
        }
      }
      
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    } else if (center && technicians.length === 0) {
      map.setView(center, 13);
    }
  }, [center, technicians, map]);
  return null;
}

const NearbyTechnicians = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { coords, loading: geoLoading, error: geoError } = useLocation();
  const [params, setParams] = useState({
    keyword: searchParams.get('keyword') || '',
    radius: 50000, // Default to a global radius to always show test data
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: 0,
    sort: 'distance'
  });

  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

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

  const fetchServices = async () => {
    setSearchLoading(true);
    try {
      const res = await api.get('/services/nearby', {
        params: {
          lat: coords?.lat || 27.717,
          lng: coords?.lng || 85.324,
          radius: params.radius,
          keyword: params.keyword,
          category: params.category,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          rating: params.rating,
          limit: 100 // Load more for map, we can cluster
        }
      });
      let data = res.data.data || [];
      // Additional client-side sort if needed
      if (params.sort === 'rating') {
        data = data.sort((a, b) => (b.provider?.rating || 0) - (a.provider?.rating || 0));
      } else {
        data = data.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once location status is settled (either we got coords, or geoError happened causing coords to be null)
    if (coords || geoError) {
       fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, params, geoError]);

  const handleFilterChange = useCallback((newFilters) => {
    setParams(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback((newSearch) => {
    setParams(prev => ({ ...prev, ...newSearch }));
  }, []);

  const mapCenter = coords ? [coords.lat, coords.lng] : [27.717, 85.324];

  // Filter technicians that actually have valid coordinates
  const validTechnicians = useMemo(() => {
    return results.filter(s => s.provider?.location?.coordinates && s.provider.location.coordinates.length === 2) || [];
  }, [results]);

  // Group services by provider for the map topology
  const mapProviders = useMemo(() => {
    const providerMap = new Map();
    validTechnicians.forEach(service => {
      const pId = service.provider.id || service.provider._id;
      if (!providerMap.has(pId)) {
        providerMap.set(pId, {
          provider: service.provider,
          distance: service.distance,
          services: [service]
        });
      } else {
        providerMap.get(pId).services.push(service);
      }
    });
    return Array.from(providerMap.values());
  }, [validTechnicians]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full py-8 flex-grow flex flex-col">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
              Technician Radar
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {results.length > 0 ? `Found ${results.length} pros near you` : 'Discover nearby experts'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'map' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
            <select
              value={params.sort}
              onChange={(e) => setParams(p => ({...p, sort: e.target.value}))}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 outline-none"
            >
              <option value="distance">Nearest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} initialKeyword={params.keyword} />

        <FilterBar onFilterChange={handleFilterChange} categories={categories} />

        <div className="flex-grow flex flex-col mt-6 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative min-h-[500px]">
          {geoLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <Navigation className="w-10 h-10 text-blue-600 animate-pulse mb-4" />
              <h3 className="text-lg font-black text-slate-800">Locating you...</h3>
            </div>
          ) : viewMode === 'map' ? (
            <div className="relative flex-grow h-[600px] w-full z-0">
               {searchLoading && (
                 <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[1000] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                 </div>
               )}
               <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none">
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                 />
                 <Marker position={mapCenter} icon={userIcon}>
                   <Popup className="font-sans">
                     <div className="text-center p-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                         {coords ? 'Your Location' : 'Default Target'}
                       </span>
                     </div>
                   </Popup>
                 </Marker>

                 <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                   {mapProviders.map(({ provider, distance, services }) => {
                     const position = [provider.location.coordinates[1], provider.location.coordinates[0]];
                     return (
                       <Marker key={`provider-${provider.id}`} position={position}>
                         <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent className="bg-transparent border-0 shadow-none p-0 m-0 text-center">
                            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xl whitespace-nowrap text-slate-800 flex flex-col items-center">
                              <span className="text-[11px] font-black leading-tight truncate max-w-[150px]">
                                 {services.length > 1 ? `${services.length} Services` : services[0].title}
                              </span>
                              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-tight">{provider.name}</span>
                            </div>
                         </Tooltip>
                         <Popup className="font-sans min-w-[280px] max-w-[320px]">
                           <div className="flex flex-col gap-3 p-1">
                             <div className="flex items-center gap-3">
                               <img 
                                 src={provider.profilePicture || 'https://via.placeholder.com/40'} 
                                 alt={provider.name}
                                 className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                               />
                               <div className="flex-1">
                                 <h4 className="font-black text-slate-900 leading-tight m-0 text-base">{provider.name}</h4>
                                 <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-100">
                                      <MapPin className="w-3 h-3 text-slate-400" /> {distance} km
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold text-amber-600 border border-amber-100">
                                      <Star className="w-3 h-3 fill-amber-500" /> {provider.rating || 'New'} ({provider.reviewCount || 0})
                                    </div>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="mt-2 flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                               {services.map(srv => (
                                 <div key={srv._id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2 hover:border-blue-300 transition-colors shadow-sm relative overflow-hidden group">
                                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                   <div className="flex justify-between items-start gap-2">
                                     <div>
                                       <p className="text-[12px] font-black text-slate-900 leading-tight mb-0.5">{srv.title}</p>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{srv.category?.name || 'Standard'}</p>
                                     </div>
                                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">Rs.{srv.price}</span>
                                   </div>
                                   <p className="text-[10px] font-medium text-slate-500 leading-snug line-clamp-2">{srv.description}</p>
                                   <div className="flex items-center gap-2 mt-1">
                                       <button 
                                         onClick={() => navigate(`/service/${srv._id}`)}
                                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shadow-md shadow-blue-500/20"
                                       >
                                         <CalendarCheck className="w-3 h-3" /> Book
                                       </button>
                                       <button 
                                         className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                       >
                                         <Phone className="w-3 h-3" /> Call
                                       </button>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </Popup>
                       </Marker>
                     );
                   })}
                 </MarkerClusterGroup>

                 {/* Uber-style Radar Network Connections */}
                 {mapProviders.map(({ provider }) => {
                   const providerPos = [provider.location.coordinates[1], provider.location.coordinates[0]];
                   return (
                     <Polyline 
                        key={`line-provider-${provider.id}`} 
                        positions={[mapCenter, providerPos]} 
                        color="#3b82f6" 
                        weight={3} 
                        opacity={0.3} 
                        dashArray="5, 15"
                        lineCap="round"
                        className="animate-pulse"
                     />
                   );
                 })}

                 <MapUpdater center={mapCenter} technicians={validTechnicians} />
               </MapContainer>
            </div>
          ) : (
            <div className="p-6">
               {searchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-80 bg-slate-50 rounded-3xl animate-pulse"></div>
                  ))}
                </div>
               ) : results.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {results.map((service) => (
                     <ServiceCard key={service._id} service={service} />
                   ))}
                 </div>
               ) : (
                 <div className="h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-6 rounded-full border border-slate-100 mb-6">
                      <FilterX className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No technicians found</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">We couldn't find any service providers matching your current filters within your area.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyTechnicians;
