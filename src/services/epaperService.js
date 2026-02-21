import { db } from '../firebase/config';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    doc
} from 'firebase/firestore';

const PAGES_COLLECTION = 'epaper_pages';

/**
 * Add a new E-paper page to Firestore
 * @param {Object} pageData - Page data including imageUrl, pageNumber, etc.
 * @returns {Promise<string>} - Document ID
 */
export const addEpaperPage = async (pageData) => {
    try {
        const docRef = await addDoc(collection(db, PAGES_COLLECTION), {
            pageNumber: pageData.pageNumber,
            imageUrl: pageData.imageUrl,
            editionDate: pageData.editionDate || new Date().toISOString().split('T')[0],
            language: pageData.language || 'english',
            published: pageData.published !== undefined ? pageData.published : true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Optional metadata
            title: pageData.title || `Page ${pageData.pageNumber}`,
            description: pageData.description || '',
            articles: pageData.articles || []
        });

        console.log('✅ Page added to Firestore:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding page to Firestore:', error);
        throw error;
    }
};

/**
 * Fetch all published E-paper pages
 * @param {string} language - Language filter (optional)
 * @param {string} editionDate - Edition date filter (optional)
 * @returns {Promise<Array>} - Array of page objects
 */
export const getPublishedPages = async (language = 'english', editionDate = null) => {
    try {
        // Simplified query - fetch all pages and filter client-side
        // This avoids the composite index requirement
        const querySnapshot = await getDocs(collection(db, PAGES_COLLECTION));
        let pages = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter by published status, language, and optional date
            if (data.published === true && data.language === language) {
                if (!editionDate || data.editionDate === editionDate) {
                    pages.push({
                        id: doc.id,
                        ...data
                    });
                }
            }
        });

        // Sort by page number client-side
        pages.sort((a, b) => a.pageNumber - b.pageNumber);

        console.log(`✅ Fetched ${pages.length} published pages from Firestore`);
        return pages;
    } catch (error) {
        console.error('❌ Error fetching pages from Firestore:', error);
        throw error;
    }
};

/**
 * Get all unique edition dates
 * @returns {Promise<Array>} - Array of edition dates
 */
export const getEditionDates = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, PAGES_COLLECTION));
        const dates = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.editionDate) {
                dates.add(data.editionDate);
            }
        });

        return Array.from(dates).sort().reverse(); // Most recent first
    } catch (error) {
        console.error('❌ Error fetching edition dates:', error);
        return [];
    }
};

/**
 * Update page published status
 * @param {string} pageId - Document ID
 * @param {boolean} published - Published status
 */
export const updatePageStatus = async (pageId, published) => {
    try {
        const pageRef = doc(db, PAGES_COLLECTION, pageId);
        await updateDoc(pageRef, {
            published,
            updatedAt: serverTimestamp()
        });
        console.log(`✅ Page ${pageId} status updated to: ${published}`);
    } catch (error) {
        console.error('❌ Error updating page status:', error);
        throw error;
    }
};

/**
 * Delete all pages (for testing/cleanup)
 * WARNING: Use with caution!
 */
export const deleteAllPages = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, PAGES_COLLECTION));
        const deletePromises = [];

        querySnapshot.forEach((doc) => {
            deletePromises.push(doc.ref.delete());
        });

        await Promise.all(deletePromises);
        console.log('✅ All pages deleted');
    } catch (error) {
        console.error('❌ Error deleting pages:', error);
        throw error;
    }
};
