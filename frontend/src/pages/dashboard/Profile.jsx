import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ImageUpload from '../../components/common/ImageUpload';
import MapPicker from '../../components/common/MapPicker';
import {
    User,
    Mail,
    MapPin,
    FileText,
    CheckCircle2,
    ShieldCheck,
    Navigation,
    Save,
    Loader2,
    Map as MapIcon,
    LocateFixed,
    X,
    Briefcase,
    MousePointer2
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        address: user?.location?.address || '',
        profilePicture: user?.profilePicture || '',
        lat: user?.location?.coordinates[1] || 27.717,
        lng: user?.location?.coordinates[0] || 85.324
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [locationStatus, setLocationStatus] = useState('idle');
    const [showMap, setShowMap] = useState(true);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile(formData);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Update failed. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCoordsSelected = async (lat, lng) => {
        setFormData(prev => ({ ...prev, lat, lng }));
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.display_name) {
                setFormData(prev => ({ ...prev, address: data.display_name }));
                toast.success('Address updated');
            }
        } catch (err) {
            console.error('Reverse Geocoding failed:', err);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return toast.error('Geolocation not supported');
        setLocationStatus('detecting');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleCoordsSelected(latitude, longitude);
                setLocationStatus('captured');
            },
            () => {
                setLocationStatus('error');
                toast.error('Location access denied');
            }
        );
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">Profile Settings</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="px-2 py-0.5 bg-slate-950 text-white rounded-md text-[9px] font-black uppercase tracking-[0.2em]">{user?.role}</p>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Session</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Account</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Photo & Quick Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-900/5">
                        <div className="flex flex-col items-center">
                            <ImageUpload
                                label="Profile Picture"
                                currentImage={formData.profilePicture}
                                onUploadSuccess={(url) => setFormData({ ...formData, profilePicture: url })}
                            />
                            <h3 className="text-xl font-black text-slate-950 mt-6 tracking-tight uppercase italic">{user?.name}</h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5">{user?.email}</p>
                        </div>
                    </div>

                    {/* Quick Coordinates Display (Provider) */}
                    {user?.role === 'provider' && (
                        <div className="bg-slate-950 p-6 rounded-3xl text-white shadow-2xl shadow-slate-950/20">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-blue-600 rounded-xl">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Current Location</p>
                                    <p className="text-sm font-black tracking-tight">Service Area</p>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 mb-5">
                                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                    <span>Latitude</span>
                                    <span className="text-blue-400 font-mono">{Number(formData.lat).toFixed(6)}</span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                    <span>Longitude</span>
                                    <span className="text-blue-400 font-mono">{Number(formData.lng).toFixed(6)}</span>
                                </div>
                            </div>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center leading-relaxed">
                                This location applies to all your services
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-900/5 border border-slate-50 space-y-8">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-6 text-sm font-bold text-slate-950 focus:bg-white focus:border-slate-950 transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Address (Provider) */}
                        {user?.role === 'provider' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-5 text-slate-300">
                                        <Navigation className="w-4 h-4" />
                                    </div>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-950 focus:bg-white focus:border-blue-600 transition-all outline-none resize-none leading-relaxed"
                                        placeholder="Your address will auto-fill when you pick a location"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Bio
                            </label>
                            <textarea
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-6 text-sm font-bold text-slate-950 focus:bg-white focus:border-slate-950 transition-all outline-none placeholder:text-slate-300 min-h-[140px] leading-relaxed"
                                placeholder="Tell clients about yourself..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        {/* Location Map Section (Provider Only) */}
                        {user?.role === 'provider' && (
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-wide">Service Location</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">Click on map to select or use current location</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={locationStatus === 'detecting'}
                                            className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                        >
                                            {locationStatus === 'detecting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                                            {locationStatus === 'detecting' ? 'Locating...' : 'Get My Location'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowMap(!showMap)}
                                            className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showMap ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            <MapIcon className="w-3.5 h-3.5" />
                                            {showMap ? 'Hide Map' : 'Select on Map'}
                                        </button>
                                    </div>
                                </div>

                                {showMap && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 relative group/map">
                                            {/* Hover hint */}
                                            <div className="absolute top-8 right-8 z-20 pointer-events-none opacity-0 group-hover/map:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-100 shadow-xl flex items-center gap-2">
                                                    <MousePointer2 className="w-3 h-3 text-blue-600 animate-bounce" />
                                                    <span className="text-[9px] font-black uppercase text-slate-900">Click to select location</span>
                                                </div>
                                            </div>
                                            <MapPicker
                                                lat={formData.lat}
                                                lng={formData.lng}
                                                onPick={handleCoordsSelected}
                                                height="420px"
                                            />
                                            <div className="mt-4 flex gap-6 px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Lat</span>
                                                    <span className="text-xs font-black font-mono text-blue-600">{Number(formData.lat).toFixed(6)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Lng</span>
                                                    <span className="text-xs font-black font-mono text-blue-600">{Number(formData.lng).toFixed(6)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Save */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full py-5 bg-slate-950 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-950/20 active:scale-95 transition-all duration-500"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
