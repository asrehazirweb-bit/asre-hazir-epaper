import React, { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, Type, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Image as ImageIcon, Search, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { performOCR } from '../utils/ocrService';
import { generateArticleCropFromUrl } from '../utils/imageCropper';

const ArticleCropViewer = ({ cropData, onClose, onNext, onPrev, page }) => {
    const [ocrResult, setOcrResult] = useState(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [localCropData, setLocalCropData] = useState(null);
    const [viewMode, setViewMode] = useState('text'); // 'text' or 'image'

    useEffect(() => {
        if (!cropData) return;

        const processArticle = async () => {
            setOcrLoading(true);
            setOcrResult(null);

            try {
                let currentCrop = cropData;
                if (!cropData.imageUrl && page?.imageUrl) {
                    currentCrop = await generateArticleCropFromUrl(page.imageUrl, cropData.xPct, cropData.yPct);
                }
                setLocalCropData(currentCrop);

                const result = await performOCR(currentCrop.imageUrl);
                setOcrResult(result);

                // If confidence is very low, default to image view
                if (result.confidence < 50) {
                    setViewMode('image');
                } else {
                    setViewMode('text');
                }
            } catch (error) {
                console.error('❌ Article Processing failed', error);
                setViewMode('image');
            } finally {
                setOcrLoading(false);
            }
        };

        processArticle();
    }, [cropData?.id, cropData?.xPct, cropData?.yPct, page?.imageUrl]);

    if (!cropData) return null;

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
            className="h-full flex flex-col bg-white overflow-hidden touch-none shadow-2xl border-l border-gray-100"
        >
            {/* Industry Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        <button
                            onClick={() => setViewMode('text')}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${viewMode === 'text' ? 'bg-[#AA792D] border-[#AA792D] text-white z-10' : 'bg-white border-gray-100 text-gray-400'}`}
                            title="Reader Mode"
                        >
                            <Type size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('image')}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${viewMode === 'image' ? 'bg-[#AA792D] border-[#AA792D] text-white z-10' : 'bg-white border-gray-100 text-gray-400'}`}
                            title="Original Image"
                        >
                            <ImageIcon size={16} />
                        </button>
                    </div>
                    <div className="h-6 w-px bg-gray-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {ocrResult?.confidence ? `AI Confidence: ${ocrResult.confidence.toFixed(1)}%` : 'Processing...'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onPrev} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={onNext} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><ChevronRight size={20} /></button>
                    <button onClick={onClose} className="ml-2 w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-xl transition-all group">
                        <X size={20} className="text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
                <AnimatePresence mode="wait">
                    {ocrLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-16 h-16 border-4 border-[#AA792D]/10 border-t-[#AA792D] rounded-full animate-spin mb-6" />
                            <h4 className="text-sm font-black text-[#2B2523] uppercase tracking-widest animate-pulse">Analyzing Layout...</h4>
                            <p className="text-xs text-gray-400 mt-2 font-medium">Extracting columns and headlines</p>
                        </motion.div>
                    ) : viewMode === 'text' ? (
                        <motion.div
                            key="text-mode"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-2xl mx-auto px-8 py-12"
                        >
                            {/* Confidence Warning Badges */}
                            {ocrResult?.isPartial && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full mb-8">
                                    <AlertTriangle size={14} className="text-orange-500" />
                                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Partial Clarity — Some text may be distorted</span>
                                </div>
                            )}

                            {/* Headline Section */}
                            <header className="mb-10 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#AA792D] uppercase tracking-[0.3em]">
                                    <Sparkles size={12} /> Verified Headline
                                </div>
                                <h1 className="text-4xl font-black text-[#2B2523] leading-[1.1] tracking-tight">
                                    {ocrResult?.headline}
                                </h1>
                                <div className="w-20 h-1.5 bg-[#AA792D] rounded-full" />
                            </header>

                            {/* Body Section */}
                            <article className="prose prose-stone max-w-none">
                                {ocrResult?.bodyText ? (
                                    ocrResult.bodyText.split('\n\n').map((para, i) => (
                                        <p key={i} className="text-lg text-gray-600 leading-[1.7] mb-6 font-serif hyphens-auto text-justify">
                                            {para}
                                        </p>
                                    ))
                                ) : (
                                    <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                                        <ImageIcon size={32} className="mx-auto mb-4 text-gray-200" />
                                        <p className="text-sm font-bold text-gray-400">Body text clarity too low. Switch to image mode.</p>
                                    </div>
                                )}
                            </article>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="image-mode"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                            className="h-full flex flex-col p-4 gap-4 bg-gray-50"
                        >
                            <div className="flex-1 rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-2xl relative">
                                <TransformWrapper initialScale={1.1} minScale={0.5} maxScale={4} centerOnInit={true}>
                                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                                        <img
                                            src={localCropData?.imageUrl}
                                            alt="Original source"
                                            className="max-w-full h-auto transition-all"
                                            style={{ imageRendering: 'high-quality' }}
                                        />
                                    </TransformComponent>
                                </TransformWrapper>

                                <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
                                    <div className="bg-[#2B2523]/90 text-[10px] text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                                        <Search size={12} /> Best Clarity — Original Scan
                                    </div>
                                </div>
                            </div>

                            {ocrResult?.isLowQuality && (
                                <div className="px-6 py-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                    <AlertTriangle size={18} className="text-red-500" />
                                    <div>
                                        <p className="text-xs font-black text-red-900 uppercase tracking-wider">Low Clarity Detected</p>
                                        <p className="text-[10px] text-red-600/70 font-medium">Text extraction unavailable for this image resolution.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Guides */}
            <div className="px-8 py-6 bg-white border-t border-gray-100 lg:hidden">
                <div className="flex justify-center items-center gap-4 text-gray-400">
                    <ChevronLeft size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Swipe to navigate</span>
                    <ChevronRight size={14} className="animate-pulse" />
                </div>
            </div>
        </motion.div>
    );
};

export default ArticleCropViewer;
