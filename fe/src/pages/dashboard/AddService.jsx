import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
    ArrowLeft,
    Plus,
    MapPin,
    Terminal,
    Image as ImageIcon,
    DollarSign,
    Tag,
    AlignLeft,
    Info,
    Globe,
    Truck,
    CheckCircle2,
    Trash2,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

const AddService = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { coords, address: defaultAddress } = useLocation();

    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        serviceType: 'onsite', // 'onsite' or 'remote'
        pricingType: 'fixed',   // 'fixed' or 'hourly'
        price: '',
        address: defaultAddress || '',
        images: []
    });

    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data.data || []);
            } catch (err) {
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchService = async () => {
            try {
                const res = await api.get(`/services/${id}`);
                const service = res.data.data;
                setFormData({
                    title: service.title,
                    description: service.description,
                    categoryId: service.categoryId?._id || service.categoryId || '',
                    serviceType: service.serviceType,
                    pricingType: service.pricingType,
                    price: service.price.toString(),
                    address: service.location?.address || defaultAddress || '',
                    images: service.images || []
                });
            } catch (err) {
                toast.error('Failed to load service details');
            }
        };
        fetchService();
    }, [id, defaultAddress]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSuccess = (url) => {
        if (!url) return;
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.title || !formData.description || !formData.categoryId || !formData.price) {
            return toast.error("Please provide all required service details.");
        }

        setSubmitting(true);
        try {
            // Prepare payload according to backend model expectance
            const payload = {
                title: formData.title,
                description: formData.description,
                categoryId: formData.categoryId,
                serviceType: formData.serviceType,
                pricingType: formData.pricingType,
                price: Number(formData.price),
                images: formData.images,
                location: formData.serviceType === 'onsite' ? {
                    type: 'Point',
                    coordinates: coords ? [coords.lng, coords.lat] : [85.324, 27.717], // Fallback Kathmandu
                    address: formData.address || 'Service Location'
                } : undefined
            };

            if (id) {
                await api.put(`/services/${id}`, payload);
                toast.success("✨ Your Service has been Updated!");
            } else {
                await api.post('/services', payload);
                toast.success("✨ Your Service is Now Live!");
            }
            navigate('/dashboard/services');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failure to list service profile.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    return (
        <div className="max-w-3xl mx-auto pb-16">
            {/* Header Area */}
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={() => navigate('/dashboard/services')}
                    className="p-4 bg-white rounded-3xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">{id ? 'Edit Service' : 'Launch New Service'}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{id ? 'Update Existing Service Profile' : `Step ${currentStep} of 3 — Profile Architecture`}</p>
                </div>
            </div>

            {/* Progress Stepper */}
            {!id && (
                <div className="flex gap-4 mb-12">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative border border-slate-50 shadow-inner">
                            <div
                                className={`absolute inset-0 bg-blue-600 transition-all duration-700 ease-out ${currentStep >= step ? 'translate-x-0' : '-translate-x-full'}`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-12">

                {/* STEP 1: IDENTITY & CORE */}
                {(currentStep === 1 || id) && (
                    <div className="bg-white rounded-[32px] border border-slate-50 shadow-2xl shadow-blue-900/5 p-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Info className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity & Category</h2>
                        </div>

                        <div className="space-y-8">
                            {/* Service Title */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descriptive Title</label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Professional Sofa Deep Cleaning"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-5 pl-16 pr-8 text-sm font-bold focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Executive Summary</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe the value proposition, process, and tools used..."
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[32px] p-8 text-sm font-bold focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none leading-relaxed"
                                />
                            </div>

                            {/* Category Select */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Infrastructure Category</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map(cat => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, categoryId: cat._id }))}
                                            className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 group
                                         ${formData.categoryId === cat._id
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-slate-900 hover:shadow-lg hover:shadow-blue-900/5'}
                                       `}
                                        >
                                            <Tag className={`w-6 h-6 ${formData.categoryId === cat._id ? 'text-white' : 'text-slate-300 group-hover:text-blue-600'} transition-colors`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-center">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end">
                            {!id && (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.title || !formData.description || !formData.categoryId}
                                    className="px-10 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest flex items-center gap-3"
                                >
                                    Configure Pricing <ChevronRight className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: LOGISTICS & COMMERCE */}
                {(currentStep === 2 || id) && (
                    <div className="bg-white rounded-[32px] border border-slate-50 shadow-2xl shadow-blue-900/5 p-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Logistics & Revenue Model</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Service Type */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Deployment Strategy</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, serviceType: 'onsite' }))}
                                        className={`flex-1 p-6 rounded-[32px] border-2 flex flex-col items-center gap-4 transition-all
                                       ${formData.serviceType === 'onsite'
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl'
                                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-4 rounded-2xl ${formData.serviceType === 'onsite' ? 'bg-white/10' : 'bg-white'}`}>
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">On-site Help</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, serviceType: 'remote' }))}
                                        className={`flex-1 p-6 rounded-[32px] border-2 flex flex-col items-center gap-4 transition-all
                                       ${formData.serviceType === 'remote'
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl'
                                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-4 rounded-2xl ${formData.serviceType === 'remote' ? 'bg-white/10' : 'bg-white'}`}>
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Remote Expert</span>
                                    </button>
                                </div>
                            </div>

                            {/* Pricing Type */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Compensation Structure</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, pricingType: 'fixed' }))}
                                        className={`flex-1 p-6 rounded-[32px] border-2 flex flex-col items-center gap-4 transition-all
                                       ${formData.pricingType === 'fixed'
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-2xl'
                                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-4 rounded-2xl ${formData.pricingType === 'fixed' ? 'bg-white/10' : 'bg-white'}`}>
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Fixed Fee</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, pricingType: 'hourly' }))}
                                        className={`flex-1 p-6 rounded-[32px] border-2 flex flex-col items-center gap-4 transition-all
                                       ${formData.pricingType === 'hourly'
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-2xl'
                                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-4 rounded-2xl ${formData.pricingType === 'hourly' ? 'bg-white/10' : 'bg-white'}`}>
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Hourly Rate</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Price Input */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Artifact Value (NPR)</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all">
                                    Rs
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-5 pl-20 pr-8 text-2xl font-black focus:bg-white focus:border-blue-600/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Location Input (Only if onsite) */}
                        {formData.serviceType === 'onsite' && (
                            <div className="space-y-4 pt-4 animate-in fade-in duration-500">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Service Radius Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Area, City (e.g., Baneshwor, Kathmandu)"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-5 pl-16 pr-8 text-sm font-bold focus:bg-white focus:border-emerald-600/20 transition-all outline-none"
                                    />
                                </div>
                                {coords && (
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest pl-2">精准 GPS Coordinates Optimized ✓</p>
                                )}
                            </div>
                        )}

                        <div className="pt-8 flex justify-between gap-4">
                            {!id && (
                                <>
                                    <button type="button" onClick={prevStep} className="px-8 py-5 rounded-[24px] border-2 border-slate-100 font-black text-[12px] uppercase tracking-widest hover:bg-slate-50">Back</button>
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!formData.price || (formData.serviceType === 'onsite' && !formData.address)}
                                        className="px-10 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest flex items-center gap-3"
                                    >
                                        Upload Assets <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: ASSETS & DEPLOY */}
                {(currentStep === 3 || id) && (
                    <div className="bg-white rounded-[32px] border border-slate-50 shadow-2xl shadow-blue-900/5 p-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Visual Identity & Portfolio</h2>
                        </div>

                        <div className="space-y-8">
                            <ImageUpload
                                label="Primary Branding Image"
                                onUploadSuccess={handleImageSuccess}
                                folder="services"
                            />

                            {/* Image Grid */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="group relative aspect-square rounded-[24px] overflow-hidden border border-slate-100">
                                            <img src={img} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-md rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary Checklist */}
                        <div className="bg-slate-900 rounded-[24px] p-6 text-white space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Final Review Checklist</p>
                            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                                {formData.title} listed as {formData.serviceType}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                                Automatic secure escrow integration active
                            </div>
                        </div>

                        <div className="pt-8 flex justify-between gap-4">
                            {!id && <button type="button" onClick={prevStep} className="px-8 py-5 rounded-[24px] border-2 border-slate-100 font-black text-[12px] uppercase tracking-widest hover:bg-slate-50">Back</button>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-600 text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-slate-900 transition-all disabled:opacity-50 h-16"
                            >
                                {submitting ? 'Synchronizing Profile...' : (id ? 'Update Service' : 'Finalize & Launch Service')}
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </div>
    );
};

export default AddService;
