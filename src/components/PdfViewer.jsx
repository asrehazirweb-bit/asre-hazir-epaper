import React from 'react';
import { Download, Maximize2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PdfViewer = ({ fileUrl, title, onClose }) => {
    if (!fileUrl) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${title || 'edition'}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0B0F19] flex flex-col"
        >
            {/* Control Header */}
            <header className="h-20 glass-panel border-b border-white/5 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <FileText size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic uppercase tracking-tighter leading-none">{title}</h2>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Full PDF Edition Portfolio</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Download size={14} />
                        Download Full PDF
                    </button>
                    <div className="w-px h-8 bg-white/5 mx-2" />
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* PDF Content Area */}
            <div className="flex-1 bg-black/40 relative overflow-hidden">
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    title={title}
                />

                {/* Mobile Helper (only shows if iframe might be blocked or hard to use) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:hidden">
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-2xl"
                    >
                        Open In Native Viewer
                    </button>
                </div>
            </div>

            {/* Bottom Footer Stats */}
            <footer className="h-12 bg-black/40 border-t border-white/5 px-8 flex items-center justify-center gap-10">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">SECURE PDF STREAM ACTIVE</span>
                </div>
                <div className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">ASRE HAZIR DIGITAL // SYSTEM 5.0</div>
            </footer>
        </motion.div>
    );
};

export default PdfViewer;
