/**
 * Canvas-based image cropper for E-paper article previews
 * Captures click coordinates and generates cropped image data URL
 */

const CROP_WIDTH = 400;
const CROP_HEIGHT = 500;

/**
 * Generate cropped image from click coordinates
 * @param {HTMLImageElement} imgElement - The newspaper page image element
 * @param {number} clickX - Click X coordinate (screen space)
 * @param {number} clickY - Click Y coordinate (screen space)
 * @returns {Promise<Object>} - Cropped image data and metadata
 */
export const generateArticleCrop = async (imgElement, clickX, clickY) => {
    return new Promise((resolve, reject) => {
        try {
            // Get bounding rect for scaling calculations
            const rect = imgElement.getBoundingClientRect();

            // Calculate scale factors from displayed size to natural size
            const scaleX = imgElement.naturalWidth / rect.width;
            const scaleY = imgElement.naturalHeight / rect.height;

            // Convert click coordinates to real image coordinates
            const realX = clickX * scaleX;
            const realY = clickY * scaleY;

            console.log('🖱️ Click captured:', { clickX, clickY });
            console.log('📐 Scaled coordinates:', { realX, realY });
            console.log('📏 Image dimensions:', {
                displayed: { width: rect.width, height: rect.height },
                natural: { width: imgElement.naturalWidth, height: imgElement.naturalHeight }
            });

            // Calculate crop area centered on click point
            let cropX = Math.round(realX - CROP_WIDTH / 2);
            let cropY = Math.round(realY - CROP_HEIGHT / 2);

            // Ensure crop stays within image bounds
            cropX = Math.max(0, Math.min(cropX, imgElement.naturalWidth - CROP_WIDTH));
            cropY = Math.max(0, Math.min(cropY, imgElement.naturalHeight - CROP_HEIGHT));

            // Adjust crop dimensions if they exceed image bounds
            const actualCropWidth = Math.min(CROP_WIDTH, imgElement.naturalWidth - cropX);
            const actualCropHeight = Math.min(CROP_HEIGHT, imgElement.naturalHeight - cropY);

            console.log('✂️ Crop area:', { cropX, cropY, actualCropWidth, actualCropHeight });

            // Create canvas for cropping
            const canvas = document.createElement('canvas');
            canvas.width = actualCropWidth;
            canvas.height = actualCropHeight;
            const ctx = canvas.getContext('2d');

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw cropped portion of original image
            ctx.drawImage(
                imgElement,                  // Source image
                cropX,                       // Source X
                cropY,                       // Source Y
                actualCropWidth,             // Source width
                actualCropHeight,            // Source height
                0,                           // Dest X
                0,                           // Dest Y
                actualCropWidth,             // Dest width
                actualCropHeight             // Dest height
            );

            // Convert canvas to data URL
            const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95);

            console.log('✅ Crop generated successfully');

            resolve({
                imageUrl: croppedImageUrl,
                cropX,
                cropY,
                cropWidth: actualCropWidth,
                cropHeight: actualCropHeight,
                clickX: Math.round(realX),
                clickY: Math.round(realY),
                naturalWidth: imgElement.naturalWidth,
                naturalHeight: imgElement.naturalHeight
            });

        } catch (error) {
            console.error('❌ Error generating crop:', error);
            reject(error);
        }
    });
};

/**
 * Check if image is loaded and ready for cropping
 * @param {HTMLImageElement} imgElement - Image element to check
 * @returns {boolean}
 */
export const isImageReady = (imgElement) => {
    return imgElement &&
        imgElement.complete &&
        imgElement.naturalWidth > 0 &&
        imgElement.naturalHeight > 0;
};
