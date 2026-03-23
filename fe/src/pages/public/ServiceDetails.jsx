import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ImageUpload from '../../components/common/ImageUpload';
import { 
  Star, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  Calendar,
  FileText,
  Upload,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookingData, setBookingData] = useState({
    scheduleDate: '',
    startTime: '',
    requirements: '',
    files: []
  });

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data } = await api.get(`/services/${id}`);
      return data.data;
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/bookings', payload);
      return data;
    },
    onSuccess: () => {
      alert("Booking request transmitted! Await provider confirmation.");
      navigate('/dashboard/bookings');
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Transmission failed.");
    }
  });

  const handleBooking = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    bookingMutation.mutate({
      serviceId: service._id,
      scheduleDate: bookingData.scheduleDate,
      startTime: bookingData.startTime,
      address: user.location?.address || 'Remote Location',
      requirements: {
         description: bookingData.requirements,
         files: bookingData.files
      }
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8">
       <div className="w-16 h-16 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin"></div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Service Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Back navigation */}
        <button onClick={() => navigate(-1)} className="mb-10 flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Visuals & Content */}
          <div className="lg:col-span-8 space-y-12">
             <div className="aspect-[21/9] rounded-[48px] overflow-hidden bg-white shadow-2xl relative group">
                {service.images?.[0] ? (
                  <img src={service.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                     <Zap className="w-20 h-20 text-slate-200" />
                  </div>
                )}
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl ring-1 ring-black/5">
                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                   <span className="text-sm font-black text-slate-900">4.9/5.0</span>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 opacity-50">• 124 Tasks</span>
                </div>
             </div>

             <div className="bg-white p-12 rounded-[52px] shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100">
                <div className="flex items-start justify-between mb-10">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Official Service</span>
                         {service.serviceType === 'remote' && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ring-1 ring-emerald-100">Remote Compatible</span>}
                      </div>
                      <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{service.title}</h1>
                      <div className="flex items-center gap-5 mt-6 text-slate-400">
                         <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold uppercase tracking-widest">{service.serviceType === 'remote' ? 'Global / Digital Delivery' : service.location?.address || 'Kathmandu, NP'}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Expert Execution</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {service.price}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70">per task request</p>
                   </div>
                </div>

                <div className="prose prose-slate max-w-none">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Service Specification</h4>
                   <p className="text-lg font-medium text-slate-500 leading-relaxed mb-10 whitespace-pre-line">{service.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-slate-50">
                    <div className="p-6 bg-slate-50 rounded-[32px] flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-slate-100">
                          <MessageCircle className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Response Time</p>
                          <p className="text-xs font-black text-slate-900">{"< 30 minutes"}</p>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-slate-100">
                          <ShieldCheck className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Service Guard</p>
                          <p className="text-xs font-black text-slate-900">Protected</p>
                       </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Booking / Side Section */}
          <div className="lg:col-span-4 space-y-10">
             <div className="bg-slate-900 p-10 rounded-[52px] text-white shadow-2xl shadow-slate-900/20 sticky top-32 group">
                <div className="flex items-center gap-3 mb-10">
                   <Calendar className="w-8 h-8 text-blue-400" />
                   <h3 className="text-2xl font-black tracking-tight">Initiate Booking</h3>
                </div>

                <form onSubmit={handleBooking} className="space-y-8">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Date</label>
                         <input 
                           type="date" 
                           required
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-blue-400 transition-all"
                           value={bookingData.scheduleDate}
                           onChange={(e) => setBookingData({...bookingData, scheduleDate: e.target.value})}
                         />
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Starting Clock</label>
                         <input 
                           type="time" 
                           required
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-blue-400 transition-all"
                           value={bookingData.startTime}
                           onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                         />
                      </div>
                   </div>

                   {/* Requirements Block (Remote specific or high detail) */}
                   <div className="space-y-6 pt-6 border-t border-white/5">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                            Requirements Mapping
                            <span className="text-blue-400 opacity-60">Digital Assets Supported</span>
                         </label>
                         <textarea 
                           className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-blue-400 transition-all placeholder:text-slate-600 min-h-[140px]"
                           placeholder="Describe specific work deliverables or project nuances..."
                           value={bookingData.requirements}
                           onChange={(e) => setBookingData({...bookingData, requirements: e.target.value})}
                         />
                      </div>

                      <div className="bg-white/5 rounded-[32px] p-4 border border-white/10">
                         <ImageUpload 
                            label="Attach Reference Documents"
                            onUploadSuccess={(url) => setBookingData(prev => ({ ...prev, files: [...prev.files, url] }))}
                         />
                         {bookingData.files.length > 0 && (
                            <p className="text-[9px] font-black text-blue-400 uppercase mt-2 px-2">{bookingData.files.length} Assests Attached</p>
                         )}
                      </div>
                   </div>

                   <Button 
                     type="submit" 
                     className="w-full h-18 rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                     disabled={bookingMutation.isPending}
                   >
                     {bookingMutation.isPending ? 'Transmitting Data...' : (
                        <span className="flex items-center gap-3">Confirm Entry <ChevronRight className="w-5 h-5" /></span>
                     )}
                   </Button>

                   <div className="text-center pt-4 opacity-40">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encrypted Service Transmission</p>
                   </div>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
