import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
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
    const [currentLang, setCurrentLang] = useState('english');
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

    const [detectedArticles, setDetectedArticles] = useState([]);
    const [currentArticleIndex, setCurrentArticleIndex] = useState(-1);

    // Fetch edition from Firestore
    useEffect(() => {
        const fetchEdition = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`🔍 Fetching ${currentLang} edition for ${selectedDate}...`);
                const q = query(
                    collection(db, 'editions'),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                let foundEdition = null;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.language === currentLang) {
                        if (!selectedDate || data.editionDate === selectedDate) {
                            if (!foundEdition) foundEdition = { id: doc.id, ...data };
                        }
                    }
                });

                if (foundEdition && foundEdition.pages) {
                    setPages(foundEdition.pages);
                    setCurrentPageIndex(0);
                    setSelectedArticle(null);
                } else {
                    setPages([]);
                }
            } catch (err) {
                console.error('❌ Error fetching edition:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEdition();
    }, [currentLang, selectedDate]);

    // Fetch available edition dates
    useEffect(() => {
        const fetchDates = async () => {
            try {
                const q = query(collection(db, 'editions'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const dates = new Set();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.editionDate) dates.add(data.editionDate);
                });
                const sortedDates = Array.from(dates).sort().reverse();
                setEditionDates(sortedDates);
                if (sortedDates.length > 0 && !selectedDate) {
                    setSelectedDate(sortedDates[0]);
                }
            } catch (err) {
                console.error("Error fetching dates:", err);
            }
        };
        fetchDates();
    }, []);

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

    const handleLanguageToggle = () => {
        setCurrentLang(prev => prev === 'english' ? 'urdu' : 'english');
        setSelectedArticle(null);
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

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Loading E-Paper...
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
                        Error Loading E-Paper
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Retry
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
                        No Edition Published Yet
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        There are no published pages for {currentLang === 'english' ? 'English' : 'Urdu'} edition
                        {selectedDate && ` on ${selectedDate}`}.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleLanguageToggle}
                            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                        >
                            Switch to {currentLang === 'english' ? 'Urdu' : 'English'}
                        </button>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Show All Dates
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Top Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Newspaper size={24} className="text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                E-Paper Reader
                            </h1>
                        </div>
                        {currentPage && (
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-lg">
                                    Page {currentPage.pageNumber} of {pages.length}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Edition Date Selector */}
                        {editionDates.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-500" />
                                <select
                                    value={selectedDate || ''}
                                    onChange={(e) => setSelectedDate(e.target.value || null)}
                                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Dates</option>
                                    {editionDates.map(date => (
                                        <option key={date} value={date}>
                                            {new Date(date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Language Toggle */}
                        <button
                            onClick={handleLanguageToggle}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                            <Globe size={16} />
                            {currentLang === 'english' ? 'English' : 'اردو'}
                        </button>

                        {/* Page Navigation */}
                        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPageIndex === 0}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Previous Page"
                            >
                                <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPageIndex === pages.length - 1}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Next Page"
                            >
                                <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3-Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL - Page Thumbnails (Desktop side, Mobile hidden by default) */}
                <aside
                    className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ${isMobile
                        ? (leftPanelCollapsed ? 'w-0' : 'fixed inset-0 z-50 w-3/4')
                        : (leftPanelCollapsed ? 'w-0' : 'w-64')
                        }`}
                >
                    {(!leftPanelCollapsed || isMobile === false) && (
                        <PageThumbnailList
                            pages={pages}
                            activePageIndex={currentPageIndex}
                            onPageSelect={(idx) => {
                                handlePageSelect(idx);
                                if (isMobile) setLeftPanelCollapsed(true);
                            }}
                        />
                    )}
                </aside>

                {/* CENTER PANEL - Full Page Viewer */}
                <main className={`flex-1 overflow-hidden relative ${isMobile ? 'w-full' : ''}`}>
                    {/* Mobile Thumbnail Toggle */}
                    {isMobile && (
                        <button
                            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                            className="absolute bottom-20 left-4 z-20 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                            <ChevronRight size={24} className={`${leftPanelCollapsed ? '' : 'rotate-180'} transition-transform`} />
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
                    <div className="fixed inset-0 z-[60] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setSelectedArticle(null)}
                        />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="relative w-full max-h-[90vh] bg-[#0B0F19] rounded-t-[3rem] shadow-2xl overflow-hidden border-t border-white/5"
                        >
                            <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto my-6" />
                            <div className="h-[calc(90vh-100px)]">
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
