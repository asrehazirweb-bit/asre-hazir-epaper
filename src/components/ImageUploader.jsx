import React, { useState } from 'react';
import { uploadToStorage } from '../services/storageService';
import { saveEdition, addEpaperPage } from '../services/epaperService';
import { Upload, X, Check, Image as ImageIcon, Loader2, FileText, Zap, Calendar, Type, AlertCircle } from 'lucide-react';
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const ImageUploader = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusLabel, setStatusLabel] = useState('');
    const [error, setError] = useState(null);

    const [editionTitle, setEditionTitle] = useState('');
    const [editionDate, setEditionDate] = useState(new Date().toISOString().split('T')[0]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const maxSize = 100 * 1024 * 1024; // 100MB Limit
            if (selectedFile.size > maxSize) {
                setError(`File too large! Maximum 100MB.`);
                return;
            }
            setFile(selectedFile);
            setError(null);
            if (!editionTitle) {
                const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
                setEditionTitle(nameWithoutExt);
            }
        }
    };

    const processPdfConversion = async (pdfFile, editionId) => {
        setStatusLabel('Initializing Conversion Engine...');
        if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = PDFJS_CDN;
            document.head.appendChild(script);
            await new Promise(r => script.onload = r);
        }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdf.numPages;
        const imageUrls = [];

        for (let i = 1; i <= totalPages; i++) {
            setStatusLabel(`Rendering & Syncing Page ${i} / ${totalPages}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            const pageFile = new File([blob], `page_${i}.jpg`, { type: 'image/jpeg' });

            const url = await uploadToStorage(pageFile, `epaper/editions/${editionId}`);
            imageUrls.push(url);

            await addEpaperPage({
                editionDate,
                pageNumber: i,
                imageUrl: url,
                title: `Page ${i}`
            });

            setProgress(Math.round((i / totalPages) * 100));
        }
        return { imageUrls, totalPages };
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
        setStatusLabel('Securing Asset Node...');

        try {
            // 1. Upload original PDF
            setStatusLabel('Transmitting Master PDF...');
            const fileUrl = await uploadToStorage(file, 'epaper/pdfs', (p) => setProgress(p * 0.1));

            // 2. Create Edition Placeholder
            const editionId = await saveEdition({
                name: editionTitle,
                editionDate: editionDate,
                type: 'pdf-images',
                fileUrl: fileUrl,
                status: 'published',
                isActive: true
            });

            // 3. Automated Conversion
            const conversionResult = await processPdfConversion(file, editionId);
            const pageCount = conversionResult.totalPages;
            const thumbnailUrl = conversionResult.imageUrls[0];

            // 4. Update Edition
            await saveEdition({
                id: editionId,
                thumbnailUrl: thumbnailUrl,
                pageCount: pageCount
            });

            setStatusLabel('Archive Published Successfully');
            if (onUploadComplete) onUploadComplete(fileUrl);
            setProgress(100);
            setTimeout(() => handleClear(), 2000);
        } catch (err) {
            console.error('❌ Publication Fault:', err);
            setError(err.message || 'Transmission Error in Blaze Cluster.');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setFile(null);
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
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-20 h-24 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center">
                                    <FileText className="text-red-500" size={32} />
                                    <span className="text-[10px] font-black text-red-500 mt-2">PDF</span>
                                </div>
                                <p className="text-sm font-bold text-[#2B2523]">{file.name}</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB // Secure Asset</p>
                            </div>

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
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">PDF Document Only (100MB Max)</span>
                            <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Metadata Entry Zone */}
                {file && !uploading && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                    <div className="space-y-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-[#AA792D]">{statusLabel}</span>
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
