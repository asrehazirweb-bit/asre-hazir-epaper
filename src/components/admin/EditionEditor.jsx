import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import {
    ChevronLeft, Save, Sparkles, Trash2, Eye, Layout,
    Type, CheckCircle2, AlertTriangle, MousePointer2,
    Maximize, ZoomIn, ZoomOut, RefreshCw, Layers,
    ScanLine, Image as ImageIcon, CheckCircle
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { performOCR } from '../../utils/ocrService';
import { getPagesByEdition, getArticlesByPage, saveArticle, saveEdition } from '../../services/epaperService';

const EditionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [edition, setEdition] = useState(null);
    const [pages, setPages] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPageIdx, setSelectedPageIdx] = useState(0);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [saving, setSaving] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showThumbnails, setShowThumbnails] = useState(window.innerWidth >= 1024);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setShowThumbnails(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial Fetch: Edition and Pages
    useEffect(() => {
        const fetchEditionData = async () => {
            try {
                const edSnap = await getDoc(doc(db, 'epaper_editions', id));
                if (edSnap.exists()) {
                    setEdition({ id: edSnap.id, ...edSnap.data() });
                    const fetchedPages = await getPagesByEdition(id);
                    setPages(fetchedPages);
                }
            } catch (err) {
                console.error("Fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEditionData();
    }, [id]);

    // Fetch articles when page changes
    useEffect(() => {
        const fetchPageArticles = async () => {
            if (!pages[selectedPageIdx]) return;
            try {
                const fetchedArticles = await getArticlesByPage(pages[selectedPageIdx].id);
                setArticles(fetchedArticles);
            } catch (err) {
                console.error("Articles fetch failed:", err);
            }
        };
        fetchPageArticles();
    }, [selectedPageIdx, pages]);

    const currentPage = pages[selectedPageIdx];

    const handleMouseDown = (e) => {
        if (!containerRef.current || activeHotspot || isDrawing) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setStartPos({ x, y });
        setIsDrawing(true);
        setActiveHotspot({
            id: null, // New
            rect: { x, y, w: 0, h: 0 },
            headline: '',
            content: '',
            verified: false
        });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || !activeHotspot) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setActiveHotspot(prev => ({
            ...prev,
            rect: {
                x: Math.min(startPos.x, x),
                y: Math.min(startPos.y, y),
                w: Math.abs(x - startPos.x),
                h: Math.abs(y - startPos.y)
            }
        }));
    };

    const handleMouseUp = () => {
        if (isDrawing) {
            setIsDrawing(false);
            if (activeHotspot.rect.w < 0.5 || activeHotspot.rect.h < 0.5) {
                setActiveHotspot(null);
            }
        }
    };

    const handleCommitArticle = async () => {
        if (!activeHotspot || !currentPage) return;
        setSaving(true);
        try {
            const articleId = await saveArticle({
                ...activeHotspot,
                editionId: id,
                pageId: currentPage.id
            });

            // Update local state
            if (activeHotspot.id) {
                setArticles(prev => prev.map(a => a.id === articleId ? { ...activeHotspot, id: articleId } : a));
            } else {
                setArticles(prev => [...prev, { ...activeHotspot, id: articleId }]);
            }
            setActiveHotspot(null);
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const runOCR = async () => {
        if (!activeHotspot || ocrLoading || !imageRef.current) return;
        setOcrLoading(true);
        try {
            // Calculate absolute rectangle for OCR
            const naturalW = imageRef.current.naturalWidth;
            const naturalH = imageRef.current.naturalHeight;
            const ocrRect = {
                left: (activeHotspot.rect.x / 100) * naturalW,
                top: (activeHotspot.rect.y / 100) * naturalH,
                width: (activeHotspot.rect.w / 100) * naturalW,
                height: (activeHotspot.rect.h / 100) * naturalH
            };

            const result = await performOCR(currentPage.imageUrl, ocrRect);
            setActiveHotspot(prev => ({
                ...prev,
                headline: result.headline || prev.headline,
                content: result.bodyText || prev.content
            }));
        } catch (err) {
            console.error("OCR Inference Error:", err);
        } finally {
            setOcrLoading(false);
        }
    };

    const toggleEditionStatus = async () => {
        const newStatus = edition.status === 'published' ? 'draft' : 'published';
        const newActive = !edition.isActive;
        setSaving(true);
        try {
            await saveEdition({ ...edition, status: newStatus, isActive: newActive });
            setEdition(prev => ({ ...prev, status: newStatus, isActive: newActive }));
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F19] space-y-4">
            <ScanLine className="w-12 h-12 text-blue-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Initializing Mapping Engine...</p>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#0B0F19] text-white overflow-hidden">
            {/* Header */}
            <header className="h-20 glass-panel border-b border-white/5 px-4 md:px-8 flex items-center justify-between shrink-0 z-40">
                <div className="flex items-center gap-3 md:gap-6">
                    <button onClick={() => navigate('/admin/editions')} className="p-2 md:p-2.5 hover:bg-white/5 rounded-xl transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-[10px] md:text-sm font-black uppercase tracking-widest italic truncate max-w-[120px] md:max-w-none">
                            {edition?.name} <span className="text-blue-500 mx-2 hidden md:inline">//</span>
                            <span className="md:hidden block text-blue-500 text-[8px] mt-0.5">Page {selectedPageIdx + 1}</span>
                            <span className="hidden md:inline text-gray-400">Sheet {selectedPageIdx + 1}</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-6">
                    <button
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        className={`p-2 rounded-lg md:hidden ${showThumbnails ? 'bg-blue-600' : 'bg-white/5'}`}
                    >
                        <ImageIcon size={18} />
                    </button>
                    <button
                        onClick={toggleEditionStatus}
                        className={`px-3 md:px-6 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all ${edition?.status === 'published' ? 'bg-green-600 text-white' : 'bg-amber-600/20 text-amber-500 border border-amber-500/30'}`}
                    >
                        {edition?.status === 'published' ? <CheckCircle size={14} className="hidden xs:block" /> : <AlertTriangle size={14} className="hidden xs:block" />}
                        {edition?.status === 'published' ? 'Live' : 'Draft'}
                    </button>
                    <a
                        href="/"
                        target="_blank"
                        className="p-2 md:p-2.5 hover:bg-blue-600/10 text-gray-400 hover:text-blue-500 rounded-xl transition-all hidden xs:block"
                        title="View Live Reader"
                    >
                        <Eye size={20} />
                    </a>
                    {saving && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails */}
                <aside className={`
                    ${isMobile
                        ? `fixed inset-y-20 left-0 z-50 transform transition-transform duration-300 ${showThumbnails ? 'translate-x-0' : '-translate-x-full'}`
                        : 'relative w-64 border-r'}
                    bg-[#111827] border-white/5 overflow-y-auto p-4 space-y-4 custom-scrollbar
                `}>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2">Edition Hierarchy</p>
                    <div className={`${isMobile ? 'flex flex-col w-48' : 'block'}`}>
                        {pages.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => { setSelectedPageIdx(idx); setActiveHotspot(null); if (isMobile) setShowThumbnails(false); }}
                                className={`w-full relative aspect-[1/1.4] rounded-xl overflow-hidden border-2 transition-all mb-4 ${selectedPageIdx === idx ? 'border-blue-600 shadow-lg shadow-blue-500/20' : 'border-white/5 hover:border-white/10'}`}
                            >
                                <img src={p.imageUrl} className={`w-full h-full object-cover transition-all ${selectedPageIdx === idx ? 'opacity-100' : 'opacity-40 grayscale hover:opacity-100'}`} />
                                <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 rounded-lg text-[9px] font-black tracking-widest">{idx + 1}</div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Mapping Area */}
                <main className="flex-1 relative bg-black overflow-hidden flex flex-col">
                    <TransformWrapper
                        centerOnInit
                        minScale={1}
                        limitToBounds={false}
                        panning={{ disabled: isDrawing || !!activeHotspot }}
                        wheel={{ disabled: true }}
                    >
                        <TransformComponent wrapperClassName="!w-full !h-full" contentClassName="flex items-center justify-center p-10">
                            <div
                                ref={containerRef}
                                className="relative bg-white cursor-crosshair shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            >
                                <img
                                    ref={imageRef}
                                    src={currentPage?.imageUrl}
                                    className="max-h-[80vh] w-auto pointer-events-none select-none"
                                    crossOrigin="anonymous"
                                />

                                {/* Articles */}
                                {articles.map((art) => (
                                    <div
                                        key={art.id}
                                        onClick={(e) => { e.stopPropagation(); setActiveHotspot(art); }}
                                        className={`absolute border-2 transition-all selection-none ${activeHotspot?.id === art.id ? 'border-blue-500 bg-blue-500/20 z-30' : 'border-white/20 bg-black/5 z-10 hover:border-white/60'}`}
                                        style={{
                                            left: `${art.rect.x}%`,
                                            top: `${art.rect.y}%`,
                                            width: `${art.rect.w}%`,
                                            height: `${art.rect.h}%`
                                        }}
                                    />
                                ))}

                                {/* Active Selection */}
                                {activeHotspot && !activeHotspot.id && (
                                    <div
                                        className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none z-40"
                                        style={{
                                            left: `${activeHotspot.rect.x}%`,
                                            top: `${activeHotspot.rect.y}%`,
                                            width: `${activeHotspot.rect.w}%`,
                                            height: `${activeHotspot.rect.h}%`
                                        }}
                                    />
                                )}
                            </div>
                        </TransformComponent>
                    </TransformWrapper>

                    <div className="h-16 border-t border-white/5 bg-[#111827]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0">
                        <div className="flex items-center gap-3 md:gap-6">
                            <MousePointer2 size={16} className="text-blue-500 shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Drag to map // Click to edit</span>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full" />
                                <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">{articles.length} Nodes</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{articles.filter(a => a.verified).length} Verified</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Article List Shelf (Right Side when no active hotspot) */}
                <aside className={`border-l border-white/5 bg-[#0B0F19] transition-all duration-500 overflow-hidden ${activeHotspot ? 'w-0' : 'w-80'}`}>
                    <div className="h-full flex flex-col p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Page Inventory</h3>
                            <Layers size={14} className="text-gray-700" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {articles.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                                    <Sparkles size={24} className="text-gray-800 mb-3" />
                                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">No articles found</p>
                                </div>
                            ) : (
                                articles.map((art, idx) => (
                                    <button
                                        key={art.id}
                                        onClick={() => setActiveHotspot(art)}
                                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all text-left group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">NODE {idx + 1}</span>
                                            {art.verified && <CheckCircle size={10} className="text-green-500" />}
                                        </div>
                                        <p className="text-xs font-bold text-gray-300 line-clamp-2 leading-tight group-hover:text-white">{art.headline || 'Untitled Node'}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Side Editor / Bottom Sheet on Mobile */}
                <aside className={`
                    ${isMobile
                        ? `fixed inset-x-0 bottom-0 z-[60] bg-[#111827] border-t border-white/10 rounded-t-[2rem] shadow-2xl transition-all duration-500 ${activeHotspot ? 'h-[85vh]' : 'h-0 pointer-events-none overflow-hidden'}`
                        : `relative border-l border-white/5 bg-[#111827] transition-all duration-500 overflow-hidden ${!activeHotspot ? 'w-0' : 'w-[500px]'}`}
                `}>
                    {activeHotspot && (
                        <div className="h-full flex flex-col">
                            {isMobile && (
                                <div className="h-1.5 w-12 bg-white/20 rounded-full mx-auto my-4 shrink-0" onClick={() => setActiveHotspot(null)} />
                            )}
                            <div className={`p-4 md:p-8 border-b border-white/5 flex items-center justify-between bg-black/20 ${isMobile ? 'rounded-t-[2rem]' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg hidden md:block"><Layers size={18} /></div>
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Metadata Engine</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isMobile && <button onClick={() => setActiveHotspot(null)} className="p-2.5 bg-white/5 rounded-xl text-gray-400"><X size={18} /></button>}
                                    <button onClick={handleCommitArticle} className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Commit Node</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-10 custom-scrollbar pb-20">
                                <div className="space-y-4">
                                    <label className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Precision Headline</label>
                                    <textarea
                                        value={activeHotspot.headline}
                                        onChange={(e) => setActiveHotspot({ ...activeHotspot, headline: e.target.value })}
                                        className="w-full h-20 md:h-28 px-4 md:px-5 py-3 md:py-4 bg-[#0B0F19] border border-white/5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                        placeholder="Article Headline..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest">Core Body</label>
                                        <button onClick={runOCR} disabled={ocrLoading} className="text-blue-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-white flex items-center gap-2">
                                            {ocrLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            {ocrLoading ? 'Scanning...' : 'Run OCR'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={activeHotspot.content}
                                        onChange={(e) => setActiveHotspot({ ...activeHotspot, content: e.target.value })}
                                        className="w-full h-48 md:h-80 px-4 md:px-5 py-3 md:py-4 bg-[#0B0F19] border border-white/5 rounded-2xl md:rounded-[2rem] text-xs md:text-sm text-gray-400 leading-relaxed font-bold focus:border-blue-500 outline-none transition-all"
                                        placeholder="Captured text..."
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className={activeHotspot.verified ? 'text-green-500' : 'text-gray-600'} />
                                        <div>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white">Verified</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveHotspot(prev => ({ ...prev, verified: !prev.verified }))}
                                        className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-all ${activeHotspot.verified ? 'bg-green-600' : 'bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${activeHotspot.verified ? 'left-5 md:left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <button onClick={() => setActiveHotspot(null)} className="w-full py-2 text-gray-600 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-all">Cancel</button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default EditionEditor;
