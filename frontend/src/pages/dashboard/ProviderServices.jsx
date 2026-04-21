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
    const [showAddModal, setShowAddModal] = useState(false);

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

    // --- Add Service Modal ---
    const AddServiceModal = ({ onClose }) => {
        const [submitting, setSubmitting] = useState(false);
        const [form, setForm] = useState({
            title: '',
            price: '',
            categoryId: categories[0]?._id || '',
            description: '',
            images: [],
            serviceType: 'onsite',
            pricingType: 'fixed',
            address: ''
        });

        const hChange = (e) => {
            const { name, value } = e.target;
            setForm(prev => ({ ...prev, [name]: value }));
        };

        const onSubmit = async (e) => {
            e.preventDefault();
            if (!form.title || !form.price || !form.categoryId) {
                return toast.error('Please fill in all required fields');
            }
            try {
                setSubmitting(true);
                await api.post('/services', {
                    ...form,
                    price: Number(form.price),
                    location: form.serviceType === 'onsite' ? {
                        type: 'Point',
                        coordinates: [85.32, 27.71], // default Kathmandu
                        address: form.address || 'Service Location'
                    } : undefined
                });
                toast.success('Service added successfully');
                fetchServices();
                onClose();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to add service');
            } finally {
                setSubmitting(false);
            }
        };

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
                <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight italic">Add New Service</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Service Title</label>
                            <input name="title" value={form.title} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none" placeholder="e.g. House Cleaning" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Price (Rs.)</label>
                                <input type="number" name="price" value={form.price} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none" placeholder="0" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                <select name="categoryId" value={form.categoryId} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none appearance-none">
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
                                <select name="serviceType" value={form.serviceType} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none">
                                    <option value="onsite">On-site</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Pricing</label>
                                <select name="pricingType" value={form.pricingType} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none">
                                    <option value="fixed">Fixed</option>
                                    <option value="hourly">Hourly</option>
                                </select>
                            </div>
                        </div>

                        {form.serviceType === 'onsite' && (
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Location</label>
                                <input name="address" value={form.address} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="Enter your address" />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                            <textarea name="description" value={form.description} onChange={hChange} rows="3" className="w-full bg-slate-50 border-none rounded-xl p-4 text-[12px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all resize-none shadow-inner" placeholder="Tell customers about your service..." />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" onClick={onClose} theme="secondary" className="flex-1 rounded-xl">Cancel</Button>
                            <Button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-blue-600 shadow-xl shadow-blue-600/20">
                                {submitting ? 'Adding...' : 'Add Service'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // --- Edit Modal Component ---
    const EditServiceModal = ({ serviceId, onClose }) => {
        const [updating, setUpdating] = useState(false);
        const [form, setForm] = useState({ title: '', price: '', categoryId: '', description: '', images: [], serviceType: 'onsite', pricingType: 'fixed', address: '' });

        useEffect(() => {
            const loadData = async () => {
                try {
                    const res = await api.get(`/services/${serviceId}`);
                    const d = res.data.data;
                    setForm({
                        title: d.title,
                        price: d.price,
                        categoryId: d.categoryId?._id || d.categoryId,
                        description: d.description,
                        images: d.images || [],
                        serviceType: d.serviceType || 'onsite',
                        pricingType: d.pricingType || 'fixed',
                        address: d.location?.address || ''
                    });
                } catch (err) {
                    toast.error('Failed to load service');
                    onClose();
                }
            };
            loadData();
        }, [serviceId]);

        const hChange = (e) => {
            const { name, value } = e.target;
            setForm(prev => ({ ...prev, [name]: value }));
        };

        const onSubmit = async (e) => {
            e.preventDefault();
            try {
                setUpdating(true);
                await api.put(`/services/${serviceId}`, {
                    ...form,
                    price: Number(form.price),
                    location: form.serviceType === 'onsite' ? {
                        type: 'Point',
                        coordinates: [85.32, 27.71],
                        address: form.address || 'Service Location'
                    } : undefined
                });
                toast.success('Service updated');
                fetchServices();
                onClose();
            } catch (err) {
                toast.error('Failed to update');
            } finally {
                setUpdating(false);
            }
        };

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
                <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
                    <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-6 italic">Edit Service</h2>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Service Title</label>
                            <input name="title" value={form.title} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/10 transition-all outline-none" placeholder="Service Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Price</label>
                                <input type="number" name="price" value={form.price} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                <select name="categoryId" value={form.categoryId} onChange={hChange} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-[13px] font-bold appearance-none shadow-inner">
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                            <textarea name="description" value={form.description} onChange={hChange} rows="3" className="w-full bg-slate-50 border-none rounded-xl p-4 text-[12px] font-bold resize-none shadow-inner" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" onClick={onClose} theme="secondary" className="flex-1 rounded-xl">Cancel</Button>
                            <Button type="submit" disabled={updating} className="flex-1 rounded-xl bg-blue-600 shadow-xl">
                                {updating ? 'Saving...' : 'Save Changes'}
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
       </div>
    );

    if (error) return (
       <div className="p-12 text-center bg-red-50 rounded-[40px] border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-black text-red-900 mb-2">Error Connecting</h3>
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button onClick={fetchServices} className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">Retry</button>
       </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">Your Services</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="px-1.5 py-0.5 bg-slate-950 text-white rounded text-[8px] font-black uppercase tracking-[0.2em] leading-none">{totalResults} Active</p>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Everything Up to Date</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-950'}`}
                        ><LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-950'}`}
                        >
                            <ListIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-black/10 group/add"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-500" />
                        Add New Service
                    </button>
                </div>
            </div>

            {services.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-20 text-center group/empty opacity-30">
                    <Briefcase className="w-10 h-10 text-slate-100 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-950 mb-4 tracking-tight uppercase italic">No Services Found</h3>
                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest mb-8 italic">Please add a service to get started.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-3 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all scale-100 group-hover/empty:scale-110 duration-500 shadow-2xl"
                    >
                        Add Service
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service._id} className="group/card bg-white rounded-xl border border-slate-100 p-4 flex flex-col h-full hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 relative ring-1 ring-slate-100/50">
                            <div className="aspect-[16/9] mb-4 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden relative group/img shadow-inner shrink-0">
                                {service.images?.[0] ? (
                                    <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        {service.serviceType === 'remote' ? <Terminal className="w-10 h-10" /> : <Briefcase className="w-10 h-10" />}
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 z-10">
                                    <span className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md border border-white/20 ${service.serviceType === 'remote' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
                                        {service.serviceType}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 px-1 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-0.5 w-4 bg-blue-600 rounded-full group-hover/card:w-6 transition-all duration-700"></div>
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{service.categoryId?.name}</span>
                                </div>
                                <h3 className="text-sm font-black text-slate-950 tracking-tight leading-none group-hover/card:text-blue-600 transition-colors uppercase italic truncate">{service.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 line-clamp-2 leading-tight opacity-70 group-hover/card:opacity-100 transition-opacity italic">"{service.description}"</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none italic opacity-50">Price</p>
                                    <p className="text-lg font-black text-slate-950 tracking-tighter leading-none italic">
                                        Rs. {service.price}
                                        <span className="text-[10px] text-slate-300 font-bold not-italic ml-1">/{service.pricingType === 'hourly' ? 'per hour' : 'fixed'}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link to={`/dashboard/services/preview/${service._id}`} className="w-8 h-8 bg-white border border-slate-100 rounded flex items-center justify-center text-slate-300 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-sm">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => setEditModalId(service._id)} className="w-8 h-8 bg-white border border-slate-100 rounded flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteModalId(service._id)} className="w-8 h-8 bg-white border border-slate-100 rounded flex items-center justify-center text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100/50">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Name</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                                <th className="px-5 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/30">
                            {services.map((service) => (
                                <tr key={service._id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-8 h-8 shrink-0">
                                                <div className="w-full h-full bg-slate-50 rounded flex items-center justify-center border border-slate-100 text-slate-300 group-hover/row:bg-slate-950 group-hover/row:text-white transition-all shadow-sm">
                                                    {service.serviceType === 'remote' ? <Terminal className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-950 text-[11px] uppercase tracking-tight group-hover/row:text-blue-600 transition-colors leading-none mb-1">{service.title}</p>
                                                <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest italic">{service.categoryId?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2">
                                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border border-slate-100/50 shadow-sm ${service.serviceType === 'remote' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {service.serviceType}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2">
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-black text-slate-950 tracking-tight leading-none mb-1 italic">Rs. {service.price}</p>
                                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest opacity-40 leading-none">/{service.pricingType === 'hourly' ? 'HR' : 'TK'}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2 text-right">
                                        <div className="flex justify-end gap-1.5 pr-1">
                                            <Link to={`/dashboard/services/preview/${service._id}`} className="w-7 h-7 bg-white border border-slate-100 rounded flex items-center justify-center text-slate-300 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-sm">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <button onClick={() => setEditModalId(service._id)} className="w-7 h-7 bg-white border border-slate-100 rounded flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setDeleteModalId(service._id)} className="w-7 h-7 bg-white border border-slate-100 rounded flex items-center justify-center text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                    <p>Showing: {((page - 1) * 10) + 1}-{Math.min(page * 10, totalResults)} / {totalResults}</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">Previous</button>
                        <span className="text-slate-950 font-black">{page} | {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">Next</button>
                    </div>
                </div>
            )}

            {/* Modal components remain as is but with slightly tighter styles inside if needed */}

          {/* Delete Service Modal */}
          {deleteModalId && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                   className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
                   onClick={() => setDeleteModalId(null)}
                ></div>
                
                <div className="relative bg-white rounded-[3.5rem] p-12 max-w-sm w-full shadow-[0_80px_160px_-40px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 border border-white/20">
                   <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-inner border border-rose-100">
                      <AlertCircle className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-950 text-center mb-4 tracking-tighter uppercase italic">Are you sure?</h3>
                   <p className="text-slate-400 font-bold text-[11px] text-center mb-10 uppercase tracking-[0.2em] leading-relaxed italic px-4">
                      This action cannot be undone.
                   </p>
                   
                   <div className="flex gap-4">
                      <button
                         onClick={() => setDeleteModalId(null)}
                         className="flex-1 py-5 rounded-[2rem] bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all duration-500 active:scale-95 border border-slate-100"
                      >
                         Cancel
                      </button>
                      <button
                         onClick={handleDelete}
                         className="flex-1 py-5 rounded-[2rem] bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 transition-all duration-500 active:scale-95 shadow-2xl shadow-rose-600/30"
                      >
                         Delete
                      </button>
                   </div>
                </div>
             </div>
          )}

           {/* Edit Modal */}
           {editModalId && (
              <EditServiceModal 
                 serviceId={editModalId} 
                 onClose={() => setEditModalId(null)} 
              />
           )}

           {/* Add Modal */}
           {showAddModal && (
               <AddServiceModal 
                  onClose={() => setShowAddModal(false)}
               />
           )}
        </div>
    );
};

export default ProviderServices;
