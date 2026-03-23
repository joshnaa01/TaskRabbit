import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ImageUpload from '../../components/common/ImageUpload';
import { 
  User, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ShieldCheck,
  Navigation,
  Save,
  Loader2
} from 'lucide-react';

const Profile = () => {
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

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile(formData);
            alert("Profile synchronized successfully!");
        } catch (err) {
            console.error(err);
            alert("Sync failed. Check connection.");
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
            },
            () => setLocationStatus('error')
        );
    };

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile Architecture</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Manage your digital presence and location metrics</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-blue-900/5">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role} Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Visual Identity Section */}
                <div className="lg:col-span-1 space-y-10">
                    <div className="bg-white p-10 rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <ImageUpload 
                                label="Profile Avatar"
                                currentImage={formData.profilePicture}
                                onUploadSuccess={(url) => setFormData({...formData, profilePicture: url})}
                            />
                            <h3 className="text-xl font-black text-slate-900 mt-8">{user?.name}</h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">{user?.email}</p>
                            
                            <div className="w-full mt-10 pt-10 border-t border-slate-50 space-y-4">
                               <div className="flex items-center justify-between px-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</span>
                                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                               </div>
                               <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                  <div className="h-full w-full bg-emerald-500 rounded-full"></div>
                               </div>
                            </div>
                        </div>
                    </div>
                    
                    {user?.role === 'provider' && (
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Navigation className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Proximity Logic</p>
                                    <h4 className="text-lg font-black tracking-tight">Service Radius</h4>
                                </div>
                            </div>
                            <div className="space-y-4">
                               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-bold text-slate-400">LATITUDE</span>
                                     <code className="text-[10px] text-blue-400 font-mono">{formData.lat || 'NULL'}</code>
                                  </div>
                                  <div className="flex justify-between items-center">
                                     <span className="text-[10px] font-bold text-slate-400">LONGITUDE</span>
                                     <code className="text-[10px] text-blue-400 font-mono">{formData.lng || 'NULL'}</code>
                                  </div>
                               </div>
                               <button 
                                 onClick={detectLocation}
                                 className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                               >
                                  {locationStatus === 'detecting' ? 'Locating...' : 'Sync Current Location'}
                               </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Information Logic Section */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="bg-white p-12 rounded-[52px] shadow-2xl shadow-blue-900/5 border border-slate-50 space-y-10 animate-in fade-in slide-in-from-right duration-700">
                        <div className="space-y-8">
                            <Input 
                                label="Legal Full Name"
                                placeholder="Edit your display name"
                                icon={<User className="w-5 h-5" />}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                className="h-16 rounded-[24px]"
                            />

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" /> Professional Bio / About
                                </label>
                                <textarea 
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] p-6 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 transition-all outline-none ring-0 placeholder:text-slate-300 min-h-[160px]"
                                    placeholder="Introduce yourself or your expertise to your clients..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full h-18 rounded-[28px] text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-blue-600/10"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Synchronizing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Persist Profile Changes
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Account Shield</p>
                                <p className="text-[11px] font-bold text-slate-400 leading-none">All changes are immediately reflected across the service marketplace network.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
