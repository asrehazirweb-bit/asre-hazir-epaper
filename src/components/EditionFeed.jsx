import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar, FileText, ChevronRight, Hash } from 'lucide-react';

const EditionFeed = ({ editions, onSelect, selectedDate, onDateSelect }) => {

    // Extract unique dates for the filter
    const uniqueDates = useMemo(() => {
        const dates = [...new Set(editions.map(e => e.editionDate))];
        return dates.sort((a, b) => b.localeCompare(a));
    }, [editions]);

    // Ensure we have a selected date if none specified
    useEffect(() => {
        if (!selectedDate && uniqueDates.length > 0) {
            onDateSelect(uniqueDates[0]);
        }
    }, [uniqueDates, selectedDate, onDateSelect]);

    // Filter editions based on selected date
    const filteredEditions = useMemo(() => {
        // If there are no editions at all, return empty
        if (!editions || editions.length === 0) return [];

        // If no specific date is selected yet, show everything from the MOST RECENT date available
        if (!selectedDate && uniqueDates.length > 0) {
            return editions.filter(e => e.editionDate === uniqueDates[0]);
        }

        // Use the selected date filter
        return editions.filter(e => e.editionDate === selectedDate);
    }, [editions, selectedDate, uniqueDates]);

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
                <header className="space-y-6 text-center max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-px bg-[#AA792D]" />
                        <span className="text-[10px] font-black text-[#AA792D] uppercase tracking-[0.4em]">Intelligence Archives</span>
                        <div className="w-8 h-px bg-[#AA792D]" />
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black text-[#2B2523] tracking-tighter italic uppercase leading-none">
                        Discovery <span className="text-[#AA792D]">Gateway</span>
                    </h2>

                    {/* Strategic Date Strip */}
                    <div className="flex flex-wrap justify-center gap-2 mt-10">
                        {uniqueDates.map(date => (
                            <button
                                key={date}
                                onClick={() => onDateSelect(date)}
                                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                    ${selectedDate === date
                                        ? 'bg-[#AA792D] text-white shadow-xl shadow-[#AA792D]/20 scale-105'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                {date}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Main Feed Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-32">
                    <AnimatePresence mode="popLayout">
                        {filteredEditions.map((edition, index) => (
                            <motion.div
                                key={edition.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                onClick={() => onSelect(edition)}
                                className="group cursor-pointer flex flex-col"
                            >
                                {/* Card Wrapper */}
                                <div className="relative aspect-[1/1.4] rounded-[2.5rem] overflow-hidden border border-gray-100 group-hover:border-[#AA792D]/30 transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-[#AA792D]/10">
                                    {edition.thumbnailUrl || edition.thumbnail ? (
                                        <img
                                            src={edition.thumbnailUrl || edition.thumbnail}
                                            alt={edition.name}
                                            className="w-full h-full object-cover transition-all duration-1000 opacity-95 group-hover:opacity-100 scale-100 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-4 text-center p-6">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-inner">
                                                <FileText size={32} className="text-[#AA792D]/20" />
                                            </div>
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">Digitizing Feed...</span>
                                        </div>
                                    )}

                                    {/* Action Reveal */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 backdrop-blur-[2px]">
                                        <div className="w-full py-4 bg-white text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-[#2B2523] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            Open Intelligence
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-[#AA792D] text-white text-[8px] font-black rounded-xl uppercase tracking-widest shadow-xl z-10 border border-white/10">
                                        {edition.type?.includes('pdf') ? 'PDF ARCHIVE' : 'INTERACTIVE'}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="mt-6 px-4 space-y-2 text-center lg:text-left">
                                    <p className="text-xs font-black text-[#2B2523] uppercase tracking-widest truncate group-hover:text-[#AA792D] transition-colors">
                                        {edition.name || 'Digital Transmission'}
                                    </p>
                                    <div className="flex items-center justify-center lg:justify-start gap-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-[#AA792D]" />
                                            <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">{edition.editionDate}</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">EDITION {index + 1}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Verification Tag */}
            <div className="fixed bottom-10 right-10 z-30 pointer-events-none hidden sm:flex">
                <div className="px-6 py-3 bg-[#2B2523] rounded-3xl flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                    <span className="text-[9px] font-black text-white/95 uppercase tracking-[0.4em]">Blaze Synchronized</span>
                </div>
            </div>
        </div>
    );
};

export default EditionFeed;
