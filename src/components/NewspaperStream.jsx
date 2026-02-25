import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, ExternalLink, X, ChevronRight, Share2, Info } from 'lucide-react';

const NewspaperStream = ({ pages, edition, onPdfOpen }) => {
    const [activePage, setActivePage] = useState(1);
    const [showActions, setShowActions] = useState(false);
    const containerRef = useRef(null);

    // Track scroll to update page indicator
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const scrollPos = containerRef.current.scrollTop;
            const pageHeight = containerRef.current.offsetHeight;
            const index = Math.round(scrollPos / pageHeight) + 1;
            setActivePage(Math.min(index, pages.length));
        };

        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [pages.length]);

    const handleDownload = (e) => {
        e.stopPropagation();
        if (!edition?.fileUrl) return;
        const link = document.createElement('a');
        link.href = edition.fileUrl;
        link.download = `Asre-Hazir-${edition.editionDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full w-full bg-[#F3F4F6] relative flex flex-col overflow-hidden">
            {/* Minimal Sticky Header */}
            <div className="absolute top-0 inset-x-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 pointer-events-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-[#2B2523] uppercase tracking-widest">
                        Page {activePage} <span className="text-gray-300 mx-1">/</span> {pages.length}
                    </span>
                </div>

                <button
                    onClick={() => setShowActions(true)}
                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center text-[#AA792D] pointer-events-auto active:scale-95 transition-transform"
                >
                    <Info size={18} />
                </button>
            </div>

            {/* Continuous Scroll Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth custom-scrollbar"
                onClick={() => setShowActions(true)}
            >
                {pages.map((page, idx) => (
                    <div key={idx} className="w-full min-h-full flex items-center justify-center p-2 lg:p-6 snap-start">
                        <div className="w-full max-w-4xl bg-white shadow-2xl relative group">
                            <img
                                src={page.imageUrl}
                                alt={`Page ${idx + 1}`}
                                className="w-full h-auto"
                                loading={idx < 2 ? "eager" : "lazy"}
                            />
                            {/* Subtle Page Numbering on physical page */}
                            <div className="absolute bottom-4 right-4 text-[9px] font-black text-gray-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Sheet Node {idx + 1} // Archive Verified
                            </div>
                        </div>
                    </div>
                ))}

                {/* End of Stream Indicator */}
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-1 bg-gray-200 rounded-full" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">End of Digital Edition</p>
                </div>
            </div>

            {/* ACTION BOTTOM SHEET */}
            <AnimatePresence>
                {showActions && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowActions(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-x-0 bottom-0 bg-white rounded-t-[3rem] z-[70] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t border-gray-100 p-8 lg:p-12 pb-10"
                        >
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />

                            <div className="flex flex-col gap-6 max-w-md mx-auto">
                                <header className="text-center space-y-2 mb-4">
                                    <h2 className="text-2xl font-black text-[#2B2523] uppercase italic">Edition <span className="text-[#AA792D]">Intelligence</span></h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selected Edition: {edition?.editionDate}</p>
                                </header>

                                <button
                                    onClick={() => { setShowActions(false); onPdfOpen(); }}
                                    className="w-full py-5 bg-[#2B2523] text-white rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#AA792D] transition-all shadow-xl active:scale-[0.98]"
                                >
                                    <ExternalLink size={18} />
                                    Open Full PDF Portfolio
                                </button>

                                <button
                                    onClick={handleDownload}
                                    className="w-full py-5 bg-white text-[#2B2523] border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#AA792D] hover:text-[#AA792D] transition-all shadow-lg active:scale-[0.98]"
                                >
                                    <Download size={18} />
                                    Download High-Res PDF
                                </button>

                                <button
                                    onClick={() => setShowActions(false)}
                                    className="w-full py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Continue Reading
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewspaperStream;
