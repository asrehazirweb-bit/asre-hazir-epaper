import React, { useState } from 'react';
import { uploadToStorage } from '../services/storageService';
import { saveEdition, addEpaperPage } from '../services/epaperService';
import { Upload, X, Check, Image as ImageIcon, Loader2, FileText, Zap, Calendar, Type } from 'lucide-react';

const ImageUploader = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [preview, setPreview] = useState(null);
    const [thumbPreview, setThumbPreview] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const [editionTitle, setEditionTitle] = useState('');
    const [editionDate, setEditionDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPdf, setIsPdf] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const isPdfFile = selectedFile.type === 'application/pdf';
            const maxSize = isPdfFile ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

            if (selectedFile.size > maxSize) {
                setError(`File too large! Maximum ${isPdfFile ? '50MB for PDFs' : '5MB for images'}.`);
                return;
            }

            setFile(selectedFile);
            setIsPdf(isPdfFile);
            setPreview(isPdfFile ? null : URL.createObjectURL(selectedFile));
            setError(null);

            if (!editionTitle) {
                const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
                setEditionTitle(nameWithoutExt);
            }
        }
    };

    const handleThumbnailChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('Thumbnail must be under 2MB.');
                return;
            }
            setThumbnail(selectedFile);
            setThumbPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!editionTitle) {
            setError('Please enter an edition title.');
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            let fileUrl = '';
            let thumbnailUrl = '';

            // 1. Upload Main Asset
            const assetPath = isPdf ? 'epaper/pdfs' : 'epaper/images';
            fileUrl = await uploadToStorage(file, assetPath, (p) => setProgress(Math.round(p * 0.9)));

            // 2. Upload Thumbnail if exists
            if (thumbnail) {
                thumbnailUrl = await uploadToStorage(thumbnail, 'epaper/thumbnails');
            } else if (!isPdf) {
                thumbnailUrl = fileUrl; // For images, use the image itself as thumbnail
            }

            // 3. Create Edition
            const editionId = await saveEdition({
                name: editionTitle,
                editionDate: editionDate,
                type: isPdf ? 'pdf' : 'image',
                fileUrl: fileUrl,
                thumbnailUrl: thumbnailUrl,
                status: 'published',
                isActive: true
            });

            // 4. If image, also add as Page 1 for legacy support in mapping
            if (!isPdf) {
                await addEpaperPage({
                    editionDate,
                    pageNumber: 1,
                    imageUrl: fileUrl,
                    title: 'Front Page'
                });
            }

            console.log('✅ Edition Deployed Successfully:', editionId);
            if (onUploadComplete) onUploadComplete(fileUrl);

            // Success State Reset
            setProgress(100);
            setTimeout(() => {
                handleClear();
            }, 2000);

        } catch (err) {
            console.error('❌ Deployment Failed:', err);
            setError(err.message || 'System fault during transmission.');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setFile(null);
        setThumbnail(null);
        setPreview(null);
        setThumbPreview(null);
        setError(null);
        setProgress(0);
        setEditionTitle('');
    };

    return (
        <div className="w-full font-sans max-w-2xl mx-auto">
            <div className="space-y-6">
                {/* Main Asset Selection */}
                <div className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${file ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/50 bg-white/5'}`}>
                    {file ? (
                        <div className="space-y-4">
                            {isPdf ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-24 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col items-center justify-center">
                                        <FileText className="text-red-500" size={32} />
                                        <span className="text-[10px] font-black text-red-500 mt-2">PDF</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">{file.name}</p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB // Secure Asset</p>
                                </div>
                            ) : (
                                <div className="relative inline-block group">
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-2xl shadow-2xl border-4 border-white/5" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                        <ImageIcon className="text-white" size={32} />
                                    </div>
                                </div>
                            )}

                            {!uploading && (
                                <button onClick={handleClear} className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Replace Asset
                                </button>
                            )}
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center py-10 group">
                            <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/5">
                                <Upload className="text-blue-500" size={32} />
                            </div>
                            <span className="text-lg font-bold text-white mb-2">Deploy New Edition</span>
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Images (5MB) or PDF Portfolio (50MB)</span>
                            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Metadata Fields */}
                {file && !uploading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    <Type size={12} className="text-blue-500" /> Edition Title
                                </label>
                                <input
                                    type="text"
                                    value={editionTitle}
                                    onChange={(e) => setEditionTitle(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-black/40 border border-white/5 rounded-2xl text-white text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                    placeholder="Morning Express..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                    <Calendar size={12} className="text-blue-500" /> Publication Date
                                </label>
                                <input
                                    type="date"
                                    value={editionDate}
                                    onChange={(e) => setEditionDate(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-black/40 border border-white/5 rounded-2xl text-white text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Thumbnail Upload (Optional for PDFs) */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                Cover Thumbnail {isPdf && <span className="text-blue-500 font-black">(Required for PDF)</span>}
                            </label>
                            <label className={`w-full h-[154px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${thumbPreview ? 'border-solid border-white/10' : 'border-white/5 hover:border-blue-500/30 bg-black/20'}`}>
                                {thumbPreview ? (
                                    <img src={thumbPreview} alt="Thumb" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <>
                                        <ImageIcon size={24} className="text-gray-600 mb-2" />
                                        <span className="text-[9px] font-black text-gray-600 uppercase">Select Cover</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                            </label>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                    <div className="space-y-4 bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-pulse">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-blue-500">Transmitting to Firebase Cluster...</span>
                            <span className="text-white">{progress}%</span>
                        </div>
                        <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Error Logic */}
                {error && (
                    <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <X size={16} /> {error}
                    </div>
                )}

                {/* Execute Button */}
                {file && !uploading && progress < 100 && (
                    <button
                        onClick={handleUpload}
                        className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
                    >
                        <Zap size={18} fill="currentColor" />
                        Execute Publication Node
                    </button>
                )}

                {progress === 100 && (
                    <div className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-green-600/20">
                        <Check size={18} />
                        Mission Successful
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
