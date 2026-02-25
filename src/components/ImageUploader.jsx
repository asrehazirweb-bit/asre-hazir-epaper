import React, { useState } from 'react';
import { uploadToStorage } from '../services/storageService';
import { saveEdition, addEpaperPage } from '../services/epaperService';
import { Upload, X, Check, Image as ImageIcon, Loader2, FileText, Zap, Calendar, Type, AlertCircle } from 'lucide-react';

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

        if (isPdf && !thumbnail) {
            setError('First Page Image is required for PDFs to show a preview!');
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
                <div className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${file ? 'border-[#AA792D] bg-[#AA792D]/5' : 'border-gray-100 hover:border-[#AA792D]/30 bg-gray-50'}`}>
                    {file ? (
                        <div className="space-y-4">
                            {isPdf ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-24 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center">
                                        <FileText className="text-red-500" size={32} />
                                        <span className="text-[10px] font-black text-red-500 mt-2">PDF</span>
                                    </div>
                                    <p className="text-sm font-bold text-[#2B2523]">{file.name}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB // Secure Asset</p>
                                </div>
                            ) : (
                                <div className="relative inline-block group">
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-2xl shadow-2xl border-4 border-white" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                        <ImageIcon className="text-white" size={32} />
                                    </div>
                                </div>
                            )}

                            {!uploading && (
                                <button onClick={handleClear} className="px-4 py-2 bg-white hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100">
                                    Replace Asset
                                </button>
                            )}
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center py-10 group">
                            <div className="w-20 h-20 bg-[#AA792D]/10 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#AA792D]/5">
                                <Upload className="text-[#AA792D]" size={32} />
                            </div>
                            <span className="text-lg font-black text-[#2B2523] uppercase italic mb-2">Deploy New Edition</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Images (5MB) or PDF Portfolio (50MB)</span>
                            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Metadata & PDF Preview Required Section */}
                {file && !uploading && (
                    <div className="space-y-6">
                        {isPdf && !thumbnail && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                <div>
                                    <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Preview Required</p>
                                    <p className="text-[10px] text-amber-700 font-medium mt-1 uppercase tracking-wide">Bhai, PDF ke liye First Page ki image upload karna zaroori hai taake readers preview dekh sakein.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Type size={12} className="text-[#AA792D]" /> Edition Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editionTitle}
                                        onChange={(e) => setEditionTitle(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[#2B2523] text-sm font-bold focus:border-[#AA792D]/50 focus:bg-white outline-none transition-all"
                                        placeholder="Morning Express..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Calendar size={12} className="text-[#AA792D]" /> Publication Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editionDate}
                                        onChange={(e) => setEditionDate(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[#2B2523] text-sm font-bold focus:border-[#AA792D]/50 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Thumbnail Upload (Required for PDFs for Preview) */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    First Page Preview {isPdf && <span className="text-[#AA792D] font-black">(REQUIRED)</span>}
                                </label>
                                <label className={`w-full h-[154px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${thumbPreview ? 'border-solid border-gray-200' : 'border-gray-100 hover:border-[#AA792D]/30 bg-gray-50'}`}>
                                    {thumbPreview ? (
                                        <img src={thumbPreview} alt="Thumb" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <>
                                            <ImageIcon size={24} className="text-gray-300 mb-2 group-hover:text-[#AA792D]" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase group-hover:text-[#AA792D]">Upload Page 1 Image</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                    <div className="space-y-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-[#AA792D]">Transmitting to Cloud Cluster...</span>
                            <span className="text-[#2B2523]">{progress}%</span>
                        </div>
                        <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <div className="h-full bg-[#AA792D] transition-all duration-300 shadow-[0_0_10px_rgba(170,121,45,0.4)]" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Error Logic */}
                {error && (
                    <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Execute Button */}
                {file && !uploading && progress < 100 && (
                    <button
                        onClick={handleUpload}
                        className="w-full py-5 bg-[#AA792D] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[#8B6123] transition-all shadow-xl shadow-[#AA792D]/20 active:scale-[0.98]"
                    >
                        <Zap size={18} fill="currentColor" />
                        Execute Publication Node
                    </button>
                )}

                {progress === 100 && (
                    <div className="w-full py-5 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-green-500/20">
                        <Check size={18} />
                        Edition Deployed Successfully
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
