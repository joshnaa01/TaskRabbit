import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ImageUpload from '../common/ImageUpload';
import MapPicker from '../common/MapPicker';
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
  X,
  Shield,
  LocateFixed,
  Map as MapIcon,
  MousePointer2
} from 'lucide-react';
import { toast } from 'sonner';

const ProfileModal = ({ isOpen, onClose }) => {
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
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                address: user.location?.address || '',
                profilePicture: user.profilePicture || '',
                lat: user.location?.coordinates[1] || 27.717,
                lng: user.location?.coordinates[0] || 85.324
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile(formData);
            toast.success("Profile updated successfully!");
            setTimeout(onClose, 500);
        } catch (err) {
            console.error(err);
            toast.error("Sync failed.");
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
                toast.success('Address synchronized');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return toast.error("Geolocation not supported");
        setLocationStatus('detecting');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleCoordsSelected(position.coords.latitude, position.coords.longitude);
                setLocationStatus('captured');
            },
            () => { setLocationStatus('error'); toast.error("Access denied"); }
        );
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 max-h-[90vh]">
                {/* Profile Visual Sidebar */}
                <div className="md:w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center shrink-0">
                    <div className="w-full mb-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Provider Console</p>
                        <h2 className="text-lg font-black text-slate-950 uppercase italic">Identity Sync</h2>
                    </div>

                    <div className="w-full bg-white p-6 rounded-[32px] shadow-xl shadow-blue-900/5 mb-8 border border-slate-100">
                        <ImageUpload 
                            currentImage={formData.profilePicture}
                            onUploadSuccess={(url) => setFormData({...formData, profilePicture: url})}
                            label="Avatar"
                        />
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">User ID</span>
                            <span className="text-[9px] font-black text-slate-900 font-mono italic">#{user?.id?.slice(-6)}</span>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl text-white">
                             <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2 leading-none">Security Status</p>
                             <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Node</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">Update Profile</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage your service location and identity</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><User className="w-4 h-4" /></div>
                                        <input 
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-950 focus:bg-white focus:border-slate-950 transition-all outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Physical Address</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-5 text-slate-300"><Navigation className="w-4 h-4" /></div>
                                        <textarea 
                                            rows="3"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] py-4 pl-12 pr-6 text-[12px] font-bold text-slate-950 focus:bg-white focus:border-blue-600 transition-all outline-none resize-none leading-relaxed italic"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                                <textarea 
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] p-8 text-[12px] font-bold text-slate-950 focus:bg-white focus:border-slate-950 transition-all outline-none h-[calc(100%-24px)] min-h-[160px] leading-relaxed italic"
                                    placeholder="Tell clients about your work..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Location Management Section */}
                        <div className="pt-6 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-widest">{user?.role === 'provider' ? 'Service Area' : 'My Location'}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Click on the map or use current location</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={detectLocation}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                                        >
                                            <LocateFixed className="w-3.5 h-3.5" />
                                            {locationStatus === 'detecting' ? 'Locating...' : 'Get My Location'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShowMap(!showMap)}
                                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showMap ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            <MapIcon className="w-3.5 h-3.5" />
                                            {showMap ? 'Hide Map' : 'Select on Map'}
                                        </button>
                                    </div>
                                </div>

                                {showMap && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-slate-50 p-4 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative group/map">
                                            <div className="absolute top-8 right-8 z-20 pointer-events-none opacity-0 group-hover/map:opacity-100 transition-opacity">
                                                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-100 shadow-xl flex items-center gap-2">
                                                   <MousePointer2 className="w-3 h-3 text-blue-600 animate-bounce" />
                                                   <span className="text-[9px] font-black uppercase text-slate-900">Click to Select</span>
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
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Latitude</span>
                                                    <span className="text-xs font-black font-mono text-blue-600">[{Number(formData.lat).toFixed(6)}]</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Longitude</span>
                                                    <span className="text-xs font-black font-mono text-blue-600">[{Number(formData.lng).toFixed(6)}]</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        <div className="flex gap-4 pt-10">
                            <button type="button" onClick={onClose} className="flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">Discard Changes</button>
                            <button 
                                type="submit" 
                                disabled={isUpdating}
                                className="flex-[2] py-5 bg-slate-950 hover:bg-emerald-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-95 transition-all duration-500"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
