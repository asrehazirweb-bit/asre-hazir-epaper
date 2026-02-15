import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import ClickableOverlay from './ClickableOverlay';

const PageViewer = ({ page, onArticleClick }) => {
    if (!page) return null;

    return (
        <div className="epaper-viewer-container">
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={false}
            >
                {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                    <>
                        <div className="zoom-controls">
                            <button className="zoom-btn" onClick={() => zoomIn()} title="Zoom In"><ZoomIn size={20} /></button>
                            <button className="zoom-btn" onClick={() => zoomOut()} title="Zoom Out"><ZoomOut size={20} /></button>
                            <button className="zoom-btn" onClick={() => resetTransform()} title="Reset"><RotateCcw size={20} /></button>
                            <button className="zoom-btn" title="Full Screen"><Maximize size={20} /></button>
                        </div>

                        <TransformComponent
                            wrapperStyle={{ width: '100%', height: '100%' }}
                            contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div className="page-image-container">
                                <img
                                    src={page.imageUrl}
                                    alt={`Page ${page.pageNumber}`}
                                    className="page-image"
                                />
                                <ClickableOverlay
                                    articles={page.articles}
                                    onArticleClick={onArticleClick}
                                />
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

export default PageViewer;
