import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, CheckCircle, XCircle, Clock, ShieldCheck, User as UserIcon, RefreshCw, Layers, Search } from 'lucide-react';
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
  const navigate = useNavigate();
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

  useEffect(() => { fetchProviders(); }, []);

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
      if (!provider.location?.coordinates || provider.location.coordinates.length < 2) return false;
      if (filters.keyword && !provider.name.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      if (filters.status !== 'all') {
        const isApp = provider.isApproved;
        const stat = provider.status;
        if (filters.status === 'active' && (!isApp || stat !== 'active')) return false;
        if (filters.status === 'unverified' && isApp) return false;
        if (filters.status === 'suspended' && stat !== 'suspended') return false;
      }
      if (filters.category !== 'all') {
        if (!provider.categories || !provider.categories.includes(filters.category)) return false;
      }
      return true;
    });
  }, [providers, filters]);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-slate-100/50">
        <div>
           <h1 className="text-4xl font-black text-slate-950 tracking-tighter leading-none uppercase">Provider Map</h1>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
              Real-time Active Provider Locations
           </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-100/50 p-4 rounded-[28px] border border-slate-100/50 backdrop-blur-md shadow-inner">
           {[
             { label: 'Active', count: providers.filter(p => p.status === 'active' && p.isApproved).length, color: 'bg-emerald-500' },
             { label: 'Suspended', count: providers.filter(p => p.status === 'suspended').length, color: 'bg-rose-500' },
             { label: 'Pending', count: providers.filter(p => !p.isApproved && p.status !== 'suspended').length, color: 'bg-slate-400' }
           ].map((stat, i) => (
             <div key={i} className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${stat.color} shadow-sm`}></div>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</span>
                   <span className="text-[11px] font-black text-slate-950 leading-none">{stat.count}</span>
                </div>
             </div>
           ))}
           <div className="h-8 w-px bg-slate-200/50 mx-2"></div>
           <button
             onClick={fetchProviders}
             className="w-10 h-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Analysis Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/50 p-2 rounded-[3rem] border border-slate-100 shadow-sm backdrop-blur-sm">
        <div className="relative col-span-2 group/search">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/search:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search providers..."
              className="w-full bg-white border border-slate-100 rounded-[2rem] py-4 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-slate-950 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
              value={filters.keyword}
              onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value }))}
            />
        </div>
        <div className="relative group/status flex items-center">
            <ShieldCheck className="absolute left-6 w-4 h-4 text-slate-300 group-focus-within/status:text-blue-600 transition-colors pointer-events-none" />
            <select
              className="w-full bg-white border border-slate-100 rounded-[2rem] py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-950 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm appearance-none cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
            >
              <option value="all">Status</option>
              <option value="active">Active</option>
              <option value="unverified">Pending Approval</option>
              <option value="suspended">Suspended</option>
            </select>
        </div>
        <div className="relative group/cat flex items-center">
            <Layers className="absolute left-6 w-4 h-4 text-slate-300 group-focus-within/cat:text-blue-600 transition-colors pointer-events-none" />
            <select
              className="w-full bg-white border border-slate-100 rounded-[2rem] py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-950 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm appearance-none cursor-pointer"
              value={filters.category}
              onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))}
            >
               <option value="all">Skill Category</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
        </div>
      </div>

      {/* Immersion Map Environment */}
      <div className="bg-white rounded-[4rem] border-4 border-white shadow-[0_40px_120px_-20px_rgba(30,58,138,0.12)] overflow-hidden h-[700px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-[1000] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-[11px] font-black text-slate-950 tracking-[0.4em] uppercase">Loading Map...</div>
          </div>
        )}
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none z-0">
          <TileLayer
            attribution='&copy; OSM'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MarkerClusterGroup chunkedLoading>
            {filteredProviders.map(provider => {
              const position = [provider.location.coordinates[1], provider.location.coordinates[0]];
              const icon = getStatusIcon(provider.status, provider.isApproved);
              const isFullyActive = provider.isApproved && provider.status === 'active';

              return (
                <Marker key={provider._id} position={position} icon={icon}>
                  <Popup className="premium-popup">
                    <div className="w-[300px] p-4 bg-white rounded-[2rem] overflow-hidden">
                      <div className="flex items-center gap-4 mb-6 relative">
                        <div className="relative w-14 h-14 shrink-0">
                           <div className="absolute inset-0 bg-slate-900/5 rounded-2xl rotate-6 transition-transform group-hover:rotate-12"></div>
                           {provider.profilePicture && provider.profilePicture !== 'default.jpg' ? (
                             <img src={provider.profilePicture} alt="Profile" className="relative w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                           ) : (
                             <div className="relative w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-white shadow-sm">
                               <UserIcon className="w-6 h-6 text-slate-300" />
                             </div>
                           )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-slate-950 text-sm leading-tight tracking-tight uppercase truncate m-0">{provider.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 truncate m-0 italic mt-1">{provider.email}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" /> 
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter leading-relaxed">{provider.location.address || 'Active Location'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> 
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{provider.categories?.[0] || 'Provider'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {provider.status === 'suspended' ? (
                          <button
                            onClick={() => handleUpdateProvider(provider._id, { status: 'active' })}
                            className="bg-slate-950 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-emerald-600 transition-all active:scale-95"
                          >
                            Restore User
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            {!isFullyActive && (
                                <button
                                  onClick={() => handleUpdateProvider(provider._id, { isApproved: true, status: 'active' })}
                                  className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 hover:bg-slate-950 transition-all"
                                >
                                  Verify
                                </button>
                            )}
                            <button
                               onClick={() => handleUpdateProvider(provider._id, { status: 'suspended' })}
                               className="flex-1 bg-white border-2 border-slate-100 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-rose-100 active:scale-95 transition-all"
                            >
                               Suspend
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={() => navigate(`/admin/messages?to=${provider._id}`)}
                          className="w-full bg-slate-50 text-slate-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all active:scale-95 border border-slate-100"
                        >
                          Send Message
                        </button>
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
