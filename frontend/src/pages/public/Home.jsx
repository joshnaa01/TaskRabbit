import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
import ServiceCard from '../../components/search/ServiceCard';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e?.preventDefault();
    if (!heroSearch.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(heroSearch)}`);
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/services', { params: Object.fromEntries([...searchParams]) });
      setServices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
              Get anything done, <br />
              <span className="text-blue-600 italic">one task</span> at a time.
            </h1>

            <p className="text-slate-500 text-lg lg:text-xl font-medium mb-12 max-w-2xl leading-relaxed">
              Find reliable local help for everything from home repairs to digital design. Instant booking, professional results.
            </p>

            <form onSubmit={handleHeroSearch} className="w-full max-w-3xl flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[32px] shadow-2xl shadow-blue-900/10 border border-slate-100">
              <div className="flex-1 w-full flex items-center gap-4 px-6 border-r-0 sm:border-r border-slate-100 h-10">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="What are you looking for?" 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 placeholder:text-slate-400" 
                />
              </div>
              <div className="flex-1 w-full flex items-center gap-4 px-6 h-10">
                <MapPin className="w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Your Location" className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 placeholder:text-slate-400" />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto rounded-2xl px-12 h-16 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                Search Experts
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Popular:</span>
              {['Plumbing', 'Cleaning', 'Graphics Design', 'Web Help'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setHeroSearch(tag);
                    navigate(`/search?keyword=${encodeURIComponent(tag)}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100/50 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              <div className="flex items-center gap-2 saturate-0 opacity-50"><ShieldCheck className="w-5 h-5" /> Secured Payments</div>
              <div className="flex items-center gap-2 saturate-0 opacity-50"><CheckCircle2 className="w-5 h-5" /> Verified Pros</div>
              <div className="flex items-center gap-2 saturate-0 opacity-50"><Clock className="w-5 h-5" /> Fast Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Hub */}
      <section className="py-16 max-w-7xl mx-auto px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Recommended for you</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-3">High-rated experts in your vicinity</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest px-8 gap-2 h-12">
              <Filter className="w-4 h-4" /> Refinement
            </Button>
            <Link to="/search">
              <Button variant="ghost" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 gap-2 h-12 group">
                Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
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
              {services.map((service) => (
                <ServiceCard key={service._id} service={{...service, provider: service.providerId}} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale">
              <Zap className="w-16 h-16 mb-4" />
              <p className="font-black text-[10px] uppercase tracking-widest">No Services Discovered</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-50 py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6 font-black text-blue-600">01</div>
            <h4 className="text-lg font-black text-slate-900 mb-3">Safe Payments</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Encrypted transactions via secure standard gateways.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6 font-black text-blue-600">02</div>
            <h4 className="text-lg font-black text-slate-900 mb-3">Verified Experts</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Rigorous vetting process for all service providers.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6 font-black text-blue-600">03</div>
            <h4 className="text-lg font-black text-slate-900 mb-3">Fast Booking</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Book a service in under 60 seconds with instant confirmation.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6 font-black text-blue-600">04</div>
            <h4 className="text-lg font-black text-slate-900 mb-3">24/7 Support</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Get assistance anytime through our support channel.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
