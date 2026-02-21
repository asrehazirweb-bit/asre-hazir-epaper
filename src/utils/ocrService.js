import { createWorker } from 'tesseract.js';

/**
 * Advanced OCR Service with Layout Awareness and Text Post-Processing
 */
export const performOCR = async (imageDataUrl) => {
    console.log('🤖 Starting Industry-Grade OCR Extraction...');

    const worker = await createWorker('eng');

    try {
        const { data } = await worker.recognize(imageDataUrl);
        console.log('✅ OCR Complete. Confidence:', data.confidence.toFixed(2));

        // 1️⃣ LAYOUT ANALYSIS (Block-based for column integrity)
        const blocks = data.blocks || [];

        let headlineCandidate = "";
        let bodyBlocks = [];
        let maxFontSize = 0;

        // Iterate through blocks to find the headline and structure body text
        blocks.forEach((block, index) => {
            const blockText = block.text.trim();
            if (!blockText) return;

            // Estimate "Font Size" based on line count vs bounding box height
            const avgLineHeight = block.bbox.y1 - block.bbox.y0;
            const lineCount = block.lines.length;
            const estimatedFontSize = avgLineHeight / (lineCount || 1);

            // Headline Detection Logic:
            // - Usually in the first few blocks
            // - Typically has the largest vertical height per line
            if (index < 2 && estimatedFontSize > maxFontSize && blockText.length < 150) {
                maxFontSize = estimatedFontSize;
                headlineCandidate = blockText;
            } else {
                bodyBlocks.push(blockText);
            }
        });

        // 2️⃣ TEXT CLEANUP PIPELINE
        const cleanupText = (text) => {
            return text
                // Merge hyphenated words at line ends (e.g., "post-\nponed" -> "postponed")
                .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
                // Remove unintended single line breaks within sentences (merge paragraphs)
                .replace(/(?<!\n)\n(?!\n)/g, ' ')
                // Remove repeated spaces
                .replace(/\s{2,}/g, ' ')
                // Remove common newspaper noise
                .replace(/(TURN TO PAGE|CONTINUED ON|Page \d+|Photo by \w+)/gi, '')
                .trim();
        };

        const cleanedHeadline = cleanupText(headlineCandidate) || "Headline not detected";
        const cleanedBody = bodyBlocks.map(block => cleanupText(block)).filter(b => b.length > 5).join('\n\n');

        await worker.terminate();

        return {
            headline: cleanedHeadline,
            bodyText: cleanedBody,
            confidence: data.confidence,
            blocks: blocks.length,
            isPartial: data.confidence < 80 && data.confidence >= 50,
            isLowQuality: data.confidence < 50
        };

    } catch (error) {
        console.error('❌ OCR Extraction Error:', error);
        await worker.terminate();
        throw error;
    }
};
