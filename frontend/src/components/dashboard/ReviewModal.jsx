import React, { useState } from 'react';
import { 
    X, 
    Star, 
    MessageSquare, 
    Heart, 
    ShieldCheck,
    Award,
    Zap
} from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit, bookingId }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(bookingId, { rating, comment });
            onClose();
        } catch (err) {
            console.error("Review error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Visual Header Accent */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
                
                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Award className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rate Your Experience</h3>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Impression Management Protocol</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 bg-slate-50 rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-10">
                        {/* Rating Logic */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Quantifiable Satisfaction</label>
                            <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 ring-1 ring-slate-100 shadow-inner">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setRating(star)}
                                        className={`transition-all duration-300 group ${star <= rating ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <Star className={`w-10 h-10 ${star <= rating ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-slate-300'}`} />
                                        <p className={`text-[8px] font-black uppercase tracking-widest mt-2 text-center transition-opacity ${star === rating ? 'opacity-100' : 'opacity-0'}`}>
                                            {star === 5 ? 'Elite' : star === 4 ? 'Great' : star === 3 ? 'Fair' : star === 2 ? 'Weak' : 'Poor'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Qualitative Feedback */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Qualitative Intelligence</label>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${comment.length < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {comment.length} / 500
                                </span>
                            </div>
                            <div className="relative group">
                                <textarea 
                                    className="w-full bg-white border-2 border-slate-100 rounded-[32px] p-8 text-sm font-bold text-slate-700 outline-none focus:border-amber-400 focus:ring-8 focus:ring-amber-400/5 transition-all min-h-[160px] placeholder:text-slate-300"
                                    placeholder="Briefly describe the quality of service, communication efficiency, and technical fulfillment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="absolute top-8 right-8 text-slate-200 group-focus-within:text-amber-400/30 transition-colors">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || comment.length < 5}
                                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-4 hover:bg-amber-500 transition-all shadow-2xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-30 disabled:shadow-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Zap className="w-4 h-4 animate-spin" /> Recording Experience...
                                    </>
                                ) : (
                                    <>
                                        <Heart className={`w-4 h-4 ${rating >= 4 ? 'fill-white' : ''}`} /> Record Final Impression
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-2 opacity-50">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified Marketplace Transaction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
