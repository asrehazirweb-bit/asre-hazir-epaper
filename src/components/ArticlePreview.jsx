import React, { useRef, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Type, Clock, Activity, Verified, Image as ImageIcon, Link, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticlePreview = ({ article, onClose, onNext, onPrev }) => {
    if (!article) return null;

    const isMobile = window.innerWidth < 768;

    const CanvasCrop = ({ imageUrl, rect, onCropReady }) => {
        const canvasRef = useRef(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (!imageUrl || !rect) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageUrl;

            img.onload = () => {
                const { x, y, w, h } = rect;
                // Convert percentages to actual pixels
                const sourceX = (x / 100) * img.width;
                const sourceY = (y / 100) * img.height;
                const sourceW = (w / 100) * img.width;
                const sourceH = (h / 100) * img.height;

                canvas.width = sourceW;
                canvas.height = sourceH;
                ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
                setLoading(false);

                if (onCropReady) {
                    onCropReady(canvas.toDataURL('image/jpeg', 0.9));
                }
            };
            img.onerror = () => {
                console.error("Failed to load image for CanvasCrop:", imageUrl);
                setLoading(false); // Stop loading even if there's an error
            };
        }, [imageUrl, rect, onCropReady]);

        return (
            <div className="relative w-full overflow-hidden flex items-center justify-center min-h-[200px] bg-gray-50">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#AA792D] animate-spin" />
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className={`max-w-full h-auto shadow-2xl transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
                />
            </div>
        );
    };

    const [croppedImageUrl, setCroppedImageUrl] = useState(null);

    const handleDownload = async () => {
        const downloadUrl = croppedImageUrl || article.imageUrl;
        if (!downloadUrl) return;
        try {
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `asre-hazir-article-${article.id.slice(0, 6)}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(downloadUrl, '_blank');
        }
    };

    return (
        <motion.div
            initial={isMobile ? { y: 100, opacity: 0 } : { x: 500, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: 100, opacity: 0 } : { x: 500, opacity: 0 }}
            className={`h-full flex flex-col bg-white text-[#2B2523] overflow-hidden ${!isMobile ? 'shadow-2xl border-l border-gray-100' : ''}`}
        >
            {/* Professional Navigation Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#AA792D]/10 rounded-lg flex items-center justify-center border border-[#AA792D]/20">
                        <Type size={16} className="text-[#AA792D]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Article Reader</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onPrev} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#AA792D] transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={onNext} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#AA792D] transition-colors"><ChevronRight size={20} /></button>
                    <div className="w-px h-6 bg-gray-100 mx-2" />
                    <button onClick={onClose} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="flex flex-col">
                    {/* PHOTO SECTION (Top) */}
                    <div className="p-6 lg:p-10 pb-0">
                        <div className="rounded-2xl lg:rounded-[1.5rem] overflow-hidden border border-gray-100 bg-gray-50 shadow-2xl relative group">
                            <CanvasCrop
                                imageUrl={article.imageUrl}
                                rect={article.rect}
                                onCropReady={setCroppedImageUrl}
                            />
                            <div className="absolute bottom-6 right-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest border border-gray-100 text-[#AA792D]">
                                Digital Segment Node
                            </div>
                        </div>
                    </div>

                    {/* TEXT SECTION (Below) */}
                    <div className={`${isMobile ? 'p-8 pb-32' : 'p-10 lg:p-16'} space-y-10`}>
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-[#AA792D]" />
                                <span>{Math.ceil((article.content?.length || 0) / 500)} Min Read</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-green-500" />
                                <span>Verified Archive</span>
                            </div>
                            <div className="h-4 w-px bg-gray-100" />
                            <div className="text-[#AA792D]">Edition: {new Date().toLocaleDateString()}</div>
                        </div>

                        {/* Headline */}
                        <header className="space-y-6">
                            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} font-black text-[#2B2523] leading-[1.2] tracking-tighter selection:bg-[#AA792D]/10`}>
                                {article.headline || 'Digital Segment Captured'}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-1.5 bg-[#AA792D] rounded-full" />
                                <div className="w-4 h-1 bg-gray-100 rounded-full" />
                            </div>
                        </header>

                        {/* Body Text */}
                        <article className="space-y-8">
                            {article.content ? (
                                article.content.split('\n\n').map((para, i) => (
                                    <p key={i} className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-600 leading-relaxed font-medium selection:bg-[#AA792D]/5 text-justify`}>
                                        {para}
                                    </p>
                                ))
                            ) : (
                                <div className="p-12 border-2 border-dashed border-gray-100 rounded-[3rem] text-center bg-gray-50 space-y-4">
                                    <Activity size={32} className="mx-auto text-gray-200 animate-pulse" />
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                        Reading transcript signal...
                                    </p>
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            </div>

            {/* Share & Branding */}
            <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={handleDownload} className="p-3 bg-white hover:bg-[#AA792D] hover:text-white rounded-xl transition-all border border-gray-200 group shadow-sm" title="Download Image Clip">
                        <Download size={16} className="text-[#AA792D] group-hover:text-white" />
                    </button>
                    <button className="p-3 bg-white hover:bg-[#25D366] hover:text-white rounded-xl transition-all border border-gray-200 group shadow-sm">
                        <Share2 size={16} className="text-[#25D366] group-hover:text-white" />
                    </button>
                    <button onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link Captured!');
                    }} className="p-3 bg-white hover:bg-[#AA792D] hover:text-white rounded-xl transition-all border border-gray-200 shadow-sm group">
                        <Link size={16} className="text-[#AA792D] group-hover:text-white" />
                    </button>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 italic hidden sm:inline-block">Asre Hazir Digital Reader // System 5.0</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-[#AA792D] rounded-full" />
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                </div>
            </div>
        </motion.div>
    );
};

export default ArticlePreview;
