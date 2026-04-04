import React, { useState } from 'react';
import { Mail, X, Send, Users, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

const TEMPLATES = {
    'custom': { subject: '', message: '' },
    'maintenance': {
        subject: '⚠️ System Maintenance Notice',
        message: 'Dear User,\n\nWe would like to inform you that TaskRabbit will be undergoing scheduled maintenance on [Date] between [Time]. During this period, the portal may be temporarily unavailable.\n\nWe apologize for any inconvenience caused.\n\nBest regards,\nThe Administrative Team'
    },
    'policy_update': {
        subject: '📜 Update to our Terms of Service',
        message: 'Dear Community member,\n\nWe have updated our platform policies to better serve your ecosystem. The key changes involve [Summary of Changes].\n\nPlease review the updated terms in your profile dashboard.\n\nThank you for being part of TaskRabbit.'
    },
    'provider_welcome': {
        subject: '🚀 Welcome to our Provider Network!',
        message: 'Hello,\n\nCongratulations! Your provider status has been successfully verified. You can now start listing your services and accepting bookings from clients in your area.\n\nMake sure your location and availability and accurate for maximum visibility.\n\nHappy Tasking!'
    },
    'urgent_announcement': {
        subject: '⚡ Urgent System Announcement',
        message: 'Attention TaskRabbit Users,\n\n[Urgent message details go here]. We require your immediate attention regarding this update.\n\nSpecifically: [Action needed].\n\nThank you for your prompt response.'
    }
};

const AdminEmailModal = ({ isOpen, onClose, initialTarget = 'all' }) => {
    const isEmailArray = Array.isArray(initialTarget);
    const [selectedTemplate, setSelectedTemplate] = useState('custom');
    const [formData, setFormData] = useState({
        to: initialTarget === 'all' || initialTarget === 'client' || initialTarget === 'provider' ? 'all' : initialTarget,
        role: initialTarget === 'client' || initialTarget === 'provider' ? initialTarget : 'all',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleTemplateChange = (key) => {
        setSelectedTemplate(key);
        if (key !== 'custom') {
            setFormData({
                ...formData,
                subject: TEMPLATES[key].subject,
                message: TEMPLATES[key].message
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSending(true);
            await api.post('/admin/email', formData);
            toast.success('Email(s) sent successfully!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-[36px] shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                {isEmailArray ? 'Mass Notification' : formData.to === 'all' ? 'Mass Broadcast' : 'Direct Message'}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator Communication Terminal</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Target Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Recipient Target</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                                    value={isEmailArray ? 'selection' : (initialTarget === 'all' || initialTarget === 'client' || initialTarget === 'provider' ? formData.role : 'individual')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'individual') {
                                            setFormData({ ...formData, to: '', role: 'all' });
                                        } else if (val === 'selection') {
                                            setFormData({ ...formData, to: isEmailArray ? initialTarget : '', role: 'all' });
                                        } else {
                                            setFormData({ ...formData, to: 'all', role: val });
                                        }
                                    }}
                                >
                                    <option value="all">Every Account</option>
                                    <option value="client">All Clients</option>
                                    <option value="provider">All Providers</option>
                                    {isEmailArray && <option value="selection">Current Selection ({initialTarget.length})</option>}
                                    <option value="individual">Specific Email Address</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Template Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mail Template</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-900 text-white border-0 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-4 focus:ring-blue-600/20 transition-all cursor-pointer"
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                >
                                    <option value="custom">Custom Format</option>
                                    <option value="maintenance">Maintenance Notice</option>
                                    <option value="policy_update">Policy Update</option>
                                    <option value="provider_welcome">Provider Welcome</option>
                                    <option value="urgent_announcement">Urgent Announcement</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                            </div>
                        </div>

                        {/* Specific Email (only if individual is selected) */}
                        {(formData.to !== 'all' || (initialTarget !== 'all' && initialTarget !== 'client' && initialTarget !== 'provider')) && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-left duration-300 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="jane@example.com"
                                    className="w-full bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                                    value={formData.to === 'all' ? '' : formData.to}
                                    onChange={(e) => setFormData({ ...formData, to: e.target.value, role: 'all' })}
                                    required={formData.to !== 'all'}
                                />
                            </div>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Broadcast Subject</label>
                        <input
                            type="text"
                            placeholder="System Maintenance Announcement..."
                            className="w-full bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                    </div>

                    {/* Message Body */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Message Payload (HTML Supported)</label>
                        <textarea
                            placeholder="Write your message here. Newlines will be converted to paragraph breaks automatically."
                            className="w-full bg-slate-50 text-slate-900 border border-slate-100 rounded-[32px] p-6 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all min-h-[200px] resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                        >
                            Abort Changes
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {sending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Initiating Transfer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEmailModal
