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
            <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center animate-pulse">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                        <Newspaper size={40} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">Resolving Broadcast Feed...</p>
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
        <div className="h-full w-full flex flex-col bg-white overflow-hidden select-none">
            {/* Info Bar */}
            <div className="px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex-shrink-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="px-4 py-1 bg-[#AA792D] text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-[#AA792D]/20">
                        Sheet {page.pageNumber || 'Alpha'}
                    </div>
                    <h3 className="font-bold text-[#2B2523] text-xs uppercase tracking-[0.2em] italic truncate max-w-xs">
                        {page.title || `Standard Edition`}
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Crosshair size={14} className="text-[#AA792D] animate-pulse" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Mapping Active</span>
                    </div>
                </div>
            </div>

            {/* PERSISTENT CANVAS CONTAINER */}
            <div className="flex-1 relative bg-[#F3F4F6] overflow-y-auto custom-scrollbar flex justify-center">
                <TransformWrapper
                    ref={transformComponentRef}
                    initialScale={1}
                    minScale={1}
                    maxScale={8}
                    centerOnInit={true}
                    limitToBounds={false}
                    disabled={false}
                    doubleClick={{ disabled: true }}
                    panning={{
                        activationKeys: ["Space"],
                        disabled: false,
                        velocityDisabled: true
                    }}
                    pinch={{ disabled: false }}
                    wheel={{ disabled: true }} // EXPLICIT: Wheel scrolls the page, NOT the image
                    alignmentAnimation={{ disabled: true }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Persistent Controls */}
                            <div className="absolute bottom-10 right-10 z-30 flex flex-col gap-3">
                                <button onClick={() => zoomIn()} className="w-12 h-12 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-[#2B2523] transition-all shadow-xl group">
                                    <ZoomIn size={20} className="group-hover:scale-110 transition-transform group-hover:text-[#AA792D]" />
                                </button>
                                <button onClick={() => zoomOut()} className="w-12 h-12 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-[#2B2523] transition-all shadow-xl group">
                                    <ZoomOut size={20} className="group-hover:scale-110 transition-transform group-hover:text-[#AA792D]" />
                                </button>
                                <button onClick={() => resetTransform()} className="w-12 h-12 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-[#2B2523] transition-all shadow-xl group">
                                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500 group-hover:text-[#AA792D]" />
                                </button>
                            </div>

                            <TransformComponent
                                wrapperClassName="!w-full !h-full"
                                contentClassName="flex items-center justify-center p-4 lg:p-10"
                            >
                                <div
                                    ref={containerRef}
                                    onClick={(e) => {
                                        // Standard click handler for the whole page
                                        handleContainerClick(e);
                                    }}
                                    className="relative shadow-[0_10px_50px_rgba(0,0,0,0.1)] bg-white cursor-pointer group"
                                >
                                    <img
                                        src={page.imageUrl}
                                        alt="Main Newspaper Sheet"
                                        onLoad={handleImageLoad}
                                        onError={() => setImageLoaded(true)}
                                        className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        style={{
                                            width: 'auto',
                                            height: 'auto',
                                            maxWidth: '90vw',
                                            maxHeight: '85vh',
                                            pointerEvents: 'none',
                                            display: 'block'
                                        }}
                                    />

                                    {/* HOTSPOTS LAYER */}
                                    {imageLoaded && page.articles && page.articles.map((art) => (
                                        <div
                                            key={art.id}
                                            className="absolute border border-[#AA792D]/20 bg-[#AA792D]/5 hover:border-[#AA792D] hover:bg-[#AA792D]/20 cursor-pointer transition-all duration-200 z-[100] group/hotspot"
                                            title={art.headline}
                                            style={{
                                                left: `${art.rect.x}%`,
                                                top: `${art.rect.y}%`,
                                                width: `${art.rect.w}%`,
                                                height: `${art.rect.h}%`
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("🔥 Article Clicked:", art.headline);
                                                onArticleClick(art);
                                            }}
                                        >
                                            <div className="absolute inset-0 group-hover/hotspot:bg-[#AA792D]/10 transition-colors duration-300" />

                                            {/* Open Article Label */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/hotspot:opacity-100 flex flex-col items-center transition-all duration-300 pointer-events-none">
                                                <div className="px-3 py-1 bg-[#AA792D] text-white text-[8px] font-black rounded-lg uppercase tracking-widest shadow-xl whitespace-nowrap border border-[#AA792D]/50">
                                                    Open Article
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>

                {/* Micro-Loader */}
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-2 border-[#AA792D]/10 border-t-[#AA792D] rounded-full animate-spin" />
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Optimizing Clarity...</p>
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
