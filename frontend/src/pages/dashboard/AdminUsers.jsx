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
    Check,
    Ban,
    Mail
} from 'lucide-react';
import { toast } from 'sonner';
import AdminEmailModal from './AdminEmailModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [emailModal, setEmailModal] = useState({ open: false, target: 'all' });

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

    const handleApproveStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}`, { isApproved: !currentStatus });
            toast.success(`Provider approval status updated`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update approval status');
        }
    };

    const handleSuspendStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}`, { status: currentStatus === 'suspended' ? 'active' : 'suspended' });
            toast.success(`User suspension status updated`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update suspension status');
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setEmailModal({ open: true, target: filterRole === 'all' ? 'all' : filterRole })}
                        className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/40 transition-all"
                    >
                        <Mail className="w-4 h-4" /> Broadcast Email
                    </button>
                    <button onClick={fetchUsers} className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
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
                                                {user.role === 'provider' && (
                                                    <div className="flex gap-2 mt-2">
                                                        {user.citizenshipDocument && <a href={user.citizenshipDocument} target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-500 hover:text-blue-500 underline">Citizenship</a>}
                                                        {user.workDocument && <a href={user.workDocument} target="_blank" rel="noreferrer" className="text-[9px] font-black text-slate-500 hover:text-blue-500 underline">Work Doc</a>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => handleVerifyStatus(user._id, user.isVerified)}
                                                className={`flex items-center gap-2 w-full justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${user.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100' : 'bg-red-50 text-red-500 border-red-100 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100'}`}
                                            >
                                                {user.isVerified ? <><CheckCircle2 className="w-3.5 h-3.5" /> Verified</> : <><XCircle className="w-3.5 h-3.5" /> Unverified</>}
                                            </button>
                                            {user.role === 'provider' && (
                                                <button
                                                    onClick={() => handleApproveStatus(user._id, user.isApproved)}
                                                    className={`flex items-center gap-2 w-full justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${user.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100' : 'bg-amber-50 text-amber-500 border-amber-100 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100'}`}
                                                >
                                                    {user.isApproved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Approved</> : <><Shield className="w-3.5 h-3.5" /> Pending Approval</>}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 items-center opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEmailModal({ open: true, target: user.email })}
                                                className="p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                                                title="Email User"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleSuspendStatus(user._id, user.status)}
                                                className={`p-3.5 rounded-2xl border transition-all shadow-sm ${user.status === 'suspended' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-white border-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-100'}`}
                                                title={user.status === 'suspended' ? 'Restore Account' : 'Suspend Account'}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
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
            <AdminEmailModal
                isOpen={emailModal.open}
                onClose={() => setEmailModal({ ...emailModal, open: false })}
                initialTarget={emailModal.target}
            />
        </div>
    );
};

export default AdminUsers;
