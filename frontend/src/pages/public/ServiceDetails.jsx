import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
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
import { toast } from 'sonner';
import StripePaymentModal from '../../components/payment/StripePaymentModal';
import InlineCalendar from '../../components/common/InlineCalendar';
const ServiceDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { user } = useAuth();

   const [service, setService] = useState(null);
   const [reviews, setReviews] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [bookingData, setBookingData] = useState({
      scheduleDate: '',
      requirements: '',
      files: []
   });
   const [slots, setSlots] = useState([]);
   const [selectedSlot, setSelectedSlot] = useState(null);
   const [slotsLoading, setSlotsLoading] = useState(false);
   const [paymentModal, setPaymentModal] = useState({ open: false, booking: null });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [servRes, revRes] = await Promise.all([
                api.get(`/services/${id}`),
                api.get(`/reviews/service/${id}`)
            ]);
            setService(servRes.data.data);
            setReviews(revRes.data.data || []);
         } catch (err) {
            console.error('Failed to load assets:', err);
         } finally {
            setIsLoading(false);
         }
      };
      fetchData();
   }, [id]);

   useEffect(() => {
      if (!bookingData.scheduleDate || !service?.providerId?._id) return;

      const fetchSlots = async () => {
         setSlotsLoading(true);
         try {
            const res = await api.get(`/slots/available?providerId=${service.providerId?._id}&date=${bookingData.scheduleDate}`);
            setSlots(res.data.data || []);
            setSelectedSlot(null); // Reset when date changes
         } catch (err) {
            toast.error("Failed to load availability. Please try another date.");
         } finally {
            setSlotsLoading(false);
         }
      };
      fetchSlots();
   }, [bookingData.scheduleDate, service?.providerId?._id]);

   const handleBooking = async (e) => {
      e.preventDefault();
      if (!user) return navigate('/login');

      // Restrict services like 'Tutoring' as they require daily commitment (Escrow demo limited to one-off)
      if (service.categoryId?.name?.toLowerCase().includes('tutoring')) {
         return toast.warning("Escrow booking is currently optimized for one-off tasks. Multi-day services are disabled.");
      }
      
      setSubmitting(true);
      try {
         // 1. Create the booking record first (Pending status)
         const res = await api.post('/bookings', {
            serviceId: service._id,
            scheduleDate: bookingData.scheduleDate,
            timeSlot: {
               start: selectedSlot.start,
               end: selectedSlot.end
            },
            address: user.location?.address || 'Remote Location',
            requirements: {
               description: bookingData.requirements,
               files: bookingData.files
            },
            basePrice: service.price
         });

         // 2. Open Stripe Payment Modal for this booking
         setPaymentModal({
            open: true,
            booking: res.data.data
         });

      } catch (err) {
         toast.error(err.response?.data?.message || "Transmission failed.");
      } finally {
         setSubmitting(false);
      }
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

                 {/* Reviews Section */}
                 <div className="pt-12 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-10">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">User Impressions</h4>
                       <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-black text-slate-900">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
                       </div>
                    </div>

                    <div className="space-y-8">
                       {reviews.length > 0 ? reviews.map((review) => (
                          <div key={review._id} className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-50 group hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all">
                             <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                      {review.clientId?.profilePicture && <img src={review.clientId.profilePicture} className="w-full h-full object-cover" />}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 tracking-tight">{review.clientId?.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="flex gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                   ))}
                                </div>
                             </div>
                             <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{review.comment}"</p>
                          </div>
                       )) : (
                          <div className="text-center py-10 opacity-30">
                             <p className="text-[10px] font-black uppercase tracking-widest">No ratings recorded yet</p>
                          </div>
                       )}
                    </div>
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
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Date</label>
                               <InlineCalendar
                                  darkMode
                                  value={bookingData.scheduleDate}
                                  onChange={(date) => setBookingData({ ...bookingData, scheduleDate: date })}
                               />
                               {bookingData.scheduleDate && (
                                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                     <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                     <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">
                                        {new Date(bookingData.scheduleDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                     </span>
                                  </div>
                               )}
                            </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Available Windows</label>
                              
                              {!bookingData.scheduleDate ? (
                                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-40">
                                  <p className="text-[10px] uppercase font-bold text-center">Select a date to see slots</p>
                                </div>
                              ) : slotsLoading ? (
                                <div className="flex justify-center p-8">
                                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                                </div>
                              ) : slots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {slots.map((slot, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      disabled={!slot.available}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`p-4 rounded-xl text-center transition-all border-2 
                                        ${selectedSlot?.start === slot.start 
                                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                          : slot.available 
                                            ? 'bg-white/5 border-white/10 text-white hover:border-blue-400/50' 
                                            : 'bg-white/5 border-transparent text-white/20 cursor-not-allowed opacity-30'}
                                      `}
                                    >
                                      <p className="text-xs font-black">{slot.start}</p>
                                      <p className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">to {slot.end}</p>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-8 text-center bg-red-500/10 rounded-2xl border border-red-500/20">
                                  <p className="text-[10px] text-red-200 font-bold uppercase">Provider unavailable today</p>
                                </div>
                              )}
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
                                 onChange={(e) => setBookingData({ ...bookingData, requirements: e.target.value })}
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
                           disabled={submitting || !selectedSlot}
                        >
                           {submitting ? 'Transmitting Data...' : (
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
         <StripePaymentModal
            isOpen={paymentModal.open}
            onClose={() => {
               setPaymentModal({ open: false, booking: null });
               navigate('/dashboard/bookings');
            }}
            onSuccess={() => {
               setPaymentModal({ open: false, booking: null });
               toast.success("Payment Secured! Booking request transmitted.");
               navigate('/dashboard/bookings');
            }}
            bookingId={paymentModal.booking?._id}
            amount={service.price}
            serviceName={service.title}
         />
      </div>
   );
};

export default ServiceDetails;
