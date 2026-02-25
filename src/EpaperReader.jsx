import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase/config';
import { collection, query, orderBy, getDocs, onSnapshot, where } from 'firebase/firestore';
import PageThumbnailList from './components/PageThumbnailList';
import PageViewer from './components/PageViewer';
import ArticlePreview from './components/ArticlePreview';
import EditionFeed from './components/EditionFeed';
import NewspaperStream from './components/NewspaperStream';
import DocumentSidebar from './components/DocumentSidebar';
import {
    Loader2, Calendar, Globe, Newspaper, ChevronLeft, ChevronRight,
    Maximize2, Sidebar, PanelsTopLeft, Search, User, LogIn,
    Zap, Activity, Clock, AlertTriangle, Home, Menu, X
} from 'lucide-react';
import { getPagesByEdition, getArticlesByPage, incrementReaders } from './services/epaperService';

const FEED_TIMEOUT_MS = 8000; // 8 seconds fallback

const EpaperReader = () => {
    const navigate = useNavigate();
    // Infrastructure State
    const [editions, setEditions] = useState([]);
    const [pages, setPages] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true); // Initial app load

    // Feed Lifecycle State
    const [feedStatus, setFeedStatus] = useState('idle'); // idle | loading | success | error
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEditionId, setSelectedEditionId] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);

    // UI State
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState(null);

    // Refs for Request Control
    const activeRequestRef = useRef(0);
    const timeoutRef = useRef(null);
    const datePickerRef = useRef(null);

    // Click outside handler for date picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // REAL-TIME FETCH: Editions (Source of Truth)
    useEffect(() => {
        const q = query(
            collection(db, 'epaper_editions'),
            where("status", "==", "published"),
            where("isActive", "==", true),
            orderBy('editionDate', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEditions(data);
            setLoading(false);
        }, (err) => {
            console.error("Firestore Error:", err);
            setError("Connectivity lost. Reconnecting...");
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // Landing logic: AUTO-SYNC to Latest Edition Date
    useEffect(() => {
        if (editions.length > 0) {
            // If no date selected, OR if the current selected date is no longer the latest 
            // and we are still on the first load/idle state, sync to latest.
            if (!selectedDate) {
                setSelectedDate(editions[0].editionDate);
            }
        }
    }, [editions, selectedDate]);

    // ATOMIC FEED SWITCHER
    const loadFeed = useCallback(async (date, editionId) => {
        const requestId = Date.now();
        activeRequestRef.current = requestId;

        setFeedStatus('loading');
        setError(null);

        // Start safety timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (activeRequestRef.current === requestId && feedStatus === 'loading') {
                console.warn("Feed request timed out");
                setFeedStatus('error');
                setError("Scanning signal lost. Please check connection.");
            }
        }, FEED_TIMEOUT_MS);

        try {
            // Fetch Pages
            const fetchedPages = await getPagesByEdition(editionId);

            // Atomic check: Is this request still valid?
            if (activeRequestRef.current !== requestId) return;

            setPages(fetchedPages);

            // Only reset index if switching dates, not just refreshing? 
            // For now, reset to page 1 on date switch.
            setCurrentPageIndex(0);

            // Fetch Articles for first page immediately to avoid chained renders
            if (fetchedPages.length > 0) {
                const fetchedArticles = await getArticlesByPage(fetchedPages[0].id);
                if (activeRequestRef.current === requestId) {
                    setArticles(fetchedArticles);
                    setFeedStatus('success');
                    incrementReaders(editionId);
                }
            } else {
                setFeedStatus('success');
            }

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

        } catch (err) {
            if (activeRequestRef.current === requestId) {
                console.error("Feed error:", err);
                setFeedStatus('error');
                setError("Failed to resolve digital feed.");
            }
        }
    }, [feedStatus]);

    // Track incremented editions to prevent infinite loops
    const incrementedRef = useRef(new Set());
    // Track last selected ID to only auto-collapse on actual change
    const lastIdRef = useRef(null);

    // Handle Edition Switch - Separate core logic from reactive increment
    useEffect(() => {
        if (!selectedEditionId) {
            lastIdRef.current = null;
            return;
        }

        const edition = editions.find(e => e.id === selectedEditionId);
        if (!edition) return;

        // 1. Static Metadata Sync
        if (edition.editionDate !== selectedDate) setSelectedDate(edition.editionDate);
        setSelectedArticle(null);

        // 2. Load Content
        // 2. Load Content - Now unified image-based feed
        loadFeed(edition.editionDate, edition.id);

        // 3. Reader Increment (One-time per selection session)
        if (!incrementedRef.current.has(selectedEditionId)) {
            incrementedRef.current.add(selectedEditionId);
            // Non-blocking increment call
            incrementReaders(selectedEditionId).catch(() => { });
        }

        // 4. Auto-collapse sidebar ONLY on NEW selection for mobile
        if (isMobile && lastIdRef.current !== selectedEditionId) {
            setLeftPanelCollapsed(true);
            lastIdRef.current = selectedEditionId;
        }

    }, [selectedEditionId, editions, isMobile]);

    // Handle Page Navigation within same edition
    const handlePageNavigation = useCallback(async (index) => {
        if (!pages[index]) return;

        const requestId = Date.now();
        activeRequestRef.current = requestId;

        setFeedStatus('loading');
        setSelectedArticle(null);
        setCurrentPageIndex(index);

        try {
            const fetchedArticles = await getArticlesByPage(pages[index].id);
            if (activeRequestRef.current === requestId) {
                setArticles(fetchedArticles);
                setFeedStatus('success');
            }
        } catch (err) {
            if (activeRequestRef.current === requestId) {
                setFeedStatus('error');
            }
        }
    }, [pages]);

    const handleArticleClick = useCallback((art) => {
        setSelectedArticle({ ...art, imageUrl: pages[currentPageIndex]?.imageUrl });
    }, [pages, currentPageIndex]);

    const handleCoordinateClick = useCallback(({ x, y, pageUrl }) => {
        const hit = articles.find(art =>
            x >= art.rect.x && x <= (art.rect.x + art.rect.w) &&
            y >= art.rect.y && y <= (art.rect.y + art.rect.h)
        );

        if (hit) {
            setSelectedArticle({ ...hit, imageUrl: pageUrl });
        } else {
            // 🧠 AI Discovery: Create a smart-crop for any arbitrary click (Like Hans India)
            setSelectedArticle({
                id: 'ai-discovery-' + Date.now(),
                headline: 'Captured News Segment',
                content: 'This area has not been indexed yet. Swipe to "Picture" view to see the original scan high-fidelity.',
                // Create a 20% width/15% height centered box around the click
                rect: {
                    x: Math.max(0, x - 15),
                    y: Math.max(0, y - 10),
                    w: 30,
                    h: 20
                },
                imageUrl: pageUrl,
                verified: false,
                isDiscovery: true
            });
        }
    }, [articles]);

    const viewerPageData = useMemo(() => ({
        ...(pages[currentPageIndex] || {}),
        articles
    }), [pages, currentPageIndex, articles]);

    // Initial Full-Screen Loaders
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0B0F19]">
                <div className="text-center space-y-6">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Initializing Newsroom Engine...</p>
                </div>
            </div>
        );
    }

    if (editions.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0B0F19]">
                <div className="text-center space-y-6">
                    <Newspaper className="w-16 h-16 text-gray-800 mx-auto" />
                    <h2 className="text-xl font-black uppercase tracking-widest italic text-gray-700">No Published Editions</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Check Admin Panel for draft status</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white text-[#2B2523] overflow-hidden font-sans">
            {/* Header */}
            <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between z-50 shrink-0 shadow-sm">
                <div className="flex items-center gap-10">
                    <button
                        onClick={() => {
                            setSelectedEditionId(null);
                            setPages([]);
                            setFeedStatus('idle');
                            setLeftPanelCollapsed(false);
                        }}
                        className="flex items-center gap-4 group cursor-pointer text-left"
                    >
                        <div className="w-10 h-10 bg-[#AA792D] rounded-xl flex items-center justify-center shadow-lg shadow-[#AA792D]/20 group-hover:scale-110 transition-transform">
                            <Newspaper size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black italic uppercase tracking-tighter leading-none group-hover:text-[#AA792D] transition-colors">ASRE HAZIR <span className="text-[#AA792D]">DIGITAL</span></h1>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Industrial E-Paper Feed</p>
                        </div>
                    </button>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="h-8 w-px bg-gray-100 mx-2" />

                        {/* Premium Date Selector */}
                        <div className="relative" ref={datePickerRef}>
                            <div
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-xl border transition-all cursor-pointer ${showDatePicker ? 'border-[#AA792D] bg-white shadow-md' : 'border-gray-100 hover:border-[#AA792D]/30'}`}
                            >
                                <Calendar size={14} className="text-[#AA792D]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#2B2523]">{selectedDate || 'Select Edition'}</span>
                                <ChevronRight size={12} className="text-gray-300 rotate-90" />
                            </div>

                            <AnimatePresence>
                                {showDatePicker && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Available Archives</p>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {editions.map(e => (
                                                <button
                                                    key={e.id}
                                                    onClick={() => {
                                                        setSelectedDate(e.editionDate);
                                                        setSelectedEditionId(e.id);
                                                        setShowDatePicker(false);
                                                    }}
                                                    className={`w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors ${selectedEditionId === e.id ? 'bg-[#AA792D]/5 text-[#AA792D]' : 'text-gray-600'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest font-bold">{e.name || e.editionDate}</span>
                                                        <span className="text-[7px] font-medium text-gray-400 mt-0.5">{e.editionDate}</span>
                                                        <span className={`text-[7px] font-black uppercase mt-1 ${e.type === 'pdf' ? 'text-red-500' : 'text-[#AA792D]'}`}>{e.type === 'pdf' ? 'PDF Portfolio' : 'Interactive'}</span>
                                                    </div>
                                                    {selectedEditionId === e.id && <Zap size={12} className="fill-[#AA792D] text-[#AA792D]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search Intel..."
                                className="bg-gray-50 border border-gray-100 rounded-xl px-10 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all w-64 placeholder:text-gray-400 text-[#2B2523]"
                                onChange={(e) => {
                                    const term = e.target.value.toLowerCase();
                                    if (term.length > 2) {
                                        const found = articles.find(a => a.headline?.toLowerCase().includes(term));
                                        if (found) handleArticleClick(found);
                                    }
                                }}
                            />
                        </div>

                        <div className="h-8 w-px bg-gray-100 mx-2" />

                        {selectedEditionId && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                                    className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all shadow-sm active:scale-95 ${!leftPanelCollapsed ? 'bg-white border-[#AA792D] text-[#AA792D]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                >
                                    <Sidebar size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                        {!leftPanelCollapsed ? 'Hide Sidebar' : 'Show Sidebar'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedEditionId(null);
                                        setPages([]);
                                        setFeedStatus('idle');
                                        setLeftPanelCollapsed(false);
                                    }}
                                    className="flex items-center gap-3 px-5 py-2.5 bg-[#2B2523] text-white rounded-xl hover:bg-[#AA792D] transition-all shadow-lg active:scale-95"
                                >
                                    <ChevronLeft size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Exit Reader</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                            <Activity size={12} className="text-green-600" />
                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-3 bg-gray-50 hover:bg-white hover:shadow-md rounded-xl border border-gray-100 transition-all text-gray-400 hover:text-[#AA792D]"
                    >
                        <User size={18} />
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white relative">

                {/* Document Sidebar Backdrop for Mobile */}
                <AnimatePresence>
                    {!leftPanelCollapsed && isMobile && selectedEditionId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLeftPanelCollapsed(true)}
                            className="fixed inset-0 bg-[#2B2523]/60 backdrop-blur-sm z-30 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Document Sidebar - Sidebar Library for Switching */}
                {selectedEditionId ? (
                    <aside className={`bg-white border-r border-gray-100 transition-all duration-300 flex flex-col shrink-0 z-40 
                        ${isMobile
                            ? `fixed inset-y-0 left-0 w-80 shadow-2xl transform ${leftPanelCollapsed ? '-translate-x-full' : 'translate-x-0'}`
                            : (leftPanelCollapsed ? 'w-0 overflow-hidden' : 'w-80')}`}
                    >
                        <DocumentSidebar
                            editions={editions}
                            selectedEditionId={selectedEditionId}
                            onClose={() => setLeftPanelCollapsed(true)}
                            onSelect={(e) => {
                                setSelectedEditionId(e.id);
                                if (isMobile) {
                                    setTimeout(() => setLeftPanelCollapsed(true), 300);
                                }
                            }}
                        />
                    </aside>
                ) : null}

                {/* Mobile Menu Toggle Bar - Only visible when an edition is selected */}
                {isMobile && selectedEditionId ? (
                    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-30 shadow-sm shrink-0">
                        <button
                            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                            className="p-2 bg-gray-50 rounded-xl text-[#AA792D]"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Document Controls</span>
                        <div className="w-10" />
                    </div>
                ) : null}

                {/* Central Canvas Container */}
                <main className="flex-1 relative bg-white overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        {!selectedEditionId ? (
                            <EditionFeed
                                editions={editions}
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                onSelect={(e) => {
                                    setSelectedDate(e.editionDate);
                                    setSelectedEditionId(e.id);
                                }}
                            />
                        ) : (
                            <div className="flex-1 overflow-hidden relative">
                                <NewspaperStream
                                    pages={pages}
                                    edition={editions.find(e => e.id === selectedEditionId)}
                                />
                            </div>
                        )}

                        {/* ATOMIC LOADER OVERLAY */}
                        <AnimatePresence>
                            {feedStatus === 'loading' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="relative">
                                            <Loader2 className="w-12 h-12 animate-spin text-[#AA792D] mx-auto" />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-[#AA792D]/10 blur-xl rounded-full"
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Switching Feed State...</p>
                                    </div>
                                </motion.div>
                            )}

                            {feedStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-white/90 z-40 p-8"
                                >
                                    <div className="text-center space-y-6 max-w-sm">
                                        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
                                        <h2 className="text-lg font-black uppercase tracking-widest italic text-[#2B2523]">Signal Failure</h2>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wider">{error || "Connection timed out."}</p>
                                        <button
                                            onClick={() => loadFeed(selectedDate, editions.find(e => e.editionDate === selectedDate)?.id)}
                                            className="px-8 py-3 bg-[#AA792D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#AA792D]/20"
                                        >
                                            Retry Digital Sync
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </main>
            </div>

            {/* Mobile Bottom Sheet (Article Reader) */}
            <AnimatePresence>
                {isMobile && selectedArticle && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-[100] h-[75vh] flex flex-col bg-[#0B0F19] rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10 overflow-hidden"
                    >
                        {/* Drag Handle */}
                        <div className="h-1.5 w-12 bg-white/20 rounded-full mx-auto my-4 shrink-0" />

                        <div className="p-6 flex justify-between items-center border-b border-white/5 shrink-0 bg-[#0B0F19]">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Live Reading Mode</span>
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400"
                            >
                                <ChevronRight size={20} className="rotate-90" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ArticlePreview
                                article={selectedArticle}
                                onClose={() => setSelectedArticle(null)}
                                onNext={() => {
                                    const idx = articles.findIndex(a => a.id === selectedArticle.id);
                                    if (idx < articles.length - 1) setSelectedArticle({ ...articles[idx + 1], imageUrl: pages[currentPageIndex]?.imageUrl });
                                }}
                                onPrev={() => {
                                    const idx = articles.findIndex(a => a.id === selectedArticle.id);
                                    if (idx > 0) setSelectedArticle({ ...articles[idx - 1], imageUrl: pages[currentPageIndex]?.imageUrl });
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EpaperReader;
