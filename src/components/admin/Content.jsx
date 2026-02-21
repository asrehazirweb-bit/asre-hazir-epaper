import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Layers, Search, Filter, MessageSquare, FileText, ChevronRight, Sparkles, Languages, Tag, Plus, MoreVertical, Calendar } from 'lucide-react';

const Content = () => {
    const [articles, setArticles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArticles(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const categories = ['All', 'Politics', 'Business', 'Sports', 'World', 'Technology'];

    const filteredArticles = articles.filter(art => {
        const matchesSearch = (art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.content?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = filterCategory === 'All' || art.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* News Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-6 flex-1 max-w-4xl">
                    <div className="relative group w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find Article..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-6 py-2.5 bg-[#0B0F19]/50 border border-white/5 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
                        {categories.slice(0, 4).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95">
                    <Plus size={16} /> Create Post
                </button>
            </div>

            {/* Article Repository Table Style */}
            <div className="premium-card overflow-hidden">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Accessing Repository...</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="p-32 text-center">
                        <FileText size={48} className="mx-auto text-gray-800 mb-6" />
                        <h3 className="text-xl font-bold text-gray-600 uppercase tracking-tight italic">No Results Found</h3>
                        <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide">Adjust your filters to locate required documentation.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left border-b border-white/5 bg-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Document</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden lg:table-cell">Metadata</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredArticles.map((art, idx) => (
                                    <motion.tr
                                        key={art.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-white/5 hover:transition-colors cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-[#1f2937] border border-white/5 overflow-hidden shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                                    {art.thumbnail ? (
                                                        <img src={art.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-80" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600"><FileText size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">{art.title}</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium truncate italic max-w-sm">
                                                        {art.content?.replace(/<[^>]*>/g, '').slice(0, 100)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 hidden lg:table-cell">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={12} className="text-blue-500" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{art.category || 'Standard'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-gray-600" />
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                                        {art.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{art.status || 'Active'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button className="p-2.5 bg-white/5 hover:bg-white text-gray-400 hover:text-black rounded-xl transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2.5 bg-white/5 hover:bg-black text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 group-hover:border-blue-500/10">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Content;
