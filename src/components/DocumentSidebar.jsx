import React from 'react';
import { FileText, Calendar, ChevronRight, X } from 'lucide-react';

const DocumentSidebar = ({ editions, selectedEditionId, onSelect, onClose }) => {
    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-100 w-full overflow-hidden">
            <div className="px-6 py-8 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                <div>
                    <h3 className="text-[11px] font-black text-[#2B2523] uppercase tracking-[0.3em]">Archives Library</h3>
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select Edition to Load</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-[#AA792D] transition-all shadow-sm md:shadow-none"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                {editions.map((doc) => {
                    const isActive = doc.id === selectedEditionId;
                    return (
                        <button
                            key={doc.id}
                            onClick={() => onSelect(doc)}
                            className="w-full text-left group"
                        >
                            <div className={`relative aspect-[1/1.4] rounded-2xl overflow-hidden border-2 transition-all duration-500
                                ${isActive
                                    ? 'border-[#AA792D] shadow-xl shadow-[#AA792D]/20 scale-[1.02]'
                                    : 'border-gray-50 hover:border-[#AA792D]/30 group-hover:shadow-lg'
                                }`}
                            >
                                {doc.thumbnailUrl || doc.thumbnail ? (
                                    <img
                                        src={doc.thumbnailUrl || doc.thumbnail}
                                        alt={doc.name}
                                        className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <FileText size={20} className="text-gray-200" />
                                    </div>
                                )}

                                {isActive && (
                                    <div className="absolute inset-0 bg-[#AA792D]/10 flex items-center justify-center">
                                        <div className="px-3 py-1 bg-[#AA792D] text-white text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg">
                                            Reading
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 px-1">
                                <p className={`text-[9px] font-black uppercase tracking-widest truncate ${isActive ? 'text-[#AA792D]' : 'text-gray-500 group-hover:text-[#2B2523]'}`}>
                                    {doc.name || doc.editionDate}
                                </p>
                                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{doc.editionDate}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Verified Archive Node active</span>
                </div>
            </div>
        </div>
    );
};

export default DocumentSidebar;
