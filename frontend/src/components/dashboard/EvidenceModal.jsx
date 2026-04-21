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
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 font-display">Submit Work</h3>
                            <p className="text-gray-500 text-sm mt-1">Upload your completed files for Admin verification and Client review.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Summary of Work */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Message for review</label>
                            <div className="relative">
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 min-h-[120px] placeholder:text-gray-400"
                                    placeholder="Describe your work..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Artifact Attachment */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700">Attachments</label>
                                <span className="text-xs text-gray-500">{files.length} added</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {files.map((file, i) => (
                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 animate-in zoom-in-95 duration-200">
                                        <img src={file} className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => removeFile(file)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 shadow-sm text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                
                                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors aspect-square 
                                    ${isUploading ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-gray-50 border-gray-200 hover:border-blue-500 hover:bg-blue-50/50'}`}>
                                    <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    <UploadCloud className={`w-6 h-6 mb-2 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                                    <span className="text-xs font-semibold text-gray-500">
                                        {isUploading ? 'Uploading...' : 'Upload Files'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading || !message || files.length === 0}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    'Submitting...'
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" /> Submit for Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceModal;
