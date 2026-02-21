import React from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Type, Clock, Activity, Verified } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticlePreview = ({ article, onClose, onNext, onPrev }) => {
    if (!article) return null;

    const handleDragEnd = (event, info) => {
        const threshold = 100;
        if (info.offset.x < -threshold && onNext) onNext();
        if (info.offset.x > threshold && onPrev) onPrev();
        if (info.offset.y > threshold) onClose();
    };

    return (
        <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="h-full flex flex-col bg-[#0B0F19] text-white overflow-hidden shadow-2xl"
        >
            {/* Professional Article Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 glass-panel z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <Verified size={14} className="text-green-500" />
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Verified Feed</span>
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

            {/* Scrollable Content Engine */}
            <div className="flex-1 overflow-y-auto p-12 lg:p-16 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-blue-500" />
                            <span>Published: {article.publishedAt || 'Industrial Edition'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity size={12} className="text-green-500" />
                            <span>98% Readability</span>
                        </div>
                    </div>

                    {/* Industrial Headline */}
                    <header className="space-y-6">
                        <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight selection:bg-blue-600">
                            {article.headline}
                        </h1>
                        <div className="w-24 h-2 bg-blue-600 rounded-full" />
                    </header>

                    {/* Article Body - High Contrast & Spacing */}
                    <article className="space-y-8">
                        {article.content ? (
                            article.content.split('\n\n').map((para, i) => (
                                <p key={i} className="text-xl lg:text-2xl text-gray-300 leading-relaxed font-medium selection:bg-blue-600/30">
                                    {para}
                                </p>
                            ))
                        ) : (
                            <div className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
                                <p className="text-gray-500 text-sm italic">"Article data stream is initializing..."</p>
                            </div>
                        )}
                    </article>

                    {/* Footer Actions */}
                    <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                        <button className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                            <Share2 size={16} /> Share News
                        </button>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <Type size={14} /> Font Size: Large
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Indicator */}
            <div className="p-6 bg-[#0B0F19] lg:hidden border-t border-white/5">
                <div className="flex justify-center items-center gap-4 text-gray-600">
                    <ChevronLeft size={16} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Swipe to Navigate Feed</span>
                    <ChevronRight size={16} className="animate-pulse" />
                </div>
            </div>
        </motion.div>
    );
};

export default ArticlePreview;
