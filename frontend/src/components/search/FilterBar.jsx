import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, Star, RotateCcw, MapPin, CircleDollarSign, Layers, X } from 'lucide-react';

const FilterBar = ({ onFilterChange, categories = [] }) => {
  const [radius, setRadius] = useState(20);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = [
    category !== '',
    minPrice !== '',
    maxPrice !== '',
    rating > 0,
    radius !== 20
  ].filter(Boolean).length;

  useEffect(() => {
    onFilterChange({ radius, category, minPrice, maxPrice, rating });
  }, [radius, category, minPrice, maxPrice, rating]);

  const resetAll = () => {
    setRadius(20);
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating(0);
  };

  const selectedCategoryName = categories.find(c => c._id === category)?.name;

  return (
    <div className="w-full mb-8">
      {/* Filter Toggle Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm ${
            isExpanded || activeFilterCount > 0
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-[10px] font-black flex items-center justify-center -mr-1">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>

        {/* Active Filter Pills (visible when collapsed) */}
        {!isExpanded && activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {radius !== 20 && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100">
                <MapPin className="w-3 h-3" /> {radius}km
                <button onClick={() => setRadius(20)} className="ml-1 text-blue-400 hover:text-blue-700"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCategoryName && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                <Layers className="w-3 h-3" /> {selectedCategoryName}
                <button onClick={() => setCategory('')} className="ml-1 text-indigo-400 hover:text-indigo-700"><X className="w-3 h-3" /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                <CircleDollarSign className="w-3 h-3" /> Rs. {minPrice || '0'} – {maxPrice || '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="ml-1 text-emerald-400 hover:text-emerald-700"><X className="w-3 h-3" /></button>
              </span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-100">
                <Star className="w-3 h-3 fill-amber-500" /> {rating}+ Stars
                <button onClick={() => setRating(0)} className="ml-1 text-amber-400 hover:text-amber-700"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="mt-4 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-6 lg:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Radius */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distance</label>
                <span className="ml-auto text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{radius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-300 tracking-wider">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
              </div>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price (Rs.)</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none placeholder:text-slate-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Min Rating</label>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                      rating >= star
                        ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-500'
                    }`}
                    title={`${star} Stars`}
                  >
                    <Star className={`w-4 h-4 ${rating >= star ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-[9px] font-bold text-amber-600 mt-2 text-center">{rating}+ star services only</p>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400">
              {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied` : 'No filters applied'}
            </p>
            <div className="flex gap-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-transparent hover:border-red-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset All
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
