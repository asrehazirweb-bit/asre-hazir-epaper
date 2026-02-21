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
    const [language, setLanguage] = useState('english');

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setUploadedUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!image) return;
        if (!pageNumber || pageNumber < 1) {
            setError('Please enter a valid page number');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Step 1: Upload image to Cloudinary
            const url = await uploadImage(image, 'epaper');
            setUploadedUrl(url);

            // Step 2: Save page data to Firestore
            const pageData = {
                pageNumber: parseInt(pageNumber),
                imageUrl: url,
                title: pageTitle || `Page ${pageNumber}`,
                language: language,
                editionDate: new Date().toISOString().split('T')[0],
                published: true,
                articles: [] // Empty for now, can be added later
            };

            await addEpaperPage(pageData);

            console.log('✅ Page uploaded and saved to Firestore:', pageData);

            if (onUploadComplete) onUploadComplete(url);
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
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center py-6">
                            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-zinc-700 mb-4">
                                <Upload className="text-blue-600" size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">Select Edition Assets</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-Res JPG or PNG</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Page Metadata Inputs */}
                {preview && !uploadedUrl && (
                    <div className="space-y-4 bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-widest mb-3">
                            Page Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Page Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                                    <Hash size={12} className="inline mr-1" />
                                    Page Number
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={pageNumber}
                                    onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="1"
                                />
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                                    Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="english">English</option>
                                    <option value="urdu">Urdu</option>
                                </select>
                            </div>
                        </div>

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
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Page Successfully Deployed</p>
                                <p className="text-[10px] text-emerald-600/70 font-medium">Asset is now live in the global reader CDN.</p>
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
