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
    Mail,
    MessageSquare,
    Briefcase,
    UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminEmailModal from './AdminEmailModal';
const ITEMS_PER_PAGE = 15;

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [emailModal, setEmailModal] = useState({ open: false, target: 'all' });
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

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

    const toggleUserSelection = (id) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const toggleAllSelection = () => {
        if (selectedUserIds.length === filteredUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(filteredUsers.map(u => u._id));
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100/50">
                <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">User Registry</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">Total: {users.length}</p>
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">System Online</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'client', label: 'Clients' },
                        { id: 'provider', label: 'Providers' },
                        { id: 'admin', label: 'Admins' }
                    ].map((r) => (
                        <button
                            key={r.id}
                            onClick={() => { setFilterRole(r.id); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${filterRole === r.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tactical Search Console */}
            <div className="bg-white p-0.5 rounded-lg flex items-center border border-slate-200 shadow-sm">
                <div className="px-3 py-1.5 text-slate-300 shrink-0">
                    <Search className="w-3.5 h-3.5" />
                </div>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="flex-1 bg-transparent px-2 py-1 text-[9px] outline-none text-slate-950 font-black uppercase tracking-[0.2em] placeholder:text-slate-200"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <button
                    onClick={fetchUsers}
                    className="p-2 text-slate-300 hover:text-slate-950 transition-colors border-l border-slate-100"
                >
                    <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* High-Density Data Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left align-middle whitespace-nowrap">
                        <thead className="bg-slate-50/50 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-2.5">User Information</th>
                                <th className="px-5 py-2.5 text-center">Status & Verification</th>
                                <th className="px-5 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700 leading-none">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-4 py-16 text-center text-gray-400 opacity-50">
                                        <RefreshCcw className="w-6 h-6 mx-auto mb-2 animate-spin text-slate-300" />
                                        <p className="text-[8px] font-black uppercase tracking-widest">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-5 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-black text-[10px] shrink-0 overflow-hidden group-hover:bg-slate-950 group-hover:text-white transition-all">
                                                    {user.profilePicture ? <img src={user.profilePicture} alt="PFP" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-950 text-xs truncate tracking-tight uppercase leading-none mb-1">{user.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[7px] px-1 py-0.5 rounded uppercase font-black tracking-widest leading-none ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'provider' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {user.role}
                                                        </span>
                                                        <p className="text-[8px] text-slate-400 truncate font-black uppercase tracking-tighter leading-none italic">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-2">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleVerifyStatus(user._id, user.isVerified)}
                                                    className={`flex items-center gap-1 px-1.5 py-1 rounded text-[7px] font-black uppercase tracking-widest border transition-all ${user.isVerified
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                >
                                                    {user.isVerified ? 'Verified' : 'Pending'}
                                                </button>

                                                {user.role === 'provider' && (
                                                    <button
                                                        onClick={() => handleApproveStatus(user._id, user.isApproved)}
                                                        className={`flex items-center gap-1 px-1.5 py-1 rounded text-[7px] font-black uppercase tracking-widest border transition-all ${user.isApproved
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}
                                                    >
                                                        {user.isApproved ? 'Approved' : 'Review Required'}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleSuspendStatus(user._id, user.status)}
                                                    className={`flex items-center gap-1 px-1.5 py-1 rounded text-[7px] font-black uppercase tracking-widest border transition-all ${user.status === 'suspended'
                                                        ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100 italic'
                                                        }`}
                                                >
                                                    {user.status === 'suspended' ? 'Restore' : 'Suspend'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/admin/messages?to=${user._id}`)}
                                                    className="p-1.5 text-slate-300 hover:text-slate-950 hover:bg-slate-50 rounded transition-all"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-16 text-center text-slate-300 opacity-40">
                                        <UserCircle className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-[9px] font-black uppercase tracking-widest">No users found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tactical Pagination */}
            <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                <p>Showing: {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} / {filteredUsers.length}</p>
                <div className="flex items-center gap-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">PREVIOUS</button>
                    <span className="text-slate-950 font-black">{currentPage} | {Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">NEXT</button>
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
