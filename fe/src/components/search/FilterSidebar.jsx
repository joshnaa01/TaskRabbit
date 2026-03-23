import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Star } from 'lucide-react';

const FilterSidebar = ({ onFilterChange, categories = [] }) => {
  const [radius, setRadius] = useState(20);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    onFilterChange({ radius, category, minPrice, maxPrice, rating });
  }, [radius, category, minPrice, maxPrice, rating]);

  return (
    <aside className="w-full lg:w-80 bg-white border border-slate-100 rounded-[32px] p-8 h-fit lg:sticky lg:top-24 shadow-2xl shadow-slate-200/40">
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
        <div className="p-3 bg-blue-50 rounded-2xl">
           <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        </div>
        <div>
           <h3 className="text-xl font-black text-slate-900 tracking-tight">Advanced Filters</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Refine your results</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Distance Slider */}
        <div className="group">
          <div className="flex justify-between mb-4">
             <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Radius</label>
             <span className="text-blue-600 font-black text-xs px-2.5 py-1 bg-blue-50 rounded-lg">{radius} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={radius} 
            onChange={(e) => setRadius(e.target.value)}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
          />
          <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 tracking-widest uppercase">
             <span>1km</span>
             <span>50km</span>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="group">
           <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Service Category</label>
           <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-5 pr-10 py-4 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 appearance-none focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
              >
                 <option value="">All Categories</option>
                 {categories.map((c) => (
                   <option key={c._id} value={c._id}>{c.name}</option>
                 ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
           </div>
        </div>

        {/* Price Range */}
        <div className="group">
           <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Price Range (Rs.)</label>
           <div className="grid grid-cols-2 gap-3">
              <input 
                 type="number" 
                 placeholder="Min" 
                 value={minPrice}
                 onChange={(e) => setMinPrice(e.target.value)}
                 className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
              />
              <input 
                 type="number" 
                 placeholder="Max" 
                 value={maxPrice}
                 onChange={(e) => setMaxPrice(e.target.value)}
                 className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
              />
           </div>
        </div>

        {/* Rating Filter */}
        <div className="group">
           <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Minimum Rating</label>
           <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                 <button 
                   key={star}
                   onClick={() => setRating(star)}
                   className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center ${
                      rating >= star 
                      ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-lg shadow-amber-200/20' 
                      : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
                   }`}
                 >
                    <Star className={`w-4 h-4 ${rating >= star ? 'fill-amber-500' : 'fill-slate-100'}`} />
                 </button>
              ))}
           </div>
        </div>
        
        <button 
           onClick={() => {
              setRadius(20); setCategory(''); setMinPrice(''); setMaxPrice(''); setRating(0);
           }}
           className="w-full py-4 text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest border border-slate-100 hover:border-blue-100 rounded-2xl transition-all"
        >
           Reset All Filters
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
