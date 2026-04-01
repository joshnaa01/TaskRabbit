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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        icon: 'briefcase' // default icon string
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

    useEffect(() => {
        fetchCategories();
    }, []);

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
        <div className="flex flex-col items-center justify-center h-96 gap-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Categories...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg">
                           <LayoutGrid className="w-5 h-5" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Categories</h1>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Manage your service categories</p>
                </div>

                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all hover:shadow-2xl hover:shadow-blue-900/10 active:scale-95 group"
                >
                    <Plus className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                    {showAddForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* Addition Form */}
            {showAddForm && (
                <div className="bg-white rounded-[48px] border border-slate-50 shadow-2xl shadow-blue-900/5 p-12 transition-all animate-in fade-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Category Name</label>
                                <div className="relative group">
                                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                      type="text" 
                                      placeholder="e.g. Cleaning" 
                                      className="w-full bg-slate-50 border-none rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none"
                                      value={newCategory.name}
                                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Icon Name</label>
                                <div className="relative group">
                                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input 
                                      type="text" 
                                      placeholder="lucide-icon-name (e.g. briefcase)" 
                                      className="w-full bg-slate-50 border-none rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none"
                                      value={newCategory.icon}
                                      onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Description</label>
                             <div className="relative group">
                                 <AlignLeft className="absolute left-6 top-6 w-4 h-4 text-slate-300" />
                                 <textarea 
                                   placeholder="Explain what this category includes..." 
                                   rows="3"
                                   className="w-full bg-slate-50 border-none rounded-[32px] py-6 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-blue-600/5 focus:bg-white transition-all outline-none leading-relaxed"
                                   value={newCategory.description}
                                   onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                                 />
                             </div>
                        </div>
                        <div className="flex justify-end pt-4">
                             <button 
                               type="submit" 
                               disabled={submitting}
                               className="bg-slate-900 text-white px-12 py-5 rounded-[28px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all disabled:opacity-50"
                             >
                                 {submitting ? 'Adding...' : 'Add Category'}
                             </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((cat) => (
                    <div key={cat._id} className="group bg-white rounded-[42px] border border-slate-50 shadow-2xl shadow-blue-900/5 p-8 transition-all hover:shadow-blue-900/10 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:shadow-xl group-hover:shadow-blue-600/20 translate-y-0 group-hover:-translate-y-2">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                <button className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">{cat.name}</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed line-clamp-2">{cat.description || 'System-orchestrated service domain with verified experts.'}</p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300">
                             <div className="flex items-center gap-2">
                                 <LinkIcon className="w-3 h-3" />
                                 {cat.icon || 'default'}
                             </div>
                             {cat.isActive ? (
                                 <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>
                             ) : (
                                 <span className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3" /> Inactive</span>
                             )}
                        </div>
                    </div>
                    ))}
                </div>

                {/* Pagination */}
                {categories.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between px-2 pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, categories.length)} of {categories.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 transition-all">Previous</button>
                            {Array.from({ length: Math.ceil(categories.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === page ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500 hover:border-blue-200'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(categories.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(categories.length / ITEMS_PER_PAGE)} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCategories;
