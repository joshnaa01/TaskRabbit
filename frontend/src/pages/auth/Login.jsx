import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogIn, ArrowRight, Chrome, Apple, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 p-10 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
           <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/30">
              <LogIn className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-100 rounded-2xl mb-8 flex items-center justify-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-2xl h-14"
          />
          
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-2xl h-14 pr-12"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <div className="flex justify-end mt-2">
              <Link to="/forgot" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Forgot Password?</Link>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full h-14 rounded-2xl mt-4" disabled={loading}>
            {loading ? 'Entering...' : 'Sign In'}
          </Button>

          <div className="flex items-center gap-4 py-4">
             <div className="flex-1 h-px bg-slate-100"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or access via</span>
             <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-slate-50 rounded-2xl hover:bg-slate-50 hover:border-slate-100 transition-all group">
                <Chrome className="w-5 h-5 text-slate-900 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-700">Google</span>
             </button>
             <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-slate-50 rounded-2xl hover:bg-slate-50 hover:border-slate-100 transition-all group">
                <Apple className="w-5 h-5 text-slate-900 fill-slate-900 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-700">Apple</span>
             </button>
          </div>

          <p className="text-center text-[11px] font-bold text-slate-400 mt-10">
            Don't have an account? {' '}
            <Link to="/register" className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2">Sign up for free</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
