import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Users, Newspaper, Zap, TrendingUp, TrendingDown, Clock, MousePointer2 } from 'lucide-react';

const Dashboard = ({ stats, editions }) => {
    const statCards = [
        { label: 'Total Inventory', value: stats.totalEditions, sub: '+2 this month', trend: 'up', icon: <Newspaper size={20} />, color: '#AA792D' },
        { label: 'Cloud Reach', value: `${(stats.totalReaders / 1000).toFixed(1)}k`, sub: '+12% traffic', trend: 'up', icon: <Users size={20} />, color: '#AA792D' },
        { label: 'Active Streams', value: stats.activeEditions, sub: 'All systems green', trend: 'up', icon: <Activity size={20} />, color: '#AA792D' },
        { label: 'Critical Errors', value: stats.lowBattery, sub: 'Require attention', trend: 'down', icon: <AlertTriangle size={20} />, color: 'red' }
    ];

    return (
        <div className="space-y-6 md:space-y-8 pb-12 px-2 sm:px-0">
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(statCards || []).map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="premium-card p-4 md:p-6 flex flex-col justify-between group cursor-default"
                        style={{ background: 'white' }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stat?.sub?.split(' ')[0]}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[9px] md:text-[11px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="text-2xl md:text-3xl font-black text-[#2B2523] tracking-tight">{stat.value}</div>
                            <p className="text-[9px] md:text-[10px] text-gray-400 mt-2 font-medium">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Newsroom Performance Grid */}
                <div className="lg:col-span-2 premium-card p-5 md:p-8 bg-white border border-gray-100">
                    <div className="flex items-center justify-between mb-8 md:mb-10">
                        <div>
                            <h3 className="text-base md:text-lg font-black text-[#2B2523] tracking-tight uppercase italic">Active Edition Pulse</h3>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-widest">Real-time engagement node metrics.</p>
                        </div>
                        <button className="text-[9px] md:text-[11px] font-bold text-[#AA792D] uppercase tracking-widest hover:text-[#8B6123] transition-colors">Generate Report</button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        {(editions || []).slice(0, 4).map((edition) => (
                            <div key={edition.id} className="flex items-center gap-4 md:gap-6 group">
                                <div className="w-12 md:w-14 h-16 md:h-18 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 shadow-lg group-hover:scale-105 transition-all duration-500">
                                    <img src={edition.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs md:text-sm font-black text-[#2B2523] uppercase truncate">{edition.name}</h4>
                                        <div className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <MousePointer2 size={10} className="text-[#AA792D]" />
                                            {edition.readers}
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(edition.readers / 5000) * 100}%` }}
                                            className="h-full bg-[#AA792D] rounded-full shadow-[0_0_10px_rgba(170,121,45,0.2)]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${edition.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                            {edition.status}
                                        </span>
                                        <span className="text-[9px] text-gray-400 flex items-center gap-1 font-bold">
                                            <Clock size={10} /> {edition.lastSync}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2.5 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-[#AA792D] transition-all opacity-0 group-hover:opacity-100">
                                    <Zap size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Activity Feed */}
                <div className="premium-card p-5 md:p-8 bg-white border border-gray-100 flex flex-col shadow-sm">
                    <h3 className="text-[11px] md:text-sm font-black text-[#2B2523] uppercase tracking-widest mb-6 md:mb-8 border-b border-gray-50 pb-4 italic">Live Activity Stream</h3>
                    <div className="flex-1 space-y-6">
                        {[
                            { time: '2m ago', user: 'Admin', act: 'Published "Morning Express"', color: '#AA792D' },
                            { time: '15m ago', user: 'System', act: 'Auto-sync successful', color: '#10B981' },
                            { time: '1h ago', user: 'Security', act: 'Role updated for user_22', color: '#8B5CF6' },
                            { time: '4h ago', user: 'Bot', act: 'Image optimization complete', color: '#F59E0B' },
                            { time: '8h ago', user: 'System', act: 'Scheduled backup sequence', color: '#6B7280' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 items-start relative pb-6 group">
                                <div className="w-2.5 h-2.5 mt-1 rounded-full z-10 shrink-0" style={{ backgroundColor: log.color, boxShadow: `0 0 10px ${log.color}40` }} />
                                {i !== 4 && <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-gray-50" />}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 group-hover:text-[#2B2523] transition-colors leading-tight">{log.act}</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{log.user} • {log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#2B2523] transition-all">Clear Stream Logs</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
