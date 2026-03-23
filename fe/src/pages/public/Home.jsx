import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Star,
  Zap,
  ArrowRight,
  Filter,
  MapPin
} from 'lucide-react';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services with filters
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries([...searchParams]);
      const res = await api.get('/services', { params });
      setServices(res.data.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchTerm) newParams.set('keyword', searchTerm);
      else newParams.delete('keyword');
      setSearchParams(newParams);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, setSearchParams, searchParams]);

  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get('category') === id) newParams.delete('category');
    else newParams.set('category', id);
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full -mr-64 -mt-64 blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="bg-blue-600/10 text-blue-700 px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest mb-10 border border-blue-600/10 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 fill-blue-600" />
                Trusted by 50,000+ Nepal households
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
              Get anything done, <br/>
              <span className="text-blue-600 italic">anytime.</span>
            </h1>
            
            <p className="text-xl text-slate-600 font-medium mb-12 max-w-2xl">
                Connect with verified professionals for home repairs, cleaning, and moving. Nepal's most reliable task marketplace.
            </p>

            <div className="flex gap-4 mb-16">
               <Link to="/search">
                  <Button variant="outline" className="rounded-2xl flex items-center gap-2 font-bold px-8 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all">
                     <MapPin className="w-4 h-4" /> Find Experts Nearby
                  </Button>
               </Link>
            </div>
            
            {/* Advanced Search Bar */}
            <div className="w-full max-w-3xl bg-white p-2.5 rounded-[40px] shadow-[0_20px_50px_rgba(37,99,235,0.12)] border border-slate-100 flex flex-col md:flex-row items-center mb-12">
              <div className="flex-1 flex items-center w-full">
                <div className="pl-8 text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  placeholder="What task do you need help with?" 
                  className="flex-1 px-5 py-6 bg-transparent outline-none text-lg font-semibold placeholder:text-slate-400 text-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="h-10 w-px bg-slate-100 hidden md:block mx-4"></div>
              <Button size="lg" className="rounded-[32px] px-12 py-7 text-lg w-full md:w-auto mt-2 md:mt-0 shadow-xl shadow-blue-300/40">
                Search
              </Button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
               {categories.map((cat) => (
                 <button
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat._id)}
                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                      searchParams.get('category') === cat._id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}
                 >
                   {cat.name}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="py-24 max-w-7xl mx-auto px-8 w-full min-h-[400px]">
        <div className="flex items-center justify-between mb-12">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">
             {loading ? 'Searching services...' : searchTerm || searchParams.get('category') ? 'Search Results' : 'Recommended Services'}
           </h2>
           <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <Filter className="w-4 h-4" /> Filters
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[420px] bg-slate-100 rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link key={service._id} to={`/register`} className="group bg-white rounded-[32px] border border-slate-100 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col items-start overflow-hidden active:scale-[0.98]">
                <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
                   {service.images?.[0] ? (
                     <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Zap className="w-12 h-12" />
                     </div>
                   )}
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-blue-600 uppercase tracking-widest">
                      {service.categoryId?.name}
                   </div>
                </div>

                <div className="p-8 w-full flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 4.9
                     </span>
                     <span className="text-xs font-bold text-slate-400">• 120+ reviews</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                  <p className="text-slate-500 font-medium mb-6 line-clamp-2 text-sm leading-relaxed">{service.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between w-full">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm overflow-hidden">
                           {service.providerId?.profilePicture ? (
                             <img src={service.providerId.profilePicture} alt="" className="w-full h-full object-cover" />
                           ) : service.providerId?.name?.[0]}
                        </div>
                        <div>
                           <p className="text-xs font-bold text-slate-900">{service.providerId?.name}</p>
                           <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Certified Pro</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-slate-900 text-blue-600">Rs. {service.price}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{service.pricingType === 'hourly' ? '/ hr' : '/ task'}</p>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="bg-slate-50 p-10 rounded-full mb-8">
                <Search className="w-16 h-16 text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-3">No services found</h3>
             <p className="text-slate-500 font-medium mb-8 max-w-sm">Try adjusting your search or filters to find what you're looking for.</p>
             <Button variant="outline" onClick={() => {setSearchTerm(''); setSearchParams('')}}>
                Clear all filters
             </Button>
          </div>
        )}
      </section>

      {/* Trust Quote Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-8 relative text-center">
            <h2 className="text-4xl font-black text-white mb-10">Nepal's #1 Task Marketplace</h2>
            <p className="text-xl text-slate-400 font-medium mb-16 max-w-3xl mx-auto leading-relaxed">"TaskRabbit has completely changed how I handle home chores. I've found reliable help for everything from a leaking faucet to spring cleaning. It's truly a lifesaver."</p>
            <div className="flex items-center justify-center gap-4">
               <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/30">JS</div>
               <div className="text-left">
                  <p className="text-white font-bold text-sm">Joshna Giri</p>
                  <p className="text-blue-500 font-extrabold text-[10px] uppercase tracking-widest">Kathmandu, Nepal</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
