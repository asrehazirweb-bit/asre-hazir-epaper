const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary environment variables are missing. Please check your .env file.");
}

/**
 * Upload an image to Cloudinary (unsigned)
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder name (default: 'epaper')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'epaper') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Image upload failed');
        }

        const data = await response.json();
        return data; // Return full data object instead of just secure_url
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
