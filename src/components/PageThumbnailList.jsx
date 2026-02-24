import React from 'react';
import { FileText, Archive } from 'lucide-react';

const PageThumbnailList = ({ pages, activePageIndex, onPageSelect, horizontal = false }) => {
    // Determine if we are listing pages of ONE edition or multiple EDITIONS themselves
    const isEditionList = pages[0]?.isEdition;

    return (
        <div className={`h-full flex ${horizontal ? 'flex-row' : 'flex-col'} bg-[#0B0F19]`}>
            {!horizontal && (
                <div className="px-6 py-6 border-b border-white/5 bg-[#111827]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <Archive size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-[11px] uppercase tracking-widest leading-none">
                                {isEditionList ? 'Daily Editions' : 'Edition Sheets'}
                            </h3>
                            <p className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1.5">Archive Node V5.0</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex-1 overflow-auto custom-scrollbar ${horizontal ? 'flex flex-row p-3 gap-3 h-28' : 'p-6 space-y-8'}`}>
                {pages.map((page, index) => {
                    const isPdf = page.type === 'pdf' || page.id === 'pdf-virtual';
                    const isActive = index === activePageIndex;

                    return (
                        <div key={page.id || index} className={`${horizontal ? 'h-full shrink-0' : 'space-y-4'}`}>
                            <button
                                onClick={() => onPageSelect(index)}
                                className={`${horizontal ? 'h-full aspect-[1/1.4]' : 'w-full aspect-[1/1.4]'} relative rounded-xl lg:rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 group ${isActive
                                    ? 'border-blue-600 shadow-2xl shadow-blue-500/30 scale-[1.02]'
                                    : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="w-full h-full bg-[#111827] flex items-center justify-center relative">
                                    {page.imageUrl ? (
                                        <img
                                            src={page.imageUrl}
                                            alt={page.title || `Page ${page.pageNumber}`}
                                            loading="lazy"
                                            className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 lg:gap-4">
                                            <div className="w-8 h-8 lg:w-16 lg:h-16 bg-white/5 rounded-lg lg:rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
                                                <FileText size={horizontal ? 16 : 32} className="text-gray-700 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            {!horizontal && <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">No Preview</span>}
                                        </div>
                                    )}

                                    {isPdf && (
                                        <div className={`absolute inset-x-0 bottom-0 ${horizontal ? 'p-2' : 'p-5'} bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent flex flex-col items-center gap-1`}>
                                            <div className={`px-2 lg:px-3 py-0.5 lg:py-1 bg-blue-600 rounded-full ${horizontal ? 'text-[6px]' : 'text-[8px]'} font-black text-white uppercase tracking-widest shadow-lg shadow-blue-600/40 truncate w-full text-center`}>
                                                {isEditionList ? (horizontal ? 'Launch' : 'Launch Edition') : (horizontal ? 'Full' : 'Full View Mode')}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`absolute ${horizontal ? 'top-2 left-2 min-w-[20px] h-5 px-1.5' : 'top-5 left-5 min-w-[32px] h-8 px-3'} flex items-center justify-center rounded-lg lg:rounded-xl ${horizontal ? 'text-[7px]' : 'text-[10px]'} font-black shadow-2xl backdrop-blur-md transition-all ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-black/60 text-gray-400 border border-white/10'
                                        }`}>
                                        {isPdf ? 'PDF' : page.pageNumber}
                                    </div>
                                </div>
                            </button>

                            {!horizontal && (
                                <div className="px-2">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest leading-none truncate ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {isEditionList ? (page.title || 'Untitled Edition') : `Page Node ${page.pageNumber}`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-800'}`} />
                                        <p className="text-[7px] font-black text-gray-700 uppercase tracking-[0.2em] italic">Digital Verified Stream</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PageThumbnailList;
