import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ImageUpload from '../../components/common/ImageUpload';
import {
  UserPlus,
  Navigation,
  Info,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    lat: '',
    lng: '',
    profilePicture: '',
    citizenshipDocument: '',
    workDocument: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');

  // Real-time validation states
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordStrong = formData.password.length >= 6;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

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
      () => setLocationStatus('error'),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (formData.role === 'provider' && locationStatus === 'idle') {
      detectLocation();
    }
  }, [formData.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'provider' && !formData.lat) {
      setError('Location required for providers');
      return;
    }
    if (formData.role === 'provider' && (!formData.citizenshipDocument || !formData.workDocument)) {
      setError('Citizenship and Work documents are required for providers');
      return;
    }
    if (!isEmailValid || !isPasswordStrong) {
      setError('Please fix form errors');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(formData);
      toast.success("Account created successfully! Welcome to TaskRabbit.");
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Registration failed';
      if (!err.response) {
        msg = 'Server problem - connection unstable';
      } else if (err.response.status >= 500) {
        msg = 'Server problem - please try again later';
      } else {
        msg = err.response.data?.message || 'Registration failed';
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 p-8 lg:p-12 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Join our service network today</p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'client' })}
            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'client' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500'}`}
          >
            I'm a Client
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'provider' })}
            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'provider' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500'}`}
          >
            I'm a Provider
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Compact Profile Picture - Only for Providers during signup */}
          {formData.role === 'provider' && (
            <div className="flex flex-col gap-4 mb-2">
              <div className="w-full">
                <ImageUpload
                  label="Profile Picture"
                  onUploadSuccess={(url) => setFormData({ ...formData, profilePicture: url })}
                />
              </div>
              <div className="w-full">
                <ImageUpload
                  label="Citizenship Document"
                  onUploadSuccess={(url) => setFormData({ ...formData, citizenshipDocument: url })}
                />
              </div>
              <div className="w-full">
                <ImageUpload
                  label="Work Document"
                  onUploadSuccess={(url) => setFormData({ ...formData, workDocument: url })}
                />
              </div>
            </div>
          )}


          {/* Inline Geolocation Status for Providers */}
          {formData.role === 'provider' && (
            <div className={`p-4 rounded-2xl border transition-all ${locationStatus === 'captured' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Navigation className={`w-4 h-4 ${locationStatus === 'detecting' ? 'animate-spin text-blue-600' : 'text-blue-400'}`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    {locationStatus === 'captured' ? 'Location Secured ✅' : 'Area Verification'}
                  </span>
                </div>
                {locationStatus === 'error' && (
                  <button type="button" onClick={detectLocation} className="text-[10px] font-black text-blue-600 uppercase underline">Retry</button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Full Name"
              icon={<UserIcon className="w-4 h-4" />}
              placeholder="Ex. Girindra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-14 rounded-2xl"
            />

            <div className="relative">
              <Input
                label="Email Address"
                icon={<Mail className="w-4 h-4" />}
                type="email"
                placeholder="name@email.com"
                value={formData.email}
                onFocus={() => setEmailFocus(true)}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-14 rounded-2xl"
              />
              {emailFocus && formData.email && !isEmailValid && (
                <p className="absolute -bottom-5 left-1 text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5" /> Invalid Email
                </p>
              )}
            </div>

            <div className="relative">
              <Input
                label="Password"
                icon={<Lock className="w-4 h-4" />}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onFocus={() => setPasswordFocus(true)}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-14 rounded-2xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {passwordFocus && formData.password && (
                <div className="absolute -bottom-5 left-1 right-1 flex items-center gap-2">
                  <div className="flex-1 h-1 flex gap-0.5">
                    <div className={`flex-1 rounded-full ${formData.password.length >= 4 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                    <div className={`flex-1 rounded-full ${formData.password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                    <div className={`flex-1 rounded-full ${formData.password.length >= 10 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    {formData.password.length < 6 ? 'Weak' : 'Strong'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl flex items-center justify-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 rounded-2xl shadow-xl shadow-blue-600/10"
              disabled={loading || (formData.role === 'provider' && locationStatus !== 'captured')}
            >
              {loading ? 'Processing...' : (
                <span className="flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                  Sign Up <UserPlus className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>

          <p className="text-center text-[11px] font-bold text-slate-400 pt-4">
            Already have an account? {' '}
            <Link to="/login" className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
