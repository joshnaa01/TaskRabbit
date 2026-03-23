import { useState } from 'react';
import { Image as ImageIcon, X, Loader2, UploadCloud, Plus } from 'lucide-react';
import api from '../../services/api';

const GalleryUpload = ({ onUpdate, currentGallery = [], label = "Image Gallery", limit = 6 }) => {
  const [images, setImages] = useState(currentGallery);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (images.length + files.length > limit) {
      alert(`You can only upload up to ${limit} images.`);
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    setIsUploading(true);
    try {
      const { data } = await api.post('/upload/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImages = [...images, ...data.data];
      setImages(newImages);
      onUpdate(newImages);
    } catch (err) {
      console.error("Gallery upload failed:", err);
      alert("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{images.length}/{limit} Images</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {images.map((img, idx) => (
          <div key={idx} className="relative group aspect-square rounded-[32px] overflow-hidden bg-slate-100 border-2 border-slate-100 border-white shadow-xl shadow-blue-900/5">
            <img 
              src={img.url || img} // Handles both Object or String URL
              alt={`Gallery ${idx}`} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {images.length < limit && (
          <label className={`relative aspect-square rounded-[32px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-blue-100 transition-all transition-colors group ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
            <input 
              type="file" 
              multiple 
              hidden 
              onChange={handleFiles}
              accept="image/*"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-blue-900/5 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Add Image</p>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
};

export default GalleryUpload;
