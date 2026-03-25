import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Search, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Trash2,
  RefreshCcw,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users' + (filterRole !== 'all' ? `?role=${filterRole}` : ''));
            setUsers(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const handleVerifyStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}`, { isVerified: !currentStatus });
            toast.success(`User verification status updated`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update verification status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? All their bookings and services will be purged.')) return;
        
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User permanently deleted');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity Management</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Oversee Clients, Taskers, and Staff</p>
                </div>
                <button onClick={fetchUsers} className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden flex flex-col">
                {/* Controls */}
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search identities by name or email..." 
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 text-xs font-bold focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        {['all', 'client', 'provider', 'admin'].map(role => (
                            <button 
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === role ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Identity Record</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Authorization Check</th>
                                <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Access Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="3" className="px-10 py-32 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Running identity scan...</td></tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user._id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden text-blue-600 font-black text-xl">
                                                {user.profilePicture ? <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 mb-0.5">{user.name}</p>
                                                <p className="text-xs font-bold text-slate-500">{user.email}</p>
                                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">{user.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <button 
                                                onClick={() => handleVerifyStatus(user._id, user.isVerified)}
                                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${user.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100' : 'bg-red-50 text-red-500 border-red-100 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100'}`}
                                            >
                                                {user.isVerified ? <><CheckCircle2 className="w-3.5 h-3.5" /> Verified</> : <><XCircle className="w-3.5 h-3.5" /> Unverified</>}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 items-center opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => handleDeleteUser(user._id)}
                                              className="p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm" 
                                              title="Destroy Account"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-10 py-32 text-center text-slate-400">
                                         <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                         <p className="text-xs font-black uppercase tracking-widest">No Identities Match Filter</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
