import React, { useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Home, MousePointer2 } from 'lucide-react';
import { generateArticleCrop, isImageReady } from '../utils/imageCropper';

const PageViewer = ({ page, onPageClick }) => {
    const imageRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (!page) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Select a page to view
                    </p>
                </div>
            </div>
        );
    }

    const handleImageClick = async (e) => {
        // CRITICAL: Stop event propagation to prevent zoom behavior
        e.stopPropagation();
        e.preventDefault();

        // Prevent click during processing or if image not ready
        if (processing || !imageRef.current || !onPageClick) return;

        if (!isImageReady(imageRef.current)) {
            console.warn('⚠️ Image not fully loaded yet');
            return;
        }

        setProcessing(true);

        try {
            // Get click coordinates relative to the image element
            const rect = imageRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            console.log('🎯 Processing click at:', { clickX, clickY });

            // Generate cropped image using canvas
            const cropData = await generateArticleCrop(imageRef.current, clickX, clickY);

            console.log('✅ Crop data ready:', cropData);

            // Pass crop data to parent component
            onPageClick(cropData);

        } catch (error) {
            console.error('❌ Error processing click:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleImageLoad = () => {
        console.log('📄 Page image loaded:', page.pageNumber);
        setImageLoaded(true);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Page Info Bar */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            {page.title || `Page ${page.pageNumber}`}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {page.editionDate && new Date(page.editionDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                            Page {page.pageNumber}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded capitalize">
                            {page.language}
                        </span>
                    </div>
                </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                <TransformWrapper
                    initialScale={1}
                    minScale={0.3}
                    maxScale={5}
                    centerOnInit={true}
                    limitToBounds={false}
                    doubleClick={{ disabled: true }}
                    panning={{ disabled: false }}
                    wheel={{ step: 0.1, smoothStep: 0.01 }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Zoom Controls */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                <button
                                    onClick={() => zoomIn()}
                                    className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={18} className="text-gray-700 dark:text-gray-300" />
                                </button>
                                <button
                                    onClick={() => zoomOut()}
                                    className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={18} className="text-gray-700 dark:text-gray-300" />
                                </button>
                                <button
                                    onClick={() => resetTransform()}
                                    className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
                                    title="Reset View"
                                >
                                    <RotateCcw size={18} className="text-gray-700 dark:text-gray-300" />
                                </button>
                                <button
                                    className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
                                    title="Fullscreen"
                                >
                                    <Maximize size={18} className="text-gray-700 dark:text-gray-300" />
                                </button>
                            </div>

                            {/* Loading Indicator */}
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading page...</p>
                                    </div>
                                </div>
                            )}

                            {/* Processing Indicator */}
                            {processing && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                                    <div className="bg-black/80 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm font-medium">Generating preview...</span>
                                    </div>
                                </div>
                            )}

                            {/* Page Image */}
                            <TransformComponent
                                wrapperStyle={{ width: '100%', height: '100%' }}
                                contentStyle={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: imageLoaded ? 'crosshair' : 'default'
                                }}
                            >
                                <img
                                    ref={imageRef}
                                    src={page.imageUrl}
                                    alt={`Page ${page.pageNumber}`}
                                    title="Click to preview article"
                                    onClick={handleImageClick}
                                    onLoad={handleImageLoad}
                                    className="max-w-full max-h-full shadow-2xl select-none"
                                    style={{
                                        maxHeight: '90vh',
                                        objectFit: 'contain',
                                        cursor: imageLoaded ? 'crosshair' : 'wait'
                                    }}
                                    crossOrigin="anonymous"
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>

                {/* Click Hint */}
                {imageLoaded && !processing && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-full shadow-xl backdrop-blur-sm animate-pulse flex items-center gap-2">
                        <MousePointer2 size={16} />
                        Click to preview article • Use buttons or scroll to zoom
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageViewer;
