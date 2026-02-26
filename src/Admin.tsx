import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Image as ImageIcon, Plus, Check, AlertCircle, ArrowLeft, Save, MessageSquare, LogIn, LogOut, Lock, User, Key, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase-config';
import { fetchWeddingDetails, updateWeddingDetails, fetchGalleryImages, addGalleryImage, deleteGalleryImage, fetchBlessings, deleteBlessing } from './cms-service';
import { type GalleryImage } from './wedding-config';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function Admin() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [details, setDetails] = useState<any>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [blessings, setBlessings] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const d = await fetchWeddingDetails();
          if (d) setDetails(d);
          const i = await fetchGalleryImages();
          setImages(i);
          const b = await fetchBlessings();
          setBlessings(b);
        } catch (error) {
          console.error("Error loading admin data:", error);
        }
      };
      loadData();

      // Load Cloudinary script
      if (!document.getElementById('cloudinary-script')) {
        const script = document.createElement('script');
        script.id = 'cloudinary-script';
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError('Invalid email or password. Please try again.');
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details) return;
    setIsSaving(true);
    try {
      await updateWeddingDetails(details);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dugnv4zww";
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "marrige";

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary is not configured correctly.");
      return;
    }

    if (!window.cloudinary) {
      alert("Cloudinary script is still loading. Please wait.");
      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        theme: 'minimal',
        colors: {
          primary: '#8B0000',
        }
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const newImage = {
            url: result.info.secure_url,
            category: 'Wedding' as const,
            title: result.info.original_filename || 'New Memory'
          };
          try {
            const id = await addGalleryImage(newImage);
            setImages([{ id, ...newImage }, ...images]);
          } catch (err) {
            console.error("Error adding image to Firestore:", err);
            alert("Image uploaded to Cloudinary but failed to save to database.");
          }
        }
      }
    );
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await deleteGalleryImage(id);
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error("Delete image error:", error);
      alert("Failed to delete image.");
    }
  };

  const handleDeleteBlessing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blessing?')) return;
    try {
      await deleteBlessing(id);
      setBlessings(blessings.filter(b => b.id !== id));
    } catch (error) {
      console.error("Delete blessing error:", error);
      alert("Failed to delete blessing.");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-telangana-cream flex flex-col items-center justify-center font-traditional">
        <Loader2 className="w-12 h-12 text-telangana-red animate-spin mb-4" />
        <p className="text-xl text-telangana-red font-bold">Verifying Sanctuary Access...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-telangana-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-telangana-red/10"
        >
          <div className="bg-telangana-red p-12 text-center relative overflow-hidden">
            <div className="marigold-garland absolute inset-0 opacity-10" />
            <Lock className="w-16 h-16 text-telangana-yellow mx-auto mb-6 relative z-10" />
            <h1 className="text-4xl font-traditional font-bold text-telangana-yellow relative z-10">Admin Sanctuary</h1>
            <p className="text-telangana-yellow/70 uppercase tracking-[0.3em] text-[10px] font-bold mt-2 relative z-10">Restricted Access</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-12 space-y-8">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border border-red-100">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Email Address</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sanctuary.com"
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl pl-14 pr-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Password</label>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl pl-14 pr-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-telangana-red text-telangana-yellow py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-telangana-orange transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" /> : <LogIn size={18} />}
              {isLoggingIn ? "Authenticating..." : "Enter Sanctuary"}
            </button>
            
            <Link to="/" className="block text-center text-stone-400 hover:text-telangana-red transition-colors text-[10px] uppercase tracking-widest font-bold">
              Return to Public Site
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!details) return (
    <div className="min-h-screen bg-telangana-cream flex flex-col items-center justify-center font-traditional">
      <Loader2 className="w-12 h-12 text-telangana-red animate-spin mb-4" />
      <p className="text-xl text-telangana-red font-bold">Loading Sacred Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-telangana-cream p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 text-telangana-red hover:text-telangana-orange transition-colors mb-4 font-bold uppercase tracking-widest text-[10px]">
              <ArrowLeft size={14} /> Back to Site
            </Link>
            <h1 className="text-5xl font-traditional font-bold text-telangana-red">Sanctuary CMS</h1>
            <p className="text-telangana-orange uppercase tracking-[0.4em] text-[10px] font-bold mt-2">Manage Your Sacred Details</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Logged in as</p>
              <p className="text-sm font-bold text-stone-700">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-white text-telangana-red border-2 border-telangana-red/10 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-telangana-red hover:text-white transition-all shadow-sm"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Wedding Details */}
          <div className="lg:col-span-7 space-y-12">
            <div className="glass-card p-10 rounded-[2.5rem] traditional-border bg-white shadow-xl">
              <h2 className="text-3xl font-traditional font-bold text-telangana-red mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-telangana-red/10 rounded-xl flex items-center justify-center">
                  <Save className="text-telangana-red" size={24} />
                </div>
                Wedding Details
              </h2>
              
              <form onSubmit={handleSaveDetails} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Groom Name</label>
                    <input 
                      type="text" 
                      value={details.groom}
                      onChange={(e) => setDetails({...details, groom: e.target.value})}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Bride Name</label>
                    <input 
                      type="text" 
                      value={details.bride}
                      onChange={(e) => setDetails({...details, bride: e.target.value})}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Wedding Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={details.date.slice(0, 16)}
                    onChange={(e) => setDetails({...details, date: e.target.value})}
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Venue Address</label>
                  <textarea 
                    rows={3}
                    value={details.venue}
                    onChange={(e) => setDetails({...details, venue: e.target.value})}
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional text-lg resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Groom's Father</label>
                    <input 
                      type="text" 
                      value={details.parents?.groom?.father || ''}
                      onChange={(e) => setDetails({...details, parents: {...details.parents, groom: {...details.parents?.groom, father: e.target.value}}})}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-4">Groom's Mother</label>
                    <input 
                      type="text" 
                      value={details.parents?.groom?.mother || ''}
                      onChange={(e) => setDetails({...details, parents: {...details.parents, groom: {...details.parents?.groom, mother: e.target.value}}})}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-8 py-4 focus:border-telangana-red outline-none transition-all font-traditional"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-telangana-red text-telangana-yellow py-6 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-2xl hover:bg-telangana-orange transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  {isSaving ? "Preserving Changes..." : "Update Sanctuary Details"}
                </button>

                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-center font-bold text-xs border border-emerald-100">
                      Sacred Details Updated Successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Right Column: Gallery & Blessings */}
          <div className="lg:col-span-5 space-y-12">
            {/* Gallery CMS */}
            <div className="glass-card p-10 rounded-[2.5rem] traditional-border bg-white shadow-xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-traditional font-bold text-telangana-red flex items-center gap-4">
                  <div className="w-10 h-10 bg-telangana-red/10 rounded-xl flex items-center justify-center">
                    <ImageIcon className="text-telangana-red" size={20} />
                  </div>
                  Gallery
                </h2>
                <button 
                  onClick={handleUpload}
                  className="bg-telangana-red text-telangana-yellow px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <Plus size={14} /> Upload
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {images.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-stone-300 font-traditional italic">
                    No memories uploaded yet.
                  </div>
                ) : (
                  images.map(img => (
                    <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-stone-100 shadow-sm">
                      <img src={img.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleDeleteImage(img.id)}
                          className="bg-white text-telangana-red p-3 rounded-xl hover:bg-telangana-red hover:text-white transition-all shadow-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Blessings CMS */}
            <div className="glass-card p-10 rounded-[2.5rem] traditional-border bg-white shadow-xl">
              <h2 className="text-2xl font-traditional font-bold text-telangana-red mb-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-telangana-red/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-telangana-red" size={20} />
                </div>
                Blessings
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {blessings.length === 0 ? (
                  <div className="py-12 text-center text-stone-300 font-traditional italic">
                    No blessings received yet.
                  </div>
                ) : (
                  blessings.map(b => (
                    <div key={b.id} className="p-6 bg-stone-50 rounded-2xl border-2 border-stone-100 flex justify-between items-start group hover:border-telangana-red/20 transition-colors">
                      <div className="space-y-2">
                        <p className="font-bold text-telangana-red font-traditional text-lg">{b.name}</p>
                        <p className="text-stone-600 text-sm italic leading-relaxed">"{b.message}"</p>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mt-2">{b.date}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteBlessing(b.id)}
                        className="text-stone-300 hover:text-telangana-red transition-colors p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
