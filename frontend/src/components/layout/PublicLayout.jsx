import Header from './Header';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

const PublicLayout = ({ children, noContainer = false }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden pt-20">
      <Header />

      {/* Main Content */}
      <main className={`relative ${noContainer ? '' : 'max-w-7xl mx-auto px-8'}`}>
        {children}
      </main>

      {/* Modern Footer Implementation */}
      <footer className="bg-slate-900 text-white mt-12 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">TaskRabbit</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">Nepal's leading community-driven marketplace for home services and professional tasks.</p>
                </div>
                
                {[
                    { title: 'Marketplace', links: ['Home Repair', 'Cleaning', 'Moving', 'Marketing'] },
                    { title: 'Company', links: ['About', 'Safety', 'Careers', 'Blog'] },
                    { title: 'Support', links: ['Help Center', 'Trust & Safety', 'Contact Us', 'Terms'] }
                ].map((col) => (
                    <div key={col.title}>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">{col.title}</h4>
                        <ul className="space-y-4">
                            {col.links.map(link => (
                                <li key={link}>
                                    <Link to="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-xs font-bold text-slate-500">© 2026 TaskRabbit Nepal. All rights reserved.</p>
                <div className="flex items-center gap-8">
                    <Link to="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
