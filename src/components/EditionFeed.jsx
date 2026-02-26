import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar, FileText, ChevronRight, Hash } from 'lucide-react';
import CalendarPicker from './CalendarPicker';

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
                <header className="space-y-6 text-center max-w-4xl mx-auto mb-16">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-px bg-[#AA792D]" />
                        <span className="text-[10px] font-black text-[#AA792D] uppercase tracking-[0.4em]">Intelligence Archives</span>
                        <div className="w-8 h-px bg-[#AA792D]" />
                    </div>
                    <h2 className="text-4xl lg:text-7xl font-black text-[#2B2523] tracking-tighter italic uppercase leading-[0.85]">
                        Discovery <br /> <span className="text-[#AA792D]">Gateway</span>
                    </h2>

                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] max-w-sm mx-auto mt-6">
                        Synchronize with historical digital feeds through the high-fidelity archive retrieval system.
                    </p>

                    {/* Premium Calendar Component */}
                    <div className="mt-16">
                        <CalendarPicker
                            editions={editions}
                            selectedDate={selectedDate}
                            onDateSelect={onDateSelect}
                        />
                    </div>
                </header>

                {/* Main Feed Grid - Larger Impactful Cards */}
                {filteredEditions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12 lg:gap-16 pb-32 max-w-6xl mx-auto">
                        <AnimatePresence mode="popLayout">
                            {filteredEditions.map((edition, index) => (
                                <motion.div
                                    key={edition.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    onClick={() => onSelect(edition)}
                                    className="group cursor-pointer flex flex-col"
                                >
                                    {/* Card Wrapper - Extra Large Vertical */}
                                    <div className="relative aspect-[1/1.45] rounded-[3rem] overflow-hidden border border-gray-100 group-hover:border-[#AA792D]/40 transition-all duration-700 shadow-xl shadow-gray-200/50 group-hover:shadow-[0_40px_80px_-15px_rgba(170,121,45,0.2)] bg-gray-50">
                                        {edition.thumbnailUrl || edition.thumbnail ? (
                                            <img
                                                src={edition.thumbnailUrl || edition.thumbnail}
                                                alt={edition.name}
                                                className="w-full h-full object-cover transition-all duration-1000 opacity-95 group-hover:opacity-100 scale-100 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-center p-12">
                                                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-inner">
                                                    <FileText size={40} className="text-[#AA792D]/20" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-black text-[#2B2523] uppercase tracking-widest">Archive Signal</span>
                                                    <span className="block text-[8px] font-bold text-gray-300 uppercase tracking-widest">Awaiting Frame Sync...</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Premium Overlay Reveal */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2523] via-[#2B2523]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-end p-12 backdrop-blur-[1px]">
                                            <div className="w-full py-5 bg-[#AA792D] text-white text-center rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out shadow-2xl">
                                                Open Archive
                                            </div>
                                            <div className="mt-4 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 delay-75">
                                                Direct PDF Injection
                                            </div>
                                        </div>

                                        {/* Type Badge */}
                                        <div className="absolute top-8 left-8 flex items-center gap-3">
                                            <div className="px-5 py-2 bg-[#AA792D] text-white text-[9px] font-black rounded-2xl uppercase tracking-widest shadow-2xl border border-white/20">
                                                PDF
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata - Premium Typography */}
                                    <div className="mt-10 px-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#AA792D] shadow-[0_0_10px_rgba(170,121,45,0.8)]" />
                                            <p className="text-[12px] font-black text-[#2B2523] uppercase tracking-[2px] truncate group-hover:text-[#AA792D] transition-colors duration-300">
                                                {edition.name || 'Digital Transmission'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 pl-5">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-300" />
                                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{edition.editionDate}</span>
                                            </div>
                                            <div className="h-4 w-px bg-gray-100" />
                                            <span className="text-[10px] font-bold text-[#AA792D]/40 uppercase tracking-widest">Node ID {edition.id?.slice(0, 6)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="py-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-gray-100 shadow-inner">
                            <FileText size={32} className="text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#AA792D] uppercase tracking-[0.4em]">Signal Offline</p>
                            <h3 className="text-xl font-black text-[#2B2523] uppercase italic">Archive Not Available</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
                                The edition for <span className="text-[#AA792D]">{selectedDate}</span> has not been synchronized yet.
                            </p>
                        </div>
                    </div>
                )}
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
