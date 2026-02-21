import React, { useEffect, useState } from 'react';
import { X, ZoomIn, Maximize2, Info } from 'lucide-react';

const ArticleCropViewer = ({ cropData, onClose }) => {
    const [fadeIn, setFadeIn] = useState(false);

    // Trigger fade-in animation when crop data arrives
    useEffect(() => {
        if (cropData) {
            // Small delay for smooth transition
            setTimeout(() => setFadeIn(true), 50);
        } else {
            setFadeIn(false);
        }
    }, [cropData]);

    if (!cropData) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <ZoomIn size={36} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Article Preview
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Click anywhere on the newspaper page to view a zoomed preview of that section
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg border border-blue-100 dark:border-blue-800">
                        <Info size={14} />
                        <span>Try clicking on an article headline</span>
                    </div>
                </div>
            </div>
        );
    }

    const { imageUrl, clickX, clickY, cropX, cropY, cropWidth, cropHeight, naturalWidth, naturalHeight } = cropData;

    return (
        <div
            className={`h-full flex flex-col bg-white dark:bg-gray-900 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            Article Preview
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Zoomed Section
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                    aria-label="Close preview"
                    title="Close preview"
                >
                    <X size={18} className="text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
            </div>

            {/* Cropped Image Display */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                    {/* Main Preview Image */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                            <img
                                src={imageUrl}
                                alt="Article crop preview"
                                className="w-full h-auto"
                                style={{
                                    imageRendering: 'crisp-edges',
                                    maxWidth: '100%'
                                }}
                            />
                        </div>
                    </div>

                    {/* Metadata Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Click Position */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">
                                Click Position
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">X:</span>
                                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{clickX}px</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">Y:</span>
                                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{clickY}px</span>
                                </div>
                            </div>
                        </div>

                        {/* Crop Area */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">
                                Crop Size
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">Width:</span>
                                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{cropWidth}px</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">Height:</span>
                                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{cropHeight}px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Details (Collapsible) */}
                    <details className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <summary className="px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold text-sm text-gray-700 dark:text-gray-300">
                            Technical Details
                        </summary>
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Crop Origin X:</span>
                                <span className="font-mono text-gray-900 dark:text-white">{cropX}px</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Crop Origin Y:</span>
                                <span className="font-mono text-gray-900 dark:text-white">{cropY}px</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Original Image Size:</span>
                                <span className="font-mono text-gray-900 dark:text-white">{naturalWidth} × {naturalHeight}px</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Method:</span>
                                <span className="text-gray-900 dark:text-white">Canvas Crop</span>
                            </div>
                        </div>
                    </details>

                    {/* Help Card */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex gap-3">
                            <Info size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                                    Coming Soon: OCR & Article Extraction
                                </p>
                                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                                    Future updates will include automatic text recognition, article metadata,
                                    headlines, and full-text search capabilities.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Hint */}
                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Click anywhere else on the page to preview another section
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCropViewer;
