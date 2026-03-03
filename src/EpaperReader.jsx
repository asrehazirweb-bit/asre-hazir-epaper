import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase/config';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import EditionFeed from './components/EditionFeed';
import DocumentSidebar from './components/DocumentSidebar';
import {
    Loader2, Newspaper, ChevronLeft, Sidebar as SidebarIcon, LayoutGrid, User,
    Download, Maximize2, ZoomIn, ZoomOut, AlertCircle, X, Menu
} from 'lucide-react';
import { getPagesByEdition, incrementReaders } from './services/epaperService';

const EpaperReader = () => {
    const navigate = useNavigate();
    const [editions, setEditions] = useState([]);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedStatus, setFeedStatus] = useState('idle');
    const [selectedEditionId, setSelectedEditionId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const [zoom, setZoom] = useState(100);
    const [selectedDate, setSelectedDate] = useState(null);
    const incrementedRef = useRef(new Set());

    // Sync isMobile more frequently or via ResizeObserver for robustness
    useEffect(() => {
        const updateWidth = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // On desktop, default to open. On mobile, default to closed.
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        window.addEventListener('resize', updateWidth);
        updateWidth();
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Initial Data Sync — auto-select latest edition
    useEffect(() => {
        const q = query(collection(db, 'epaper_editions'), where("status", "==", "published"));
        const unsub = onSnapshot(q, (snapshot) => {
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => {
                const timeA = a.publishedAt?.toMillis() || new Date(a.editionDate || 0).getTime();
                const timeB = b.publishedAt?.toMillis() || new Date(b.editionDate || 0).getTime();
                return timeB - timeA;
            });
            const visible = data.filter(e => e.isVisible !== false);
            setEditions(visible);
            setLoading(false);

            // ✨ AUTO-OPEN LATEST: If no edition is selected yet, pick the first (newest) one
            if (visible.length > 0) {
                setSelectedEditionId(prev => {
                    if (!prev) {
                        // Load its pages immediately
                        const latest = visible[0];
                        // Defer to avoid state batching
                        setTimeout(() => loadEditionPages(latest.id), 0);
                        return latest.id;
                    }
                    return prev;
                });
            }
        });
        return () => unsub();
    }, [loadEditionPages]);

    const handleDateSelect = useCallback((date) => setSelectedDate(date), []);

    // Atomic Page Loader
    const loadEditionPages = useCallback(async (editionId) => {
        setFeedStatus('loading');
        setPages([]);
        try {
            const fetchedPages = await getPagesByEdition(editionId);
            fetchedPages.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
            setPages(fetchedPages);
            setFeedStatus(fetchedPages.length > 0 ? 'success' : 'empty');
        } catch (err) {
            console.error("Page Load Error:", err);
            setFeedStatus('error');
        }
    }, []);

    // Selection Handler
    const handleEditionSelect = useCallback((edition) => {
        setSelectedEditionId(edition.id);
        loadEditionPages(edition.id);
        if (window.innerWidth < 1024) setSidebarOpen(false);
        // Ensure we scroll to top of reader when switching
        window.scrollTo(0, 0);
    }, [loadEditionPages]);

    useEffect(() => {
        if (selectedEditionId && !incrementedRef.current.has(selectedEditionId)) {
            incrementedRef.current.add(selectedEditionId);
            incrementReaders(selectedEditionId).catch(() => { });
        }
    }, [selectedEditionId]);

    if (loading) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#AA792D] animate-spin" />
            </div>
        );
    }

    const currentEdition = editions.find(e => e.id === selectedEditionId);

    return (
        <div className="h-[100dvh] w-full flex flex-col bg-white text-[#2B2523] font-sans selection:bg-[#AA792D]/20 overflow-hidden">

            {/* 1. TOP HEADER (Only in Home Feed) */}
            {!selectedEditionId && (
                <header className="h-16 lg:h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-50">
                    <div className="flex items-center gap-4 lg:gap-6 h-full py-3">
                        <img
                            src="/logo.png"
                            alt="Asre Hazir"
                            className="h-full w-auto object-contain cursor-pointer"
                            onClick={() => window.location.reload()}
                        />
                        <div className="hidden sm:block border-l border-gray-100 pl-4 h-8 flex items-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Industrial <span className="text-[#AA792D]">Digital</span> Feed</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/admin')} className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#AA792D] transition-all">
                        <User size={20} />
                    </button>
                </header>
            )}

            <div className="flex-1 flex w-full overflow-hidden relative">

                {/* 2. SIDEBAR NAVIGATION - Improved Mobile logic */}
                <AnimatePresence>
                    {selectedEditionId && sidebarOpen && (
                        <>
                            {/* Backdrop: ALWAYS fixed on ALL screens when sidebarOpen is true in a overlay context */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className={`fixed inset-0 bg-[#2B2523]/40 backdrop-blur-sm z-[60] ${isMobile ? 'block' : 'hidden'}`}
                            />

                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`bg-white border-r border-gray-100 flex flex-col shrink-0 z-[100] fixed inset-y-0 left-0 w-80 shadow-2xl lg:relative lg:shadow-none lg:z-10`}
                            >
                                <DocumentSidebar
                                    editions={editions}
                                    selectedEditionId={selectedEditionId}
                                    onClose={() => setSidebarOpen(false)}
                                    onSelect={handleEditionSelect}
                                />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* 3. MAIN WORKSPACE - Now with dynamic margin to avoid the "White Block" overlap */}
                <main className={`flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden transition-all duration-300`}>
                    {!selectedEditionId ? (
                        /* Feed State */
                        <div className="flex-1 flex flex-col overflow-hidden w-full">
                            <EditionFeed
                                editions={editions}
                                onSelect={handleEditionSelect}
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                        </div>
                    ) : (
                        /* Reader State */
                        <div className="flex-1 flex flex-col overflow-hidden w-full h-full">

                            {/* Reader Controls (Toolbar) */}
                            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0 z-40 shadow-sm">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className={`p-2.5 rounded-xl transition-all ${sidebarOpen ? 'bg-[#2B2523] text-white shadow-lg' : 'bg-gray-50 text-[#AA792D]'}`}
                                    >
                                        <SidebarIcon size={18} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedEditionId(null)}
                                        className="flex items-center gap-2 px-3 lg:px-4 py-2 hover:bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#AA792D] transition-all border border-[#AA792D]/20 hover:border-[#AA792D]/50"
                                    >
                                        <LayoutGrid size={15} />
                                        <span className="hidden sm:inline">Archive</span>
                                    </button>
                                </div>

                                {/* Edition Info - Center */}
                                <div className="hidden sm:flex flex-col items-center">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-[#2B2523] truncate max-w-[200px]">
                                        {currentEdition?.name || 'Asre Hazir'}
                                    </p>
                                    <p className="text-[9px] font-bold text-[#AA792D] uppercase tracking-widest">
                                        📅 {currentEdition?.editionDate} · {pages.length} Pages
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 lg:gap-3">
                                    {/* Zoom Controls */}
                                    <div className="hidden md:flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                                        <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-2 hover:bg-white rounded-lg hover:text-[#AA792D] transition-all"><ZoomOut size={14} /></button>
                                        <span className="text-[9px] font-black px-2 w-12 text-center text-[#2B2523]">{zoom}%</span>
                                        <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-2 hover:bg-white rounded-lg hover:text-[#AA792D] transition-all"><ZoomIn size={14} /></button>
                                    </div>
                                    {/* PDF Download */}
                                    {currentEdition?.fileUrl && (
                                        <button
                                            onClick={() => window.open(currentEdition.fileUrl, '_blank')}
                                            className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-[#AA792D] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-[#AA792D]/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Download size={14} /> <span className="hidden xs:inline">PDF</span>
                                        </button>
                                    )}
                                </div>
                            </header>


                            {/* Scrolling Image Feed */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#EDEFF2] p-4 lg:p-12 relative">
                                {feedStatus === 'loading' && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#EDEFF2]/80 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-[#AA792D] animate-spin" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Digital Pages...</p>
                                        </div>
                                    </div>
                                )}

                                {feedStatus === 'empty' ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <AlertCircle size={40} className="text-gray-300" />
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black uppercase text-[#2B2523]">Processing Edition</h3>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Images are being generated...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12 pb-32">
                                        {pages.map((page, idx) => (
                                            <motion.div
                                                key={page.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: '-50px' }}
                                                className="relative bg-white shadow-xl rounded-[0.5rem] lg:rounded-[1rem] overflow-hidden border border-gray-100"
                                                style={{ width: isMobile ? '100%' : `${zoom}%`, margin: '0 auto' }}
                                            >
                                                <img
                                                    src={page.imageUrl}
                                                    alt={`Page ${idx + 1}`}
                                                    className="w-full h-auto block"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 left-3 lg:top-6 lg:left-6 px-3 lg:px-4 py-1 lg:py-1.5 bg-black/70 text-white text-[7px] lg:text-[8px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md">
                                                    Page {page.pageNumber || idx + 1}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default EpaperReader;
