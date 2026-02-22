import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
    onSnapshot,
    collection,
    query,
    orderBy,
    doc
} from 'firebase/firestore';
import {
    LogOut,
    LayoutDashboard,
    Search,
    RefreshCw,
    User,
    Newspaper,
    AlertTriangle,
    Home,
    Monitor,
    BarChart3,
    Layers,
    Activity,
    Settings as SettingsIcon,
    Clock,
    Zap,
    ChevronLeft,
    ChevronRight,
    Search as SearchIcon,
    Bell,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from './ImageUploader';

// Import Admin Sections
import Dashboard from './admin/Dashboard';
import Editions from './admin/Editions';
import EditionEditor from './admin/EditionEditor';
import Content from './admin/Content';
import Analytics from './admin/Analytics';
import Settings from './admin/Settings';

const AdminLayout = ({ onBack, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [editions, setEditions] = useState([]);
    const [liveStats, setLiveStats] = useState({
        totalEditions: 0,
        activeEditions: 0,
        lowBattery: 0,
        totalReaders: 0
    });
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Unified collection name (MANDATORY FIX 1)
        const q = query(collection(db, 'epaper_editions'), orderBy('createdAt', 'desc'));

        const unsub = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    lastSync: doc.data().lastSync?.toDate?.()?.toLocaleTimeString() || 'Just now'
                }));
                setEditions(data);
                setIsConnected(true);
                setLoading(false);

                setLiveStats({
                    totalEditions: data.length,
                    // Use published status (MANDATORY FIX 4)
                    activeEditions: data.filter(e => e.status === 'published' && e.isActive).length,
                    lowBattery: data.filter(e => e.battery < 30).length,
                    totalReaders: data.reduce((sum, e) => sum + (e.readers || 0), 0)
                });
            },
            (error) => {
                console.error("Dashboard connection error:", error);
                setIsConnected(false);
            }
        );

        return () => unsub();
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        onBack();
    };

    const navItems = [
        { path: '/admin/dashboard', id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/editions', id: 'editions', label: 'Editions', icon: <Newspaper size={20} /> },
        { path: '/admin/content', id: 'content', label: 'Content', icon: <Layers size={20} /> },
        { path: '/admin/analytics', id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { path: '/admin/settings', id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
    ];

    useEffect(() => {
        if (location.pathname === '/admin' || location.pathname === '/admin/') {
            navigate('/admin/dashboard');
        }
    }, [location.pathname, navigate]);

    return (
        <div className="flex h-screen bg-[#0B0F19] text-gray-100 antialiased font-sans overflow-hidden">
            {/* 💎 PREMIUM SIDEBAR */}
            <aside className="w-64 bg-[#111827] border-r border-white/5 flex flex-col z-30">
                {/* Brand Logo */}
                <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white uppercase italic">Asre <span className="text-blue-500">CMS</span></span>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Navigation</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {item.icon}
                            <span className="text-sm font-medium">{item.label}</span>
                            {location.pathname === item.path && (
                                <motion.div layoutId="activeNav" className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/5 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Activity size={14} />
                            </div>
                            <span className="text-xs font-bold text-gray-300">System Live</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full bg-blue-500" style={{ width: isConnected ? '100%' : '30%' }} />
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* 🖥️ MAIN VIEWPORT */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] relative">
                {/* Modern Header */}
                <header className="h-20 glass-panel flex items-center justify-between px-8 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors border border-white/5"
                            title="Back to Reader"
                        >
                            <ChevronLeft size={20} className="text-gray-400" />
                        </button>
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <div>
                            <h2 className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">{location.pathname.split('/').pop()} Control</h2>
                            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{isConnected ? 'System Pulse: Optimal' : 'Connecting to Server...'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search Command..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 transition-all w-64"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0B0F19]" />
                            </button>
                            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <ExternalLink size={20} />
                            </button>
                        </div>

                        <div className="w-px h-8 bg-white/10 mx-2" />

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs font-bold text-white leading-none">{user?.displayName || 'Admin'}</p>
                                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Authorized</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-lg shadow-blue-500/10">
                                <img
                                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=2563EB&color=fff`}
                                    className="w-full h-full object-cover rounded-[10px]"
                                    alt="Avatar"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Sub-Header Area for Branding/Actions */}
                <div className="px-8 pt-8 shrink-0 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">
                            {location.pathname.includes('dashboard') ? 'Executive Insights' :
                                location.pathname.includes('editions') ? 'Edition Management' :
                                    location.pathname.includes('content') ? 'Content Core' :
                                        'System Preferences'}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Monitoring newsroom activity in precision-time.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* VIEW MAIN PORTAL BUTTON (MANDATORY FIX 3) */}
                        <button
                            onClick={() => window.open('/', '_blank')}
                            className="px-5 py-2.5 bg-white text-black hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <Monitor size={14} />
                            View Live E-Paper Portal
                        </button>
                        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                            <Zap size={14} className="fill-current" />
                            Action Point
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 pt-6 scroll-smooth">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="dashboard" element={<Dashboard stats={liveStats} editions={editions} />} />
                            <Route path="editions" element={<Editions editions={editions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onEdit={(id) => navigate(`/admin/editions/${id}`)} />} />
                            <Route path="content" element={<Content />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="settings" element={<Settings user={user} />} />
                            <Route path="editions/:id" element={<EditionEditor />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
