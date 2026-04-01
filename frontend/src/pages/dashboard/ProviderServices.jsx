import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
   Plus,
   Search,
   MoreVertical,
   Edit2,
   Trash2,
   ExternalLink,
   Briefcase,
   MapPin,
   Terminal,
   AlertCircle,
   RefreshCcw,
   LayoutGrid,
   List as ListIcon,
   Eye,
   X,
   Save,
   Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '../../components/common/ImageUpload';
import { Button } from '../../components/ui/Button';

const ProviderServices = () => {
   const { user } = useAuth();
   const [services, setServices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
   const [deleteModalId, setDeleteModalId] = useState(null);
    const [editModalId, setEditModalId] = useState(null);
    const [categories, setCategories] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const fetchServices = useCallback(async () => {
       try {
          setLoading(true);
          const res = await api.get(`/services/my`, { params: { page, limit: 10 } });
          setServices(res.data.data || []);
          setTotalPages(res.data.pages || 1);
          setTotalResults(res.data.total || 0);
          setError(null);
       } catch (err) {
          setError(err.response?.data?.message || err.message);
       } finally {
          setLoading(false);
       }
    }, [user._id, page]);

    useEffect(() => {
       fetchServices();
       const fetchCategories = async () => {
          try {
             const res = await api.get('/categories');
             setCategories(res.data.data || []);
          } catch (err) {}
       };
       fetchCategories();
    }, [fetchServices]);

    const handleDelete = async () => {
       if (!deleteModalId) return;

       try {
          await api.delete(`/services/${deleteModalId}`);
          toast.success('Service deactivated successfully');
          fetchServices();
          setDeleteModalId(null);
       } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to deactivate service');
       }
    };

    // --- Edit Modal Component (Internal for cleaner UX) ---
    const EditServiceModal = ({ serviceId, onClose }) => {
       const [item, setItem] = useState(null);
       const [updating, setUpdating] = useState(false);
       const [form, setForm] = useState({ title: '', price: '', categoryId: '', description: '', images: [] });

       useEffect(() => {
          const loadData = async () => {
             const res = await api.get(`/services/${serviceId}`);
             const d = res.data.data;
             setItem(d);
             setForm({
                title: d.title,
                price: d.price,
                categoryId: d.categoryId?._id || d.categoryId,
                description: d.description,
                images: d.images || []
             });
          };
          loadData();
       }, [serviceId]);

       const hChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

       const hUpdate = async (e) => {
          e.preventDefault();
          setUpdating(true);
          try {
             await api.put(`/services/${serviceId}`, { ...form, price: Number(form.price) });
             toast.success('Service synced successfully!');
             fetchServices();
             onClose();
          } catch (err) {
             toast.error('Update failed');
          } finally {
             setUpdating(false);
          }
       };

       if (!item) return null;

       return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
             <div className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 tracking-tight">Edit Service</h2>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Update your details</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <form onSubmit={hUpdate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Service Name</label>
                          <input name="title" value={form.title} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner" />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Price (NPR)</label>
                             <input type="number" name="price" value={form.price} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Category</label>
                             <select name="categoryId" value={form.categoryId} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none shadow-inner">
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                             </select>
                          </div>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Description</label>
                          <textarea name="description" value={form.description} onChange={hChange} rows="2" className="w-full bg-slate-50 border-none rounded-xl p-4 text-[12px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all resize-none shadow-inner leading-relaxed" />
                       </div>

                       <div className="pt-1">
                          <ImageUpload
                             label="Service Photo"
                             currentImage={form.images?.[0]}
                             onUploadSuccess={(url) => setForm({ ...form, images: url ? [url] : [] })}
                             folder="services"
                          />
                       </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                       <Button type="button" onClick={onClose} theme="secondary" className="flex-1 py-3.5 rounded-[16px] text-[8px] font-black uppercase tracking-widest border border-slate-100">Cancel</Button>
                       <Button 
                          type="submit" 
                          disabled={updating}
                          className="flex-1 py-3.5 rounded-[16px] text-[8px] font-black uppercase tracking-widest bg-blue-600 shadow-xl shadow-blue-600/20"
                       >
                          {updating ? 'Saving...' : (
                              <span className="flex items-center justify-center gap-2">
                                 <Save className="w-3 h-3" /> Save Changes
                              </span>
                          )}
                       </Button>
                    </div>
                </form>
             </div>
          </div>
       );
    };

   if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10"></div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Your Services...</p>
      </div>
   );

   if (error) return (
      <div className="p-12 text-center bg-red-50 rounded-[40px] border border-red-100">
         <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
         <h3 className="text-xl font-black text-red-900 mb-2">Syncing Failed</h3>
         <p className="text-sm font-bold text-red-600">{error}</p>
         <button onClick={fetchServices} className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">Retry</button>
      </div>
   );

   return (
      <div className="space-y-10">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                     <Briefcase className="w-5 h-5" />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Services</h1>
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Manage your service listings</p>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                  <button
                     onClick={() => setViewMode('grid')}
                     className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                  ><LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                     onClick={() => setViewMode('list')}
                     className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                     <ListIcon className="w-4 h-4" />
                  </button>
               </div>

               <Link
                  to="/dashboard/services/add"
                  className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-900/20 transition-all active:scale-95 group"
               >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  New Service
               </Link>
            </div>
         </div>

         {services.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[48px] p-24 text-center">
               <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-300 mx-auto mb-8 border border-slate-50 shadow-inner">
                  <Plus className="w-12 h-12" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Expand Your Business</h3>
               <p className="text-slate-400 font-bold max-w-sm mx-auto mb-10 leading-relaxed text-sm uppercase tracking-wider">Start by creating your first service profile to reach potential clients.</p>
               <Link
                  to="/dashboard/services/add"
                  className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-[28px] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200"
               >
                  Add Your First Service
               </Link>
            </div>
         ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {services.map((service) => (
                  <div key={service._id} className="group bg-white rounded-3xl border border-slate-50 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 hover:-translate-y-1 transition-all p-5 flex flex-col h-full overflow-hidden relative">
                     {/* Image Placeholder/Preview */}
                     <div className="h-36 mb-5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                        {service.images?.[0] ? (
                           <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300">
                              {service.serviceType === 'remote' ? <Terminal className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
                           </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                           <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md ${service.serviceType === 'remote' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                              {service.serviceType}
                           </span>
                        </div>
                     </div>

                     <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest">{service.categoryId?.name}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{service.title}</h3>
                        <p className="text-xs font-bold text-slate-400 line-clamp-2 leading-relaxed">{service.description}</p>
                     </div>

                     <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                           <p className="text-lg font-black text-slate-900">Rs. {service.price}<span className="text-[10px] text-slate-400 font-bold">/{service.pricingType === 'hourly' ? 'hr' : 'task'}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Link to={`/dashboard/services/preview/${service._id}`} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                              <Eye className="w-4 h-4" />
                           </Link>
                           <button onClick={() => setEditModalId(service._id)} className="p-2.5 bg-blue-50 rounded-xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => setDeleteModalId(service._id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="bg-white rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Service Name</th>
                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                        <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Pricing</th>
                        <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                     {services.map((service) => (
                        <tr key={service._id} className="group hover:bg-slate-50/30 transition-all">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                    {service.categoryId?.icon === 'web-icon' ? <Terminal className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 text-sm mb-1">{service.title}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{service.categoryId?.name}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${service.serviceType === 'remote' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                 {service.serviceType}
                              </span>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex flex-col">
                                 <p className="text-sm font-black text-slate-900">Rs. {service.price}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{service.pricingType}</p>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex justify-end gap-3">
                                 <Link to={`/dashboard/services/preview/${service._id}`} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                                    <Eye className="w-4 h-4" />
                                 </Link>
                                 <button onClick={() => setEditModalId(service._id)} className="p-3 bg-blue-50 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm">
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => setDeleteModalId(service._id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* Pagination Controls */}
         {totalPages > 1 && (
            <div className="flex flex-col items-center gap-6 pt-12 border-t border-slate-100">
               <div className="flex items-center gap-4">
                  <button 
                     onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                     disabled={page === 1}
                     className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-30"
                  >
                     Previous
                  </button>
                  <div className="flex items-center gap-2 px-2">
                     {[...Array(totalPages)].map((_, i) => (
                        <button
                           key={i}
                           onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                           className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-110' : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'}`}
                        >
                           {i + 1}
                        </button>
                     ))}
                  </div>
                  <button 
                     onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                     disabled={page === totalPages}
                     className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-30"
                  >
                     Next
                  </button>
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Page {page} of {totalPages}</p>
            </div>
         )}

         {/* Custom Delete Modal */}
         {deleteModalId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <div 
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                  onClick={() => setDeleteModalId(null)}
               ></div>
               
               {/* Modal */}
               <div className="relative bg-white rounded-[24px] p-6 max-w-xs w-full shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 text-center mb-2 tracking-tight">Deactivate Service?</h3>
                  <p className="text-slate-500 font-bold text-[10px] text-center mb-6 uppercase tracking-widest leading-relaxed">
                     This service will no longer be visible to clients.
                  </p>
                  
                  <div className="flex gap-2">
                     <button
                        onClick={() => setDeleteModalId(null)}
                        className="flex-1 px-4 py-3 rounded-[16px] bg-slate-50 text-slate-500 font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-3 rounded-[16px] bg-red-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all"
                     >
                        Deactivate
                     </button>
                  </div>
               </div>
            </div>
         )}

          {/* Custom Edit Modal */}
          {editModalId && (
             <EditServiceModal 
                serviceId={editModalId} 
                onClose={() => setEditModalId(null)} 
             />
          )}
       </div>
   );
};

export default ProviderServices;
