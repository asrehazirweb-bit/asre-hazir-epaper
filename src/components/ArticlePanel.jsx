import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Printer, Type } from 'lucide-react';

const ArticlePanel = ({ article, isOpen, onClose, direction = 'ltr' }) => {
    if (!article) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: direction === 'rtl' ? -450 : 450, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction === 'rtl' ? -450 : 450, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`article-panel ${direction === 'rtl' ? 'rtl' : ''}`}
                >
                    <div className="article-panel-header">
                        <button className="btn-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <button className="zoom-btn"><Share2 size={18} /></button>
                            <button className="zoom-btn"><Printer size={18} /></button>
                            <button className="zoom-btn"><Type size={18} /></button>
                        </div>
                        <h1 className="article-title">{article.title}</h1>
                        <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.9rem' }}>
                            <span>February 15, 2026</span>
                            <span>•</span>
                            <span>Hyderabad Edition</span>
                        </div>
                    </div>

                    <div className="article-content">
                        {article.content}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            ID: {article.id}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ArticlePanel;
