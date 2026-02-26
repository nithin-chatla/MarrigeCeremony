import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Image as ImageIcon, Plus, Check, AlertCircle, ArrowLeft, Save, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchWeddingDetails, updateWeddingDetails, fetchGalleryImages, addGalleryImage, deleteGalleryImage, fetchBlessings, deleteBlessing } from './cms-service';
import { type GalleryImage } from './wedding-config';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function Admin() {
  const [details, setDetails] = useState<any>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [blessings, setBlessings] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadData = async () => {
      const d = await fetchWeddingDetails();
      if (d) setDetails(d);
      const i = await fetchGalleryImages();
      setImages(i);
      const b = await fetchBlessings();
      setBlessings(b);
    };
    loadData();

    // Load Cloudinary script
    const script = document.createElement('script');
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateWeddingDetails(details);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dugnv4zww";
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "marrige";

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment variables.");
      return;
    }

    if (!window.cloudinary) {
      alert("Cloudinary script is still loading. Please wait a moment.");
      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const newImage = {
            url: result.info.secure_url,
            category: 'Wedding' as const,
            title: result.info.original_filename || 'New Memory'
          };
          const id = await addGalleryImage(newImage);
          setImages([{ id, ...newImage }, ...images]);
        }
      }
    );
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    await deleteGalleryImage(id);
    setImages(images.filter(img => img.id !== id));
  };

  const handleDeleteBlessing = async (id: string) => {
    if (!confirm('Delete this blessing?')) return;
    await deleteBlessing(id);
    setBlessings(blessings.filter(b => b.id !== id));
  };

  if (!details) return <div className="min-h-screen bg-telangana-cream flex items-center justify-center font-traditional text-2xl">Loading Sanctuary...</div>;

  return (
    <div className="min-h-screen bg-telangana-cream p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 text-telangana-red hover:text-telangana-orange transition-colors mb-4 font-bold uppercase tracking-widest text-xs">
              <ArrowLeft size={16} /> Back to Site
            </Link>
            <h1 className="text-5xl font-traditional font-bold text-telangana-red">Sanctuary CMS</h1>
            <p className="text-telangana-orange uppercase tracking-[0.4em] text-[10px] font-bold mt-2">Manage Your Sacred Details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Text CMS */}
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2rem] traditional-border">
              <h2 className="text-2xl font-traditional font-bold text-telangana-red mb-8 flex items-center gap-3">
                <Save className="text-telangana-gold" /> Wedding Details
              </h2>
              <form onSubmit={handleSaveDetails} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-2">Groom Name</label>
                    <input 
                      type="text" 
                      value={details.groom}
                      onChange={(e) => setDetails({...details, groom: e.target.value})}
                      className="w-full bg-white border-2 border-stone-100 rounded-xl px-6 py-3 focus:border-telangana-red outline-none transition-all font-traditional"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-2">Bride Name</label>
                    <input 
                      type="text" 
                      value={details.bride}
                      onChange={(e) => setDetails({...details, bride: e.target.value})}
                      className="w-full bg-white border-2 border-stone-100 rounded-xl px-6 py-3 focus:border-telangana-red outline-none transition-all font-traditional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-2">Wedding Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={details.date.slice(0, 16)}
                    onChange={(e) => setDetails({...details, date: e.target.value})}
                    className="w-full bg-white border-2 border-stone-100 rounded-xl px-6 py-3 focus:border-telangana-red outline-none transition-all font-traditional"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-2">Venue</label>
                  <input 
                    type="text" 
                    value={details.venue}
                    onChange={(e) => setDetails({...details, venue: e.target.value})}
                    className="w-full bg-white border-2 border-stone-100 rounded-xl px-6 py-3 focus:border-telangana-red outline-none transition-all font-traditional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-2">Groom's Father</label>
                    <input 
                      type="text" 
                      value={details.parents?.groom?.father || ''}
                      onChange={(e) => setDetails({...details, parents: {...details.parents, groom: {...details.parents?.groom, father: e.target.value}}})}
                      className="w-full bg-white border-2 border-stone-100 rounded-xl px-6 py-3 focus:border-telangana-red outline-none transition-all font-traditional"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-2">Groom's Mother</label>
                    <input 
                      type="text" 
                      value={details.parents?.groom?.mother || ''}
                      onChange={(e) => setDetails({...details, parents: {...details.parents, groom: {...details.parents?.groom, mother: e.target.value}}})}
                      className="w-full bg-white border-2 border-stone-100 rounded-xl px-6 py-3 focus:border-telangana-red outline-none transition-all font-traditional"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full btn-traditional !bg-telangana-red !text-telangana-yellow border-none py-4 flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Update Details"}
                </button>

                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald-600 text-center font-bold text-xs">
                      Details Updated Successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Gallery CMS */}
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2rem] traditional-border">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-traditional font-bold text-telangana-red flex items-center gap-3">
                  <ImageIcon className="text-telangana-gold" /> Gallery
                </h2>
                <button 
                  onClick={handleUpload}
                  className="bg-telangana-red text-telangana-yellow px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                >
                  <Plus size={14} /> Upload to Cloudinary
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {images.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-stone-100">
                    <img src={img.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        className="bg-white text-telangana-red p-2 rounded-lg hover:bg-telangana-red hover:text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blessings CMS */}
            <div className="glass-card p-8 rounded-[2rem] traditional-border">
              <h2 className="text-2xl font-traditional font-bold text-telangana-red mb-8 flex items-center gap-3">
                <MessageSquare className="text-telangana-gold" /> Blessings
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {blessings.map(b => (
                  <div key={b.id} className="p-4 bg-white rounded-xl border-2 border-stone-100 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-telangana-red">{b.name}</p>
                      <p className="text-stone-500 text-sm italic">"{b.message}"</p>
                      <p className="text-[9px] text-stone-400 uppercase tracking-widest mt-1">{b.date}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteBlessing(b.id)}
                      className="text-stone-300 hover:text-telangana-red transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
