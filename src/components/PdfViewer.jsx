import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Sub-component for individual lazy-loaded pages
const PageNode = ({ pdf, pageNum, scale = 1.2 }) => {
    const canvasRef = useRef(null);
    const [rendered, setRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
            }
        }, { threshold: 0.1, rootMargin: '500px' }); // Load ahead by 500px

        if (canvasRef.current) observerRef.current.observe(canvasRef.current);
        return () => observerRef.current?.disconnect();
    }, []);

    useEffect(() => {
        if (isVisible && !rendered && pdf) {
            const renderPage = async () => {
                try {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale });
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport }).promise;
                    setRendered(true);
                } catch (err) {
                    console.error("Page render error:", pageNum, err);
                }
            };
            renderPage();
        }
    }, [isVisible, rendered, pdf, pageNum, scale]);

    return (
        <div className="relative w-full mb-6 flex justify-center">
            <canvas
                ref={canvasRef}
                className={`w-full max-w-4xl rounded-xl shadow-2xl bg-white/5 transition-opacity duration-700 ${rendered ? 'opacity-100' : 'opacity-0'}`}
                style={{ aspectRatio: '1/1.4' }}
            />
            {!rendered && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-full border-2 border-[#AA792D]/20 border-t-[#AA792D] animate-spin" />
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Syncing Page {pageNum}</span>
                </div>
            )}
        </div>
    );
};

const PdfViewer = ({ fileUrl, title }) => {
    const [pdf, setPdf] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!fileUrl) return;

        const loadEngine = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check CDN
                if (!window.pdfjsLib) {
                    const script = document.createElement('script');
                    script.src = PDFJS_CDN;
                    document.head.appendChild(script);
                    await new Promise(r => script.onload = r);
                }

                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

                const loadingTask = window.pdfjsLib.getDocument({
                    url: fileUrl,
                    disableAutoFetch: true, // Only fetch what we need
                    disableStream: false
                });

                const loadedPdf = await loadingTask.promise;
                setPdf(loadedPdf);
                setNumPages(loadedPdf.numPages);
                setLoading(false);
            } catch (err) {
                console.error("Load Error:", err);
                setError("CORS Protocol Mismatch or Network Timeout.");
                setLoading(false);
            }
        };

        loadEngine();
    }, [fileUrl]);

    const handleDownload = () => {
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0F0E0D] overflow-hidden">
            {/* Control Header */}
            <div className="h-14 bg-[#1A1817] border-b border-white/5 px-6 flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#AA792D]/10 rounded-lg flex items-center justify-center border border-[#AA792D]/20">
                        <FileText size={16} className="text-[#AA792D]" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white leading-none truncate max-w-[150px] md:max-w-md">{title}</h2>
                        <p className="text-[7px] font-bold text-[#AA792D]/60 uppercase tracking-[0.2em] mt-1 italic">Chronological Bridge Active</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-[#AA792D] text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        Download PDF
                    </button>
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="p-2 bg-white/5 text-white/40 rounded-lg border border-white/10 hover:text-white transition-all"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0F0E0D] relative p-4 md:p-12">
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center space-y-6 z-10 bg-[#0F0E0D]"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-2 border-[#AA792D]/10 border-t-[#AA792D] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileText size={20} className="text-[#AA792D]/40" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em]">Establishing Proxy</h3>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2">Allocating memory for heavy archive...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 text-center max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-red-500/5 rounded-[2.5rem] flex items-center justify-center border border-red-500/10">
                            <AlertCircle size={32} className="text-red-500/40" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-black text-white uppercase tracking-[0.2em]">Transmission Fault</h3>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest">
                                Your browser restricted the direct stream. Click below to view the archive in full-screen reader.
                            </p>
                        </div>
                        <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="w-full py-4 bg-white text-[#0F0E0D] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#AA792D] hover:text-white transition-all shadow-2xl"
                        >
                            Open Full-Screen Reader
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {Array.from({ length: numPages }, (_, i) => (
                            <PageNode
                                key={i}
                                pdf={pdf}
                                pageNum={i + 1}
                                scale={window.innerWidth < 768 ? 1.0 : 1.5}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Status */}
            <div className="h-10 bg-[#1A1817] border-t border-white/5 px-6 flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#AA792D] animate-pulse" />
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
                        {pdf ? `Archive Synced // ${numPages} Pages Optimized` : 'Waiting for Handshake...'}
                    </span>
                </div>
                <div className="text-[8px] font-black text-[#AA792D]/20 uppercase tracking-widest">
                    Asre Hazir Digital Infrastructure
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;
