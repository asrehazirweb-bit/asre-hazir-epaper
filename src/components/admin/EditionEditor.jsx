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
import { getPagesByEdition, getArticlesByPage, saveArticle, saveEdition, deleteArticle } from '../../services/epaperService';
import ConfirmModal from '../ConfirmModal';

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
    const [confirmDelete, setConfirmDelete] = useState(false);

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
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
            <ScanLine className="w-12 h-12 text-[#AA792D] animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Initializing Mapping Engine...</p>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-white text-[#2B2523] overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0 z-40 shadow-sm">
                <div className="flex items-center gap-3 md:gap-6">
                    <button onClick={() => navigate('/admin/editions')} className="p-2 md:p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-[#AA792D]">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xs md:text-sm font-black uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">
                                Linking Edition: <span className="text-[#AA792D]">{edition?.name}</span>
                            </h1>
                            <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${edition?.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                {edition?.status}
                            </div>
                        </div>
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Spatial Hotspot Mapping Active</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={toggleEditionStatus}
                        className={`hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${edition?.status === 'published' ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100' : 'bg-[#AA792D] text-white shadow-lg shadow-[#AA792D]/20 hover:bg-[#8B6123]'}`}
                    >
                        {edition?.status === 'published' ? 'Unpublish Edition' : 'Publish Edition'}
                    </button>
                    <div className="h-8 w-px bg-gray-100 mx-1 md:mx-2 hidden xs:block" />
                    <button
                        onClick={handleCommitArticle}
                        disabled={!activeHotspot || saving}
                        className="flex items-center gap-2 px-4 md:px-8 py-2 md:py-3 bg-[#AA792D] hover:bg-[#8B6123] disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#AA792D]/10"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                        <span className="hidden xs:inline">Save Mapping</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails Strip */}
                {showThumbnails && (
                    <aside className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col shrink-0">
                        <div className="p-6 border-b border-gray-100 bg-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2B2523]">Map Pages</h3>
                            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">{pages.length} Pages Scanned</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {pages.map((p, idx) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPageIdx(idx)}
                                    className={`w-full group rounded-xl overflow-hidden border-2 transition-all ${selectedPageIdx === idx ? 'border-[#AA792D] shadow-lg' : 'border-white hover:border-gray-200'}`}
                                >
                                    <div className="aspect-[1/1.4] bg-white relative">
                                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedPageIdx === idx ? 'bg-[#AA792D] text-white' : 'bg-white/90 text-gray-400 border border-gray-100'}`}>
                                            {p.pageNumber || idx + 1}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>
                )}

                {/* Main Mapping Canvas */}
                <main className="flex-1 relative bg-gray-100 overflow-hidden flex flex-col">
                    {/* View Controls */}
                    <div className="absolute top-6 left-6 z-20 flex gap-2">
                        <button
                            onClick={() => setShowThumbnails(!showThumbnails)}
                            className={`p-3 rounded-2xl border transition-all ${showThumbnails ? 'bg-[#AA792D] text-white border-[#AA792D]' : 'bg-white text-gray-400 border-gray-100 shadow-sm'}`}
                        >
                            <Layout size={18} />
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <TransformWrapper
                            initialScale={0.8}
                            minScale={0.1}
                            maxScale={5}
                            centerOnInit={true}
                            wheel={{ disabled: false }}
                            panning={{ disabled: isDrawing }}
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
                                        <button onClick={() => zoomIn()} className="p-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-100 shadow-xl"><ZoomIn size={18} /></button>
                                        <button onClick={() => zoomOut()} className="p-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-100 shadow-xl"><ZoomOut size={18} /></button>
                                        <button onClick={() => resetTransform()} className="p-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-100 shadow-xl"><RefreshCw size={18} /></button>
                                    </div>

                                    <TransformComponent wrapperClassName="!w-full !h-full" contentClassName="flex items-center justify-center min-h-full min-w-full">
                                        <div
                                            ref={containerRef}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            className="relative bg-white shadow-2xl cursor-crosshair group select-none"
                                            style={{ width: '800px', height: '1100px' }}
                                        >
                                            {currentPage && (
                                                <img
                                                    ref={imageRef}
                                                    src={currentPage.imageUrl}
                                                    alt=""
                                                    className="w-full h-full object-contain pointer-events-none"
                                                    onLoad={(e) => {
                                                        const img = e.target;
                                                        // Adjust container to match aspect ratio
                                                        const ratio = img.naturalHeight / img.naturalWidth;
                                                        const parent = img.parentElement;
                                                        parent.style.height = `${parent.offsetWidth * ratio}px`;
                                                    }}
                                                />
                                            )}

                                            {/* Existing Article Hotspots */}
                                            {articles.map((art) => (
                                                <div
                                                    key={art.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveHotspot(art);
                                                    }}
                                                    className={`absolute border-2 transition-all cursor-pointer ${activeHotspot?.id === art.id ? 'border-[#AA792D] bg-[#AA792D]/20 z-10' : 'border-[#AA792D]/40 bg-[#AA792D]/5 hover:bg-[#AA792D]/10'}`}
                                                    style={{
                                                        left: `${art.rect.x}%`,
                                                        top: `${art.rect.y}%`,
                                                        width: `${art.rect.w}%`,
                                                        height: `${art.rect.h}%`
                                                    }}
                                                >
                                                    <div className="absolute top-0 left-0 bg-[#AA792D] text-white text-[6px] font-black px-1 uppercase tracking-tighter">
                                                        {art.headline?.slice(0, 20) || 'ARTICLE'}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Active/Drawing Hotspot */}
                                            {activeHotspot && !activeHotspot.id && (
                                                <div
                                                    className="absolute border-2 border-dashed border-[#AA792D] bg-[#AA792D]/10 pointer-events-none"
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
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </main>

                {/* Editor Panel */}
                {activeHotspot && (
                    <aside className="fixed inset-y-0 right-0 w-full sm:w-[400px] md:w-[500px] bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <ScanLine className="text-[#AA792D]" size={20} />
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#2B2523]">Intelligence Mapper</h3>
                            </div>
                            <button onClick={() => setActiveHotspot(null)} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#AA792D]">Headline Capture</label>
                                    <button
                                        onClick={runOCR}
                                        disabled={ocrLoading}
                                        className="flex items-center gap-2 text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50"
                                    >
                                        <Sparkles size={12} className={ocrLoading ? 'animate-spin' : ''} />
                                        {ocrLoading ? 'Decrypting...' : 'AI Pulse Extract'}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={activeHotspot.headline}
                                    onChange={(e) => setActiveHotspot(prev => ({ ...prev, headline: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold text-[#2B2523] outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all placeholder:text-gray-300"
                                    placeholder="Enter Article Identity..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#AA792D]">Content Transcript</label>
                                <textarea
                                    value={activeHotspot.content}
                                    onChange={(e) => setActiveHotspot(prev => ({ ...prev, content: e.target.value }))}
                                    className="w-full h-96 bg-gray-50 border border-gray-100 rounded-3xl px-6 py-6 text-sm leading-relaxed font-medium text-gray-600 outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all custom-scrollbar resize-none placeholder:text-gray-300"
                                    placeholder="Transcript signals appearing here..."
                                />
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                            <button
                                onClick={() => {
                                    if (activeHotspot.id) {
                                        setConfirmDelete(true);
                                    } else {
                                        setActiveHotspot(null);
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                            >
                                <Trash2 size={14} /> Purge
                            </button>
                            <button
                                onClick={handleCommitArticle}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-3 bg-[#AA792D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8B6123] transition-all shadow-lg shadow-[#AA792D]/20"
                            >
                                <CheckCircle size={14} /> Commit Segment
                            </button>
                        </div>
                    </aside>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={async () => {
                    try {
                        await deleteArticle(activeHotspot.id);
                        setArticles(prev => prev.filter(a => a.id !== activeHotspot.id));
                        setActiveHotspot(null);
                    } catch (err) {
                        console.error("Delete failed:", err);
                    }
                }}
                title="Purge Mapping Request"
                message="Are you sure you want to permanently delete this article coordinate mapping? This cannot be undone."
                confirmText="Confirm Purge"
                type="danger"
            />
        </div>
    );
};

export default EditionEditor;
