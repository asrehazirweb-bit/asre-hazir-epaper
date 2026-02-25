import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, ExternalLink, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Load PDF.js from CDN to avoid huge package installs
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PdfViewer = ({ fileUrl, title }) => {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageRenders, setPageRenders] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!fileUrl) return;

        const loadPdf = async () => {
            try {
                setLoading(true);
                setError(null);

                // Inject PDF.js if not present
                if (!window.pdfjsLib) {
                    const script = document.createElement('script');
                    script.src = PDFJS_CDN;
                    document.head.appendChild(script);
                    await new Promise(r => script.onload = r);
                }

                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

                const loadingTask = window.pdfjsLib.getDocument(fileUrl);
                const pdf = await loadingTask.promise;
                setNumPages(pdf.numPages);

                // Initialize page render states
                setPageRenders(new Array(pdf.numPages).fill(false));
                setLoading(false);

                // Start rendering pages
                renderAllPages(pdf);

            } catch (err) {
                console.error("PDF Load Error:", err);
                setError("This file is heavy. Try opening it in a new tab if it fails to bridge.");
                setLoading(false);
            }
        };

        const renderAllPages = async (pdf) => {
            for (let i = 1; i <= pdf.numPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 }); // High fidelity

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.style.width = '100%';
                    canvas.style.marginBottom = '20px';
                    canvas.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                    canvas.style.borderRadius = '8px';

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    await page.render(renderContext).promise;

                    if (containerRef.current) {
                        containerRef.current.appendChild(canvas);
                    }
                } catch (e) {
                    console.error("Page render failed:", i, e);
                }
            }
        };

        loadPdf();
    }, [fileUrl]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${title || 'Asre-Hazir'}.pdf`;
        link.target = "_blank";
        link.click();
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#1A1817] overflow-hidden">
            {/* Control Header */}
            <div className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                        <FileText size={16} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-[#2B2523] leading-none truncate max-w-[150px] md:max-w-md">{title}</h2>
                        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">High-Fidelity Engine Active</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#AA792D] text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md"
                    >
                        <Download size={12} />
                        <span className="hidden sm:inline">Save PDF</span>
                    </button>
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg border border-gray-100"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-[#1A1817] relative p-4 md:p-8">
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10 bg-[#1A1817]"
                        >
                            <Loader2 className="text-[#AA792D] animate-spin" size={32} />
                            <div className="text-center">
                                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Deciphering Fragments</h3>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Bypassing limits for large archives...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center px-12">
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                            <FileText size={32} className="text-red-500/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Archive Flow Restricted</h3>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium capitalize">{error}</p>
                        </div>
                        <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                        >
                            Open in Direct Reader
                        </button>
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="max-w-4xl mx-auto flex flex-col items-center"
                    />
                )}
            </div>

            {/* Bottom Status */}
            <div className="h-8 bg-[#1A1817] border-t border-white/5 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#AA792D] rounded-full animate-pulse" />
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Native Renderer // {numPages || '--'} Pages Parsed</span>
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;
