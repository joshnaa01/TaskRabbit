import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { 
  MapPin, 
  Search, 
  Zap, 
  Star, 
  Navigation, 
  Filter,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const NearbyServices = () => {
  const { location: geoCoords, error: geoError, loading: geoLoading } = useGeolocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(searchParams.get('radius') || 20); // default 20km

  const fetchNearby = useCallback(async () => {
    if (!geoCoords?.lat || !geoCoords?.lng) return;
    
    setLoading(true);
    try {
      const params = {
        lat: geoCoords.lat,
        lng: geoCoords.lng,
        radius: radius * 1000, // convert km to meters
        ...Object.fromEntries([...searchParams])
      };
      const res = await api.get('/services/nearby', { params });
      setServices(res.data.data);
    } catch (err) {
      console.error('Error fetching nearby services:', err);
    } finally {
      setLoading(false);
    }
  }, [geoCoords, searchParams, radius]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  const updateRadius = (e) => {
    const val = e.target.value;
    setRadius(val);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('radius', val);
    setSearchParams(newParams);
  };

  if (geoLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center animate-pulse mb-8 ring-8 ring-blue-50">
           <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Locating you...</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Finding the best experts in your area</p>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-8 ring-8 ring-red-50">
           <Navigation className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Location Access Denied</h2>
        <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">We need your location to show nearby services. Please enable location permissions in your browser or search manually.</p>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-2xl px-8" onClick={() => window.location.reload()}>Try Again</Button>
           <Link to="/"><Button className="rounded-2xl px-8">Return Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Filter Section */}
      <section className="bg-slate-900 pt-32 pb-20 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl -mr-64 -mt-64 -z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <div className="max-w-2xl">
                 <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-[10px] mb-4 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-lg">
                    <Navigation className="w-3 h-3 fill-blue-400" /> Currently in Kathmandu
                 </div>
                 <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                    Experts <span className="text-blue-500 italic">right next</span> to you.
                 </h1>
                 <p className="text-slate-400 font-medium text-lg leading-relaxed">Showing the highest-rated professionals within your chosen radius. Skip the commute, book local.</p>
              </div>

              {/* Proximity Slider */}
              <div className="w-full lg:w-80 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px]">
                 <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-black text-white uppercase tracking-widest">Search Radius</p>
                    <p className="text-blue-500 font-black text-xl">{radius} km</p>
                 </div>
                 <input 
                   type="range" 
                   min="1" 
                   max="50" 
                   value={radius} 
                   onChange={updateRadius}
                   className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase">
                    <span>1km</span>
                    <span>25km</span>
                    <span>50km</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 max-w-7xl mx-auto px-8">
         <div className="flex items-center justify-between mb-16">
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nearby Results</h2>
               <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">{services.length} providers found in your area</p>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold px-6">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
               </Button>
               <Button variant="ghost" className="rounded-xl gap-2 font-bold text-slate-500">
                  <ChevronDown className="w-4 h-4" /> Sort By
               </Button>
            </div>
         </div>

         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-slate-100 rounded-[40px] animate-pulse"></div>
              ))}
           </div>
         ) : services.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {services.map((s) => (
                <Link key={s._id} to={`/service/${s._id}`} className="group bg-white rounded-[40px] border border-slate-100 hover:border-blue-100 transition-all active:scale-[0.98] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col">
                   <div className="w-full h-56 relative overflow-hidden bg-slate-50">
                      {s.images?.[0] ? (
                        <img src={s.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                           <Zap className="w-16 h-16" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-6 left-6 flex items-center gap-2">
                         <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                               {s.distance ? `${s.distance} km away` : 'Remote'}
                            </span>
                         </div>
                      </div>
                      
                      {s.serviceType === 'remote' && (
                         <div className="absolute top-6 right-6 bg-emerald-500/90 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                            Global Coverage
                         </div>
                      )}
                   </div>

                   <div className="p-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-6">
                         <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                         <span className="text-sm font-black text-slate-900">4.9</span>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">• 84 ratings</span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors tracking-tight">{s.title}</h3>
                      <p className="text-slate-500 font-medium mb-8 line-clamp-2 text-sm leading-relaxed">{s.description}</p>
                      
                      <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between w-full">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 shadow-inner overflow-hidden ring-4 ring-slate-50">
                               {s.provider?.profilePicture ? (
                                 <img src={s.provider.profilePicture} alt="" className="w-full h-full object-cover" />
                               ) : s.provider?.name?.[0]}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Verified Pro</p>
                               <p className="text-sm font-black text-slate-900 truncate max-w-[100px]">{s.provider?.name}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starts From</p>
                            <p className="text-2xl font-black text-blue-600 tracking-tighter">Rs. {s.price}</p>
                         </div>
                      </div>
                   </div>
                </Link>
              ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
              <div className="bg-white p-10 rounded-full mb-10 shadow-xl shadow-slate-200/50">
                 <Search className="w-16 h-16 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Quiet around here?</h3>
              <p className="text-slate-500 font-medium mb-10 max-w-sm leading-relaxed">No services were found within {radius}km of your location. Try expanding your search radius!</p>
              <Button size="lg" className="rounded-[24px] px-12" onClick={() => setRadius(50)}>
                 Look further (50km)
              </Button>
           </div>
         )}
      </section>
    </div>
  );
};

export default NearbyServices;
