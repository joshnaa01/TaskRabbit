import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Star, RotateCcw } from 'lucide-react';

const FilterBar = ({ onFilterChange, categories = [] }) => {
  const [radius, setRadius] = useState(20);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    onFilterChange({ radius, category, minPrice, maxPrice, rating });
  }, [radius, category, minPrice, maxPrice, rating]);

  return (
    <div className="w-full bg-white border border-slate-100 rounded-[32px] p-8 mb-10 shadow-2xl shadow-blue-900/5 sticky top-24 z-30 transition-all hover:shadow-blue-900/10">
      <div className="flex flex-wrap items-end gap-8">
        {/* Radius Control */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proximity Range</span>
            <span className="text-blue-600 font-black text-[11px] px-3 py-1 bg-blue-50 rounded-xl border border-blue-100/50 shadow-sm">{radius} km</span>
          </div>
          <div className="relative flex items-center h-6">
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={radius} 
              onChange={(e) => setRadius(e.target.value)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
            />
          </div>
          <div className="flex justify-between mt-3 text-[9px] font-black text-slate-300 tracking-[0.1em] uppercase">
             <span>Local (1km)</span>
             <span>City-wide (100km)</span>
          </div>
        </div>

        {/* Category Selector */}
        <div className="w-full md:w-64">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Expertise Domain</label>
           <div className="relative group">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-5 pr-12 py-4 bg-slate-50 border-2 border-transparent hover:border-blue-100 rounded-2xl text-[11px] font-black text-slate-700 appearance-none focus:bg-white focus:ring-8 focus:ring-blue-600/5 transition-all outline-none cursor-pointer shadow-sm"
              >
                 <option value="">All Specializations</option>
                 {categories.map((c) => (
                   <option key={c._id} value={c._id}>{c.name}</option>
                 ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none" />
           </div>
        </div>

        {/* Dynamic Price Benchmarks */}
        <div className="w-full md:w-72">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Budget Threshold (Rs.)</label>
           <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input 
                   type="number" 
                   placeholder="Min" 
                   value={minPrice}
                   onChange={(e) => setMinPrice(e.target.value)}
                   className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent hover:border-blue-100 rounded-2xl text-[11px] font-black text-slate-700 focus:bg-white focus:ring-8 focus:ring-blue-600/5 transition-all outline-none shadow-sm"
                />
              </div>
              <div className="relative">
                <input 
                   type="number" 
                   placeholder="Max" 
                   value={maxPrice}
                   onChange={(e) => setMaxPrice(e.target.value)}
                   className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent hover:border-blue-100 rounded-2xl text-[11px] font-black text-slate-700 focus:bg-white focus:ring-8 focus:ring-blue-600/5 transition-all outline-none shadow-sm"
                />
              </div>
           </div>
        </div>

        {/* Performance Rating */}
        <div className="w-full lg:w-auto">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Quality Standard</label>
           <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                 <button 
                   key={star}
                   onClick={() => setRating(star)}
                   className={`w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center ${
                      rating >= star 
                      ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-lg shadow-amber-200/20' 
                      : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300 hover:text-slate-600'
                   }`}
                   title={`Minimum ${star} Stars`}
                 >
                    <Star className={`w-4 h-4 ${rating >= star ? 'fill-amber-500' : 'fill-slate-100'}`} />
                 </button>
              ))}
           </div>
        </div>
        
        {/* State Reset */}
        <div className="ml-auto">
          <button 
             onClick={() => {
                setRadius(20); setCategory(''); setMinPrice(''); setMaxPrice(''); setRating(0);
             }}
             className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-2xl transition-all shadow-sm active:scale-90"
             title="Clear All Filters"
          >
             <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
