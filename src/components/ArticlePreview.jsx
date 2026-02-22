import React from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Type, Clock, Activity, Verified, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticlePreview = ({ article, onClose, onNext, onPrev }) => {
    if (!article) return null;

    const handleDragEnd = (event, info) => {
        const threshold = 100;
        if (info.offset.x < -threshold && onNext) onNext();
        if (info.offset.x > threshold && onPrev) onPrev();
        if (info.offset.y > threshold) onClose();
    };

    // Construct Cloudinary Crop URL if rect and imageUrl are available
    // Format: c_crop,g_north_west,h_[h],w_[w],x_[x],y_[y],fl_relative
    const getCropUrl = (url, rect) => {
        if (!url || !rect) return null;
        try {
            const baseUrl = url.split('/upload/')[0] + '/upload/';
            const imagePath = url.split('/upload/')[1];
            // Normalize percentages to decimals for Cloudinary fl_relative
            const cropParams = `c_crop,g_north_west,h_${(rect.h / 100).toFixed(3)},w_${(rect.w / 100).toFixed(3)},x_${(rect.x / 100).toFixed(3)},y_${(rect.y / 100).toFixed(3)},fl_relative/`;
            return `${baseUrl}${cropParams}${imagePath}`;
        } catch (e) {
            return url;
        }
    };

    const croppedImageUrl = getCropUrl(article.imageUrl, article.rect);

    return (
        <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="h-full flex flex-col bg-[#0B0F19] text-white overflow-hidden shadow-2xl border-l border-white/5"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#111827]/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Verified size={14} className="text-blue-500" />
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Verified Digital Feed</span>
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Visual Anchor (Cropped Image) */}
                {croppedImageUrl && (
                    <div className="relative w-full aspect-video bg-black overflow-hidden group">
                        <img
                            src={croppedImageUrl}
                            alt="Article Focus"
                            className="w-full h-full object-contain"
                            crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent opacity-60" />
                        <div className="absolute bottom-6 left-8 flex items-center gap-2">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                                <ImageIcon size={14} className="text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Source Crop</span>
                        </div>
                    </div>
                )}

                <div className="p-10 lg:p-14 space-y-10">
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-blue-500" />
                            <span>Live Edition Update</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity size={12} className="text-green-500" />
                            <span>OCR Readability: 100%</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <header className="space-y-6">
                        <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tighter selection:bg-blue-600">
                            {article.headline || 'Decoding News Horizon...'}
                        </h1>
                        <div className="w-16 h-1.5 bg-blue-600 rounded-full" />
                    </header>

                    {/* Body Text */}
                    <article className="space-y-8">
                        {article.content ? (
                            article.content.split('\n\n').map((para, i) => (
                                <p key={i} className="text-lg lg:text-xl text-gray-300 leading-relaxed font-medium selection:bg-blue-600/30">
                                    {para}
                                </p>
                            ))
                        ) : (
                            <div className="p-10 border-2 border-dashed border-white/5 rounded-3xl text-center bg-white/5">
                                <p className="text-gray-500 text-sm italic font-medium leading-relaxed">
                                    Engine scanning image data...<br />
                                    If text is missing, please use OCR assist in admin.
                                </p>
                            </div>
                        )}
                    </article>

                    {/* Footer */}
                    <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                        <button className="flex items-center gap-3 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            <Share2 size={16} /> Broadcast Feed
                        </button>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            <Type size={14} /> Typography: Optimized
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Swipe Hint */}
            <div className="p-4 bg-[#111827] lg:hidden border-t border-white/5 text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">
                    Swipe Horizontal to Navigate
                </span>
            </div>
        </motion.div>
    );
};

export default ArticlePreview;
