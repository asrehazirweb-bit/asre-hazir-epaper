import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
    Maximize2, Download, AlertTriangle, Loader2,
    FileText, RefreshCw
} from 'lucide-react';

// Using PDF.js from CDN for absolute stability in this environment
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PdfViewer = ({ fileUrl, title, onBack }) => {
    const [pdf, setPdf] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const renderTaskRef = useRef(null);

    // Initialize PDF.js
    useEffect(() => {
        const loadPdf = async () => {
            try {
                setLoading(true);
                setError(null);

                // Dynamically load PDF.js script if not present
                if (!window.pdfjsLib) {
                    const script = document.createElement('script');
                    script.src = PDFJS_CDN;
                    script.onload = () => initPdf();
                    document.head.appendChild(script);
                } else {
                    initPdf();
                }
            } catch (err) {
                console.error("PDF Init Error:", err);
                setError("Failed to initialize PDF engine.");
                setLoading(false);
            }
        };

        const initPdf = async () => {
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;

            try {
                const loadingTask = pdfjsLib.getDocument({
                    url: fileUrl,
                    withCredentials: false // Firebase URLs usually don't need credentials if they are public/tokenized
                });

                const pdfDoc = await loadingTask.promise;
                setPdf(pdfDoc);
                setNumPages(pdfDoc.numPages);
                setLoading(false);
            } catch (err) {
                console.error("PDF Load Error:", err);
                if (err.name === 'UnknownErrorException' || err.message.includes('fetch')) {
                    setError("CORS_ERROR");
                } else {
                    setError("Could not load document: " + err.message);
                }
                setLoading(false);
            }
        };

        loadPdf();
    }, [fileUrl]);

    // Render Page to Canvas
    const renderPage = useCallback(async (pageNum, currentScale) => {
        if (!pdf || !canvasRef.current) return;

        // Cancel previous render task if any
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentScale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions based on scale
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
        } catch (err) {
            if (err.name !== 'RenderingCancelledException') {
                console.error("Page Render Error:", err);
            }
        }
    }, [pdf]);

    useEffect(() => {
        if (pdf) {
            renderPage(currentPage, scale);
        }
    }, [pdf, currentPage, scale, renderPage]);

    // Controls
    const changePage = (offset) => {
        const next = currentPage + offset;
        if (next >= 1 && next <= numPages) {
            setCurrentPage(next);
            containerRef.current?.scrollTo(0, 0);
        }
    };

    const handleZoom = (delta) => {
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3.0));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error("Fullscreen error:", err);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleDownload = () => {
        window.open(fileUrl, '_blank');
    };

    // Premium Error States
    if (error === "CORS_ERROR") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-10 text-center">
                <div className="max-w-md space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl border border-amber-100">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
                        <AlertTriangle size={40} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#2B2523]">Security Protocol Blocked</h2>
                        <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
                            Firebase Storage is blocking direct PDF access due to missing CORS headers.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-2xl text-left font-mono text-[9px] text-[#AA792D] break-all border border-gray-100 italic">
                            gsutil cors set cors.json gs://asrehazir-epaper.appspot.com
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="w-full py-4 bg-[#2B2523] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#AA792D] transition-all shadow-xl"
                    >
                        Download & Read Offline
                    </button>
                    <p className="text-[8px] font-bold text-gray-300 uppercase">Contact Admin to enable Infrastructure Access</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#F0F2F5] relative overflow-hidden h-full">
            {/* Professional Command Hub */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shadow-sm shrink-0">
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#AA792D] shadow-[0_0_10px_rgba(170,121,45,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2B2523]">High Fidelity Reader</span>
                    </div>
                    <div className="h-6 w-px bg-gray-100" />
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-xl">
                        <button onClick={() => changePage(-1)} disabled={currentPage <= 1} className="p-1 hover:text-[#AA792D] disabled:opacity-30">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[10px] font-black text-[#2B2523] min-w-[60px] text-center uppercase tracking-widest">
                            {currentPage} / {numPages}
                        </span>
                        <button onClick={() => changePage(1)} disabled={currentPage >= numPages} className="p-1 hover:text-[#AA792D] disabled:opacity-30">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                        <button onClick={() => handleZoom(-0.25)} className="p-2 hover:bg-white rounded-lg hover:text-[#AA792D] transition-all">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-[9px] font-black px-2 text-[#2B2523]">{Math.round(scale * 100)}%</span>
                        <button onClick={() => handleZoom(0.25)} className="p-2 hover:bg-white rounded-lg hover:text-[#AA792D] transition-all">
                            <ZoomIn size={16} />
                        </button>
                    </div>
                    <div className="h-6 w-px bg-gray-100 mx-2" />
                    <button onClick={toggleFullscreen} className="p-2.5 bg-gray-50 hover:bg-[#2B2523] hover:text-white rounded-xl text-gray-500 transition-all border border-gray-100">
                        <Maximize2 size={16} />
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-[#AA792D] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 shadow-xl transition-all">
                        <Download size={14} /> PDF
                    </button>
                </div>
            </header>

            {/* Reading Stage */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto custom-scrollbar p-6 lg:p-12 flex justify-center bg-[#E4E7EB] relative"
            >
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#F0F2F5]/80 backdrop-blur-sm">
                        <div className="text-center space-y-6">
                            <Loader2 className="w-12 h-12 text-[#AA792D] animate-spin mx-auto" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2B2523]">Allocating Frame Buffer</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Rendering Digital Archive...</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] bg-white rounded-sm overflow-hidden">
                    <canvas ref={canvasRef} className="max-w-full h-auto" />
                </div>
            </div>

            {/* Footer Status */}
            <footer className="h-8 bg-white border-t border-gray-100 flex items-center justify-center shrink-0">
                <span className="text-[7px] font-black text-gray-300 uppercase tracking-[0.6em]">Secure Industrial Signal • Powered by Mozilla PDF.js</span>
            </footer>
        </div>
    );
};

export default PdfViewer;
