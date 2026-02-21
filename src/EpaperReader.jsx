import React, { useState, useEffect } from 'react';
import { getPublishedPages, getEditionDates } from './services/epaperService';
import PageThumbnailList from './components/PageThumbnailList';
import PageViewer from './components/PageViewer';
import ArticleCropViewer from './components/ArticleCropViewer';
import { Loader2, Calendar, Globe, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';

const EpaperReader = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [cropData, setCropData] = useState(null);
    const [currentLang, setCurrentLang] = useState('english');
    const [editionDates, setEditionDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

    // Fetch pages from Firestore
    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`🔍 Fetching ${currentLang} pages...`);
                const fetchedPages = await getPublishedPages(currentLang, selectedDate);

                if (fetchedPages.length === 0) {
                    console.log('ℹ️ No published pages found');
                    setPages([]);
                } else {
                    console.log(`✅ Loaded ${fetchedPages.length} pages`);
                    setPages(fetchedPages);
                    setCurrentPageIndex(0);
                    setCropData(null); // Clear crop when changing edition
                }
            } catch (err) {
                console.error('❌ Error fetching pages:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPages();
    }, [currentLang, selectedDate]);

    // Fetch available edition dates
    useEffect(() => {
        const fetchDates = async () => {
            const dates = await getEditionDates();
            setEditionDates(dates);
            if (dates.length > 0 && !selectedDate) {
                setSelectedDate(dates[0]);
            }
        };
        fetchDates();
    }, []);

    const currentPage = pages[currentPageIndex];

    const handlePageSelect = (index) => {
        if (index >= 0 && index < pages.length) {
            setCurrentPageIndex(index);
            setCropData(null); // Clear crop when changing page
        }
    };

    const handlePageClick = (clickData) => {
        setCropData(clickData);
        setRightPanelCollapsed(false); // Auto-expand right panel
    };

    const handleLanguageToggle = () => {
        setCurrentLang(prev => prev === 'english' ? 'urdu' : 'english');
        setCropData(null);
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
                {/* LEFT PANEL - Page Thumbnails */}
                <aside
                    className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ${leftPanelCollapsed ? 'w-0' : 'w-64'
                        }`}
                >
                    {!leftPanelCollapsed && (
                        <PageThumbnailList
                            pages={pages}
                            activePageIndex={currentPageIndex}
                            onPageSelect={handlePageSelect}
                        />
                    )}
                </aside>

                {/* CENTER PANEL - Full Page Viewer */}
                <main className="flex-1 overflow-hidden relative">
                    <PageViewer
                        page={currentPage}
                        onPageClick={handlePageClick}
                    />
                </main>

                {/* RIGHT PANEL - Article Crop Viewer */}
                <aside
                    className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${rightPanelCollapsed ? 'w-0' : 'w-96'
                        }`}
                >
                    {!rightPanelCollapsed && (
                        <ArticleCropViewer
                            cropData={cropData}
                            onClose={() => setCropData(null)}
                        />
                    )}
                </aside>
            </div>
        </div>
    );
};

export default EpaperReader;
