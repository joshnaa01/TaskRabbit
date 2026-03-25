import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const SearchBar = ({ onSearch, initialKeyword = '' }) => {
  const { coords, setCoords, loading, detectLocation } = useLocation();
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch({ keyword });
  };

  // Debounced search (300ms)
  useEffect(() => {
    const delay = setTimeout(() => {
       onSearch({ keyword });
    }, 300);
    return () => clearTimeout(delay);
  }, [keyword]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 lg:p-6 border border-slate-100 mb-10">
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-center gap-4">
        {/* keyword Input */}
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
             type="text" 
             placeholder="Search services (e.g. Plumbing, Cleaning)" 
             className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-xl text-slate-800 font-semibold focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 transition-all outline-none"
             value={keyword}
             onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Location Input */}
        <div className="w-full lg:w-96 relative group">
          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
             type="text" 
             placeholder={loading ? 'Detecting...' : coords ? 'Current Location' : 'Enter location'} 
             className="w-full pl-14 pr-20 py-4 bg-slate-50 border-none rounded-xl text-slate-800 font-semibold focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 transition-all outline-none"
             readOnly
          />
          <button 
             type="button"
             onClick={detectLocation}
             className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg transition-colors group"
             title="Detect my location"
          >
             <Navigation className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button 
           type="submit"
           className="w-full lg:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
        >
           Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
