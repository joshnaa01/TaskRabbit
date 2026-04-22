import React, { useState, useEffect } from 'react';
import { 
    X, 
    Star, 
    MessageSquare, 
    Heart, 
    ShieldCheck,
    Award,
    Zap
} from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setRating(initialData.rating || 5);
                setComment(initialData.comment || '');
            } else {
                setRating(5);
                setComment('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({ rating, comment });
            onClose();
        } catch (err) {
            console.error("Review error:", err);
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
                            <h3 className="text-xl font-bold text-gray-900 font-display">Leave a Review</h3>
                            <p className="text-gray-500 text-sm mt-1">Share your experience with this service provider.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Rating Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Rating</label>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setRating(star)}
                                        className="transition-transform group hover:scale-110 focus:outline-none"
                                    >
                                        <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Written Feedback */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">Comments</label>
                                <span className={`text-xs ${comment.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {comment.length} / 500
                                </span>
                            </div>
                            <div className="relative">
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 min-h-[140px] placeholder:text-gray-400"
                                    placeholder="What did you like or dislike? How was the service quality?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || comment.length < 5}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    'Submitting Review...'
                                ) : (
                                    <>
                                        <Heart className={`w-4 h-4 ${rating >= 4 ? 'fill-white' : ''}`} /> Submit Review
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

export default ReviewModal;
