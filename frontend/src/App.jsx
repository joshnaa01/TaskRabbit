import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Toaster } from 'sonner';

// Layouts
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Pages
import Home from './pages/public/Home';
import SearchPage from './pages/public/SearchPage';
import ServiceDetails from './pages/public/ServiceDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import BookingsTable from './pages/dashboard/BookingsTable';
import PaymentsTable from './pages/dashboard/PaymentsTable';
import ProviderServices from './pages/dashboard/ProviderServices';
import AddService from './pages/dashboard/AddService';
import Chat from './pages/dashboard/Chat';
import AdminCategories from './pages/dashboard/AdminCategories';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminDisputes from './pages/dashboard/AdminDisputes';

// Role-based Route Protection
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Dynamic Dashboard Layout Wrapper
const DynamicLayout = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Toaster position="top-center" richColors />
        <Router>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<PublicLayout noContainer><Home /></PublicLayout>} />
            <Route path="/search" element={<PublicLayout noContainer><SearchPage /></PublicLayout>} />
            <Route path="/service/:id" element={<PublicLayout noContainer><ServiceDetails /></PublicLayout>} />
            <Route path="/how-it-works" element={<PublicLayout noContainer><HowItWorks /></PublicLayout>} />
            <Route path="/nearby" element={<Navigate to="/search" replace />} />

            <Route path="/contact" element={<PublicLayout noContainer><Contact /></PublicLayout>} />

            {/* GUEST ONLY */}
            <Route path="/login" element={<PublicLayout noContainer><GuestRoute><Login /></GuestRoute></PublicLayout>} />
            <Route path="/register" element={<PublicLayout noContainer><GuestRoute><Register /></GuestRoute></PublicLayout>} />

            {/* SHARED DASHBOARD - ROLE SENSITIVE LAYOUT */}
            <Route path="/dashboard" element={<ProtectedRoute><DynamicLayout><DashboardOverview /></DynamicLayout></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><DynamicLayout><BookingsTable /></DynamicLayout></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><DynamicLayout><Chat /></DynamicLayout></ProtectedRoute>} />

            {/* CLIENT ONLY */}
            <Route path="/dashboard/payments" element={<RoleRoute roles={['client','admin']}><DynamicLayout><PaymentsTable /></DynamicLayout></RoleRoute>} />

            {/* PROVIDER ONLY */}
            <Route path="/dashboard/services" element={<RoleRoute roles={['provider','admin']}><DashboardLayout><ProviderServices /></DashboardLayout></RoleRoute>} />
            <Route path="/dashboard/services/preview/:id" element={<RoleRoute roles={['provider','admin']}><DashboardLayout><ServiceDetails /></DashboardLayout></RoleRoute>} />
            <Route path="/dashboard/services/add" element={<RoleRoute roles={['provider','admin']}><DashboardLayout><AddService /></DashboardLayout></RoleRoute>} />
            <Route path="/dashboard/services/edit/:id" element={<RoleRoute roles={['provider','admin']}><DashboardLayout><AddService /></DashboardLayout></RoleRoute>} />
            <Route path="/dashboard/earnings" element={
              <RoleRoute roles={['provider','admin']}><DashboardLayout>
                <div className="p-20 text-center flex flex-col items-center">
                   <p className="text-4xl font-black text-slate-900 tracking-tight mb-4">Financial Command</p>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ledger reconciliation active</p>
                </div>
              </DashboardLayout></RoleRoute>
            } />

            {/* ADMIN ONLY */}
            <Route path="/dashboard/categories" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminCategories /></DashboardLayout></RoleRoute>} />
            <Route path="/dashboard/users" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminUsers /></DashboardLayout></RoleRoute>} />
            <Route path="/dashboard/disputes" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminDisputes /></DashboardLayout></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></RoleRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
