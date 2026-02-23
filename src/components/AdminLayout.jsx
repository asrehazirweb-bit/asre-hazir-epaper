import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import {
    onSnapshot,
    collection,
    query,
    where,
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
    ExternalLink,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from './ImageUploader';

// Import Admin Sections
import Dashboard from './admin/Dashboard';
import Editions from './admin/Editions';
import EditionEditor from './admin/EditionEditor';
import { deleteEditionCascade } from '../services/epaperService';

const AdminLayout = ({ user, onBack }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [editions, setEditions] = useState([]);
    const [liveStats, setLiveStats] = useState({
        totalEditions: 0,
        activeEditions: 0,
        lowBattery: 0,
        totalReaders: 0
    });
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
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

    const handleDeleteEdition = async (editionId) => {
        if (window.confirm('🚨 Are you absolutely sure? This will delete the entire edition, all pages, and all article mappings. This action cannot be undone.')) {
            try {
                setLoading(true);
                await deleteEditionCascade(editionId);
                console.log('✅ Edition purged from system.');
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Deletion failed. Check console for details.');
            } finally {
                setLoading(false);
            }
        }
    };

    const navItems = [
        { path: '/admin/dashboard', id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/editions', id: 'editions', label: 'Editions', icon: <Newspaper size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#0B0F19] text-white overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <aside className={`bg-[#111827] border-r border-white/5 transition-all duration-300 flex flex-col shrink-0 ${collapsed ? 'w-24' : 'w-72'}`}>
                {/* Logo Section */}
                <div className="h-24 flex items-center px-8 border-b border-white/5">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <Newspaper size={20} className="text-white" />
                    </div>
                    {!collapsed && (
                        <div className="ml-4 animate-in fade-in slide-in-from-left-4">
                            <h1 className="text-sm font-black uppercase tracking-tighter italic leading-none">ASRE HAZIR</h1>
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Admin Console</p>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <div className={`${collapsed ? 'mx-auto' : ''}`}>{item.icon}</div>
                            {!collapsed && <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/5 bg-[#0B0F19]/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                        <LogOut size={20} className={collapsed ? 'mx-auto' : ''} />
                        {!collapsed && <span>System Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Global Header */}
                <header className="h-20 glass-panel border-b border-white/10 px-8 flex items-center justify-between z-40 relative">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-500"
                        >
                            <Layout size={18} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Activity size={14} className={isConnected ? "text-green-500" : "text-red-500"} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isConnected ? "Live Engine Link" : "Link Interrupted"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.open('/', '_blank')}
                            className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 group"
                        >
                            <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" />
                            View Live E-Paper Portal
                        </button>

                        <div className="h-8 w-px bg-white/10 mx-2" />

                        <div className="flex items-center gap-4 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white uppercase tracking-tight">{user?.displayName || 'System Admin'}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20 flex items-center justify-center font-black italic shadow-inner">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    user?.displayName?.charAt(0) || 'A'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Viewer */}
                <div className="flex-1 overflow-y-auto bg-[#0B0F19] relative custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-10 h-full">
                        <Routes>
                            <Route index element={<Dashboard stats={liveStats} editions={editions} />} />
                            <Route path="dashboard" element={<Dashboard stats={liveStats} editions={editions} />} />
                            <Route path="editions" element={
                                <Editions
                                    editions={editions}
                                    onEdit={(id) => navigate(`/admin/editions/edit/${id}`)}
                                    onDelete={handleDeleteEdition}
                                />
                            } />
                            <Route path="editions/edit/:id" element={<EditionEditor />} />
                        </Routes>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
