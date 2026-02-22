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

const EDITIONS_COLLECTION = 'epaper_editions';

/**
 * Add or Update an E-paper edition
 * @param {Object} editionData - Edition data including date, pages, status, etc.
 * @returns {Promise<string>} - Document ID
 */
export const saveEdition = async (editionData) => {
    try {
        const docData = {
            name: editionData.name || `Edition ${editionData.editionDate}`,
            editionDate: editionData.editionDate || new Date().toISOString().split('T')[0],
            pages: editionData.pages || [],
            status: editionData.status || 'draft',
            isActive: editionData.isActive !== undefined ? editionData.isActive : false,
            createdAt: editionData.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
            thumbnail: editionData.thumbnail || (editionData.pages?.[0]?.imageUrl || ''),
            readers: editionData.readers || 0,
            battery: 100, // Mock for pulse UI
            online: true
        };

        let docRef;
        if (editionData.id) {
            docRef = doc(db, EDITIONS_COLLECTION, editionData.id);
            await updateDoc(docRef, docData);
            return editionData.id;
        } else {
            const result = await addDoc(collection(db, EDITIONS_COLLECTION), docData);
            return result.id;
        }
    } catch (error) {
        console.error('❌ Error saving edition:', error);
        throw error;
    }
};

/**
 * Legacy support for addEpaperPage, but redirected to editions logic
 */
export const addEpaperPage = async (pageData) => {
    try {
        // Find if an edition for this date already exists
        const q = query(
            collection(db, EDITIONS_COLLECTION),
            where("editionDate", "==", pageData.editionDate)
        );
        const snapshot = await getDocs(q);

        let edition;
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            edition = { id: docSnap.id, ...docSnap.data() };

            // Add page to existing edition
            const pages = [...(edition.pages || [])];
            pages.push({
                pageNumber: pageData.pageNumber,
                imageUrl: pageData.imageUrl,
                title: pageData.title || `Page ${pageData.pageNumber}`,
                articles: []
            });

            // Sort pages
            pages.sort((a, b) => a.pageNumber - b.pageNumber);

            await updateDoc(doc(db, EDITIONS_COLLECTION, edition.id), {
                pages,
                updatedAt: serverTimestamp(),
                thumbnail: pages[0]?.imageUrl || edition.thumbnail
            });
            return edition.id;
        } else {
            // Create new edition
            const newEdition = {
                editionDate: pageData.editionDate,
                pages: [{
                    pageNumber: pageData.pageNumber,
                    imageUrl: pageData.imageUrl,
                    title: pageData.title || `Page ${pageData.pageNumber}`,
                    articles: []
                }],
                status: 'draft', // New uploads start as draft
                isActive: false // New uploads are not active by default
            };
            return await saveEdition(newEdition);
        }
    } catch (error) {
        console.error('❌ Error adding page:', error);
        throw error;
    }
};

/**
 * Fetch all published E-paper editions (Real-time listener is preferred in component)
 */
export const getPublishedEditions = async () => {
    try {
        const q = query(
            collection(db, EDITIONS_COLLECTION),
            where("status", "==", "published"),
            where("isActive", "==", true),
            orderBy('editionDate', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Error fetching published editions:', error);
        throw error;
    }
};

/**
 * Delete an edition
 */
export const deleteEdition = async (editionId) => {
    try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, EDITIONS_COLLECTION, editionId));
        console.log(`✅ Edition ${editionId} deleted`);
    } catch (error) {
        console.error('❌ Error deleting edition:', error);
        throw error;
    }
};

