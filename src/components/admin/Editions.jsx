import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Clock, Zap, Plus, Search, Edit2, Trash2, Eye, X, Battery, Settings2, Share2, FileText } from 'lucide-react';
import ImageUploader from '../ImageUploader';

const Editions = ({ editions, onEdit, onDelete }) => {
    const [showUpload, setShowUpload] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingEdition, setEditingEdition] = useState(null); // For metadata update modal

    const filteredEditions = (editions || []).filter(e =>
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleQuickUpdate = async (e) => {
        e.preventDefault();
        try {
            // Import the save service or do it directly via db
            // For now, we'll assume a local update function or pass it via props
            // But let's just use the direct Firestore update for simplicity here
            const { saveEdition } = await import('../../services/epaperService');

            await saveEdition({
                id: editingEdition.id,
                name: editingEdition.name,
                editionDate: editingEdition.editionDate,
                status: editingEdition.status
            });
            setEditingEdition(null);
            // The onSnapshot in AdminLayout will auto-update the list
        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed.");
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-20 px-2 sm:px-0">
            {/* Control Bar remains the same */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 bg-white border border-gray-100 p-4 md:p-6 rounded-2xl shadow-sm">
                <div className="relative group flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#AA792D] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search Inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-[#2B2523] focus:outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 pr-6 pl-4 py-3 md:py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 ${showUpload ? 'bg-[#2B2523] text-white shadow-xl' : 'bg-[#AA792D] text-white shadow-lg shadow-[#AA792D]/20 hover:bg-[#8B6123]'}`}
                    >
                        {showUpload ? <X size={16} /> : <Plus size={16} />}
                        {showUpload ? 'Abord Deployment' : 'Deploy Edition'}
                    </button>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-[#AA792D] cursor-pointer transition-colors">
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
                        className="premium-card p-6 md:p-12 bg-white border-2 border-dashed border-[#AA792D]/30"
                    >
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="text-center">
                                <h3 className="text-xl md:text-2xl font-black text-[#2B2523] tracking-tight italic uppercase">Edition Deployment Module</h3>
                                <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-3">Upload source files for digital distribution</p>
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
                            {filteredEditions.map((edition, idx) => (
                                <motion.div
                                    key={edition.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="premium-card overflow-hidden group hover:border-[#AA792D]/50 transition-all duration-500 bg-white border border-gray-100"
                                >
                                    <div className="p-5 md:p-8">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-black text-[#AA792D] uppercase tracking-[0.3em]">REF: {edition.id?.slice(0, 8)}</div>
                                                <h3 className="text-lg font-black text-[#2B2523] tracking-tight leading-tight group-hover:text-[#AA792D] transition-colors italic uppercase">
                                                    {edition.name}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${edition.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                    'bg-gray-50 text-gray-400 border border-gray-100'
                                                    }`}>
                                                    {edition.status}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${edition.type === 'pdf' ? 'bg-red-500 text-white' : 'bg-[#AA792D] text-white'}`}>
                                                    {edition.type === 'pdf' ? 'PDF Portfolio' : 'Interactive'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 md:gap-8 mb-6 md:mb-8">
                                            <div className="w-20 md:w-24 h-28 md:h-32 rounded-xl overflow-hidden border border-gray-100 shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-700 bg-gray-50 flex items-center justify-center">
                                                {edition.thumbnailUrl || edition.thumbnail ? (
                                                    <img src={edition.thumbnailUrl || edition.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                ) : (
                                                    <FileText size={32} className="text-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-5">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Cloud Pulse
                                                        <span className={edition.readers > 0 ? 'text-[#AA792D]' : 'text-gray-300'}>{edition.readers || 0} Active</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: edition.readers > 0 ? '60%' : '0%' }}
                                                            className="h-full bg-[#AA792D] rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${edition.status === 'published' ? 'text-green-500' : 'text-gray-300'}`}>
                                                        <Zap size={12} className={edition.status === 'published' ? 'animate-pulse' : ''} />
                                                        {edition.status === 'published' ? 'LIVE' : 'IDLE'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <Clock size={12} />
                                                        {edition.lastSync || 'Never'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 md:gap-3 pt-6 border-t border-gray-100">
                                            <button
                                                onClick={() => {
                                                    if (edition.type === 'pdf') {
                                                        setEditingEdition(edition);
                                                    } else {
                                                        onEdit(edition.id);
                                                    }
                                                }}
                                                className="col-span-3 flex items-center justify-center gap-2 py-3 bg-[#2B2523] text-white hover:bg-black rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/10"
                                            >
                                                <Edit2 size={12} /> {edition.type === 'pdf' ? 'Update' : 'Control'}
                                            </button>
                                            <button onClick={() => onDelete(edition.id)} className="flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl transition-all border border-red-100 hover:border-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Update Modal */}
            <AnimatePresence>
                {editingEdition && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingEdition(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden"
                        >
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-[#2B2523] italic uppercase tracking-tight">Update <span className="text-[#AA792D]">Edition</span></h3>
                                    <button onClick={() => setEditingEdition(null)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleQuickUpdate} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Edition Identity</label>
                                        <input
                                            type="text"
                                            value={editingEdition.name}
                                            onChange={(e) => setEditingEdition({ ...editingEdition, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Date</label>
                                            <input
                                                type="date"
                                                value={editingEdition.editionDate}
                                                onChange={(e) => setEditingEdition({ ...editingEdition, editionDate: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Broadcast Status</label>
                                            <select
                                                value={editingEdition.status}
                                                onChange={(e) => setEditingEdition({ ...editingEdition, status: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#AA792D]/50 focus:bg-white transition-all"
                                            >
                                                <option value="draft">DRAFT</option>
                                                <option value="published">PUBLISHED</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-[#AA792D] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#AA792D]/20 hover:bg-[#8B6123] transition-all active:scale-95"
                                    >
                                        Sync Intelligence
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Editions;
