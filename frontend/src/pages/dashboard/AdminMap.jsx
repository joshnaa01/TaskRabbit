import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, CheckCircle, XCircle, Clock, ShieldCheck, User as UserIcon, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'sonner';

// Custom icons based on provider status
const iconColors = {
  active: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  unverified: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  suspended: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
};

const getStatusIcon = (status, isApproved) => {
  let color = iconColors.unverified;
  if (status === 'suspended' || status === 'deactivated') color = iconColors.suspended;
  else if (isApproved && status === 'active') color = iconColors.active;

  return new L.Icon({
    iconUrl: color,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const AdminMap = () => {
  const { coords } = useLocation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', status: 'all', category: 'all' });
  const [categories, setCategories] = useState([]);

  const mapCenter = coords ? [coords.lat, coords.lng] : [27.717, 85.324];

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const [provRes, catRes] = await Promise.all([
        api.get('/admin/providers-map'),
        api.get('/categories')
      ]);
      setProviders(provRes.data.data || []);
      setCategories(catRes.data.data || catRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch provider geospatial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleUpdateProvider = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('Provider status updated successfully');
      fetchProviders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Must have valid coordinates
      if (!provider.location?.coordinates || provider.location.coordinates.length < 2) return false;

      // Filter by Keyword
      if (filters.keyword && !provider.name.toLowerCase().includes(filters.keyword.toLowerCase())) return false;

      // Filter by Status
      if (filters.status !== 'all') {
        const isApp = provider.isApproved;
        const stat = provider.status;
        if (filters.status === 'active' && (!isApp || stat !== 'active')) return false;
        if (filters.status === 'unverified' && isApp) return false;
        if (filters.status === 'suspended' && stat !== 'suspended') return false;
      }

      // Filter by Category
      if (filters.category !== 'all') {
        if (!provider.categories || !provider.categories.includes(filters.category)) return false;
      }

      return true;
    });
  }, [providers, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Provider Network Map</h1>
          <p className="text-slate-500 font-medium text-sm mt-1 mb-2">Real-time geographical overview of all task specialists.</p>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active ({providers.filter(p => p.status === 'active' && p.isApproved).length})</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Suspended ({providers.filter(p => p.status === 'suspended').length})</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Unverified ({providers.filter(p => !p.isApproved && p.status !== 'suspended').length})</div>
          </div>
        </div>

        <button
          onClick={fetchProviders}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-xs font-black uppercase tracking-widest shadow-sm"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search provider name or ID..."
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium w-full md:w-1/3 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          value={filters.keyword}
          onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value }))}
        />
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium w-full md:w-1/4 shadow-sm outline-none focus:border-blue-500 cursor-pointer"
          value={filters.status}
          onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active & Verified</option>
          <option value="unverified">Pending Approval</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium w-full md:w-1/4 shadow-sm outline-none focus:border-blue-500 cursor-pointer"
          value={filters.category}
          onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))}
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative h-[650px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-sm font-black text-slate-800 tracking-widest uppercase">Aggregating Nodes...</div>
          </div>
        )}
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full outline-none z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <Marker position={mapCenter} icon={userIcon}>
            <Popup className="font-sans">
              <div className="text-center p-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {coords ? 'Your Admin Console' : 'Core Target Area'}
                </span>
              </div>
            </Popup>
          </Marker>

          <MarkerClusterGroup chunkedLoading>
            {filteredProviders.map(provider => {
              // Mongo coords: [lng, lat]
              const position = [provider.location.coordinates[1], provider.location.coordinates[0]];
              const icon = getStatusIcon(provider.status, provider.isApproved);
              const isFullyActive = provider.isApproved && provider.status === 'active';

              return (
                <Marker key={provider._id} position={position} icon={icon}>
                  <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent className="bg-transparent border-0 shadow-none p-0 m-0 text-center">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xl whitespace-nowrap text-slate-800 flex flex-col items-center">
                      <span className="text-[11px] font-black leading-tight truncate max-w-[150px]">{provider.name}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{provider.categories?.length ? provider.categories[0] : 'Professional'}</span>
                    </div>
                  </Tooltip>
                  <Popup className="font-sans min-w-[280px]">
                    <div className="p-1">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                        {provider.profilePicture && provider.profilePicture !== 'default.jpg' ? (
                          <img src={provider.profilePicture} alt="Profile" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                            <UserIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-slate-900 text-sm m-0 leading-tight">{provider.name}</h3>
                          <p className="text-[10px] font-bold text-slate-500 truncate max-w-[150px] m-0 leading-tight">{provider.email}</p>
                          <div className="flex mt-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${provider.status === 'suspended' ? 'bg-red-100 text-red-600' :
                                !provider.isApproved ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-600'
                              }`}>
                              {provider.status === 'suspended' ? 'Suspended' : (!provider.isApproved ? 'Pending Verification' : 'Active')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-600 truncate">{provider.location.address || 'Location registered automatically'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-600 truncate">{provider.categories?.length ? provider.categories.join(', ') : 'No exact services listed'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-600">Since {new Date(provider.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {provider.status === 'suspended' ? (
                          <button
                            onClick={() => handleUpdateProvider(provider._id, { status: 'active' })}
                            className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Restore Account
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateProvider(provider._id, { status: 'suspended' })}
                              className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 border border-red-100"
                            >
                              <XCircle className="w-3 h-3" /> Suspend
                            </button>

                            {!isFullyActive ? (
                              <button
                                onClick={() => handleUpdateProvider(provider._id, { isApproved: true, status: 'active' })}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 border border-emerald-100"
                              >
                                <ShieldCheck className="w-3 h-3" /> Verify & Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateProvider(provider._id, { isApproved: false })}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 border border-slate-200"
                              >
                                Revoke ID
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default AdminMap;
