import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import {
    ChevronLeft, Save, Sparkles, Trash2, Eye, Layout,
    Type, CheckCircle2, AlertTriangle, MousePointer2,
    Maximize, ZoomIn, ZoomOut, RefreshCw, Layers
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { performOCR } from '../../utils/ocrService';

const EditionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [edition, setEdition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPageIdx, setSelectedPageIdx] = useState(0);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [saving, setSaving] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'editions', id), (snapshot) => {
            if (snapshot.exists()) {
                setEdition({ id: snapshot.id, ...snapshot.data() });
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    const currentPage = edition?.pages?.[selectedPageIdx];

    const handleMouseDown = (e) => {
        if (!containerRef.current || activeHotspot) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setStartPos({ x, y });
        setIsDrawing(true);
        setActiveHotspot({
            id: 'temp-' + Date.now(),
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
            if (activeHotspot.rect.w < 1 || activeHotspot.rect.h < 1) {
                setActiveHotspot(null);
            }
        }
    };

    const saveHotspot = () => {
        if (!activeHotspot) return;

        const updatedPages = [...edition.pages];
        const page = { ...updatedPages[selectedPageIdx] };
        page.articles = page.articles || [];

        const existingIdx = page.articles.findIndex(a => a.id === activeHotspot.id);
        if (existingIdx >= 0) {
            page.articles[existingIdx] = activeHotspot;
        } else {
            page.articles.push({ ...activeHotspot, id: 'art-' + Date.now() });
        }

        updatedPages[selectedPageIdx] = page;
        handleUpdateEdition({ pages: updatedPages });
        setActiveHotspot(null);
    };

    const deleteHotspot = (artId) => {
        const updatedPages = [...edition.pages];
        const page = { ...updatedPages[selectedPageIdx] };
        page.articles = page.articles.filter(a => a.id !== artId);
        updatedPages[selectedPageIdx] = page;
        handleUpdateEdition({ pages: updatedPages });
        setActiveHotspot(null);
    };

    const handleUpdateEdition = async (data) => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'editions', id), data);
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const runOCR = async () => {
        if (!activeHotspot || ocrLoading) return;
        setOcrLoading(true);
        try {
            // In a real app, we'd crop the image first.
            // For now, we'll run OCR on the whole page or simulate it
            const result = await performOCR(currentPage.imageUrl);
            setActiveHotspot(prev => ({
                ...prev,
                headline: result.headline || prev.headline,
                content: result.bodyText || prev.content
            }));
        } catch (err) {
            console.error("OCR Error:", err);
        } finally {
            setOcrLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse italic">Initializing Editor Engine...</div>;

    return (
        <div className="h-full flex flex-col bg-[#0B0F19] text-white">
            {/* Control Bar */}
            <div className="h-16 glass-panel border-b border-white/5 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/admin/editions')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest italic">{edition.name} <span className="text-blue-500 mx-2">//</span> Page {selectedPageIdx + 1}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Mapping Session</span>
                    </div>
                    {saving && <div className="text-[10px] font-bold text-gray-500 uppercase animate-pulse">Syncing...</div>}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Page List */}
                <div className="w-64 border-r border-white/5 bg-[#111827]/50 overflow-y-auto p-4 space-y-4">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2">Edition Sheets</p>
                    {edition.pages.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setSelectedPageIdx(idx); setActiveHotspot(null); }}
                            className={`w-full group relative aspect-[1/1.4] rounded-xl overflow-hidden border-2 transition-all ${selectedPageIdx === idx ? 'border-blue-600 shadow-lg shadow-blue-500/20' : 'border-white/5 hover:border-white/20'}`}
                        >
                            <img src={p.imageUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-black/60 px-3 py-1 rounded text-[10px] font-black uppercase">{idx + 1}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Center Panel: Mapping Canvas */}
                <div className="flex-1 relative overflow-hidden bg-black">
                    <TransformWrapper centerOnInit minScale={1} limitToBounds={false}>
                        <TransformComponent wrapperClassName="!w-full !h-full">
                            <div
                                ref={containerRef}
                                className="relative bg-white cursor-crosshair"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            >
                                <img
                                    ref={imageRef}
                                    src={currentPage?.imageUrl}
                                    className="max-h-[85vh] w-auto pointer-events-none select-none"
                                    crossOrigin="anonymous"
                                />

                                {/* Existing Hotspots */}
                                {currentPage?.articles?.map((art) => (
                                    <div
                                        key={art.id}
                                        onClick={(e) => { e.stopPropagation(); setActiveHotspot(art); }}
                                        className={`absolute border-2 transition-all ${activeHotspot?.id === art.id ? 'border-blue-500 bg-blue-500/20 z-30' : 'border-green-500/50 bg-green-500/5 z-10 hover:border-green-500'}`}
                                        style={{
                                            left: `${art.rect.x}%`,
                                            top: `${art.rect.y}%`,
                                            width: `${art.rect.w}%`,
                                            height: `${art.rect.h}%`
                                        }}
                                    />
                                ))}

                                {/* Drawing Hotspot */}
                                {isDrawing && activeHotspot && (
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

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-6 py-3 glass-panel rounded-2xl flex items-center gap-4 text-gray-500">
                        <MousePointer2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Click and drag to map new article node</span>
                    </div>
                </div>

                {/* Right Panel: Article Editor */}
                <div className="w-[450px] border-l border-white/5 bg-[#111827] overflow-y-auto p-10 flex flex-col gap-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-xl"><Layers size={20} /></div>
                            <h3 className="text-lg font-bold tracking-tight uppercase italic">Meta Logic</h3>
                        </div>
                        {activeHotspot && (
                            <button onClick={saveHotspot} className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                Commit Unit
                            </button>
                        )}
                    </div>

                    {activeHotspot ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Article Headline</label>
                                <textarea
                                    value={activeHotspot.headline}
                                    onChange={(e) => setActiveHotspot({ ...activeHotspot, headline: e.target.value })}
                                    placeholder="Enter precision headline..."
                                    className="w-full h-24 px-5 py-4 bg-[#0B0F19] border border-white/5 rounded-2xl text-sm font-bold text-white transition-all outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Article Body</label>
                                    <button
                                        onClick={runOCR}
                                        disabled={ocrLoading}
                                        className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest disabled:opacity-50"
                                    >
                                        <Sparkles size={12} /> {ocrLoading ? 'Scanning...' : 'Assisted OCR'}
                                    </button>
                                </div>
                                <textarea
                                    value={activeHotspot.content}
                                    onChange={(e) => setActiveHotspot({ ...activeHotspot, content: e.target.value })}
                                    placeholder="Source text engine input..."
                                    className="w-full h-[300px] px-5 py-4 bg-[#0B0F19] border border-white/5 rounded-[2rem] text-sm text-gray-300 transition-all outline-none focus:border-blue-500 leading-relaxed font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[2rem]">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={18} className={activeHotspot.verified ? 'text-green-500' : 'text-gray-600'} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Verification Status</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 italic">Force-verify before publishing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveHotspot({ ...activeHotspot, verified: !activeHotspot.verified })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${activeHotspot.verified ? 'bg-green-600' : 'bg-gray-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${activeHotspot.verified ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => deleteHotspot(activeHotspot.id)}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <Trash2 size={16} /> Decommission Node
                                </button>
                                <button onClick={() => setActiveHotspot(null)} className="p-4 bg-white/5 text-gray-500 hover:text-white rounded-2xl">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale group">
                            <div className="w-20 h-20 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                                <Layout size={40} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest mb-4">No Active Selection</h4>
                            <p className="text-[10px] font-bold leading-relaxed italic">Map a region on the canvas to initialize<br />article meta-data configuration.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditionEditor;
