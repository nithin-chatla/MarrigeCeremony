import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'motion/react';
import { Heart, Calendar, MapPin, Clock, Send, Music, Camera, Info, Image as ImageIcon, MessageSquare, Star, ChevronRight, ChevronLeft, Volume2, VolumeX, Sparkles, Quote, Download, X, Maximize2, Flower2, Sun, Flame, ArrowLeft, Loader2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { WEDDING_DETAILS, GALLERY_IMAGES, type GalleryImage } from './wedding-config';
import { fetchWeddingDetails, fetchGalleryImages, fetchBlessings } from './cms-service';
import Admin from './Admin';

const WEDDING_DATE = new Date(WEDDING_DETAILS.date);
// ------------------------------

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState<'All' | 'Wedding' | 'Family' | 'Travel' | 'Others'>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const i = await fetchGalleryImages();
        if (i && i.length > 0) {
          setImages(i);
        } else {
          setImages(GALLERY_IMAGES);
        }
      } catch (error) {
        setImages(GALLERY_IMAGES);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

  const filteredImages = useMemo(() => 
    filter === 'All' ? images : images.filter(img => img.category === filter)
  , [filter, images]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Try to fetch the image to bypass "open in new tab" behavior
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: Create a direct download link if CORS allows, 
      // otherwise open in new tab as a last resort
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {['All', 'Wedding', 'Family', 'Travel', 'Others'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-[9px] uppercase tracking-[0.2em] font-bold transition-all duration-500 border-2",
                filter === cat 
                  ? "bg-telangana-red text-telangana-yellow border-telangana-gold shadow-lg scale-105" 
                  : "bg-white text-stone-400 border-stone-100 hover:border-telangana-red/30 hover:text-telangana-red"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => GALLERY_IMAGES.forEach(img => handleDownload(img.url, `wedding-${img.id}.jpg`))}
          className="flex items-center gap-3 bg-telangana-red text-telangana-yellow px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-xl font-bold text-[10px] uppercase tracking-widest border border-telangana-gold/30"
        >
          <Download size={16} />
          Download All
        </button>
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {filteredImages.map((img) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl bg-white traditional-border"
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />

              {/* Mobile Quick Download */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(img.url, `wedding-${img.id}.jpg`);
                }}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-telangana-red/80 backdrop-blur-md border border-telangana-gold/30 text-telangana-yellow rounded-lg flex items-center justify-center md:hidden"
              >
                <Download size={16} />
              </button>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-telangana-red/90 via-telangana-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-telangana-yellow text-[10px] uppercase tracking-[0.3em] font-bold">{img.category}</p>
                  <h4 className="text-white font-traditional text-2xl font-bold">{img.title}</h4>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setSelectedImage(img)}
                      className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 rounded-xl hover:bg-telangana-yellow hover:text-telangana-red transition-all flex items-center justify-center gap-2"
                    >
                      <Maximize2 size={16} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">View</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.url, `wedding-${img.id}.jpg`);
                      }}
                      className="w-12 h-12 bg-telangana-gold text-telangana-red rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Download Image"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
          >
            <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-xl" onClick={() => setSelectedImage(null)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-[4/5] md:aspect-video rounded-[2rem] overflow-hidden shadow-2xl traditional-border"
            >
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="w-full h-full object-contain bg-black"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-8 right-8 flex gap-4">
                <button 
                  onClick={() => handleDownload(selectedImage.url, `wedding-${selectedImage.id}.jpg`)}
                  className="w-12 h-12 bg-telangana-red/80 backdrop-blur-md border border-telangana-gold/30 text-telangana-yellow rounded-full flex items-center justify-center hover:bg-telangana-yellow hover:text-telangana-red transition-all"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="w-12 h-12 bg-telangana-red/80 backdrop-blur-md border border-telangana-gold/30 text-telangana-yellow rounded-full flex items-center justify-center hover:bg-telangana-yellow hover:text-telangana-red transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-telangana-red/90 to-transparent">
                <p className="text-telangana-yellow text-xs uppercase tracking-[0.4em] font-bold mb-2">{selectedImage.category}</p>
                <h3 className="text-white text-4xl font-traditional font-bold">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FloatingElements = () => {
  const elements = useMemo(() => [...Array(30)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 20,
    size: 8 + Math.random() * 15,
    color: Math.random() > 0.5 ? 'text-telangana-orange' : 'text-telangana-yellow',
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ y: '110vh', x: 0, opacity: 0, rotate: 0 }}
          animate={{ 
            y: '-10vh', 
            x: [0, 30, -30, 0],
            opacity: [0, 0.6, 0.6, 0],
            rotate: 720 
          }}
          transition={{ 
            duration: el.duration, 
            repeat: Infinity, 
            delay: el.delay,
            ease: "linear"
          }}
          style={{ left: el.left }}
          className={cn("absolute opacity-30", el.color)}
        >
          <Flower2 size={el.size} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};

const Countdown = ({ date = WEDDING_DATE }: { date?: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= date) { clearInterval(timer); return; }
      setTimeLeft({
        days: differenceInDays(date, now),
        hours: differenceInHours(date, now) % 24,
        minutes: differenceInMinutes(date, now) % 60,
        seconds: differenceInSeconds(date, now) % 60,
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  if (new Date() > date) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-telangana-red font-traditional italic text-3xl tracking-widest text-gradient luxury-text-shadow">
      United in Tradition since March 5th, 2026
    </motion.div>
  );

  return (
    <div className="flex gap-3 md:gap-6 justify-center mt-16">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label} className="group relative">
          <motion.div
            key={item.value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-20 h-24 md:w-28 md:h-32 bg-telangana-red/10 backdrop-blur-md border border-telangana-gold/30 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center shadow-2xl group-hover:border-telangana-yellow transition-all duration-500"
          >
            <span className="text-3xl md:text-5xl font-traditional font-bold text-telangana-yellow mb-1 md:mb-2 drop-shadow-lg">
              {item.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white font-accent font-bold">
              {item.label}
            </span>
          </motion.div>
          <div className="absolute inset-0 bg-telangana-orange/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      ))}
    </div>
  );
};

const SectionHeading = ({ title, subtitle, light = false }: { title: string; subtitle?: string; light?: boolean }) => (
  <div className="text-center mb-20 relative">
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="mb-6"
    >
      <Flower2 className={cn("w-10 h-10 mx-auto", light ? "text-telangana-yellow/60" : "text-telangana-red/60")} />
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("text-5xl md:text-7xl font-traditional font-bold mb-6", light ? "text-telangana-yellow" : "text-telangana-red")}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={cn("uppercase tracking-[0.4em] text-[10px] font-bold", light ? "text-white/70" : "text-telangana-orange")}
      >
        {subtitle}
      </motion.p>
    )}
    <div className={cn("h-1 w-32 mx-auto mt-8 rounded-full", light ? "bg-telangana-yellow/30" : "bg-telangana-red/20")} />
  </div>
);

const Nav = ({ navBg, setIsMuted, isMuted }: any) => {
  const location = useLocation();
  const isGalleryPage = location.pathname === '/gallery';

  return (
    <motion.nav 
      style={{ backgroundColor: navBg }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center transition-colors duration-500"
    >
      <Link to="/" className="text-white font-traditional text-3xl font-bold tracking-tighter cursor-pointer">
        S<span className="text-telangana-yellow">&</span>N
      </Link>
      
      <div className="hidden md:flex gap-12">
        {isGalleryPage ? (
          <Link to="/" className="nav-link flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        ) : (
          ['The Bond', 'Family', 'Blessings'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} className="nav-link">
              {item}
            </a>
          ))
        )}
        <Link to="/gallery" className="nav-link">Memories</Link>
      </div>
      
      <div className="flex items-center gap-6">
        <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-telangana-yellow transition-colors p-2">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
        </button>
      </div>
    </motion.nav>
  );
};

const Home = ({ notes, weddingDetails }: any) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const heroY = useTransform(smoothProgress, [0, 0.3], ["0%", "20%"]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);

  const groom = weddingDetails?.groom || WEDDING_DETAILS.groom;
  const bride = weddingDetails?.bride || WEDDING_DETAILS.bride;
  const date = weddingDetails?.date ? new Date(weddingDetails.date) : WEDDING_DATE;
  const venue = weddingDetails?.venue || WEDDING_DETAILS.venue;

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/telangana-wedding/1920/1080?blur=1"
            alt="Hero"
            className="w-full h-full object-cover scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-telangana-red/80 via-black/60 to-telangana-cream" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] uppercase tracking-[1em] mb-12 block font-accent font-bold text-telangana-yellow"
            >
              Srirasthu • Shubhamasthu • Avighnamasthu
            </motion.div>
            <h1 className="text-7xl md:text-[13rem] font-traditional font-bold mb-8 leading-none tracking-tighter text-gradient luxury-text-shadow">
              <span className="text-2xl md:text-4xl block opacity-50 mb-4">Chi.</span>
              {groom} 
              <span className="text-3xl md:text-6xl font-sans not-italic block md:inline-block opacity-60 my-4 md:my-0 text-white mx-4">&</span> 
              <span className="text-2xl md:text-4xl block opacity-50 mb-4 md:inline">Chi. La. Sow.</span>
              {bride}
            </h1>
            <div className="mb-8 space-y-4">
              <div className="text-telangana-yellow/80 font-traditional text-xl md:text-2xl tracking-widest uppercase">
                {format(date, 'EEEE, do MMMM yyyy • h:mm a')} <br />
                <span className="text-sm opacity-60">Hasta Nakshatram • Mesha Lagnam</span>
              </div>
              <div className="text-white/60 font-traditional text-sm italic tracking-widest">
                Second Son of {weddingDetails?.parents?.groom?.father || WEDDING_DETAILS.parents.groom.father} & {weddingDetails?.parents?.groom?.mother || WEDDING_DETAILS.parents.groom.mother} <br />
                & <br />
                Only Daughter of Late Srinivas & {weddingDetails?.parents?.bride?.invitedBy || WEDDING_DETAILS.parents.bride.invitedBy}
              </div>
            </div>
            <div className="h-1 w-64 bg-gradient-to-r from-transparent via-telangana-gold to-transparent mx-auto mb-12 rounded-full" />
            <Countdown date={date} />
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-telangana-yellow/50 flex flex-col items-center gap-4"
        >
          <span className="text-[7px] uppercase tracking-[0.6em] font-bold">Scroll to Explore Our Tradition</span>
          <div className="w-px h-24 bg-gradient-to-b from-telangana-gold to-transparent" />
        </motion.div>
      </section>

      {/* Our Story / Vows Section */}
      <section id="thebond" className="section-padding bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="traditional-border rounded-2xl overflow-hidden aspect-[4/5]">
                <img 
                  src="https://res.cloudinary.com/dugnv4zww/image/upload/v1772126004/IMG_20260226_222809_zwdmbr.jpg" 
                  alt="Tradition" 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-telangana-yellow/10 rounded-full -z-10 border border-telangana-red/10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <Sun className="w-16 h-16 text-telangana-orange/20" />
                <h2 className="text-6xl md:text-8xl font-traditional font-bold leading-tight text-telangana-red">
                  A Bond Blessed by <br /> <span className="text-telangana-gold">Tradition.</span>
                </h2>
                <p className="text-stone-600 leading-relaxed text-xl font-traditional max-w-xl">
                  "Our union is a celebration of our roots, our culture, and the timeless traditions of Telangana. From the Jeelakarra Bellam to the Saptapadi, every ritual is a step towards a shared destiny."
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-12 pt-8">
                <div>
                  <h4 className="text-telangana-red uppercase tracking-widest text-[10px] font-bold mb-4">The Muhurtham</h4>
                  <p className="text-stone-500 text-sm leading-relaxed font-traditional">The auspicious moment when our souls unite under the divine gaze.</p>
                </div>
                <div>
                  <h4 className="text-telangana-red uppercase tracking-widest text-[10px] font-bold mb-4">The Legacy</h4>
                  <p className="text-stone-500 text-sm leading-relaxed font-traditional">Carrying forward the values of our ancestors into our new life together.</p>
                </div>
              </div>

              <div className="pt-8">
                <Link to="/gallery" className="btn-traditional">View Gallery</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Family Section */}
      <section id="family" className="section-padding bg-telangana-cream relative overflow-hidden">
        <div className="marigold-garland absolute inset-0 opacity-5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="The Families" subtitle="United by Tradition" />
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Groom's Family */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 rounded-[2rem] traditional-border text-center flex flex-col justify-between"
            >
              <div>
                <h3 className="text-telangana-red font-traditional font-bold text-2xl mb-6">Groom's Parents</h3>
                <div className="space-y-4">
                  <p className="text-xl font-traditional text-stone-800 font-bold">{weddingDetails?.parents?.groom?.father || WEDDING_DETAILS.parents.groom.father}</p>
                  <div className="w-8 h-px bg-telangana-gold mx-auto" />
                  <p className="text-xl font-traditional text-stone-800 font-bold">{weddingDetails?.parents?.groom?.mother || WEDDING_DETAILS.parents.groom.mother}</p>
                  <p className="text-[10px] text-stone-500 mt-4 uppercase tracking-widest">{weddingDetails?.parents?.groom?.location || WEDDING_DETAILS.parents.groom.location}</p>
                </div>
              </div>
            </motion.div>

            {/* Bride's Family */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 rounded-[2rem] traditional-border text-center flex flex-col justify-between"
            >
              <div>
                <h3 className="text-telangana-red font-traditional font-bold text-2xl mb-6">Bride's Family</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Invited By</p>
                    <p className="text-xl font-traditional text-stone-800 font-bold">{weddingDetails?.parents?.bride?.invitedBy || WEDDING_DETAILS.parents.bride.invitedBy}</p>
                    <p className="text-stone-500 text-xs">(W/o Late Srinivas)</p>
                  </div>
                  <div className="w-8 h-px bg-telangana-gold mx-auto" />
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Bride Donor</p>
                    <p className="text-lg font-traditional text-stone-800 font-bold">{weddingDetails?.parents?.bride?.donor || WEDDING_DETAILS.parents.bride.donor}</p>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-4 uppercase tracking-widest">{weddingDetails?.parents?.bride?.location || WEDDING_DETAILS.parents.bride.location}</p>
                </div>
              </div>
            </motion.div>

            {/* Best Wishes */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-10 rounded-[2rem] traditional-border text-center flex flex-col justify-between bg-telangana-red/5"
            >
              <div>
                <h3 className="text-telangana-red font-traditional font-bold text-2xl mb-6">Best Wishes From</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Brother (తమ్ముడు)</p>
                    <p className="text-lg font-traditional text-stone-800 font-bold">Chatla Nithin</p>
                  </div>
                  <div className="w-8 h-px bg-telangana-gold mx-auto" />
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Elder Brother (అన్న)</p>
                    <p className="text-lg font-traditional text-stone-800 font-bold">Chatla Ravichandra</p>
                  </div>
                  <div className="w-8 h-px bg-telangana-gold mx-auto" />
                  <p className="text-stone-500 text-xs italic font-traditional">Sisters, Brothers-in-law, <br /> Relatives & Friends</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="section-padding bg-telangana-red text-white relative overflow-hidden">
        <div className="marigold-garland absolute inset-0 opacity-10" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="The Muhurtham" subtitle="Sacred Ceremonies" light />
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { 
                time: 'Wednesday, 4th March • 4:00 PM', 
                event: 'Prathanam', 
                desc: 'The engagement ceremony at our residence, Madhapuram.',
                location: 'Vill: Madhapuram, Mdl: Gudipalli, Dist: Nalgonda',
                icon: Flame
              },
              { 
                time: 'Thursday, 5th March • 9:50 AM', 
                event: 'Sumuhurtham', 
                desc: 'The sacred wedding ceremony in Hasta Nakshatram, Mesha Lagnam.',
                location: "Bride Groom's Residence, Vill: Kodandapuram, Mdl: Gudipalli, Dist: Nalgonda",
                icon: Sun
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-12 rounded-[2rem] text-center group hover:border-telangana-yellow/50 transition-all traditional-border"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-telangana-yellow" />
                </div>
                <span className="text-telangana-yellow font-accent text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block group-hover:text-white transition-colors">{item.time}</span>
                <h3 className="text-3xl font-traditional font-bold mb-4 group-hover:text-telangana-yellow transition-colors">{item.event}</h3>
                <p className="text-white/80 text-lg leading-relaxed font-traditional mb-4">{item.desc}</p>
                <div className="flex items-center justify-center gap-2 text-telangana-yellow/60 text-sm">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-2xl font-traditional italic text-telangana-yellow/80">Dinner Follows...</p>
          </div>
        </div>
      </section>

      {/* Guestbook */}
      <section id="blessings" className="section-padding bg-telangana-cream relative overflow-hidden">
        <div className="marigold-garland absolute inset-0 opacity-5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="The Ashirvadam" subtitle="Blessings from Loved Ones" />
          <div className="grid lg:grid-cols-3 gap-24">
            <div className="lg:col-span-1 space-y-12">
              <div className="space-y-6">
                <h3 className="text-5xl font-traditional font-bold text-telangana-red">Sacred <br /> <span className="text-telangana-gold">Blessings.</span></h3>
                <p className="text-stone-600 leading-relaxed text-lg font-traditional">These words are the sacred threads that weave our story together. Blessings that will be cherished for a lifetime.</p>
              </div>
            </div>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
              <AnimatePresence mode='popLayout'>
                {notes.map((note, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 rounded-[2rem] hover:border-telangana-red/30 transition-all group traditional-border"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-12 h-12 rounded-xl bg-telangana-red/10 flex items-center justify-center text-telangana-red font-traditional font-bold text-xl group-hover:bg-telangana-red group-hover:text-telangana-yellow transition-all">
                        {note.name[0]}
                      </div>
                      <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">{note.date}</span>
                    </div>
                    <p className="text-stone-700 italic leading-relaxed mb-8 text-lg font-traditional">"{note.message}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-px bg-telangana-red/30" />
                      <h4 className="font-traditional font-bold text-xl text-telangana-red">— {note.name}</h4>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const GalleryPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeading title="Traditional Gallery" subtitle="View & Download Our Memories" />
        <Gallery />
      </div>
    </div>
  );
};

export default function App() {
  const [isMuted, setIsMuted] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [weddingDetails, setWeddingDetails] = useState<any>(WEDDING_DETAILS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [details, b] = await Promise.all([
          fetchWeddingDetails(),
          fetchBlessings()
        ]);
        if (details) setWeddingDetails(details);
        if (b) setNotes(b);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const navBg = useTransform(scrollYProgress, [0, 0.1], ["rgba(0,0,0,0)", "rgba(139, 0, 0, 0.95)"]);

  if (isLoading) return <div className="min-h-screen bg-telangana-cream flex items-center justify-center font-traditional text-2xl">Loading Sanctuary...</div>;

  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-x-hidden bg-telangana-cream selection:bg-telangana-red/30">
        <FloatingElements />
        
        {/* Scroll Progress Bar */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 bg-telangana-gold z-[60] origin-left"
          style={{ scaleX }}
        />
        
        <Nav navBg={navBg} setIsMuted={setIsMuted} isMuted={isMuted} />

        <Routes>
          <Route path="/" element={<Home notes={notes} weddingDetails={weddingDetails} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>

        {/* Footer */}
        <footer className="py-32 bg-telangana-cream text-stone-900 relative overflow-hidden border-t border-telangana-gold/20">
          <div className="marigold-garland absolute inset-0 opacity-5" />
          
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid md:grid-cols-3 gap-24 items-center text-center md:text-left">
              <div className="space-y-8">
                <h3 className="text-3xl font-traditional font-bold text-telangana-red">The Sanctuary</h3>
                <p className="text-stone-500 text-sm leading-relaxed font-traditional">A digital archive of our traditional journey, built to preserve every ritual, every blessing, and every promise for a lifetime.</p>
                <div className="space-y-2 text-stone-400 text-xs">
                  <p className="flex items-center gap-2 justify-center md:justify-start"><MapPin size={14} /> Gudipalli, Nalgonda</p>
                  <p className="flex items-center gap-2 justify-center md:justify-start">8106718860, 8106079690</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8">
                <Flower2 className="w-16 h-16 text-telangana-red fill-telangana-red/10 animate-pulse" />
                <h2 className="text-7xl md:text-9xl font-traditional font-bold text-gradient leading-none luxury-text-shadow">S<span className="text-4xl md:text-6xl not-italic opacity-60 text-telangana-red">&</span>N</h2>
                <p className="text-telangana-orange text-[10px] uppercase tracking-[0.8em] font-bold">Traditional Vows</p>
              </div>

              <div className="space-y-8 md:text-right">
                <h3 className="text-3xl font-traditional font-bold text-telangana-red">Quick Links</h3>
                <div className="flex flex-col gap-4">
                  <Link to="/" className="text-stone-500 hover:text-telangana-red transition-colors text-[10px] uppercase tracking-widest font-bold">Home</Link>
                  <Link to="/gallery" className="text-stone-500 hover:text-telangana-red transition-colors text-[10px] uppercase tracking-widest font-bold">Memories</Link>
                  <a href="/#family" className="text-stone-500 hover:text-telangana-red transition-colors text-[10px] uppercase tracking-widest font-bold">Family</a>
                  <a href="/#blessings" className="text-stone-500 hover:text-telangana-red transition-colors text-[10px] uppercase tracking-widest font-bold">Blessings</a>
                </div>
              </div>
            </div>

            <div className="mt-32 pt-12 border-t border-telangana-red/10 flex flex-col md:flex-row justify-between items-center gap-8 text-stone-500 text-[9px] uppercase tracking-[0.4em] font-bold">
              <span>© 2026-Forever • Handcrafted with Tradition</span>
              <span className="text-telangana-red/40">March 5th, 2026 • The Sacred Beginning</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
