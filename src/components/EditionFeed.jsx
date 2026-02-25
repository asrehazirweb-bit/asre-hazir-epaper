import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar, FileText, ChevronRight, Hash } from 'lucide-react';

const EditionFeed = ({ editions, onSelect, selectedDate, onDateSelect }) => {

    // Extract unique dates for the filter
    const uniqueDates = useMemo(() => {
        const dates = [...new Set(editions.map(e => e.editionDate))];
        return dates.sort((a, b) => b.localeCompare(a));
    }, [editions]);

    // Filter editions based on selected date
    const filteredEditions = useMemo(() => {
        if (!selectedDate) return editions;
        return editions.filter(e => e.editionDate === selectedDate);
    }, [editions, selectedDate]);

    const handleDownload = (e, edition) => {
        e.stopPropagation();
        if (!edition.fileUrl) return;

        const link = document.createElement('a');
        link.href = edition.fileUrl;
        link.download = `AsreHazir-${edition.editionDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-12">

                {/* Header Section */}
                <header className="space-y-4 text-center max-w-2xl mx-auto mb-16">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-px bg-[#AA792D]" />
                        <span className="text-[10px] font-black text-[#AA792D] uppercase tracking-[0.4em]">Digital Archives</span>
                        <div className="w-8 h-px bg-[#AA792D]" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-[#2B2523] tracking-tighter italic uppercase">
                        Discovery <span className="text-[#AA792D]">Gateway</span>
                    </h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-loose">
                        Access our complete digital repository indexed by chronological synchronization.
                    </p>
                </header>

                {/* Main Feed Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
                    <AnimatePresence mode="popLayout">
                        {filteredEditions.map((edition, index) => (
                            <motion.div
                                key={edition.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => onSelect(edition)}
                                className="group cursor-pointer flex flex-col"
                            >
                                {/* Card Wrapper */}
                                <div className="relative aspect-[1/1.4] rounded-3xl overflow-hidden border-[2px] border-gray-100 group-hover:border-[#AA792D] transition-all duration-500 shadow-md group-hover:shadow-xl group-hover:shadow-[#AA792D]/10">
                                    {edition.thumbnailUrl || edition.thumbnail ? (
                                        <img
                                            src={edition.thumbnailUrl || edition.thumbnail}
                                            alt={edition.name}
                                            className="w-full h-full object-cover transition-all duration-1000 opacity-90 group-hover:opacity-100 scale-100 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-4 text-center p-6">
                                            <FileText size={40} className="text-gray-200" />
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">Scanning Archives</span>
                                        </div>
                                    )}

                                    {/* Action Reveal */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-full py-2.5 bg-white text-center rounded-xl text-[9px] font-black uppercase tracking-widest text-[#2B2523]">
                                            Launch Reader
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-5 right-5 px-3 py-1 bg-[#AA792D] text-white text-[7px] font-black rounded-lg uppercase tracking-widest shadow-lg z-10 border border-white/20">
                                        {edition.type === 'pdf' ? 'PDF' : 'IMAGE'}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="mt-4 px-2 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-[#2B2523] uppercase tracking-widest truncate group-hover:text-[#AA792D] transition-colors">
                                            {edition.name || 'Untitled Stream'}
                                        </p>
                                        <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={10} className="text-gray-400" />
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{edition.editionDate}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Verification Tag */}
            <div className="fixed bottom-8 right-8 z-30 pointer-events-none">
                <div className="px-4 py-2 bg-[#2B2523] rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[8px] font-black text-white/80 uppercase tracking-[0.3em]">Archives Live</span>
                </div>
            </div>
        </div>
    );
};

export default EditionFeed;
