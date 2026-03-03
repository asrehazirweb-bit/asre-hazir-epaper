import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar, FileText, ChevronRight, Zap, Archive, Clock } from 'lucide-react';
import CalendarPicker from './CalendarPicker';

const EditionFeed = ({ editions, onSelect, selectedDate, onDateSelect }) => {

    const [showAll, setShowAll] = useState(false);

    // Sorted editions — newest first
    const sortedEditions = useMemo(() => {
        return [...editions].sort((a, b) => {
            const timeA = a.publishedAt?.toMillis?.() || new Date(a.editionDate || 0).getTime();
            const timeB = b.publishedAt?.toMillis?.() || new Date(b.editionDate || 0).getTime();
            return timeB - timeA;
        });
    }, [editions]);

    const latestEdition = sortedEditions[0] || null;
    const archiveEditions = sortedEditions.slice(1);

    // Unique dates for calendar
    const uniqueDates = useMemo(() => {
        const dates = [...new Set(editions.map(e => e.editionDate))];
        return dates.sort((a, b) => b.localeCompare(a));
    }, [editions]);

    // Calendar filter
    const filteredByDate = useMemo(() => {
        if (!selectedDate) return [];
        return sortedEditions.filter(e => e.editionDate === selectedDate);
    }, [sortedEditions, selectedDate]);

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

    const displayEditions = selectedDate ? filteredByDate : (showAll ? archiveEditions : archiveEditions.slice(0, 8));

    return (
        <div className="flex-1 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 space-y-16">

                <div className="h-1 lg:h-4" /> {/* Spacer */}

                {/* ── CALENDAR FILTER ── */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Archive size={18} className="text-[#AA792D]" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2B2523]">Browse by Date</h3>
                    </div>
                    <CalendarPicker
                        editions={editions}
                        selectedDate={selectedDate}
                        onDateSelect={onDateSelect}
                    />

                    {/* Calendar result */}
                    {selectedDate && filteredByDate.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#AA792D]">
                                📅 Editions for {selectedDate}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredByDate.map((edition, idx) => (
                                    <EditionCard key={edition.id} edition={edition} idx={idx} onSelect={onSelect} onDownload={handleDownload} />
                                ))}
                            </div>
                            <button onClick={() => onDateSelect(null)} className="text-[10px] font-black text-gray-400 hover:text-[#AA792D] uppercase tracking-widest transition-colors mt-4">
                                ✕ Clear date filter
                            </button>
                        </div>
                    )}
                    {selectedDate && filteredByDate.length === 0 && (
                        <div className="mt-8 py-12 text-center space-y-3 bg-gray-50 rounded-3xl border border-gray-100">
                            <FileText size={32} className="text-gray-200 mx-auto" />
                            <p className="text-[10px] font-black text-[#AA792D] uppercase tracking-widest">Not Available</p>
                            <p className="text-sm font-medium text-gray-400">No edition found for <strong>{selectedDate}</strong></p>
                            <button onClick={() => onDateSelect(null)} className="text-[10px] font-black text-gray-400 hover:text-[#AA792D] uppercase tracking-widest transition-colors">
                                ✕ Clear filter
                            </button>
                        </div>
                    )}
                </section>

                {/* ── LATEST EDITION HERO ── */}
                {latestEdition && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Today's Latest Edition</span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onSelect(latestEdition)}
                            className="group cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gradient-to-br from-[#2B2523] to-[#3d342f] rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-[0_40px_80px_rgba(170,121,45,0.3)] transition-all duration-700"
                        >
                            {/* Left: Thumbnail */}
                            <div className="relative aspect-[3/4] lg:aspect-auto overflow-hidden">
                                {latestEdition.thumbnailUrl || latestEdition.thumbnail ? (
                                    <img
                                        src={latestEdition.thumbnailUrl || latestEdition.thumbnail}
                                        alt={latestEdition.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[#1a1210]">
                                        <FileText size={64} className="text-[#AA792D]/30" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 px-4 py-2 bg-[#AA792D] text-white text-[9px] font-black uppercase tracking-widest rounded-2xl">
                                    PDF
                                </div>
                            </div>

                            {/* Right: Info */}
                            <div className="p-8 lg:p-12 flex flex-col justify-between text-white">
                                <div>
                                    <div className="text-[10px] font-bold text-[#AA792D] uppercase tracking-[0.3em] mb-4">
                                        Latest Edition
                                    </div>
                                    <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tight leading-tight mb-4">
                                        {latestEdition.name || 'Asre Hazir'}
                                    </h2>
                                    <div className="flex items-center gap-3 text-white/60">
                                        <Calendar size={14} />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">{latestEdition.editionDate}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    <button
                                        onClick={() => onSelect(latestEdition)}
                                        className="flex-1 flex items-center justify-center gap-3 bg-[#AA792D] text-white py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#c49040] transition-all active:scale-95 shadow-xl"
                                    >
                                        <Zap size={16} fill="currentColor" /> Read Now
                                    </button>
                                    {latestEdition.fileUrl && (
                                        <button
                                            onClick={(e) => handleDownload(e, latestEdition)}
                                            className="flex items-center justify-center gap-3 border border-white/20 text-white/80 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            <Download size={16} /> Download PDF
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* ── ARCHIVE GRID ── */}
                {!selectedDate && archiveEditions.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-[#AA792D]" />
                                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2B2523]">Previous Editions</h3>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{archiveEditions.length} editions</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                            <AnimatePresence mode="popLayout">
                                {displayEditions.map((edition, idx) => (
                                    <EditionCard key={edition.id} edition={edition} idx={idx} onSelect={onSelect} onDownload={handleDownload} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {!showAll && archiveEditions.length > 8 && (
                            <div className="text-center mt-10">
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="px-8 py-4 border-2 border-[#AA792D] text-[#AA792D] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#AA792D] hover:text-white transition-all"
                                >
                                    Load All Editions ({archiveEditions.length - 8} more)
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* Empty State */}
                {editions.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                        <FileText size={48} className="text-gray-200 mx-auto" />
                        <h3 className="text-xl font-black uppercase text-[#2B2523]">No Editions Yet</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload your first edition from the admin panel</p>
                    </div>
                )}

            </div>
        </div>
    );
};

// ── Reusable Archive Card ──
const EditionCard = ({ edition, idx, onSelect, onDownload }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, delay: idx * 0.05 }}
        onClick={() => onSelect(edition)}
        className="group cursor-pointer flex flex-col"
    >
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-gray-100 group-hover:border-[#AA792D]/40 transition-all duration-500 shadow-lg group-hover:shadow-[0_20px_50px_rgba(170,121,45,0.2)] bg-gray-50">
            {edition.thumbnailUrl || edition.thumbnail ? (
                <img
                    src={edition.thumbnailUrl || edition.thumbnail}
                    alt={edition.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                        <FileText size={28} className="text-[#AA792D]/30" />
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No Preview</span>
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B2523] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end p-6">
                <div className="w-full py-3 bg-[#AA792D] text-white text-center rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                    Open Edition
                </div>
            </div>

            {/* PDF Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#AA792D] text-white text-[8px] font-black rounded-xl uppercase tracking-widest">PDF</div>

            {/* Download button */}
            {edition.fileUrl && (
                <button
                    onClick={(e) => onDownload(e, edition)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-[#2B2523] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#AA792D] hover:text-white shadow-lg"
                >
                    <Download size={14} />
                </button>
            )}
        </div>

        {/* Metadata */}
        <div className="mt-4 px-1">
            <p className="text-[11px] font-black text-[#2B2523] uppercase tracking-tight truncate group-hover:text-[#AA792D] transition-colors">
                {edition.name || 'Asre Hazir'}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <Calendar size={11} className="text-gray-300" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{edition.editionDate}</span>
            </div>
        </div>
    </motion.div>
);

export default EditionFeed;
