import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The folder path in storage
 * @param {Function} onProgress - Callback for upload progress
 * @returns {Promise<string>} - The download URL
 */
export const uploadToStorage = (file, path = 'epaper', onProgress = null) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const storageRef = ref(storage, `${path}/${timestamp}_${safeName}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error('Firebase Storage Error:', error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};
