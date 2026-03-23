import { useState, useRef } from 'react';
import { Camera, X, Loader2, UploadCloud } from 'lucide-react';
import api from '../../services/api';

const ImageUpload = ({ onUploadSuccess, currentImage = null, label = "Upload Image", folder = "general" }) => {
  const [preview, setPreview] = useState(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    setIsUploading(true);
    try {
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUploadSuccess(data.url);
      setPreview(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Try again.");
      setPreview(currentImage); // Rollback
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUploadSuccess(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
      
      <div className="relative group">
        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept="image/*"
        />

        {preview ? (
          <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-slate-100 border-2 border-slate-100">
            <img 
              src={preview} 
              alt="Preview" 
              className={`w-full h-full object-cover transition-all ${isUploading ? 'opacity-40 blur-sm' : 'group-hover:scale-105'}`} 
            />
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : (
              <button 
                onClick={removeImage}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="w-full aspect-video rounded-[32px] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white hover:border-blue-100 transition-all group"
          >
            <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-blue-900/5 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-900">Click to upload</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
