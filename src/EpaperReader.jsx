import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase/config';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import EditionFeed from './components/EditionFeed';
import DocumentSidebar from './components/DocumentSidebar';
import {
    Loader2, Newspaper, ChevronLeft, Sidebar, LayoutGrid, User,
    Download, Maximize2, ZoomIn, ZoomOut, AlertCircle
} from 'lucide-react';
import { getPagesByEdition, incrementReaders } from './services/epaperService';

const EpaperReader = () => {
    const navigate = useNavigate();
    const [editions, setEditions] = useState([]);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedStatus, setFeedStatus] = useState('idle'); // idle | loading | success | empty
    const [selectedEditionId, setSelectedEditionId] = useState(null);
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const [selectedDate, setSelectedDate] = useState(null);
    const [zoom, setZoom] = useState(100);
    const incrementedRef = useRef(new Set());

    // Responsive Monitor
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setLeftPanelCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Published Editions
    useEffect(() => {
        const q = query(collection(db, 'epaper_editions'), where("status", "==", "published"));
        const unsub = onSnapshot(q, (snapshot) => {
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => {
                const timeA = a.publishedAt?.toMillis() || new Date(a.editionDate || 0).getTime();
                const timeB = b.publishedAt?.toMillis() || new Date(b.editionDate || 0).getTime();
                return timeB - timeA;
            });
            setEditions(data.filter(e => e.isVisible !== false));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleDateSelect = useCallback((date) => setSelectedDate(date), []);

    // ATOMIC PAGE FETCHER (The "Image Stream" Heart)
    const loadEditionPages = useCallback(async (editionId) => {
        setFeedStatus('loading');
        try {
            const fetchedPages = await getPagesByEdition(editionId);
            // Sort pages numerically
            fetchedPages.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
            setPages(fetchedPages);
            setFeedStatus(fetchedPages.length > 0 ? 'success' : 'empty');
        } catch (err) {
            console.error("Page Load Error:", err);
            setFeedStatus('error');
        }
    }, []);

    // Handle Edition Selection
    const handleEditionSelect = useCallback((edition) => {
        setSelectedEditionId(edition.id);
        loadEditionPages(edition.id);
        if (isMobile) setLeftPanelCollapsed(true);
    }, [isMobile, loadEditionPages]);

    // Analytics Trigger
    useEffect(() => {
        if (selectedEditionId && !incrementedRef.current.has(selectedEditionId)) {
            incrementedRef.current.add(selectedEditionId);
            incrementReaders(selectedEditionId).catch(() => { });
        }
    }, [selectedEditionId]);

    // Loading Screen
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-[#AA792D] animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Synchronizing Archives...</p>
                </div>
            </div>
        );
    }

    const currentEdition = editions.find(e => e.id === selectedEditionId);

    return (
        <div className="h-screen flex flex-col bg-white text-[#2B2523] font-sans selection:bg-[#AA792D]/20 overflow-hidden">

            {/* Global Branding Header (Only if Feed is Active) */}
            {!selectedEditionId && (
                <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 z-50">
                    <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-[#AA792D] rounded-xl flex items-center justify-center shadow-lg shadow-[#AA792D]/20">
                            <Newspaper size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-tighter italic">Asre Hazir <span className="text-[#AA792D]">Digital</span></h1>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Industrial e-paper Feed</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/admin')} className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#AA792D] transition-all">
                        <User size={20} />
                    </button>
                </header>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {/* Mobile Backdrop */}
                <AnimatePresence>
                    {!leftPanelCollapsed && isMobile && selectedEditionId && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLeftPanelCollapsed(true)} className="fixed inset-0 bg-[#2B2523]/60 backdrop-blur-sm z-30 lg:hidden" />
                    )}
                </AnimatePresence>

                {/* Sidebar (Reader Mode) */}
                <AnimatePresence>
                    {selectedEditionId && (
                        <motion.aside
                            initial={isMobile ? { x: -320 } : { width: 0 }}
                            animate={isMobile ? { x: leftPanelCollapsed ? -320 : 0 } : { width: leftPanelCollapsed ? 0 : 320 }}
                            exit={isMobile ? { x: -320 } : { width: 0 }}
                            className={`bg-white border-r border-gray-100 flex flex-col shrink-0 z-40 relative ${isMobile ? 'fixed inset-y-0 left-0 w-80 shadow-2xl' : 'h-full'}`}
                        >
                            <DocumentSidebar editions={editions} selectedEditionId={selectedEditionId} onClose={() => setLeftPanelCollapsed(true)} onSelect={handleEditionSelect} />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Workspace */}
                <main className="flex-1 relative bg-white flex flex-col overflow-hidden">
                    {!selectedEditionId ? (
                        /* State 1: FEED VIEW */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <EditionFeed
                                editions={editions}
                                onSelect={handleEditionSelect}
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                        </div>
                    ) : (
                        /* State 2: READER VIEW (The Image Stream) */
                        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#F8F9FB]">

                            {/* Reader Toolbar */}
                            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)} className={`p-2.5 rounded-xl transition-all ${leftPanelCollapsed ? 'bg-gray-50 text-[#AA792D]' : 'bg-[#2B2523] text-white shadow-lg shadow-[#2B2523]/20'}`}>
                                        <Sidebar size={18} />
                                    </button>
                                    <div className="h-6 w-px bg-gray-100 mx-1 hidden sm:block" />
                                    <button onClick={() => setSelectedEditionId(null)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#AA792D] transition-all">
                                        <LayoutGrid size={16} /> Library
                                    </button>
                                </div>

                                <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-1">
                                    <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-2 hover:bg-white rounded-lg hover:text-[#AA792D] transition-all"><ZoomOut size={16} /></button>
                                    <span className="text-[9px] font-black px-2 w-12 text-center text-[#2B2523]">{zoom}%</span>
                                    <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-2 hover:bg-white rounded-lg hover:text-[#AA792D] transition-all"><ZoomIn size={16} /></button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black uppercase tracking-tight text-[#2B2523]">{currentEdition?.name}</p>
                                        <p className="text-[8px] font-bold text-[#AA792D] uppercase tracking-widest">{pages.length} Pages • Ready</p>
                                    </div>
                                    <div className="h-6 w-px bg-gray-100 mx-1" />
                                    <button
                                        onClick={() => window.open(currentEdition?.fileUrl, '_blank')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#AA792D] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[#AA792D]/20 transition-all active:scale-95"
                                    >
                                        <Download size={14} /> PDF
                                    </button>
                                </div>
                            </header>

                            {/* THE IMAGE STREAM (Hans India Style) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#EDF0F3] p-6 lg:p-12 relative">
                                {feedStatus === 'loading' && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#EDF0F3]/80 backdrop-blur-sm">
                                        <div className="text-center space-y-4">
                                            <Loader2 className="w-12 h-12 text-[#AA792D] animate-spin mx-auto" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2B2523]">Decoding Image Frame Stream...</p>
                                        </div>
                                    </div>
                                )}

                                {feedStatus === 'empty' ? (
                                    <div className="flex flex-col items-center justify-center py-32 text-center">
                                        <AlertCircle size={48} className="text-gray-300 mb-6" />
                                        <h3 className="text-lg font-black uppercase tracking-tight text-[#2B2523]">Processing Digital Feed</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-xs mt-2">
                                            The pages for this edition are currently being converted. Please try again in 60 seconds.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-w-5xl mx-auto space-y-12 pb-32">
                                        {pages.map((page, idx) => (
                                            <motion.div
                                                key={page.id}
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-100px" }}
                                                className="relative bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-200"
                                                style={{ width: `${zoom}%`, margin: '0 auto' }}
                                            >
                                                <img
                                                    src={page.imageUrl}
                                                    alt={`Page ${idx + 1}`}
                                                    className="w-full h-auto block select-none pointer-events-none"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/80 text-white text-[8px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md">
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
