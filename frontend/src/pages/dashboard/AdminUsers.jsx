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
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminEmailModal from './AdminEmailModal';
const ITEMS_PER_PAGE = 10;

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

    const handleCreateGroup = () => {
        if (selectedUserIds.length === 0) return;
        // Join IDs with comma to pass in URL or handle via state/context if possible
        // For now, let's navigate to chat and maybe we can handle a 'participants' query param
        // But the Chat component currently only handles 'to=id'
        // Let's improve Chat.jsx later to handle multiple 'to' if needed, or just navigate and let session be created
        // Actually, easier to navigate to chat and if multiple are selected, open the group modal with these IDs pre-selected
        navigate('/admin/messages', { state: { preSelectedIds: selectedUserIds } });
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
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Users</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Manage clients, providers, and staff</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedUserIds.length > 0 && (
                        <button
                            onClick={handleCreateGroup}
                            className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all animate-in fade-in slide-in-from-right-4"
                        >
                            <MessageSquare className="w-4 h-4" /> Group Message ({selectedUserIds.length})
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (selectedUserIds.length > 0) {
                                const selectedEmails = users.filter(u => selectedUserIds.includes(u._id)).map(u => u.email);
                                setEmailModal({ open: true, target: selectedEmails });
                            } else {
                                setEmailModal({ open: true, target: filterRole === 'all' ? 'all' : filterRole });
                            }
                        }}
                        className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/40 transition-all"
                    >
                        <Mail className="w-4 h-4" /> {selectedUserIds.length > 0 ? `Mass Email (${selectedUserIds.length})` : 'Broadcast Email'}
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
                            placeholder="Search by name or email..."
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 text-xs font-bold focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                                <th className="px-10 py-8 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                                        onChange={toggleAllSelection}
                                    />
                                </th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">User</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Verification</th>
                                <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="3" className="px-10 py-32 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading users...</td></tr>
                            ) : filteredUsers.length > 0 ? (() => {
                                const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
                                const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                                return paginatedUsers.map((user) => (
                                <tr key={user._id} className={`group hover:bg-slate-50/50 transition-all ${selectedUserIds.includes(user._id) ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-10 py-8">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                                            checked={selectedUserIds.includes(user._id)}
                                            onChange={() => toggleUserSelection(user._id)}
                                        />
                                    </td>
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
                                                onClick={() => navigate(`/admin/messages?to=${user._id}`)}
                                                className="p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                                title="Internal Message"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
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
                                                title="Delete Account"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ));
                            })() : (
                                <tr>
                                    <td colSpan="4" className="px-10 py-32 text-center text-slate-400">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p className="text-xs font-black uppercase tracking-widest">No users found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {(() => {
                const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
                if (totalPages <= 1 || filteredUsers.length === 0) return null;
                return (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                        currentPage === page 
                                            ? 'bg-slate-900 text-white shadow-lg' 
                                            : 'bg-white border border-slate-100 text-slate-500 hover:border-blue-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            })()}

            <AdminEmailModal
                isOpen={emailModal.open}
                onClose={() => setEmailModal({ ...emailModal, open: false })}
                initialTarget={emailModal.target}
            />
        </div>
    );
};

export default AdminUsers;

