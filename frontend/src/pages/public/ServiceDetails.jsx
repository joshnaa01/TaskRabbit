import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import ImageUpload from '../../components/common/ImageUpload';
import MapPicker from '../../components/common/MapPicker';
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
   Loader2,
   LocateFixed,
   Navigation
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
      requirements: ''
   });
   const [slots, setSlots] = useState([]);
   const [selectedSlot, setSelectedSlot] = useState(null);
   const [slotsLoading, setSlotsLoading] = useState(false);
   const [paymentModal, setPaymentModal] = useState({ open: false, booking: null });
   const [showLocationPrompt, setShowLocationPrompt] = useState(false);
   const [clientLocation, setClientLocation] = useState({
      lat: user?.location?.coordinates?.[1] || null,
      lng: user?.location?.coordinates?.[0] || null,
      address: user?.location?.address || ''
   });

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

   const handleLocationPick = async (lat, lng) => {
      setClientLocation(prev => ({ ...prev, lat, lng }));
      try {
         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
         const data = await res.json();
         if (data.display_name) {
            setClientLocation(prev => ({ ...prev, address: data.display_name }));
         }
      } catch (err) {
         console.error(err);
      }
   };

   const detectClientLocation = () => {
      if (!navigator.geolocation) return toast.error('Geolocation not supported');
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            handleLocationPick(pos.coords.latitude, pos.coords.longitude);
            toast.success('Location detected!');
         },
         () => toast.error('Location access denied')
      );
   };

   const saveClientLocation = async () => {
      if (!clientLocation.lat || !clientLocation.lng) return toast.error('Please select a location first');
      try {
         await api.put('/auth/profile', {
            lat: clientLocation.lat,
            lng: clientLocation.lng,
            address: clientLocation.address
         });
         toast.success('Location saved!');
         setShowLocationPrompt(false);
      } catch (err) {
         toast.error('Failed to save location');
      }
   };

   const handleBooking = async (e) => {
      e.preventDefault();
      if (!user) return navigate('/login');

      if (service.categoryId?.name?.toLowerCase().includes('tutoring')) {
         return toast.warning("Escrow booking is currently optimized for one-off tasks. Multi-day services are disabled.");
      }

      // If physical service and client has no location, prompt them
      if (service.serviceType !== 'remote' && !user.location?.coordinates?.length && !clientLocation.lat) {
         setShowLocationPrompt(true);
         return toast.info('Please set your location first so the provider knows where to come.');
      }
      
      setSubmitting(true);
      try {
         await api.post('/bookings', {
            serviceId: service._id,
            scheduleDate: bookingData.scheduleDate,
            timeSlot: {
               start: selectedSlot.start,
               end: selectedSlot.end
            },
            address: clientLocation.address || user.location?.address || 'Remote Location',
            requirements: {
               description: bookingData.requirements
            },
            basePrice: service.price
         });

         toast.success("Booking request sent! Awaiting provider acceptance.");
         navigate('/client/bookings');

      } catch (err) {
         toast.error(err.response?.data?.message || "Booking failed.");
      } finally {
         setSubmitting(false);
      }
   };

   if (isLoading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8">
         <div className="w-16 h-16 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin"></div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Service Details...</p>
      </div>
   );


    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12">
         <div className="max-w-6xl mx-auto px-6">

            {/* Back navigation */}
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors group">
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Search
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

               {/* Main Visuals & Content */}
               <div className="lg:col-span-8 space-y-8">
                  <div className="aspect-[21/9] rounded-[32px] overflow-hidden bg-white shadow-xl relative group">
                     {service.images?.[0] ? (
                        <img src={service.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                           <Zap className="w-16 h-16 text-slate-200" />
                        </div>
                     )}
                     <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg ring-1 ring-black/5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black text-slate-900">4.9/5.0</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1 opacity-50">• 124 Tasks</span>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-blue-900/5 ring-1 ring-slate-100">
                     <div className="flex items-start justify-between mb-8">
                        <div className="min-w-0">
                           <div className="flex items-center gap-2 mb-3">
                              <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Official</span>
                              {service.serviceType === 'remote' && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ring-1 ring-emerald-100">Remote</span>}
                           </div>
                           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight truncate">{service.title}</h1>
                           <div className="flex items-center gap-4 mt-4 text-slate-400">
                              <div className="flex items-center gap-1.5">
                                 <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">{service.serviceType === 'remote' ? 'Digital Delivery' : service.location?.address || 'Kathmandu, NP'}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 opacity-70">Expert Execution</p>
                           <p className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {service.price}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-70">per task</p>
                        </div>
                     </div>

                     <div className="prose prose-slate max-w-none">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] mb-4">Service Specification</h4>
                    <p className="text-base font-medium text-slate-500 leading-relaxed mb-8 whitespace-pre-line">{service.description}</p>
                 </div>

                 {/* Reviews Section */}
                 <div className="pt-8 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em]">User Impressions</h4>
                       <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-slate-900">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       {reviews.length > 0 ? reviews.map((review) => (
                          <div key={review._id} className="bg-slate-50/50 p-6 rounded-[28px] border border-slate-50 group hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                             <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                      {review.clientId?.profilePicture && <img src={review.clientId.profilePicture} className="w-full h-full object-cover" />}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-900 tracking-tight">{review.clientId?.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="flex gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                   ))}
                                </div>
                             </div>
                             <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{review.comment}"</p>
                          </div>
                       )) : (
                          <div className="text-center py-6 opacity-30">
                             <p className="text-[9px] font-black uppercase tracking-widest">No ratings recorded yet</p>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 border-t border-slate-50">
                        <div className="p-4 bg-slate-50 rounded-[24px] flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-slate-100">
                              <MessageCircle className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Response</p>
                              <p className="text-[10px] font-black text-slate-900">{"< 30 min"}</p>
                           </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-[24px] flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-slate-100">
                              <ShieldCheck className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Guard</p>
                              <p className="text-[10px] font-black text-slate-900">Protected</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Booking / Side Section */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/20 sticky top-24 group">
                     <div className="flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                           <Calendar className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Book Service</h3>
                     </div>

                     <form onSubmit={handleBooking} className="space-y-6">
                        <div className="space-y-4">
                           <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Select Date</label>
                               <InlineCalendar
                                  darkMode
                                  value={bookingData.scheduleDate}
                                  onChange={(date) => setBookingData({ ...bookingData, scheduleDate: date })}
                               />
                               {bookingData.scheduleDate && (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                     <Calendar className="w-3 h-3 text-blue-400" />
                                     <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">
                                        {new Date(bookingData.scheduleDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                     </span>
                                  </div>
                               )}
                            </div>

                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Windows</label>
                              
                              {!bookingData.scheduleDate ? (
                                <div className="p-6 text-center bg-white/5 rounded-xl border border-dashed border-white/10 opacity-40">
                                  <p className="text-[9px] uppercase font-bold text-center">Select a date</p>
                                </div>
                              ) : slotsLoading ? (
                                <div className="flex justify-center p-6">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                </div>
                              ) : slots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {slots.map((slot, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      disabled={!slot.available}
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`p-3 rounded-lg text-center transition-all border-2 
                                        ${selectedSlot?.start === slot.start 
                                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                          : slot.available 
                                            ? 'bg-white/5 border-white/10 text-white hover:border-blue-400/50' 
                                            : 'bg-white/5 border-transparent text-white/20 cursor-not-allowed opacity-30'}
                                      `}
                                    >
                                      <p className="text-[10px] font-black">{slot.start}</p>
                                      <p className="text-[7px] font-bold opacity-60 uppercase tracking-tighter">{slot.end}</p>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-6 text-center bg-red-500/10 rounded-xl border border-red-500/20">
                                  <p className="text-[9px] text-red-200 font-bold uppercase tracking-tight">Unavailable today</p>
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Requirements Block */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                                 Notes
                              </label>
                              <textarea
                                 className="w-full bg-white/5 border border-white/10 rounded-[24px] p-4 text-[11px] font-bold text-white outline-none focus:bg-white/10 focus:border-blue-400 transition-all placeholder:text-slate-600 min-h-[80px]"
                                 placeholder="Specific instructions..."
                                 value={bookingData.requirements}
                                 onChange={(e) => setBookingData({ ...bookingData, requirements: e.target.value })}
                              />
                           </div>
                        </div>

                        {/* Location Prompt - only if physical service & no client location */}
                        {service.serviceType !== 'remote' && (showLocationPrompt || (!user?.location?.coordinates?.length && !clientLocation.lat)) && (
                           <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="flex items-center gap-2">
                                 <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                 <label className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Set Your Location</label>
                              </div>
                              <p className="text-[9px] text-slate-400 font-bold leading-relaxed">The provider needs your location to serve you. Pick on map or detect automatically.</p>
                              <div className="flex gap-2">
                                 <button type="button" onClick={detectClientLocation} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-[8px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all active:scale-95">
                                    <LocateFixed className="w-3 h-3" /> Get My Location
                                 </button>
                              </div>
                              <MapPicker lat={clientLocation.lat || 27.717} lng={clientLocation.lng || 85.324} onPick={handleLocationPick} height="200px" />
                              {clientLocation.address && (
                                 <p className="text-[9px] font-bold text-blue-300 truncate italic px-1">{clientLocation.address}</p>
                              )}
                              <button type="button" onClick={saveClientLocation} disabled={!clientLocation.lat} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[8px] font-black uppercase tracking-widest disabled:opacity-30 transition-all active:scale-95">
                                 Save Location & Continue
                              </button>
                           </div>
                        )}

                        <Button
                           type="submit"
                           className="w-full h-12 rounded-[24px] text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-2"
                           disabled={submitting || !selectedSlot}
                        >
                           {submitting ? 'Booking...' : (
                               <span className="flex items-center gap-2 justify-center">Confirm <ChevronRight className="w-4 h-4" /></span>
                           )}
                        </Button>

                        <div className="text-center pt-2 opacity-30">
                           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Secured via Escrow</p>
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
               navigate('/client/bookings');
            }}
            onSuccess={() => {
               setPaymentModal({ open: false, booking: null });
               toast.success("Payment Secured! Booking request transmitted.");
               navigate('/client/bookings');
            }}
            bookingId={paymentModal.booking?._id}
            amount={service.price}
            serviceName={service.title}
         />
      </div>
   );
;
};

export default ServiceDetails;
