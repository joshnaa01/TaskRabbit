import { Link } from 'react-router-dom';
import { MapPin, Star, Zap, ChevronRight, User } from 'lucide-react';

const ServiceCard = ({ service }) => {
  return (
    <div className="group bg-white rounded-3xl border border-slate-100 hover:border-blue-100 transition-all active:scale-[0.98] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col h-full relative">
      {/* Distance Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-black/5 ring-4 ring-white/10">
         <MapPin className="w-3 h-3 text-blue-600 fill-blue-600" />
         <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">
            {service.distance ? `${service.distance} km away` : 'Remote'}
         </span>
      </div>

      {/* Image Area */}
      <div className="w-full h-48 relative overflow-hidden bg-slate-50">
         {service.images?.[0] ? (
           <img src={service.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-slate-200">
              <Zap className="w-12 h-12" />
           </div>
         )}
         
         {service.serviceType === 'remote' && (
            <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
               Digital
            </div>
         )}
         
         <div className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-black/5 overflow-hidden ring-4 ring-white/10 group-hover:-translate-y-1 transition-transform">
            {service.provider?.profilePicture ? (
               <img src={service.provider.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : <User className="w-6 h-6 text-slate-300" />}
         </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
         <div className="flex items-center gap-2 mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-slate-900">4.9</span>
            <span className="opacity-50">• 84 ratings</span>
         </div>
         
         <Link to={`/service/${service._id}`}>
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-2 leading-tight">
               {service.title}
            </h3>
         </Link>
         
         <p className="text-slate-500 font-medium mb-4 line-clamp-2 text-xs leading-relaxed grow">
            {service.description}
         </p>
         
         <div className="pt-4 border-t border-slate-50 flex items-center justify-between w-full">
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Starting at</p>
               <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900 tracking-tighter">Rs. {service.price}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">/ task</span>
               </div>
            </div>
            
            <Link to={`/service/${service._id}`}>
               <button className="p-3 rounded-xl bg-slate-900 text-white hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 group/btn">
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
               </button>
            </Link>
         </div>
      </div>
    </div>
  );
};

export default ServiceCard;
