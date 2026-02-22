import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase/config';
import { collection, query, orderBy, getDocs, onSnapshot, where } from 'firebase/firestore';
import PageThumbnailList from './components/PageThumbnailList';
import PageViewer from './components/PageViewer';
import ArticlePreview from './components/ArticlePreview';
import { Loader2, Calendar, Globe, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';

const EpaperReader = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [editionDates, setEditionDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Monitor screen size for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setLeftPanelCollapsed(true);
                setRightPanelCollapsed(true);
            } else {
                setLeftPanelCollapsed(false);
                setRightPanelCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // REAL-TIME FETCH: Edition from Firestore (MANDATORY FIX 1)
    useEffect(() => {
        setLoading(true);
        setError(null);

        // Reader portal ONLY fetch: status: "published" and isActive: true
        const q = query(
            collection(db, 'epaper_editions'),
            where("status", "==", "published"),
            where("isActive", "==", true),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                let foundEdition = null;
                const dates = new Set();

                const docs = snapshot.docs.map(doc => {
                    const data = doc.data();
                    if (data.editionDate) dates.add(data.editionDate);
                    return { id: doc.id, ...data };
                });

                // Update available dates
                const sortedDates = Array.from(dates).sort().reverse();
                setEditionDates(sortedDates);

                // Set default selected date if none
                if (sortedDates.length > 0 && !selectedDate) {
                    setSelectedDate(sortedDates[0]);
                }

                // Find the edition for the selected date
                const targetDate = selectedDate || sortedDates[0];
                foundEdition = docs.find(d => d.editionDate === targetDate);

                if (foundEdition && foundEdition.pages) {
                    // VERIFICATION CHECK (MANDATORY FIX 5)
                    const validPages = foundEdition.pages.filter(p => p.imageUrl);
                    setPages(validPages);
                    // Reset page index if we changed editions
                    if (!pages.length || foundEdition.id !== pages[0]?.editionId) {
                        setCurrentPageIndex(0);
                    }
                } else {
                    setPages([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('❌ Error processing editions:', err);
                setError(err.message);
                setLoading(false);
            }
        }, (err) => {
            console.error('❌ Firestore listener error:', err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedDate]);

    const currentPage = pages[currentPageIndex];

    const handlePageSelect = (index) => {
        if (index >= 0 && index < pages.length) {
            setCurrentPageIndex(index);
            setSelectedArticle(null); // Clear selected article when changing page
        }
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        setRightPanelCollapsed(false); // Auto-expand right panel
    };

    const goToNextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            handlePageSelect(currentPageIndex + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPageIndex > 0) {
            handlePageSelect(currentPageIndex - 1);
        }
    };

    if (loading && pages.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium tracking-widest uppercase text-[10px]">
                        Syncing with Newsroom Engine...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        System Sync Failure
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Re-initialize Engine
                    </button>
                </div>
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Newspaper size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        No Edition Live
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium italic">
                        {selectedDate ? `No published content found for ${selectedDate}` : 'Our journalists are currently preparing the next edition.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Back to Today
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Top Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Newspaper size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
                                    ASRE HAZIR <span className="text-blue-600 font-black">E-PAPER</span>
                                </h1>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Digital Edition Portal</p>
                            </div>
                        </div>
                        {currentPage && (
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-900/50">
                                    Sheet {currentPageIndex + 1} / {pages.length}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Edition Date Selector */}
                        {editionDates.length > 0 && (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Calendar size={14} className="text-blue-500" />
                                <select
                                    value={selectedDate || ''}
                                    onChange={(e) => setSelectedDate(e.target.value || null)}
                                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-0 cursor-pointer"
                                >
                                    {editionDates.map(date => (
                                        <option key={date} value={date} className="dark:bg-gray-800">
                                            {new Date(date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Page Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPageIndex === 0}
                                className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-current rounded-xl transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPageIndex === pages.length - 1}
                                className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-current rounded-xl transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3-Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL - Page Thumbnails */}
                <aside
                    className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ${isMobile
                        ? (leftPanelCollapsed ? 'w-0' : 'fixed inset-0 z-[60] w-3/4 shadow-2xl')
                        : (leftPanelCollapsed ? 'w-0' : 'w-72')
                        }`}
                >
                    {(!leftPanelCollapsed || !isMobile) && (
                        <div className="h-full">
                            <PageThumbnailList
                                pages={pages}
                                activePageIndex={currentPageIndex}
                                onPageSelect={(idx) => {
                                    handlePageSelect(idx);
                                    if (isMobile) setLeftPanelCollapsed(true);
                                }}
                            />
                        </div>
                    )}
                </aside>

                {/* CENTER PANEL - Full Page Viewer */}
                <main className="flex-1 overflow-hidden relative bg-[#0B0F19]">
                    {/* Mobile Thumbnail Toggle */}
                    {isMobile && (
                        <button
                            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                            className="absolute bottom-10 left-6 z-20 p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 active:scale-90 transition-all"
                        >
                            <ChevronRight size={20} className={`${leftPanelCollapsed ? '' : 'rotate-180'} transition-transform`} />
                        </button>
                    )}

                    <PageViewer
                        page={currentPage}
                        onArticleClick={handleArticleClick}
                    />
                </main>

                {/* RIGHT PANEL - Article Preview (Desktop Only) */}
                {!isMobile && (
                    <aside
                        className={`bg-[#0B0F19] border-l border-white/5 overflow-hidden transition-all duration-500 shadow-2xl z-30 ${rightPanelCollapsed || !selectedArticle ? 'w-0' : 'w-[500px]'
                            }`}
                    >
                        {selectedArticle && (
                            <ArticlePreview
                                article={selectedArticle}
                                onClose={() => setSelectedArticle(null)}
                                onNext={() => {
                                    const arts = currentPage.articles || [];
                                    const currentIdx = arts.findIndex(a => a.id === selectedArticle.id);
                                    if (currentIdx < arts.length - 1) setSelectedArticle(arts[currentIdx + 1]);
                                }}
                                onPrev={() => {
                                    const arts = currentPage.articles || [];
                                    const currentIdx = arts.findIndex(a => a.id === selectedArticle.id);
                                    if (currentIdx > 0) setSelectedArticle(arts[currentIdx - 1]);
                                }}
                            />
                        )}
                    </aside>
                )}
            </div>

            {/* MOBILE MODAL - Article Preview */}
            <AnimatePresence>
                {isMobile && selectedArticle && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedArticle(null)}
                        />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="relative w-full max-h-[95vh] bg-[#0B0F19] rounded-t-[3rem] shadow-2xl overflow-hidden border-t border-white/5"
                        >
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-6" />
                            <div className="h-[calc(95vh-80px)]">
                                <ArticlePreview
                                    article={selectedArticle}
                                    onClose={() => setSelectedArticle(null)}
                                    onNext={() => {
                                        const arts = currentPage.articles || [];
                                        const currentIdx = arts.findIndex(a => a.id === selectedArticle.id);
                                        if (currentIdx < arts.length - 1) setSelectedArticle(arts[currentIdx + 1]);
                                    }}
                                    onPrev={() => {
                                        const arts = currentPage.articles || [];
                                        const currentIdx = arts.findIndex(a => a.id === selectedArticle.id);
                                        if (currentIdx > 0) setSelectedArticle(arts[currentIdx - 1]);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EpaperReader;
