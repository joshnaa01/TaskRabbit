import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SearchPage from './pages/public/SearchPage';
import ServiceDetails from './pages/public/ServiceDetails';
import DashboardLayout from './components/layout/DashboardLayout';
import BookingsTable from './pages/dashboard/BookingsTable';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import PaymentsTable from './pages/dashboard/PaymentsTable';
import Profile from './pages/dashboard/Profile';

// Layouts
const PublicLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <a href="/" className="text-3xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition-opacity">TaskRabbit</a>
          <nav className="flex gap-10 items-center">
            <a href="/search" className="text-slate-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] transition-colors">Find Services</a>
            {user ? (
              <>
                <a href="/dashboard" className="text-slate-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] transition-colors">Dashboard</a>
                <button 
                  onClick={logout} 
                  className="text-[10px] font-black uppercase tracking-widest border border-slate-200 px-6 py-2.5 rounded-full hover:bg-slate-50 transition-all text-slate-700 shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-slate-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] transition-colors">Log in</a>
                <a 
                  href="/register" 
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] hover:bg-blue-600 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  Sign up
                </a>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="bg-slate-900 pt-24 pb-12 overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-48 -mb-48 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
             <div className="col-span-1 md:col-span-2">
                <p className="text-2xl font-black text-white tracking-tighter mb-6">TaskRabbit</p>
                <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed text-sm opacity-60">Connecting people with verified professionals for every home task. Your peace of mind, our priority.</p>
                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer opacity-70">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                   </div>
                   <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer opacity-70">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>
             </div>
             <div>
                <p className="text-xs font-black text-white uppercase tracking-widest mb-8">Platform</p>
                <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                   <li><a href="/search" className="hover:text-blue-500 transition-colors">Services</a></li>
                   <li><a href="#" className="hover:text-blue-500 transition-colors">Categories</a></li>
                   <li><a href="#" className="hover:text-blue-500 transition-colors">Providers</a></li>
                </ul>
             </div>
             <div>
                <p className="text-xs font-black text-white uppercase tracking-widest mb-8">Trust</p>
                <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
                   <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                   <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
                </ul>
             </div>
          </div>
          <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 TaskRabbit. Designed in Nepal.</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Powered by Advanced Agentic AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
              <Route path="/nearby" element={<Navigate to="/search" replace />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardOverview />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/bookings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <BookingsTable />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/payments" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PaymentsTable />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/messages" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-20 text-center flex flex-col items-center">
                       <p className="text-4xl font-black text-slate-900 tracking-tight mb-4">Secure Messaging</p>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chat module activation scheduled for next phase</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/profile" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
