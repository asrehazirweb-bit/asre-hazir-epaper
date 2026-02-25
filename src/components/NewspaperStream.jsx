import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, ExternalLink, X, ChevronRight, Share2, Info } from 'lucide-react';
const NewspaperStream = ({ pages, edition }) => {
    const [activePage, setActivePage] = useState(1);
    const [showActions, setShowActions] = useState(false);
    const containerRef = useRef(null);

    const displayPages = pages || [];

    // Track scroll to update page indicator
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const scrollPos = container.scrollTop;

            // Industrial calculation for active page based on scroll progress
            const children = container.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const rect = child.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // If the middle of the child is roughly in the middle of the viewport
                if (rect.top <= containerRect.top + containerRect.height / 2 &&
                    rect.bottom >= containerRect.top + containerRect.height / 2) {
                    setActivePage(i + 1);
                    break;
                }
            }
        };

        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [displayPages.length]);

    const handleDownload = (e) => {
        e.stopPropagation();
        if (!edition?.fileUrl) return;
        const link = document.createElement('a');
        link.href = edition.fileUrl;
        link.download = `AsreHazir-${edition.editionDate}.pdf`;
        link.target = "_blank";
        link.click();
    };

    return (
        <div className="h-full w-full bg-[#1A1817] relative flex flex-col overflow-hidden">
            {/* Minimal Sticky Header */}
            <div className="absolute top-0 inset-x-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#AA792D] animate-pulse" />
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">
                        DISSECTING PAGE {activePage} <span className="text-white/20 mx-1">/</span> {displayPages.length}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center text-white/60 pointer-events-auto active:scale-95 transition-transform hover:text-[#AA792D]"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => setShowActions(true)}
                        className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center text-[#AA792D] pointer-events-auto active:scale-95 transition-transform"
                    >
                        <Info size={18} />
                    </button>
                </div>
            </div>

            {/* Continuous Scroll Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-[#0F0E0D]"
            >
                {displayPages.map((page, idx) => (
                    <div key={idx} className="w-full flex items-center justify-center p-2 lg:p-12 border-b border-white/5 last:border-0">
                        <div className="w-full max-w-5xl bg-[#1A1817] shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative group rounded-sm overflow-hidden border border-white/5">
                            <motion.img
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: "200px" }}
                                src={page.imageUrl}
                                alt={`Page ${idx + 1}`}
                                className="w-full h-auto selection:bg-none"
                                loading={idx < 2 ? "eager" : "lazy"}
                            />
                            {/* Industrial Metadata Overlay */}
                            <div className="absolute bottom-6 right-8 text-[8px] font-black text-white/5 uppercase tracking-[0.5em] group-hover:text-white/20 transition-colors pointer-events-none">
                                Archive Node {idx + 1} // Precision Stream v5.2
                            </div>
                        </div>
                    </div>
                ))}

                {/* End of Stream Indicator */}
                <div className="py-32 flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-[1px] bg-[#AA792D]/30" />
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Chronological End</p>
                        <p className="text-[7px] font-bold text-white/10 uppercase tracking-widest italic">All fragments synchronized successfully.</p>
                    </div>
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
