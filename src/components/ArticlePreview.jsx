import React from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Type, Clock, Activity, Verified, Image as ImageIcon, Link } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticlePreview = ({ article, onClose, onNext, onPrev }) => {
    if (!article) return null;

    const isMobile = window.innerWidth < 768;

    const getCropUrl = (url, rect) => {
        if (!url || !rect) return null;
        try {
            if (url.includes('/upload/')) {
                const baseUrl = url.split('/upload/')[0] + '/upload/';
                const imagePath = url.split('/upload/')[1];
                const cropParams = `c_crop,g_north_west,h_${(rect.h / 100).toFixed(3)},w_${(rect.w / 100).toFixed(3)},x_${(rect.x / 100).toFixed(3)},y_${(rect.y / 100).toFixed(3)},fl_relative,q_auto,f_auto/`;
                return `${baseUrl}${cropParams}${imagePath}`;
            }
            return url;
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
            className={`h-full flex flex-col bg-[#0B0F19] text-white overflow-hidden ${!isMobile ? 'shadow-2xl border-l border-white/5' : ''}`}
        >
            {/* Professional Navigation Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#111827]/80 backdrop-blur-xl z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <Type size={16} className="text-blue-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Article Reader</span>
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

            {/* Hans India Unified Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B0F19]">
                <div className="flex flex-col">
                    {/* PHOTO SECTION (Top) */}
                    <div className="p-6 lg:p-10 pb-0">
                        <div className="rounded-2xl lg:rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
                            <img
                                src={croppedImageUrl}
                                alt="Article Clip"
                                className="w-full h-auto object-contain bg-[#0B0F19]"
                                style={{ minHeight: '200px' }}
                            />
                            <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                                Original Clip View
                            </div>
                        </div>
                    </div>

                    {/* TEXT SECTION (Below) */}
                    <div className={`${isMobile ? 'p-8 pb-32' : 'p-10 lg:p-16'} space-y-10`}>
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-blue-500" />
                                <span>{Math.ceil((article.content?.length || 0) / 500)} Min Read</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-green-500" />
                                <span>Verified Archive</span>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="text-blue-500">Edition: {new Date().toLocaleDateString()}</div>
                        </div>

                        {/* Headline */}
                        <header className="space-y-6">
                            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-black text-white leading-[1.2] tracking-tighter selection:bg-blue-600`}>
                                {article.headline || 'Digital Segment Captured'}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-1.5 bg-blue-600 rounded-full" />
                                <div className="w-4 h-1 bg-white/10 rounded-full" />
                            </div>
                        </header>

                        {/* Body Text */}
                        <article className="space-y-8">
                            {article.content ? (
                                article.content.split('\n\n').map((para, i) => (
                                    <p key={i} className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-300 leading-relaxed font-medium selection:bg-blue-600/30 text-justify`}>
                                        {para}
                                    </p>
                                ))
                            ) : (
                                <div className="p-12 border-2 border-dashed border-white/5 rounded-[3rem] text-center bg-white/5 space-y-4">
                                    <Activity size={32} className="mx-auto text-gray-800 animate-pulse" />
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                        Reading transcript signal...
                                    </p>
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            </div>

            {/* Share & Branding */}
            <div className="px-10 py-6 bg-black border-t border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white/5 hover:bg-[#25D366] hover:text-white rounded-xl transition-all border border-white/5 group">
                        <Share2 size={16} className="text-[#25D366] group-hover:text-white" />
                    </button>
                    <button onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link Captured!');
                    }} className="p-3 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-white/5">
                        <Link size={16} className="text-blue-500" />
                    </button>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] ml-4 italic">Asre Hazir Digital Reader // System 5.0</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
                </div>
            </div>
        </motion.div>
    );
};

export default ArticlePreview;
