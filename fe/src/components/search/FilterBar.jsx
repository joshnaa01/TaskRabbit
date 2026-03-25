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
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-xl shadow-slate-200/40">
      <div className="flex flex-col lg:flex-row lg:items-end gap-6">
        {/* Radius */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex justify-between mb-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Search Radius</label>
            <span className="text-blue-600 font-black text-[10px] px-2 py-0.5 bg-blue-50 rounded-lg">{radius} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={radius} 
            onChange={(e) => setRadius(e.target.value)}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
          />
          <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 tracking-widest uppercase">
             <span>1km</span>
             <span>50km</span>
          </div>
        </div>

        {/* Category */}
        <div className="w-full lg:w-56">
           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Service Category</label>
           <div className="relative group">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-700 appearance-none focus:ring-4 focus:ring-blue-600/5 transition-all outline-none cursor-pointer"
              >
                 <option value="">All Categories</option>
                 {categories.map((c) => (
                   <option key={c._id} value={c._id}>{c.name}</option>
                 ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none" />
           </div>
        </div>

        {/* Price Range */}
        <div className="w-full lg:w-64">
           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Price Range (Rs.)</label>
           <div className="grid grid-cols-2 gap-2">
              <input 
                 type="number" 
                 placeholder="Min" 
                 value={minPrice}
                 onChange={(e) => setMinPrice(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
              />
              <input 
                 type="number" 
                 placeholder="Max" 
                 value={maxPrice}
                 onChange={(e) => setMaxPrice(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-black text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
              />
           </div>
        </div>

        {/* Rating */}
        <div className="w-full lg:w-auto">
           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Minimum Rating</label>
           <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                 <button 
                   key={star}
                   onClick={() => setRating(star)}
                   className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                      rating >= star 
                      ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-lg shadow-amber-200/20' 
                      : 'bg-white border-slate-50 text-slate-300 hover:border-slate-200'
                   }`}
                 >
                    <Star className={`w-3.5 h-3.5 ${rating >= star ? 'fill-amber-500' : 'fill-slate-100'}`} />
                 </button>
              ))}
           </div>
        </div>
        
        {/* Reset */}
        <div className="lg:mb-0">
          <button 
             onClick={() => {
                setRadius(20); setCategory(''); setMinPrice(''); setMaxPrice(''); setRating(0);
             }}
             className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-xl transition-all shadow-sm"
             title="Reset Filters"
          >
             <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
