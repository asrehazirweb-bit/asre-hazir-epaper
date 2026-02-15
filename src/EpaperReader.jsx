import React, { useState } from 'react';
import './styles/epaper.css';
import PageThumbnailList from './components/PageThumbnailList';
import PageViewer from './components/PageViewer';
import ArticlePanel from './components/ArticlePanel';
import useEpaper from './hooks/useEpaper';
import sampleEdition from './data/sampleEdition.json';
import sampleEditionUrdu from './data/sampleEditionUrdu.json';
import { Globe } from 'lucide-react';

const EpaperReader = () => {
    const [currentLang, setCurrentLang] = useState('english');
    const epaper = useEpaper(currentLang === 'english' ? sampleEdition : sampleEditionUrdu);

    const toggleLanguage = () => {
        const nextLang = currentLang === 'english' ? 'urdu' : 'english';
        setCurrentLang(nextLang);
        epaper.setEdition(nextLang === 'english' ? sampleEdition : sampleEditionUrdu);
        epaper.handlePageSelect(0);
        epaper.closeArticle();
    };

    if (!epaper.data) return <div className="loading">Loading Edition...</div>;

    return (
        <div className={`epaper-container ${epaper.data.direction === 'rtl' ? 'rtl' : ''}`}>
            {/* Sidebar */}
            <aside className="epaper-sidebar">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>ASREHAZIR</h2>
                        <button
                            className="zoom-btn"
                            onClick={toggleLanguage}
                            title="Toggle Language"
                            style={{ color: '#60a5fa' }}
                        >
                            <Globe size={18} />
                        </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px' }}>
                        {epaper.data.edition} • {epaper.data.date}
                    </p>
                </div>

                <PageThumbnailList
                    pages={epaper.data.pages}
                    activePageIndex={epaper.activePageIndex}
                    onPageSelect={epaper.handlePageSelect}
                />
            </aside>

            {/* Main Viewer */}
            <main className="epaper-viewer-container">
                <PageViewer
                    page={epaper.activePage}
                    onArticleClick={epaper.handleArticleClick}
                />
            </main>

            {/* Article Detail Panel */}
            <ArticlePanel
                article={epaper.selectedArticle}
                isOpen={epaper.isArticleOpen}
                onClose={epaper.closeArticle}
                direction={epaper.data.direction}
            />
        </div>
    );
};

export default EpaperReader;
