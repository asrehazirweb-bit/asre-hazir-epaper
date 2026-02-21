import React from 'react';
import { FileText } from 'lucide-react';

const PageThumbnailList = ({ pages, activePageIndex, onPageSelect }) => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-gray-600 dark:text-gray-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Pages ({pages.length})
                    </h3>
                </div>
            </div>

            {/* Thumbnail List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {pages.map((page, index) => (
                    <button
                        key={page.id || index}
                        onClick={() => onPageSelect(index)}
                        className={`w-full text-left rounded-lg border-2 transition-all duration-200 overflow-hidden group ${index === activePageIndex
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-100 dark:ring-blue-900/40'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-900'
                            }`}
                    >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <img
                                src={page.imageUrl}
                                alt={`Page ${page.pageNumber}`}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Page Number Badge */}
                            <div className="absolute top-2 left-2">
                                <div className={`px-2 py-1 rounded text-xs font-bold shadow-lg ${index === activePageIndex
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white'
                                    }`}>
                                    P{page.pageNumber}
                                </div>
                            </div>

                            {/* Active Indicator */}
                            {index === activePageIndex && (
                                <div className="absolute inset-0 border-4 border-blue-600 pointer-events-none"></div>
                            )}
                        </div>

                        {/* Page Info */}
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                            <p className={`text-xs font-semibold truncate ${index === activePageIndex
                                    ? 'text-blue-700 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {page.title || `Page ${page.pageNumber}`}
                            </p>
                            {page.editionDate && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {new Date(page.editionDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click a page to view
                </p>
            </div>
        </div>
    );
};

export default PageThumbnailList;
