/**
 * Canvas-based image cropper for E-paper article previews
 * Captures click coordinates and generates cropped image data URL
 */

// DYNAMIC CROP SIZES (Balanced for Headline + Body)
const CROP_WIDTH_PCT = 0.35; // 35% of natural width
const CROP_HEIGHT_PCT = 0.38; // 38% of natural height (Vertical slice for columns)

/**
 * Generate cropped image from click coordinates (percentages)
 * @param {HTMLImageElement} imgElement - The newspaper page image element
 * @param {number} xPct - Click X as percentage (0 to 1)
 * @param {number} yPct - Click Y as percentage (0 to 1)
 * @returns {Promise<Object>} - Cropped image data and metadata
 */
export const generateArticleCrop = async (imgElement, xPct, yPct) => {
    return new Promise((resolve, reject) => {
        try {
            const naturalWidth = imgElement.naturalWidth;
            const naturalHeight = imgElement.naturalHeight;

            // Calculate dynamic crop dimensions
            const cropWidth = Math.round(naturalWidth * CROP_WIDTH_PCT);
            const cropHeight = Math.round(naturalHeight * CROP_HEIGHT_PCT);

            // Calculate real image coordinates from percentages
            const realX = xPct * naturalWidth;
            const realY = yPct * naturalHeight;

            console.log('🖱️ Click captured:', { xPct, yPct, realX, realY });

            // Calculate crop area centered on click point
            let cropX = Math.round(realX - cropWidth / 2);
            let cropY = Math.round(realY - cropHeight / 2);

            // Ensure crop stays within image bounds
            cropX = Math.max(0, Math.min(cropX, naturalWidth - cropWidth));
            cropY = Math.max(0, Math.min(cropY, naturalHeight - cropHeight));

            // Adjust crop dimensions if they exceed image bounds
            const actualCropWidth = Math.min(cropWidth, naturalWidth - cropX);
            const actualCropHeight = Math.min(cropHeight, naturalHeight - cropY);

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
                xPct,
                yPct,
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
 * Helper to generate crop from a URL (used for swiping navigation)
 */
export const generateArticleCropFromUrl = async (url, xPct, yPct) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            generateArticleCrop(img, xPct, yPct).then(resolve).catch(reject);
        };
        img.onerror = reject;
        img.src = url;
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
