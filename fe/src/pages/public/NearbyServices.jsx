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
import ServiceCard from '../../components/search/ServiceCard';

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
      <section className="py-16 max-w-7xl mx-auto px-8">
         <div className="flex items-center justify-between mb-10">
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

         <div className="pb-12">
            {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>
                ))}
             </div>
           ) : services.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((s) => (
                  <ServiceCard key={s._id} service={s} />
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="bg-white p-8 rounded-full mb-8 shadow-xl shadow-slate-200/50">
                   <Search className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No results yet</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm leading-relaxed text-sm">No services were found within {radius}km. Try expanding your radius!</p>
                <Button size="lg" className="rounded-2xl px-12" onClick={() => setRadius(50)}>
                   Look further (50km)
                </Button>
             </div>
           )}
         </div>
      </section>
    </div>
  );
};

export default NearbyServices;
