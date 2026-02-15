import React from 'react';

const ClickableOverlay = ({ articles, onArticleClick }) => {
    return (
        <div
            className="clickable-overlay"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            {articles.map((article) => (
                <div
                    key={article.id}
                    className="hotspot"
                    style={{
                        left: `${article.boundingBox.x}%`,
                        top: `${article.boundingBox.y}%`,
                        width: `${article.boundingBox.width}%`,
                        height: `${article.boundingBox.height}%`,
                        pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onArticleClick(article);
                    }}
                    title={article.title}
                />
            ))}
        </div>
    );
};

export default ClickableOverlay;
