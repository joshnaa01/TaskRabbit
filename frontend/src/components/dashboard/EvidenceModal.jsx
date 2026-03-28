import React, { useState } from 'react';
import { 
    X, 
    UploadCloud, 
    FileText, 
    Lock, 
    Zap, 
    CheckCircle, 
    Trash2, 
    PlusCircle,
    BadgeCheck
} from 'lucide-react';
import api from '../../services/api';

const EvidenceModal = ({ isOpen, onClose, onSubmit, bookingId }) => {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileUpload = async (e) => {
        const fileList = Array.from(e.target.files);
        if (!fileList.length) return;

        setIsUploading(true);
        try {
            const uploadedUrls = [];
            for (const file of fileList) {
                const formData = new FormData();
                formData.append('file', file);
                const res = await api.post('/upload', formData);
                uploadedUrls.push(res.data.url);
            }
            setFiles(prev => [...prev, ...uploadedUrls]);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = (url) => {
        setFiles(prev => prev.filter(f => f !== url));
    };

    const handleSubmit = async () => {
        if (!message || files.length === 0) return;
        setIsSubmitting(true);
        try {
            await onSubmit(bookingId, { message, files });
            onClose();
        } catch (err) {
            console.error("Submission failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400" />
                
                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <BadgeCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deliver Artifacts</h3>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Evidence Protocol Active</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 bg-slate-50 rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-10">
                        {/* Summary of Work */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Explanatory Intelligence</label>
                            <div className="relative group">
                                <textarea 
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] p-8 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-8 focus:ring-blue-400/5 transition-all min-h-[140px] placeholder:text-slate-300"
                                    placeholder="Briefly summarize the deliverables, technical specifics, and any handover instructions..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="absolute top-8 right-8 text-slate-200 group-focus-within:text-blue-400/30 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Artifact Attachment */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Fulfillment Evidence ({files.length})</label>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {files.map((file, i) => (
                                    <div key={i} className="relative group aspect-square rounded-[24px] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm animate-in zoom-in-75 duration-300">
                                        <img src={file} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        <button 
                                            onClick={() => removeFile(file)}
                                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur shadow-sm text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                
                                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[24px] cursor-pointer transition-all aspect-square 
                                    ${isUploading ? 'bg-slate-50 border-slate-200 opacity-50' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 active:scale-95'}`}>
                                    <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    <div className={`p-4 rounded-[20px] bg-white shadow-sm mb-2 ${isUploading ? 'animate-pulse' : ''}`}>
                                        <UploadCloud className={`w-6 h-6 ${isUploading ? 'text-blue-500' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {isUploading ? 'Processing...' : 'Attach Data'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading || !message || files.length === 0}
                                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:opacity-30 disabled:shadow-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Zap className="w-4 h-4 animate-spin text-blue-400" /> Committing Artifacts...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" /> Finalize Work Verification
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-2 opacity-50">
                                <Lock className="w-3 h-3 text-indigo-500" />
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encryption • Final Delivery</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceModal;
