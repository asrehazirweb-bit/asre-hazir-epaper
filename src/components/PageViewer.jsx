import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Maximize, MousePointer2, Newspaper, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const PageViewer = ({ page, onArticleClick }) => {
    const transformComponentRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [scale, setScale] = useState(1);

    // If no page is provided, show a placeholder
    if (!page) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0B0F19]">
                <div className="text-center animate-pulse">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                        <Newspaper size={40} className="text-gray-700" />
                    </div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em]">
                        Select Edition Page
                    </p>
                </div>
            </div>
        );
    }

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleHotspotClick = (article) => {
        if (onArticleClick) {
            onArticleClick(article);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0B0F19] overflow-hidden select-none">
            {/* Professional Page Info Bar */}
            <div className="px-8 py-4 glass-panel border-b border-white/5 flex-shrink-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="px-4 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Page {page.pageNumber}
                    </div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-[0.2em] italic">
                        {page.title || `Industrial Feed`}
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Precision Rendering</span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Canvas */}
            <div className="flex-1 relative bg-[#020617] overflow-hidden">
                <TransformWrapper
                    ref={transformComponentRef}
                    initialScale={1}
                    minScale={1}
                    maxScale={8}
                    centerOnInit={true}
                    limitToBounds={true}
                    doubleClick={{ disabled: true }}
                    wheel={{ step: 0.1 }}
                    onTransformed={(p) => setScale(p.state.scale)}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Controls Overlay */}
                            <div className="absolute bottom-10 right-10 z-30 flex flex-col gap-3">
                                <button onClick={() => zoomIn()} className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-2xl">
                                    <ZoomIn size={20} />
                                </button>
                                <button onClick={() => zoomOut()} className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-2xl">
                                    <ZoomOut size={20} />
                                </button>
                                <button onClick={() => resetTransform()} className="w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-2xl">
                                    <RefreshCw size={20} />
                                </button>
                            </div>

                            <TransformComponent
                                wrapperClassName="!w-full !h-full"
                                contentClassName="!w-full !h-full flex items-center justify-center"
                            >
                                <div className="relative group shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white">
                                    <img
                                        src={page.imageUrl}
                                        alt="Newspaper Page"
                                        onLoad={handleImageLoad}
                                        className={`max-w-none transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        style={{
                                            height: '85vh', // High production fit
                                            width: 'auto',
                                            pointerEvents: 'none'
                                        }}
                                        crossOrigin="anonymous"
                                    />

                                    {/* 🎯 AREA MAPPING LAYER (HOTSPOTS) 🎯 */}
                                    {imageLoaded && page.articles && page.articles.map((art) => (
                                        <div
                                            key={art.id}
                                            className={`absolute border border-transparent hover:border-blue-500/50 hover:bg-blue-500/10 cursor-pointer transition-all z-20 group/hotspot ${art.verified ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                            title={art.headline}
                                            style={{
                                                left: `${art.rect.x}%`,
                                                top: `${art.rect.y}%`,
                                                width: `${art.rect.w}%`,
                                                height: `${art.rect.h}%`
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleHotspotClick(art);
                                            }}
                                        >
                                            {/* Minimalist selection indicator */}
                                            <div className="absolute inset-0 opacity-0 group-hover/hotspot:opacity-100 flex items-center justify-center">
                                                <div className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-2xl">
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

                {/* Industrial Status Indicator */}
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0B0F19]">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Syncing Resolution...</p>
                        </div>
                    </div>
                )}

                {/* Guide Overlay */}
                {imageLoaded && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:block">
                        <div className="px-6 py-3 glass-panel border border-white/5 rounded-2xl flex items-center gap-4 text-gray-400">
                            <MousePointer2 size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to Zoom • Pan when Enlarged</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageViewer;
