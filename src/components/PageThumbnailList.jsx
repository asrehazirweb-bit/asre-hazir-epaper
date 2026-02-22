import React from 'react';
import { FileText } from 'lucide-react';

const PageThumbnailList = ({ pages, activePageIndex, onPageSelect, horizontal = false }) => {
    return (
        <div className={`h-full flex ${horizontal ? 'flex-row' : 'flex-col'} bg-[#111827]`}>
            {!horizontal && (
                <div className="px-6 py-4 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <FileText size={16} className="text-blue-500" />
                        <h3 className="font-black text-white text-[10px] uppercase tracking-[0.2em]">
                            Sheets ({pages.length})
                        </h3>
                    </div>
                </div>
            )}

            <div className={`flex-1 overflow-auto custom-scrollbar ${horizontal ? 'flex flex-row p-2 gap-3 h-28' : 'p-4 space-y-3'}`}>
                {pages.map((page, index) => (
                    <button
                        key={page.id || index}
                        onClick={() => onPageSelect(index)}
                        className={`${horizontal ? 'h-full aspect-[1/1.4] shrink-0' : 'w-full'} relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${index === activePageIndex
                            ? 'border-blue-600 shadow-lg shadow-blue-500/20'
                            : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                    >
                        <div className="w-full h-full bg-[#1F2937]">
                            <img
                                src={page.imageUrl}
                                alt={`Sheet ${page.pageNumber}`}
                                loading="lazy"
                                className={`w-full h-full object-cover transition-all duration-500 ${index === activePageIndex ? 'opacity-100' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}
                            />

                            <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black shadow-2xl ${index === activePageIndex
                                ? 'bg-blue-600 text-white'
                                : 'bg-black/80 text-gray-400 border border-white/5'
                                }`}>
                                {page.pageNumber}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PageThumbnailList;
