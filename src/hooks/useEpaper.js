import { useState, useCallback } from 'react';

const useEpaper = (initialData) => {
    const [data, setData] = useState(initialData);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isArticleOpen, setIsArticleOpen] = useState(false);

    const handlePageSelect = useCallback((index) => {
        setActivePageIndex(index);
        // Optional: close article when switching pages
        // setIsArticleOpen(false);
    }, []);

    const handleArticleClick = useCallback((article) => {
        setSelectedArticle(article);
        setIsArticleOpen(true);
    }, []);

    const closeArticle = useCallback(() => {
        setIsArticleOpen(false);
    }, []);

    const activePage = data?.pages[activePageIndex];

    return {
        data,
        activePage,
        activePageIndex,
        selectedArticle,
        isArticleOpen,
        handlePageSelect,
        handleArticleClick,
        closeArticle,
        setEdition: setData
    };
};

export default useEpaper;
