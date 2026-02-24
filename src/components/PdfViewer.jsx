import React from 'react';
import { Download, X, FileText, ExternalLink, Minimize2 } from 'lucide-react';
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full h-full flex flex-col bg-[#0B0F19] overflow-hidden"
        >
            {/* Inline Control Header */}
            <div className="h-14 bg-[#111827] border-b border-white/5 px-6 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center border border-red-500/20">
                        <FileText size={16} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white leading-none truncate max-w-[200px]">{title}</h2>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Full PDF Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                        <Download size={12} />
                        Download
                    </button>
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all"
                        title="Open in new tab"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            {/* Inline PDF Content Area */}
            <div className="flex-1 bg-black/20 relative">
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    title={title}
                />
            </div>

            {/* Mini Footer */}
            <div className="h-8 bg-black/40 border-t border-white/5 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Digital Stream Secure</span>
                </div>
                <div className="text-[7px] font-black text-gray-700 uppercase tracking-widest">ASRE HAZIR V5.0</div>
            </div>
        </motion.div>
    );
};

export default PdfViewer;
