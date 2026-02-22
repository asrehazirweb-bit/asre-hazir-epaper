import React, { useState, useEffect } from 'react';
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

const EpaperReader = () => {
    const [editions, setEditions] = useState([]);
    const [pages, setPages] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

    // REAL-TIME FETCH: Editions
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

    // FETCH: Pages for selected date
    useEffect(() => {
        const fetchContent = async () => {
            const edition = editions.find(e => e.editionDate === selectedDate);
            if (!edition) return;

            setPageLoading(true);
            try {
                const fetchedPages = await getPagesByEdition(edition.id);
                setPages(fetchedPages);
                setCurrentPageIndex(0);
                setSelectedArticle(null);
                incrementReaders(edition.id);
            } catch (err) {
                console.error("Page fetch failed:", err);
            } finally {
                setPageLoading(false);
            }
        };

        if (selectedDate && editions.length > 0) {
            fetchContent();
        }
    }, [selectedDate, editions]);

    // FETCH: Articles for current page
    useEffect(() => {
        const fetchArticles = async () => {
            if (!pages[currentPageIndex]) return;
            try {
                const fetchedArticles = await getArticlesByPage(pages[currentPageIndex].id);
                setArticles(fetchedArticles);
            } catch (err) {
                console.error("Article fetch failed:", err);
            }
        };

        fetchArticles();
    }, [currentPageIndex, pages]);

    const currentPage = pages[currentPageIndex];

    const handleCoordinateClick = ({ x, y, pageUrl }) => {
        // Dynamic Fragment Logic (Hans India Style)
        // If user clicks a non-hotspot area, we create a temporary "Crop Preview"
        // But first, check if any existing article contains this coordinate
        const hit = articles.find(art =>
            x >= art.rect.x && x <= (art.rect.x + art.rect.w) &&
            y >= art.rect.y && y <= (art.rect.y + art.rect.h)
        );

        if (hit) {
            setSelectedArticle({ ...hit, imageUrl: pageUrl });
        } else {
            // Dynamic Crop (30x15% area around click)
            setSelectedArticle({
                id: 'discover-' + Date.now(),
                headline: 'Digital Fragment Captured',
                content: 'This region has been cropped for clarity. For full article text, please click a pre-defined news node.',
                rect: { x: x - 15, y: y - 7.5, w: 30, h: 15 },
                imageUrl: pageUrl,
                verified: false
            });
        }
    };

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

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0B0F19] p-8">
                <div className="text-center space-y-6 max-w-md">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
                    <h2 className="text-xl font-black uppercase tracking-widest italic">Sync Error Detected</h2>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wider">
                        {error.includes('index')
                            ? "A database index is required to sort your editions. Please check the browser console for the creation link."
                            : error}
                    </p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest">Retry Connection</button>
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
            {/* Optimized Header (Desktop-Centric) */}
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
                                setCurrentPageIndex(idx);
                                if (isMobile) setLeftPanelCollapsed(true);
                            }}
                        />
                    </div>
                </aside>

                {/* Central Canvas (The Reader) */}
                <main className="flex-1 relative bg-black overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-hidden relative">
                        {pageLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                                <Loader2 className="animate-spin text-blue-500" />
                            </div>
                        ) : (
                            <PageViewer
                                page={{ ...currentPage, articles }}
                                onArticleClick={(art) => setSelectedArticle({ ...art, imageUrl: currentPage.imageUrl })}
                                onCoordinateClick={handleCoordinateClick}
                            />
                        )}
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
                                onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                                disabled={currentPageIndex === 0}
                                className="flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{currentPageIndex + 1} // {pages.length}</span>
                            <button
                                onClick={() => setCurrentPageIndex(p => Math.min(pages.length - 1, p + 1))}
                                disabled={currentPageIndex === pages.length - 1}
                                className="flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="w-10" />
                    </div>
                </main>

                {/* Article Intelligence Panel (Right Sidebar) */}
                <aside className={`bg-[#0B0F19] border-l border-white/5 transition-all duration-500 overflow-hidden relative z-30 shrink-0 ${!selectedArticle ? 'w-0' : 'w-[550px]'}`}>
                    {selectedArticle && (
                        <ArticlePreview
                            article={selectedArticle}
                            onClose={() => setSelectedArticle(null)}
                            onNext={() => {
                                const idx = articles.findIndex(a => a.id === selectedArticle.id);
                                if (idx < articles.length - 1) setSelectedArticle({ ...articles[idx + 1], imageUrl: currentPage.imageUrl });
                            }}
                            onPrev={() => {
                                const idx = articles.findIndex(a => a.id === selectedArticle.id);
                                if (idx > 0) setSelectedArticle({ ...articles[idx - 1], imageUrl: currentPage.imageUrl });
                            }}
                        />
                    )}
                </aside>
            </div>

            {/* Mobile Sheet (Bottom Up) */}
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
