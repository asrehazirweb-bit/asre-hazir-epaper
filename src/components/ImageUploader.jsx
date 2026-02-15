import React, { useState } from 'react';
import { uploadImage } from '../utils/cloudinary';
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageUploader = ({ onUploadComplete }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);

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

        setUploading(true);
        setError(null);

        try {
            // Upload to 'epaper' folder by default
            const url = await uploadImage(image, 'epaper');
            setUploadedUrl(url);
            if (onUploadComplete) onUploadComplete(url);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Upload failed');
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

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto my-8 font-sans">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <ImageIcon size={20} className="text-blue-600" />
                Upload E-Paper Page
            </h3>

            <div className="space-y-4">
                {/* Upload Area */}
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${preview ? 'border-blue-500 bg-blue-50/10' : 'border-slate-300 hover:border-blue-400'}`}>
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded shadow-sm" />
                            {!uploading && (
                                <button
                                    onClick={handleClear}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border hover:bg-red-50 text-red-500"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                            <Upload className="text-slate-400 mb-2" size={32} />
                            <span className="text-sm font-medium text-slate-600">Click to select page image</span>
                            <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded flex items-center gap-2">
                        <X size={14} />
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {uploadedUrl && (
                    <div className="text-green-600 text-sm bg-green-50 p-3 rounded flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-medium">
                            <Check size={14} />
                            Upload Successful
                        </div>
                        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline break-all text-green-700">
                            {uploadedUrl}
                        </a>
                    </div>
                )}

                {/* Action Button */}
                {image && !uploadedUrl && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload to Cloudinary
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
