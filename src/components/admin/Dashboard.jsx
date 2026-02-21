import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Users, Newspaper, Zap, TrendingUp, TrendingDown, Clock, MousePointer2 } from 'lucide-react';

const Dashboard = ({ stats, editions }) => {
    const statCards = [
        { label: 'Total Inventory', value: stats.totalEditions, sub: '+2 this month', trend: 'up', icon: <Newspaper size={20} />, color: 'blue' },
        { label: 'Cloud Reach', value: `${(stats.totalReaders / 1000).toFixed(1)}k`, sub: '+12% traffic', trend: 'up', icon: <Users size={20} />, color: 'purple' },
        { label: 'Active Streams', value: stats.activeEditions, sub: 'All systems green', trend: 'up', icon: <Activity size={20} />, color: 'green' },
        { label: 'Critical Errors', value: stats.lowBattery, sub: 'Require attention', trend: 'down', icon: <AlertTriangle size={20} />, color: 'red' }
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="premium-card p-6 flex flex-col justify-between group cursor-default"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stat.sub.split(' ')[0]}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Newsroom Performance Grid */}
                <div className="lg:col-span-2 premium-card p-8 bg-[#111827]/50">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Active Edition Pulse</h3>
                            <p className="text-xs text-gray-500 mt-1">Real-time engagement across top 4 publishing nodes.</p>
                        </div>
                        <button className="text-[11px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Generate Report</button>
                    </div>

                    <div className="space-y-8">
                        {editions.slice(0, 4).map((edition) => (
                            <div key={edition.id} className="flex items-center gap-6 group">
                                <div className="w-14 h-18 bg-[#1f2937] rounded-lg overflow-hidden border border-white/5 shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-500">
                                    <img src={edition.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-white truncate">{edition.name}</h4>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <MousePointer2 size={12} className="text-blue-500" />
                                            {edition.readers} Clicks
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(edition.readers / 5000) * 100}%` }}
                                            className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${edition.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                            {edition.status}
                                        </span>
                                        <span className="text-[9px] text-gray-600 flex items-center gap-1 font-bold">
                                            <Clock size={10} /> {edition.lastSync}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <Zap size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Activity Feed */}
                <div className="premium-card p-8 border-dashed border-white/10 bg-transparent flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Live Updates</h3>
                    <div className="flex-1 space-y-6">
                        {[
                            { time: '2m ago', user: 'Admin', act: 'Published "Morning Express"', color: 'blue' },
                            { time: '15m ago', user: 'System', act: 'Auto-sync successful', color: 'green' },
                            { time: '1h ago', user: 'Security', act: 'Role updated for user_22', color: 'purple' },
                            { time: '4h ago', user: 'Bot', act: 'Image optimization complete', color: 'yellow' },
                            { time: '8h ago', user: 'System', act: 'Scheduled backup sequence', color: 'gray' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 items-start relative pb-6 group">
                                <div className={`w-2.5 h-2.5 mt-1 rounded-full bg-${log.color}-500 shadow-[0_0_8px_rgba(37,99,235,0.3)] z-10 shrink-0`} />
                                {i !== 4 && <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-white/5" />}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors leading-tight">{log.act}</p>
                                    <p className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-widest">{log.user} • {log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Clear Session Logs</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
