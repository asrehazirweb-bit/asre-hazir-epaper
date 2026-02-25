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
            className="w-full h-full flex flex-col bg-white overflow-hidden"
        >
            {/* Inline Control Header */}
            <div className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                        <FileText size={16} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-[#2B2523] leading-none truncate max-w-[200px]">{title}</h2>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Full PDF Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-1.5 bg-[#AA792D] hover:bg-[#8B6123] text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-[#AA792D]/20"
                    >
                        <Download size={12} />
                        Download
                    </button>
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-lg transition-all border border-gray-100"
                        title="Open in new tab"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            {/* Inline PDF Content Area */}
            <div className="flex-1 bg-gray-50 relative">
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    title={title}
                />
            </div>

            {/* Mini Footer */}
            <div className="h-8 bg-white border-t border-gray-100 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Digital Stream Secure</span>
                </div>
                <div className="text-[7px] font-black text-gray-300 uppercase tracking-widest">ASRE HAZIR V5.0</div>
            </div>
        </motion.div>
    );
};

export default PdfViewer;
