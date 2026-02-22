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
    doc,
    deleteDoc,
    onSnapshot,
    increment
} from 'firebase/firestore';

const EDITIONS_COLL = 'epaper_editions';
const PAGES_COLL = 'epaper_pages';
const ARTICLES_COLL = 'epaper_articles';

/**
 * Normalized Edition saving
 */
export const saveEdition = async (editionData) => {
    try {
        const docData = {
            name: editionData.name || `Edition ${editionData.editionDate}`,
            editionDate: editionData.editionDate || new Date().toISOString().split('T')[0],
            status: editionData.status || 'draft',
            isActive: editionData.isActive !== undefined ? editionData.isActive : false,
            createdAt: editionData.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
            thumbnail: editionData.thumbnail || '',
            readers: editionData.readers || 0,
            syncStatus: 'synced',
            battery: 100
        };

        if (editionData.id) {
            await updateDoc(doc(db, EDITIONS_COLL, editionData.id), docData);
            return editionData.id;
        } else {
            const result = await addDoc(collection(db, EDITIONS_COLL), docData);
            return result.id;
        }
    } catch (error) {
        console.error('❌ Error saving edition:', error);
        throw error;
    }
};

/**
 * Normalized Page saving
 */
export const savePage = async (pageData) => {
    try {
        const docData = {
            editionId: pageData.editionId,
            pageNumber: parseInt(pageData.pageNumber),
            imageUrl: pageData.imageUrl,
            title: pageData.title || `Page ${pageData.pageNumber}`,
            updatedAt: serverTimestamp()
        };

        if (pageData.id) {
            await updateDoc(doc(db, PAGES_COLL, pageData.id), docData);
            return pageData.id;
        } else {
            const result = await addDoc(collection(db, PAGES_COLL), {
                ...docData,
                createdAt: serverTimestamp()
            });
            return result.id;
        }
    } catch (error) {
        console.error('❌ Error saving page:', error);
        throw error;
    }
};

/**
 * Normalized Article saving (Hotspots/Crops)
 */
export const saveArticle = async (articleData) => {
    try {
        const docData = {
            editionId: articleData.editionId,
            pageId: articleData.pageId,
            headline: articleData.headline || '',
            content: articleData.content || '',
            rect: articleData.rect, // {x, y, w, h}
            verified: articleData.verified || false,
            updatedAt: serverTimestamp()
        };

        if (articleData.id) {
            await updateDoc(doc(db, ARTICLES_COLL, articleData.id), docData);
            return articleData.id;
        } else {
            const result = await addDoc(collection(db, ARTICLES_COLL), {
                ...docData,
                createdAt: serverTimestamp()
            });
            return result.id;
        }
    } catch (error) {
        console.error('❌ Error saving article:', error);
        throw error;
    }
};

/**
 * Fetch all published editions with production-grade query
 */
export const getPublishedEditions = async () => {
    const q = query(
        collection(db, EDITIONS_COLL),
        where("status", "==", "published"),
        where("isActive", "==", true),
        orderBy('editionDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Fetch pages for a specific edition
 */
export const getPagesByEdition = async (editionId) => {
    const q = query(
        collection(db, PAGES_COLL),
        where("editionId", "==", editionId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (parseInt(a.pageNumber) || 0) - (parseInt(b.pageNumber) || 0));
};

/**
 * Fetch articles/hotspots for a specific page
 */
export const getArticlesByPage = async (pageId) => {
    const q = query(
        collection(db, ARTICLES_COLL),
        where("pageId", "==", pageId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Legacy Support: Optimized addEpaperPage
 */
export const addEpaperPage = async (pageData) => {
    // 1. Find or create edition
    const q = query(collection(db, EDITIONS_COLL), where("editionDate", "==", pageData.editionDate));
    const snapshot = await getDocs(q);
    let editionId;

    if (!snapshot.empty) {
        editionId = snapshot.docs[0].id;
    } else {
        editionId = await saveEdition({ editionDate: pageData.editionDate, status: 'draft', isActive: false });
    }

    // 2. Save page
    const pageId = await savePage({
        editionId,
        pageNumber: pageData.pageNumber,
        imageUrl: pageData.imageUrl,
        title: pageData.title
    });

    // 3. Update edition thumbnail if first page
    if (pageData.pageNumber === 1) {
        await updateDoc(doc(db, EDITIONS_COLL, editionId), { thumbnail: pageData.imageUrl });
    }

    return pageId;
};

/**
 * Delete edition and cascade delete pages/articles
 */
export const incrementReaders = async (editionId) => {
    try {
        const docRef = doc(db, EDITIONS_COLL, editionId);
        await updateDoc(docRef, {
            readers: increment(1),
            lastSync: serverTimestamp()
        });
    } catch (error) {
        console.error('❌ Error incrementing readers:', error);
    }
};

export const deleteEditionCascade = async (editionId) => {
    // Delete articles
    const artQ = query(collection(db, ARTICLES_COLL), where("editionId", "==", editionId));
    const arts = await getDocs(artQ);
    for (const d of arts.docs) {
        await deleteDoc(d.ref);
    }

    // Delete pages
    const pageQ = query(collection(db, PAGES_COLL), where("editionId", "==", editionId));
    const pages = await getDocs(pageQ);
    for (const d of pages.docs) {
        await deleteDoc(d.ref);
    }

    // Delete edition
    await deleteDoc(doc(db, EDITIONS_COLL, editionId));
};
