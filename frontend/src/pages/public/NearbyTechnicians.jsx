import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, useMap, Polyline, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  List, 
  FilterX, 
  Star, 
  Phone, 
  CalendarCheck, 
  X, 
  Zap, 
  CheckCircle2, 
  Briefcase 
} from 'lucide-react';
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

function MapUpdater({ center, technicians }) {
  const map = useMap();
  useEffect(() => {
    if (technicians.length > 0) {
      const bounds = L.latLngBounds(technicians.map(t => [t.provider.location.coordinates[1], t.provider.location.coordinates[0]]));
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
    radius: 50, // Default to 50km
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
  const [selectedProviderId, setSelectedProviderId] = useState(null);

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
          limit: 100
        }
      });
      let data = res.data.data || [];
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
    if (coords || geoError) {
       fetchServices();
    }
  }, [coords, params, geoError]);

  const handleFilterChange = useCallback((newFilters) => {
    setParams(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback((newSearch) => {
    setParams(prev => ({ ...prev, ...newSearch }));
  }, []);

  const mapCenter = coords ? [coords.lat, coords.lng] : [27.717, 85.324];

  const validTechnicians = useMemo(() => {
    return results.filter(s => s.provider?.location?.coordinates && s.provider.location.coordinates.length === 2) || [];
  }, [results]);

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

  const selectedProviderData = useMemo(() => {
    if (!selectedProviderId) return null;
    return mapProviders.find(p => (p.provider?._id || p.provider?.id) === selectedProviderId);
  }, [mapProviders, selectedProviderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full py-8 flex-grow flex flex-col">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapIcon className="w-4 h-4 text-white" />
               </div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                 Technician Radar
               </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-10">
              {results.length > 0 ? `Found ${results.length} professional nodes in your perimeter` : 'Discover nearby experts'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} initialKeyword={params.keyword} />

        <FilterBar onFilterChange={handleFilterChange} categories={categories} />

        <div className="flex-grow flex flex-row mt-6 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-blue-900/10 overflow-hidden relative min-h-[650px]">
          <div className={`flex-grow relative h-full transition-all duration-500 ${selectedProviderData ? 'md:mr-[400px]' : ''}`}>
            {geoLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <Navigation className="w-10 h-10 text-blue-600 animate-pulse mb-4" />
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Global Positioning...</h3>
              </div>
            ) : viewMode === 'map' ? (
              <div className="relative h-[650px] w-full z-0">
                 {searchLoading && (
                   <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[1000] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                   </div>
                 )}
                 <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none">
                   <TileLayer
                     attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                     url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                   />
                   <Marker position={mapCenter} icon={userIcon}>
                     <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">You are here</span>
                     </Tooltip>
                   </Marker>

                   <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                     {mapProviders.map(({ provider, services }) => {
                       const position = [provider.location.coordinates[1], provider.location.coordinates[0]];
                       const pId = provider._id || provider.id;
                       const isSelected = selectedProviderId === pId;
                       
                       return (
                         <Marker 
                            key={`provider-${pId}`} 
                            position={position}
                            eventHandlers={{
                              click: () => setSelectedProviderId(pId)
                            }}
                          >
                           <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent={isSelected} className="bg-transparent border-0 shadow-none p-0 m-0 text-center">
                              <div className={`
                                px-4 py-2 rounded-2xl border transition-all duration-300 shadow-xl whitespace-nowrap flex flex-col items-center
                                ${isSelected 
                                  ? 'bg-blue-600 border-blue-400 text-white scale-110 -translate-y-2' 
                                  : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800 hover:border-blue-400'}
                              `}>
                                <span className={`text-[11px] font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                   {services.length > 1 ? `${services.length} Specialized Services` : services[0].title}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                   <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'} animate-pulse`}></div>
                                   <span className={`text-[9px] font-bold uppercase tracking-widest leading-tight ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>{provider.name}</span>
                                </div>
                              </div>
                           </Tooltip>
                         </Marker>
                       );
                     })}
                   </MarkerClusterGroup>

                   {mapProviders.map(({ provider }) => {
                     const providerPos = [provider.location.coordinates[1], provider.location.coordinates[0]];
                     return (
                       <Polyline 
                          key={`line-provider-${provider._id || provider.id}`} 
                          positions={[mapCenter, providerPos]} 
                          color="#3b82f6" 
                          weight={2} 
                          opacity={0.15} 
                          dashArray="10, 20"
                       />
                     );
                   })}

                   <MapUpdater center={mapCenter} technicians={validTechnicians} />
                 </MapContainer>
              </div>
            ) : (
              <div className="p-8 h-[650px] overflow-y-auto custom-scrollbar">
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
                   <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="bg-slate-50 p-8 rounded-full border border-slate-100 mb-6 ring-8 ring-slate-50/50">
                        <FilterX className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Zero Results Found</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">We couldn't find any service providers matching your current parameters in this area.</p>
                   </div>
                 )}
              </div>
            )}
          </div>

          {selectedProviderData && (
            <div className="absolute inset-y-0 right-0 w-full md:w-[400px] bg-white border-l border-slate-100 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-in slide-in-from-right duration-500">
               <div className="p-8 border-b border-slate-50 flex flex-col gap-6 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                     <button 
                        onClick={() => setSelectedProviderId(null)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-90"
                     >
                        <X className="w-4 h-4 text-slate-400" />
                     </button>
                     <div className="flex items-center gap-1.5 bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full ring-1 ring-blue-600/20">
                        <Zap className="w-3 h-3 fill-blue-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Active Provider</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-5">
                     <div className="relative shrink-0">
                        <img 
                          src={selectedProviderData.provider.profilePicture || 'https://via.placeholder.com/80'} 
                          alt={selectedProviderData.provider.name}
                          className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-xl ring-4 ring-blue-50"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                           <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-1 truncate">{selectedProviderData.provider.name}</h2>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span className="text-xs font-black">{selectedProviderData.provider.rating || '4.9'}</span>
                           </div>
                           <span className="text-slate-300">•</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedProviderData.provider.reviewCount || '24'} Verified Reviews</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-blue-600" /> Available Service Catalog
                     </h3>
                     <div className="grid gap-4">
                        {selectedProviderData.services.map(srv => (
                           <div key={srv._id} className="group bg-white border border-slate-100 hover:border-blue-200 rounded-3xl p-5 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{srv.category?.name || 'Standard'}</p>
                                    <h4 className="text-base font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{srv.title}</h4>
                                 </div>
                                 <div className="shrink-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                                    <p className="text-[12px] font-black tracking-tighter leading-none">Rs. {srv.price}</p>
                                 </div>
                              </div>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6 line-clamp-3">
                                 {srv.description}
                              </p>
                              <div className="flex items-center gap-3">
                                 <button 
                                    onClick={() => navigate(`/service/${srv._id}`)}
                                    className="flex-1 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                 >
                                    <CalendarCheck className="w-4 h-4" /> Book Service
                                 </button>
                                 <button 
                                    className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors border border-slate-100 active:scale-90"
                                    title="Consultation Request"
                                 >
                                    <Phone className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 space-y-5">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-600" /> Node Location
                     </h3>
                     <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                           <Navigation className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Proximity</p>
                           <p className="text-xs font-black text-slate-900 truncate">{selectedProviderData.distance} km from your hub</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="p-8 bg-slate-900 text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">Secure Transaction Protocol Active</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">End-to-End Encrypted Selection</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyTechnicians;
