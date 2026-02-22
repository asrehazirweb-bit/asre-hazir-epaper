import { createWorker } from 'tesseract.js';

/**
 * Enhanced OCR Service with Contrast Pre-processing and Region-Specific Extraction
 * Optimized for Hans India style column detection and clean text recovery.
 */
export const performOCR = async (imageSource, rect = null) => {
    console.log('🤖 Initializing Precision Newsroom OCR...');

    // Create worker with advanced configuration
    const worker = await createWorker('eng', 1, {
        logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
    });

    try {
        let processBuffer = imageSource;

        // If a specific region is requested, we use Tesseract's native rectangle support
        // Note: Tesseract's rectangle expects ABSOLUTE pixel values, 
        // while our rect is in percentages.
        // For best results, we will use the 'rectangle' option in 'recognize'
        // But first, we need the image dimensions.

        const options = {};
        if (rect) {
            // We'll calculate absolute pixels in the component before calling this,
            // or pass dimensions here. For now, let's assume rect contains absolute pixels
            // if provided, otherwise we'll try to guess if they are percentages.
            if (rect.x < 100 && rect.w < 100) {
                console.warn("⚠️ OCR received percentage coordinates. Absolute pixels preferred for Tesseract.");
            }
            options.rectangle = rect;
        }

        // Perform recognition with layout analysis
        const { data } = await worker.recognize(processBuffer, options);

        const confidence = data.confidence;
        console.log(`✅ Text Recovered. Confidence Pool: ${confidence.toFixed(2)}%`);

        if (confidence < 40) {
            return {
                headline: "Low Quality Capture",
                bodyText: "Text not detected clearly. Image resolution or contrast might be insufficient.",
                confidence,
                error: true
            };
        }

        // 1️⃣ STRUCTURAL ANALYSIS
        const blocks = data.blocks || [];
        let headline = "";
        let body = [];
        let maxFontSize = 0;

        blocks.forEach((block, idx) => {
            const text = block.text.trim();
            if (!text || text.length < 3) return;

            // Heuristic for headline: Largest vertical height in top 1/3
            const verticalScale = (block.bbox.y1 - block.bbox.y0) / (block.lines.length || 1);

            if (idx < 3 && verticalScale > maxFontSize && text.length < 200) {
                maxFontSize = verticalScale;
                headline = text;
            } else {
                body.push(text);
            }
        });

        // 2️⃣ CLEANUP PIPELINE (Hans India Standard)
        const postProcess = (str) => {
            return str
                .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2') // Handle line-end hyphens
                .replace(/\n(?!\n)/g, ' ')               // Remove single line breaks
                .replace(/\s{2,}/g, ' ')               // Remove multiple spaces
                .replace(/[^\x20-\x7E\n]/g, '')        // Remove non-printable characters
                .replace(/(TURN TO PAGE|CONTINUED|Page \d+)/gi, '')
                .trim();
        };

        const finalHeadline = postProcess(headline || (body[0] ? body[0].substring(0, 100) : "Untitled Fragment"));
        const finalBody = body.map(b => postProcess(b)).filter(b => b.length > 10).join('\n\n');

        await worker.terminate();

        return {
            headline: finalHeadline,
            bodyText: finalBody,
            confidence,
            isReliable: confidence > 75
        };

    } catch (error) {
        console.error('❌ OCR Critical Failure:', error);
        if (worker) await worker.terminate();
        throw error;
    }
};

/**
 * Pre-process image for better OCR results (Contrast/Gray)
 * Returns a DataURL or Canvas
 */
export const enhanceImageForOCR = async (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;

    // Apply filters
    ctx.filter = 'grayscale(1) contrast(1.5) brightness(1.1)';
    ctx.drawImage(imageElement, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
};
