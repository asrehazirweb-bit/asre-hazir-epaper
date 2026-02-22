import React from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Type, Clock, Activity, Verified, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticlePreview = ({ article, onClose, onNext, onPrev }) => {
    if (!article) return null;

    const isMobile = window.innerWidth < 768;

    const handleDragEnd = (event, info) => {
        const threshold = 100;
        // Horizontal swipe for navigation
        if (info.offset.x < -threshold && onNext) onNext();
        if (info.offset.x > threshold && onPrev) onPrev();

        // Vertical swipe for close ONLY on desktop if desired, 
        // but for mobile we handle it in the parent sheet
        if (!isMobile && info.offset.y > threshold) onClose();
    };

    const getCropUrl = (url, rect) => {
        if (!url || !rect) return null;
        try {
            const baseUrl = url.split('/upload/')[0] + '/upload/';
            const imagePath = url.split('/upload/')[1];
            const cropParams = `c_crop,g_north_west,h_${(rect.h / 100).toFixed(3)},w_${(rect.w / 100).toFixed(3)},x_${(rect.x / 100).toFixed(3)},y_${(rect.y / 100).toFixed(3)},fl_relative/`;
            return `${baseUrl}${cropParams}${imagePath}`;
        } catch (e) {
            return url;
        }
    };

    const croppedImageUrl = getCropUrl(article.imageUrl, article.rect);

    return (
        <motion.div
            initial={isMobile ? { y: 100, opacity: 0 } : { x: 500, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: 100, opacity: 0 } : { x: 500, opacity: 0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className={`h-full flex flex-col bg-[#0B0F19] text-white overflow-hidden ${!isMobile ? 'shadow-2xl border-l border-white/5' : ''}`}
        >
            {/* Header - Hidden on mobile if redundant with parent sheet header */}
            {!isMobile && (
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#111827]/80 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <Verified size={14} className="text-blue-500" />
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Verified Feed</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onPrev} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={onNext} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"><ChevronRight size={20} /></button>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <button onClick={onClose} className="p-2.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Visual Anchor (Cropped Image) */}
                {croppedImageUrl && (
                    <div className={`relative w-full ${isMobile ? 'aspect-[4/3]' : 'aspect-video'} bg-black overflow-hidden group`}>
                        <img
                            src={croppedImageUrl}
                            alt="Article Focus"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0F19] to-transparent" />
                    </div>
                )}

                <div className={`${isMobile ? 'p-6 pb-24' : 'p-10 lg:p-14'} space-y-8`}>
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-blue-500" />
                            <span>Live Update</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity size={10} className="text-green-500" />
                            <span>High Fidelity</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <header className="space-y-4">
                        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-black text-white leading-tight tracking-tighter selection:bg-blue-600`}>
                            {article.headline || 'Decoding News Horizon...'}
                        </h1>
                        <div className="w-12 h-1 bg-blue-600 rounded-full" />
                    </header>

                    {/* Body Text */}
                    <article className="space-y-6">
                        {article.content ? (
                            article.content.split('\n\n').map((para, i) => (
                                <p key={i} className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} text-gray-300 leading-relaxed font-medium selection:bg-blue-600/30`}>
                                    {para}
                                </p>
                            ))
                        ) : (
                            <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center bg-white/5">
                                <p className="text-gray-500 text-xs italic font-medium">
                                    Decoding broadcast signal...<br />
                                    Please try again shortly.
                                </p>
                            </div>
                        )}
                    </article>

                    {/* Mobile Navigation Buttons */}
                    {isMobile && (
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <button onClick={onPrev} className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button onClick={onNext} className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hint for Desktop sharing (kept simple) */}
            {!isMobile && (
                <div className="p-6 border-t border-white/5 bg-[#111827]">
                    <button className="flex items-center gap-3 w-full justify-center py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <Share2 size={16} /> Share Article
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default ArticlePreview;
