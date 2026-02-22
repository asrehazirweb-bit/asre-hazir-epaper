import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase/config';
import { collection, query, orderBy, getDocs, onSnapshot, where } from 'firebase/firestore';
import PageThumbnailList from './components/PageThumbnailList';
import PageViewer from './components/PageViewer';
import ArticlePreview from './components/ArticlePreview';
import {
    Loader2, Calendar, Globe, Newspaper, ChevronLeft, ChevronRight,
    Maximize2, Sidebar, PanelsTopLeft, Search, User, LogIn,
    Zap, Activity, Clock, AlertTriangle
} from 'lucide-react';
import { getPagesByEdition, getArticlesByPage, incrementReaders } from './services/epaperService';

const FEED_TIMEOUT_MS = 8000; // 8 seconds fallback

const EpaperReader = () => {
    // Infrastructure State
    const [editions, setEditions] = useState([]);
    const [pages, setPages] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true); // Initial app load

    // Feed Lifecycle State
    const [feedStatus, setFeedStatus] = useState('idle'); // idle | loading | success | error
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);

    // UI State
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [error, setError] = useState(null);

    // Refs for Request Control
    const activeRequestRef = useRef(0);
    const timeoutRef = useRef(null);

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
            if (data.length > 0 && !selectedDate) {
                setSelectedDate(data[0].editionDate);
            }
            setLoading(false);
        }, (err) => {
            console.error("Firestore Error:", err);
            setError("Connectivity lost. Reconnecting...");
            setLoading(false);
        });

        return () => unsub();
    }, []);

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

    // Handle Date Switch
    useEffect(() => {
        const edition = editions.find(e => e.editionDate === selectedDate);
        if (edition) {
            setSelectedArticle(null);
            loadFeed(selectedDate, edition.id);
        }
    }, [selectedDate, editions.length > 0]); // editions.length check to ensure initial load

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
            setSelectedArticle({
                id: 'discover-' + Date.now(),
                headline: 'Digital Fragment captured',
                content: 'No readable article found in this area. For high-fidelity reading, please click a verified news node.',
                rect: { x: x - 15, y: y - 7.5, w: 30, h: 15 },
                imageUrl: pageUrl,
                verified: false
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
        <div className="h-screen flex flex-col bg-[#0B0F19] text-white overflow-hidden font-sans">
            {/* Header */}
            <header className="h-20 glass-panel border-b border-white/5 px-8 flex items-center justify-between z-50 shrink-0">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Newspaper size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black italic uppercase tracking-tighter leading-none">ASRE HAZIR <span className="text-blue-500">DIGITAL</span></h1>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Industrial E-Paper Feed</p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <Calendar size={14} className="text-blue-500" />
                            <select
                                value={selectedDate || ''}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                                {editions.map(e => (
                                    <option key={e.id} value={e.editionDate} className="bg-[#111827]">{e.editionDate}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
                            <Activity size={12} className="text-green-500" />
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Live Sync</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                            <Clock size={12} className="text-blue-500" />
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                        <User size={18} className="text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails Sidebar */}
                <aside className={`bg-[#111827] border-r border-white/5 transition-all duration-300 flex flex-col shrink-0 ${leftPanelCollapsed ? 'w-0' : 'w-72'}`}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <PageThumbnailList
                            pages={pages}
                            activePageIndex={currentPageIndex}
                            onPageSelect={(idx) => {
                                handlePageNavigation(idx);
                                if (isMobile) setLeftPanelCollapsed(true);
                            }}
                        />
                    </div>
                </aside>

                {/* Central Canvas */}
                <main className="flex-1 relative bg-black overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-hidden relative">
                        {/* THE STABLE CANVAS - NEVER UNMOUNTS */}
                        <PageViewer
                            page={viewerPageData}
                            onArticleClick={handleArticleClick}
                            onCoordinateClick={handleCoordinateClick}
                        />

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
                                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Switching Feed State...</p>
                                    </div>
                                </motion.div>
                            )}

                            {feedStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-[#0B0F19]/90 z-40 p-8"
                                >
                                    <div className="text-center space-y-6 max-w-sm">
                                        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
                                        <h2 className="text-lg font-black uppercase tracking-widest italic text-white">Signal Failure</h2>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wider">{error || "Connection timed out."}</p>
                                        <button
                                            onClick={() => loadFeed(selectedDate, editions.find(e => e.editionDate === selectedDate)?.id)}
                                            className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                        >
                                            Retry Digital Sync
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Rail */}
                    <div className="h-16 bg-[#111827]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-8 z-20 shrink-0">
                        <button
                            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                            className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                        >
                            <Sidebar size={20} />
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handlePageNavigation(Math.max(0, currentPageIndex - 1))}
                                disabled={currentPageIndex === 0 || feedStatus === 'loading'}
                                className="flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{currentPageIndex + 1} // {pages.length}</span>
                            <button
                                onClick={() => handlePageNavigation(Math.min(pages.length - 1, currentPageIndex + 1))}
                                disabled={currentPageIndex === pages.length - 1 || feedStatus === 'loading'}
                                className="flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="w-10" />
                    </div>
                </main>

                {/* Article Panel */}
                <aside className={`bg-[#0B0F19] border-l border-white/5 transition-all duration-500 overflow-hidden relative z-30 shrink-0 ${!selectedArticle ? 'w-0' : 'w-[550px]'}`}>
                    {selectedArticle && (
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
                    )}
                </aside>
            </div>

            {/* Mobile Sheet */}
            <AnimatePresence>
                {isMobile && selectedArticle && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-0 z-[100] flex flex-col bg-[#0B0F19]"
                    >
                        <div className="p-4 flex justify-between items-center border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest">Article Reader</span>
                            <button onClick={() => setSelectedArticle(null)} className="p-2 bg-white/5 rounded-xl"><ChevronLeft size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ArticlePreview
                                article={selectedArticle}
                                onClose={() => setSelectedArticle(null)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EpaperReader;
