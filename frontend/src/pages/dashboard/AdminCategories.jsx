import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus,
    Trash2,
    Tag,
    Search,
    CheckCircle,
    AlertCircle,
    Link as LinkIcon,
    LayoutGrid,
    Edit3,
    AlignLeft,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        icon: 'briefcase'
    });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data || []);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load categories");
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCategory.name) return toast.error("Category name is required");

        setSubmitting(true);
        try {
            await api.post('/categories', newCategory);
            toast.success("New Category added");
            setNewCategory({ name: '', description: '', icon: 'briefcase' });
            setShowAddForm(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create category");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading Categories...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100/50">
                <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">Categories</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">{categories.length} Categories</p>
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Active</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-black text-[8px] uppercase tracking-widest transition-all shadow-sm ${showAddForm
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-slate-950 text-white hover:bg-slate-900'
                        }`}
                >
                    <Plus className={`w-3.5 h-3.5 ${showAddForm ? 'rotate-45' : ''}`} />
                    {showAddForm ? 'CANCEL' : 'ADD CATEGORY'}
                </button>
            </div>

            {/* Compact Form */}
            {showAddForm && (
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-lg animate-in zoom-in-95 duration-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cleaning..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-[9px] font-black outline-none focus:border-slate-900 transition-all uppercase placeholder:text-slate-200"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Icon ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. briefcase..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-[9px] font-black outline-none focus:border-slate-900 transition-all uppercase placeholder:text-slate-200"
                                    value={newCategory.icon}
                                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                            <textarea
                                placeholder="Describe this category..."
                                rows="2"
                                className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-1.5 text-[9px] font-black outline-none focus:border-slate-900 transition-all uppercase placeholder:text-slate-200 resize-none"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-slate-950 text-white px-6 py-2 rounded font-black text-[8px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-xl"
                            >
                                {submitting ? 'ADDING...' : 'SAVE CATEGORY'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* High-Density Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categories.map((cat) => (
                    <div key={cat._id} className="group relative bg-white rounded-lg border border-slate-100 p-3 transition-all hover:bg-slate-50 overflow-hidden shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-7 h-7 bg-slate-50 rounded flex items-center justify-center text-slate-300 group-hover:bg-slate-950 group-hover:text-white transition-all border border-slate-100">
                                <Tag className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button className="p-1 text-slate-300 hover:text-slate-950"><Edit3 className="w-3 h-3" /></button>
                                <button className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        </div>
                        <h3 className="text-[9px] font-black text-slate-950 tracking-tight truncate uppercase italic mb-0.5 leading-none">{cat.name}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter line-clamp-1 opacity-60 mb-3 leading-none italic">{cat.description || 'No description'}</p>

                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[6px] font-black text-slate-300 uppercase tracking-[0.2em]">{cat.icon || 'None'}</span>
                            <span className={`w-1 h-1 rounded-full ${cat.isActive ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tactical Pagination */}
            {categories.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                    <p>Showing: {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, categories.length)} / {categories.length}</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setCurrentPage(page)} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">PREVIOUS</button>
                        <span className="text-slate-950 font-black">{currentPage} | {Math.ceil(categories.length / ITEMS_PER_PAGE)}</span>
                        <button onClick={() => setCurrentPage(page)} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">NEXT</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
