import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Clock, Zap, Plus, Search, Edit2, Trash2, Eye, X, Battery, Settings2, Share2 } from 'lucide-react';
import ImageUploader from '../ImageUploader';

const Editions = ({ editions, onEdit, onDelete, searchQuery, setSearchQuery }) => {
    const [showUpload, setShowUpload] = useState(false);

    return (
        <div className="space-y-8 pb-20">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-2xl">
                <div className="relative group flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search Inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-[#0B0F19]/50 border border-white/5 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`flex items-center gap-2 pr-6 pl-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${showUpload ? 'bg-white text-black' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'}`}
                    >
                        {showUpload ? <X size={18} /> : <Plus size={18} />}
                        {showUpload ? 'Close Dashboard' : 'Deploy Edition'}
                    </button>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors">
                        <Settings2 size={20} />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showUpload ? (
                    <motion.div
                        key="upload-zone"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="premium-card p-12 bg-[#111827]/80 border-dashed border-blue-500/30"
                    >
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white tracking-tight italic">Edition Deployment Module</h3>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Upload source files for digital distribution</p>
                            </div>
                            <ImageUploader onUploadComplete={(url) => {
                                console.log('New edition ready:', url);
                                setShowUpload(false);
                            }} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid-zone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {editions.map((edition, idx) => (
                                <motion.div
                                    key={edition.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="premium-card overflow-hidden group hover:border-blue-500/50 transition-all duration-500"
                                >
                                    <div className="p-8">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">REF: {edition.id.slice(0, 8)}</div>
                                                <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                                                    {edition.name}
                                                </h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${edition.status === 'published' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                }`}>
                                                {edition.status}
                                            </span>
                                        </div>

                                        <div className="flex gap-8 mb-8">
                                            <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/10 shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-700">
                                                <img src={edition.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center space-y-5">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                        Device Pulse
                                                        <span className={edition.online ? 'text-blue-500' : 'text-gray-500'}>{edition.readers} Active</span>
                                                    </div>
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: edition.online ? '100%' : '0%' }}
                                                            className="h-full bg-blue-600 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className={`flex items-center gap-2 text-[10px] font-bold ${edition.battery < 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                                        <Battery size={14} className={edition.battery < 30 ? 'animate-pulse' : ''} />
                                                        {edition.battery}%
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                                        <Clock size={12} />
                                                        {edition.lastSync}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-3 pt-6 border-t border-white/5">
                                            <button onClick={() => onEdit(edition.id)} className="col-span-2 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                                                <Edit2 size={14} /> Control
                                            </button>
                                            <button className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-3 rounded-xl transition-all border border-transparent hover:border-white/10">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => onDelete(edition.id)} className="flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl transition-all group-hover:shadow-lg group-hover:shadow-red-500/10">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Editions;
