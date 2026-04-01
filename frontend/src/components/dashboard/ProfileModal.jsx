import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ImageUpload from '../common/ImageUpload';
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
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        profilePicture: user?.profilePicture || '',
        lat: user?.location?.coordinates[1] || '',
        lng: user?.location?.coordinates[0] || ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [locationStatus, setLocationStatus] = useState('idle');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
                lat: user.location?.coordinates[1] || '',
                lng: user.location?.coordinates[0] || ''
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile(formData);
            toast.success("Profile synchronized successfully!");
            setTimeout(onClose, 500);
        } catch (err) {
            console.error(err);
            toast.error("Sync failed. Check connection.");
        } finally {
            setIsUpdating(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return;
        setLocationStatus('detecting');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({ 
                    ...prev, 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude 
                }));
                setLocationStatus('captured');
                toast.success("Location captured!");
            },
            () => {
                setLocationStatus('error');
                toast.error("Location access denied.");
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-8 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-4xl bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 my-auto min-h-full sm:min-h-0">
                {/* Visual Identity Sidebar */}
                <div className="md:w-80 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center shrink-0">
                    <button onClick={onClose} className="absolute top-6 left-6 md:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm z-20">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="mb-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Your Profile</p>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Profile Photo</h2>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-blue-900/5 mb-8 w-full">
                        <ImageUpload 
                            currentImage={formData.profilePicture}
                            onUploadSuccess={(url) => setFormData({...formData, profilePicture: url})}
                        />
                    </div>

                    <div className="w-full space-y-4">
                        <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        
                        {user?.role === 'provider' && (
                            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Navigation className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">Geo-Sync</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400">
                                        <span>LAT:</span>
                                        <span className="text-blue-400 font-mono">{formData.lat ? Number(formData.lat).toFixed(4) : 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400">
                                        <span>LNG:</span>
                                        <span className="text-blue-400 font-mono">{formData.lng ? Number(formData.lng).toFixed(4) : 'NULL'}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={detectLocation}
                                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    {locationStatus === 'detecting' ? 'Locating...' : 'Update Geo'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-8 text-center text-slate-300">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-[8px] font-black uppercase tracking-widest">Secure</p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto overflow-x-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Edit Profile</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update your name, bio, and photo</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all hidden md:flex"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        <div className="space-y-8">
                            <Input 
                                label="Display Name"
                                placeholder="How the world sees you"
                                icon={<User className="w-5 h-5" />}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                className="h-14 rounded-2xl"
                            />

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Professional Bio / Introduction
                                </label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[28px] p-6 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none ring-0 placeholder:text-slate-300 min-h-[140px]"
                                    placeholder="Introduce yourself to the marketplace..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-100"
                            >
                                Discard Changes
                            </Button>
                            <Button 
                                type="submit" 
                                className="flex-[2] h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
