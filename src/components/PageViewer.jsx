import React, { useRef, useState, useEffect, memo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Newspaper, ZoomIn, ZoomOut, RefreshCw, Crosshair } from 'lucide-react';

const PageViewer = memo(({ page, onArticleClick, onCoordinateClick }) => {
    const transformComponentRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const containerRef = useRef(null);
    const lastImageUrlRef = useRef(null);

    // Track image changes without resetting state abruptly
    useEffect(() => {
        if (page?.imageUrl && page.imageUrl !== lastImageUrlRef.current) {
            setImageLoaded(false);
            lastImageUrlRef.current = page.imageUrl;
        }
    }, [page?.imageUrl]);

    // If no page is provided, show a stable placeholder
    if (!page || !page.imageUrl) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0B0F19]">
                <div className="text-center animate-pulse">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                        <Newspaper size={40} className="text-gray-700" />
                    </div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em]">Resolving Broadcast Feed...</p>
                </div>
            </div>
        );
    }

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleContainerClick = (e) => {
        if (!containerRef.current || !onCoordinateClick) return;

        // Ensure we only trigger if it's a clean click (not a drag/pan)
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        onCoordinateClick({ x, y, pageUrl: page.imageUrl });
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#0B0F19] overflow-hidden select-none">
            {/* Info Bar */}
            <div className="px-8 py-4 glass-panel border-b border-white/5 flex-shrink-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="px-4 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Sheet {page.pageNumber || 'Alpha'}
                    </div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-[0.2em] italic truncate max-w-xs">
                        {page.title || `Standard Edition`}
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                        <Crosshair size={14} className="text-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Mapping Active</span>
                    </div>
                </div>
            </div>

            {/* PERSISTENT CANVAS CONTAINER */}
            <div className="flex-1 relative bg-[#020617] overflow-y-auto custom-scrollbar flex justify-center">
                <TransformWrapper
                    ref={transformComponentRef}
                    initialScale={1}
                    minScale={1}
                    maxScale={8}
                    centerOnInit={true}
                    limitToBounds={false}
                    disabled={false}
                    doubleClick={{ disabled: true }}
                    panning={{ activationKeys: ["Space"], disabled: false }}
                    wheel={{ disabled: true }} // EXPLICIT: Mouse wheel scrolls the container, NOT the image
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Persistent Controls */}
                            <div className="absolute bottom-10 right-10 z-30 flex flex-col gap-3">
                                <button onClick={() => zoomIn()} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all shadow-2xl group">
                                    <ZoomIn size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => zoomOut()} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all shadow-2xl group">
                                    <ZoomOut size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={() => resetTransform()} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all shadow-2xl group">
                                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            </div>

                            <TransformComponent
                                wrapperClassName="!w-full !min-h-full"
                                contentClassName="flex items-start justify-center py-10"
                            >
                                <div
                                    ref={containerRef}
                                    onClick={handleContainerClick}
                                    className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-white cursor-crosshair group"
                                >
                                    <img
                                        src={page.imageUrl}
                                        alt="Main Newspaper Sheet"
                                        onLoad={handleImageLoad}
                                        onError={() => setImageLoaded(true)}
                                        className={`max-w-none transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        style={{
                                            width: 'auto',
                                            height: '160vh',
                                            pointerEvents: 'none'
                                        }}
                                    />

                                    {/* HOTSPOTS LAYER */}
                                    {imageLoaded && page.articles && page.articles.map((art) => (
                                        <div
                                            key={art.id}
                                            className={`absolute border-2 border-transparent hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer transition-all z-20 group/hotspot ${art.verified ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                            title={art.headline}
                                            style={{
                                                left: `${art.rect.x}%`,
                                                top: `${art.rect.y}%`,
                                                width: `${art.rect.w}%`,
                                                height: `${art.rect.h}%`
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onArticleClick(art);
                                            }}
                                        >
                                            <div className="absolute inset-x-0 -bottom-8 opacity-0 group-hover/hotspot:opacity-100 flex justify-center transition-opacity">
                                                <div className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-2xl border border-blue-400/50">
                                                    Read Article
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>

                {/* Micro-Loader (Only for image level, not blocking feed) */}
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Optimizing Clarity...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Aggressive re-render prevention
    return (
        prevProps.page?.id === nextProps.page?.id &&
        prevProps.page?.imageUrl === nextProps.page?.imageUrl &&
        prevProps.page?.articles?.length === nextProps.page?.articles?.length
    );
});

export default PageViewer;
