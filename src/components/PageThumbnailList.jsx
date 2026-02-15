import React from 'react';

const PageThumbnailList = ({ pages, activePageIndex, onPageSelect }) => {
    return (
        <div className="thumbnail-list">
            {pages.map((page, index) => (
                <div
                    key={page.pageNumber}
                    className={`thumbnail-item ${index === activePageIndex ? 'active' : ''}`}
                    onClick={() => onPageSelect(index)}
                >
                    <img
                        src={page.imageUrl}
                        alt={`Page ${page.pageNumber}`}
                        loading="lazy"
                    />
                    <div className="page-label">P{page.pageNumber}</div>
                </div>
            ))}
        </div>
    );
};

export default PageThumbnailList;
