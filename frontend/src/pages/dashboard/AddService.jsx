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
            navigate('/provider/services');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failure to list service profile.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Provisioning Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-10 mb-16 pb-8 border-b border-slate-100/50">
                <button
                    onClick={() => navigate('/provider/services')}
                    className="w-16 h-16 shrink-0 bg-white rounded-[2rem] border border-slate-100 text-slate-300 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-900/5 transition-all duration-500 flex items-center justify-center active:scale-90 group/back"
                >
                    <ArrowLeft className="w-6 h-6 group-hover/back:-translate-x-1 transition-transform" />
                </button>
                <div className="flex-1">
                    <h1 className="text-5xl font-black text-slate-950 tracking-tighter leading-none uppercase italic mb-4">{id ? 'Update Asset' : 'Register Node'}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{id ? 'Operational Update Protocol' : `Provisioning Step ${currentStep} of 3 — Node Architecture`}</p>
                        </div>
                        {id && (
                           <span className="px-3 py-1 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Live Record</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tactical Progress Stepper */}
            {!id && (
                <div className="flex gap-6 mb-16 px-2">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex-1 space-y-3 group/step">
                            <div className="flex justify-between items-center px-1">
                               <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${currentStep >= step ? 'text-blue-600' : 'text-slate-200'}`}>0{step}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity duration-500 ${currentStep === step ? 'opacity-100' : 'opacity-0'}`}>Processing...</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100/50 overflow-hidden relative ring-1 ring-slate-100 shadow-inner">
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.3)] ${currentStep >= step ? 'translate-x-0' : '-translate-x-full'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Matrix Form Container */}
            <form onSubmit={handleSubmit} className="space-y-16">

                {/* STEP 1: IDENTITY & CORE ARCHITECTURE */}
                {(currentStep === 1 || id) && (
                    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-[0_48px_100px_-20px_rgba(30,58,138,0.06)] p-16 space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000 ring-1 ring-slate-100/50">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-inner">
                                <Info className="w-8 h-8" />
                            </div>
                            <div>
                               <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic">Core Identity</h2>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Initialize primary node descriptors</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* Service Title */}
                            <div className="space-y-5 group/input">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4 group-focus-within/input:text-blue-600 transition-colors">Strategic Label</label>
                                <div className="relative">
                                    <div className="absolute left-8 top-1/2 -translate-y-1/2 p-2 bg-slate-50 group-focus-within/input:bg-blue-600 group-focus-within/input:text-white rounded-xl text-slate-300 transition-all duration-500">
                                       <AlignLeft className="w-6 h-6" />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter high-impact service title..."
                                        className="w-full h-20 bg-slate-50 border-2 border-transparent rounded-[2.5rem] py-5 pl-24 pr-10 text-base font-black text-slate-950 focus:bg-white focus:border-blue-600 transition-all duration-500 outline-none shadow-inner placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-5 group/text">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4 group-focus-within/text:text-blue-600 transition-colors">Executive Narrative</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Describe operational mission parameters, technical requirements, and core value propositions..."
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[3.5rem] p-12 text-base font-bold text-slate-950 focus:bg-white focus:border-blue-600 transition-all duration-700 outline-none leading-relaxed italic shadow-inner placeholder:text-slate-300 min-h-[220px]"
                                />
                            </div>

                            {/* Category Select Matrix */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Marketplace Logic Dock</label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {categories.map(cat => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, categoryId: cat._id }))}
                                            className={`p-10 rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col items-center gap-5 group/cat relative overflow-hidden
                                         ${formData.categoryId === cat._id
                                                    ? 'bg-slate-950 border-slate-950 text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]'
                                                    : 'bg-white border-slate-50 text-slate-300 hover:border-blue-100 hover:text-slate-950 hover:bg-slate-50'}
                                       `}
                                        >
                                            <div className={`p-4 rounded-2xl transition-all duration-700 ${formData.categoryId === cat._id ? 'bg-white/10' : 'bg-slate-50 group-hover/cat:bg-white'}`}>
                                               <Tag className={`w-8 h-8 transition-transform duration-700 ${formData.categoryId === cat._id ? 'text-blue-400 rotate-12' : 'text-slate-200 group-hover/cat:text-blue-600'}`} />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-center leading-tight">{cat.name}</span>
                                            {formData.categoryId === cat._id && (
                                                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {!id && (
                            <div className="pt-12 flex justify-end">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.title || !formData.description || !formData.categoryId}
                                    className="h-20 px-12 bg-slate-950 hover:bg-blue-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-6 transition-all duration-700 disabled:opacity-20 shadow-2xl shadow-slate-950/20 active:scale-95 group/next"
                                >
                                    Proceed to Logistics 
                                    <ChevronRight className="w-6 h-6 group-hover/next:translate-x-2 transition-transform duration-500" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: LOGISTICS & FINANCIAL PROTOCOL */}
                {(currentStep === 2 || id) && (
                    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-[0_48px_100px_-20px_rgba(30,58,138,0.06)] p-16 space-y-16 animate-in fade-in slide-in-from-right-12 duration-1000 ring-1 ring-slate-100/50">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-slate-950 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div>
                               <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic">Logistics & Yield</h2>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Configure deployment & revenue models</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Deployment Strategy */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Deployment Vector</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, serviceType: 'onsite' }))}
                                        className={`flex-1 p-10 rounded-[3rem] border-2 flex flex-col items-center gap-6 transition-all duration-700 overflow-hidden relative group/deploy
                                       ${formData.serviceType === 'onsite'
                                                ? 'bg-slate-950 border-slate-950 text-white shadow-2xl scale-105'
                                                : 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-6 rounded-2xl transition-all duration-700 ${formData.serviceType === 'onsite' ? 'bg-white/10' : 'bg-white group-hover/deploy:bg-slate-50'}`}>
                                            <Truck className="w-10 h-10" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center">Localized Hub</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, serviceType: 'remote' }))}
                                        className={`flex-1 p-10 rounded-[3rem] border-2 flex flex-col items-center gap-6 transition-all duration-700 overflow-hidden relative group/deploy
                                       ${formData.serviceType === 'remote'
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105'
                                                : 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-6 rounded-2xl transition-all duration-700 ${formData.serviceType === 'remote' ? 'bg-white/10' : 'bg-white group-hover/deploy:bg-slate-50'}`}>
                                            <Globe className="w-10 h-10" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center">Global Node</span>
                                    </button>
                                </div>
                            </div>

                            {/* Revenue Protocol */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Yield Logic</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, pricingType: 'fixed' }))}
                                        className={`flex-1 p-10 rounded-[3rem] border-2 flex flex-col items-center gap-6 transition-all duration-700 overflow-hidden relative group/logic
                                       ${formData.pricingType === 'fixed'
                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xl'
                                                : 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-6 rounded-2xl transition-all duration-700 ${formData.pricingType === 'fixed' ? 'bg-white/10' : 'bg-white group-hover/logic:bg-slate-50'}`}>
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center">Fixed Quantum</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, pricingType: 'hourly' }))}
                                        className={`flex-1 p-10 rounded-[3rem] border-2 flex flex-col items-center gap-6 transition-all duration-700 overflow-hidden relative group/logic
                                       ${formData.pricingType === 'hourly'
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-2xl'
                                                : 'bg-slate-50 border-transparent text-slate-300 hover:bg-white hover:border-slate-100'}
                                     `}
                                    >
                                        <div className={`p-6 rounded-2xl transition-all duration-700 ${formData.pricingType === 'hourly' ? 'bg-white/10' : 'bg-white group-hover/logic:bg-slate-50'}`}>
                                            <Sparkles className="w-10 h-10" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center">Temporal Velocity</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Price Input Quantum */}
                        <div className="space-y-6 group/price">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4 group-focus-within/price:text-blue-600 transition-colors">Yield Parameter (NPR)</label>
                            <div className="relative">
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-slate-50 border border-slate-100 group-focus-within/price:bg-blue-600 group-focus-within/price:text-white rounded-2xl flex items-center justify-center font-black text-slate-400 transition-all duration-500 italic uppercase">
                                    NPR
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full h-24 bg-slate-50 border-2 border-transparent rounded-[3rem] py-5 pl-32 pr-12 text-4xl font-black text-slate-950 focus:bg-white focus:border-blue-600 transition-all duration-700 outline-none shadow-inner placeholder:text-slate-100/50 tracking-tighter italic"
                                />
                            </div>
                        </div>

                        {/* Hub Coordinates (Onsite Only) */}
                        {formData.serviceType === 'onsite' && (
                            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-left-8 duration-1000 group/geo">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4 group-focus-within/geo:text-emerald-500 transition-colors">Geospatial Registry</label>
                                <div className="relative">
                                    <div className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center group-focus-within/geo:rotate-12 group-focus-within/geo:text-emerald-500 transition-all duration-500 text-slate-300">
                                       <MapPin className="w-8 h-8" />
                                    </div>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter operational sector (e.g., Kathmandu Matrix, Sector 4)..."
                                        className="w-full h-24 bg-slate-50 border-2 border-transparent rounded-[3rem] py-5 pl-32 pr-12 text-base font-black text-slate-950 focus:bg-white focus:border-emerald-600 transition-all duration-700 outline-none shadow-inner placeholder:text-slate-300 italic"
                                    />
                                </div>
                                {coords && (
                                    <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] w-fit">
                                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">GPS Registry Optimized: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!id && (
                           <div className="pt-12 flex justify-between gap-6">
                                <button type="button" onClick={prevStep} className="h-20 px-12 bg-white border-2 border-slate-100 hover:border-slate-300 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] text-slate-300 hover:text-slate-950 transition-all duration-700 shadow-sm active:scale-95">Back</button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.price || (formData.serviceType === 'onsite' && !formData.address)}
                                    className="h-20 px-12 bg-slate-950 hover:bg-blue-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-6 transition-all duration-700 disabled:opacity-20 shadow-2xl shadow-slate-950/20 active:scale-95 group/next"
                                >
                                    Proceed to Assets 
                                    <ChevronRight className="w-6 h-6 group-hover/next:translate-x-2 transition-transform duration-500" />
                                </button>
                           </div>
                        )}
                    </div>
                )}

                {/* STEP 3: ASSETS & DEPLOYMENT PROTOCOL */}
                {(currentStep === 3 || id) && (
                    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-[0_48px_100px_-20px_rgba(30,58,138,0.06)] p-16 space-y-16 animate-in fade-in slide-in-from-right-12 duration-1000 ring-1 ring-slate-100/50">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-inner">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <div>
                               <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic">Visual Identity</h2>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Provision high-resolution asset portfolio</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="group/upload relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 blur-2xl opacity-0 group-hover/upload:opacity-100 transition-opacity duration-1000 rounded-[4rem]"></div>
                                <div className="relative z-10">
                                   <ImageUpload
                                       label="Command Center Visual Hub"
                                       onUploadSuccess={handleImageSuccess}
                                       folder="services"
                                   />
                                </div>
                            </div>

                            {/* Gallery Matrix */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="group/img relative aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-2xl hover:shadow-indigo-600/20 transition-all duration-1000">
                                            <img src={img} alt="Asset" className="w-full h-full object-cover group-hover/img:scale-125 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                               <button
                                                   type="button"
                                                   onClick={() => removeImage(i)}
                                                   className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center hover:bg-rose-700 transition-all duration-300 scale-75 group-hover/img:scale-100 shadow-2xl"
                                               >
                                                   <Trash2 className="w-5 h-5" />
                                               </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary Surveillance Checklist */}
                        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden group/check">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full -mr-10 -mt-10 group-hover/check:bg-blue-600/20 transition-all duration-1000"></div>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-2 relative z-10">Provisioning Protocol Integrity Review</p>
                            <div className="space-y-4 relative z-10">
                               <div className="flex items-center gap-6 group/item">
                                   <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-emerald-600 group-hover/item:border-emerald-600 transition-all duration-500"><CheckCircle2 className="w-5 h-5 text-white/40 group-hover/item:text-white" /></div>
                                   <p className="text-xs font-bold text-white/60 group-hover/item:text-white transition-colors tracking-wide italic leading-none truncate">Asset Module: <span className="text-white not-italic">{formData.title || 'NULL'}</span> — Deployment Strategy: <span className="text-blue-400 not-italic uppercase">{formData.serviceType}</span></p>
                               </div>
                               <div className="flex items-center gap-6 group/item">
                                   <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-emerald-600 group-hover/item:border-emerald-600 transition-all duration-500"><CheckCircle2 className="w-5 h-5 text-white/40 group-hover/item:text-white" /></div>
                                   <p className="text-xs font-bold text-white/60 group-hover/item:text-white transition-colors tracking-wide italic leading-none">Automatic Cryptographic Escrow Protection active for all yields.</p>
                               </div>
                            </div>
                        </div>

                        <div className="pt-12 flex flex-col md:flex-row gap-6">
                            {!id && <button type="button" onClick={prevStep} className="h-20 px-12 bg-white border-2 border-slate-100 hover:border-slate-300 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] text-slate-300 hover:text-slate-950 transition-all duration-700 shadow-sm active:scale-95">Back to Logistics</button>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 h-20 bg-blue-600 hover:bg-slate-950 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-6 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all duration-1000 group/submit disabled:opacity-30"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Synchronizing Hub...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-6 h-6 group-hover/submit:rotate-180 transition-transform duration-1000" />
                                        {id ? 'Commit Tactical Update' : 'Initialize & Deploy Service Node'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </div>
    );
};

export default AddService;
