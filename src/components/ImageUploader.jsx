import React, { useState } from 'react';
import { uploadImage } from '../utils/cloudinary';
import { addEpaperPage } from '../services/epaperService';
import { Upload, X, Check, Image as ImageIcon, Loader2, Link2, Copy, Zap, Hash } from 'lucide-react';

const ImageUploader = ({ onUploadComplete }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageTitle, setPageTitle] = useState('');
    const [isPdf, setIsPdf] = useState(false);
    const [pageCount, setPageCount] = useState(0);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setIsPdf(file.type === 'application/pdf');
            setPreview(file.type === 'application/pdf' ? null : URL.createObjectURL(file));
            setError(null);
            setUploadedUrl(null);
            setPageCount(0);
        }
    };

    const handleUpload = async () => {
        if (!image) return;

        setUploading(true);
        setError(null);

        try {
            // Step 1: Upload file to Cloudinary
            const data = await uploadImage(image, 'epaper');
            const baseUrl = data.secure_url;

            // If it's a PDF, Cloudinary response contains 'pages' count
            if (isPdf || data.resource_type === 'raw' || data.format === 'pdf') {
                const totalPages = data.pages || 1;
                setPageCount(totalPages);

                // Optimized PDF to Image conversion using Cloudinary transformations
                // URL Pattern: .../upload/pg_[number]/public_id.jpg
                const publicId = data.public_id;
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

                // We create entries for each page
                for (let i = 1; i <= totalPages; i++) {
                    // Generate a high-quality JPG URL for this specific page
                    // We use 'f_jpg' to ensure it's an image and 'pg_' to select the page
                    const pageImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_jpg,q_auto,w_2000/pg_${i}/${publicId}.jpg`;

                    const pageData = {
                        pageNumber: i,
                        imageUrl: pageImageUrl,
                        title: pageTitle ? `${pageTitle} - Page ${i}` : `Page ${i}`,
                        language: 'english',
                        editionDate: new Date().toISOString().split('T')[0],
                        published: true,
                        articles: []
                    };

                    await addEpaperPage(pageData);
                    console.log(`✅ Page ${i}/${totalPages} processed.`);
                }

                setUploadedUrl(baseUrl);
                if (onUploadComplete) onUploadComplete(baseUrl);
            } else {
                // Single Image behavior
                const url = data.secure_url;
                setUploadedUrl(url);

                const pageData = {
                    pageNumber: parseInt(pageNumber),
                    imageUrl: url,
                    title: pageTitle || `Page ${pageNumber}`,
                    language: 'english',
                    editionDate: new Date().toISOString().split('T')[0],
                    published: true,
                    articles: []
                };

                await addEpaperPage(pageData);
                if (onUploadComplete) onUploadComplete(url);
            }

            console.log('✅ Publication sequence complete.');
        } catch (err) {
            console.error('❌ Upload failed:', err);
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setImage(null);
        setPreview(null);
        setUploadedUrl(null);
        setError(null);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Simple visual feedback could be added here if needed
    };

    return (
        <div className="w-full font-sans">
            <div className="space-y-6">
                {/* File Dropzone / Selection */}
                <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${preview ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-200 dark:border-zinc-800 hover:border-blue-400 bg-slate-50/50 dark:bg-zinc-900/50'}`}>
                    {preview ? (
                        <div className="relative inline-block">
                            <img src={preview} alt="Edition Page Preview" className="max-h-64 mx-auto rounded-xl shadow-lg border-4 border-white dark:border-zinc-800" />
                            {!uploading && (
                                <button
                                    onClick={handleClear}
                                    className="absolute -top-3 -right-3 bg-white dark:bg-zinc-800 rounded-full p-2 shadow-md border border-slate-200 dark:border-zinc-700 hover:text-red-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    ) : image && isPdf ? (
                        <div className="flex flex-col items-center py-6">
                            <div className="w-20 h-24 bg-red-500/10 rounded-lg border-2 border-red-500/20 flex flex-col items-center justify-center relative mb-4">
                                <span className="text-[10px] font-black text-red-600 mb-1">PDF</span>
                                <div className="w-8 h-1 bg-red-500/20 rounded-full" />
                                {!uploading && (
                                    <button
                                        onClick={handleClear}
                                        className="absolute -top-3 -right-3 bg-white dark:bg-zinc-800 rounded-full p-1.5 shadow-md border border-slate-200 dark:border-zinc-700 hover:text-red-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">{image.name}</span>
                            <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-2 px-3 py-1 bg-red-500/5 rounded-full">Automated Multi-Page Split Active</span>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center py-6">
                            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-zinc-700 mb-4">
                                <Upload className="text-blue-600" size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">Select Edition Assets</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-Res JPG, PNG or PDF Portfolio</span>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Page Metadata Inputs */}
                {(preview || (image && isPdf)) && !uploadedUrl && (
                    <div className="space-y-4 bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-widest">
                                {isPdf ? 'PDF Portfolio Settings' : 'Page Details'}
                            </h3>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                {isPdf ? 'Bulk Mode' : 'Single Leaf'}
                            </span>
                        </div>

                        {!isPdf && (
                            <div className="grid grid-cols-1 gap-4">
                                {/* Page Number */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                                        <Hash size={12} className="inline mr-1" />
                                        Starting Page Number
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={pageNumber}
                                        onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Page Title (Optional) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                                Page Title (Optional)
                            </label>
                            <input
                                type="text"
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Page ${pageNumber}`}
                            />
                        </div>
                    </div>
                )}

                {/* Error Reporting */}
                {error && (
                    <div className="text-red-600 text-[11px] font-bold uppercase tracking-widest bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-3">
                        <X size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Post-Upload Success & URL Display */}
                {uploadedUrl && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/20 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                                <Check size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    {pageCount > 0 ? `${pageCount} Pages Processed` : 'Page Successfully Deployed'}
                                </p>
                                <p className="text-[10px] text-emerald-600/70 font-medium">
                                    {pageCount > 0 ? 'PDF has been split and synchronized to Firestore.' : 'Asset is now live in the global reader CDN.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-800 rounded-lg border border-emerald-200/50 dark:border-emerald-900/20">
                            <Link2 size={12} className="text-slate-400" />
                            <input
                                readOnly
                                value={uploadedUrl}
                                className="bg-transparent text-[10px] text-slate-600 dark:text-zinc-400 font-mono flex-1 outline-none"
                            />
                            <button
                                onClick={() => copyToClipboard(uploadedUrl)}
                                className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded text-blue-600 transition-colors"
                                title="Copy asset path"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Primary Action Button */}
                {image && !uploadedUrl && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-950/10"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Transmitting...
                            </>
                        ) : (
                            <>
                                <Zap size={16} className="text-blue-500" fill="currentColor" />
                                Execute Publication
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
