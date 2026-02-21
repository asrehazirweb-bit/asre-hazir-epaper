import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, Share2, Eye, Filter, Download } from 'lucide-react';

const Analytics = () => {
    const mainStats = [
        { label: 'Network Reach', value: '45.2k', change: '+12.5%', trend: 'up', icon: <Users size={18} /> },
        { label: 'Retention Cycle', value: '8m 45s', change: '+1.2%', trend: 'up', icon: <Clock size={18} /> },
        { label: 'Conversion', value: '4.8%', change: '-0.3%', trend: 'down', icon: <Share2 size={18} /> },
        { label: 'Impressions', value: '1.2M', change: '+18.7%', trend: 'up', icon: <Eye size={18} /> }
    ];

    const popularPages = [
        { name: 'Front Page - Morning Edition', views: '24k', engagement: '92%', trend: 'up' },
        { name: 'Business Daily - Section A', views: '18k', engagement: '85%', trend: 'up' },
        { name: 'Sports Special - Weekend', views: '15k', engagement: '78%', trend: 'down' },
        { name: 'Tech Review - Archive', views: '12k', engagement: '81%', trend: 'up' },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Analytics Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
                    {['24 Hours', '7 Days', '30 Days', 'All Time'].map(range => (
                        <button key={range} className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${range === '7 Days' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            {range}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10">
                        <Download size={16} /> Export Data
                    </button>
                </div>
            </div>

            {/* Top Metrics Hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="premium-card p-8 flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-3 bg-white/5 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <div className="text-4xl font-bold text-white tracking-tighter italic">{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Engagement Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Distribution Chart Placeholder */}
                <div className="lg:col-span-2 premium-card p-10 bg-[#111827]/50 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 italic">
                                Daily Reader Velocity
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Aggregate views across all digital platforms.</p>
                        </div>
                    </div>

                    {/* Visual Data Representation */}
                    <div className="h-64 flex items-end justify-between gap-4 px-4 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-5">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-px bg-white w-full" />)}
                        </div>

                        {[40, 65, 30, 85, 45, 95, 70, 50, 80, 60, 90, 55].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative z-10">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className={`w-full rounded-lg transition-all ${h > 70 ? 'bg-blue-600 shadow-xl shadow-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'} shadow-sm relative overflow-hidden`}
                                >
                                    {h > 70 && <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/20" />}
                                </motion.div>
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i % 7]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Pages Heatmap */}
                <div className="premium-card p-10 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-5 italic">Content Heatmap</h3>
                    <div className="flex-1 space-y-10">
                        {popularPages.map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer relative">
                                <div className="space-y-1.5 flex-1 min-w-0 pr-6">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors leading-none">{page.name}</h4>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]">{page.views} Impressions</div>
                                </div>
                                <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black tracking-widest ${page.trend === 'up' ? 'text-blue-500 bg-blue-500/5' : 'text-gray-500 bg-white/5'}`}>
                                    {page.engagement}
                                </div>
                                <div className="absolute -bottom-5 left-0 right-0 h-px bg-white/5" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-12 py-5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5">Full Behavioral Report</button>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
