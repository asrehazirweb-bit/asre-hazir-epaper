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
import ConfirmModal from './ConfirmModal';

const AdminLayout = ({ user, onBack }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [editions, setEditions] = useState([]);
    const [liveStats, setLiveStats] = useState({
        totalEditions: 0,
        activeEditions: 0,
        lowBattery: 0,
        totalReaders: 0
    });
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [confirmDeleteState, setConfirmDeleteState] = useState({ isOpen: false, editionId: null });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const handleDeleteEdition = (editionId) => {
        setConfirmDeleteState({ isOpen: true, editionId });
    };

    const confirmPurge = async () => {
        const editionId = confirmDeleteState.editionId;
        if (!editionId) return;

        try {
            setLoading(true);
            await deleteEditionCascade(editionId);
            console.log('✅ Edition purged from system.');
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Deletion failed. Check console for details.');
        } finally {
            setLoading(false);
            setConfirmDeleteState({ isOpen: false, editionId: null });
        }
    };

    const navItems = [
        { path: '/admin/dashboard', id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/editions', id: 'editions', label: 'Editions', icon: <Newspaper size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-white text-[#2B2523] overflow-hidden font-sans relative">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobile && mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <aside className={`
                ${isMobile
                    ? `fixed inset-y-0 left-0 z-[101] w-72 transform transition-transform duration-300 shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
                    : `relative flex flex-col shrink-0 transition-all duration-300 ${collapsed ? 'w-24' : 'w-72'}`}
                bg-white border-r border-gray-100
            `}>
                {/* Logo Section */}
                <div className="h-24 flex items-center px-8 border-b border-gray-100 shrink-0">
                    <div className="w-10 h-10 bg-[#AA792D] rounded-xl flex items-center justify-center shadow-lg shadow-[#AA792D]/20 shrink-0">
                        <Newspaper size={20} className="text-white" />
                    </div>
                    {(!collapsed || (isMobile && mobileMenuOpen)) && (
                        <div className="ml-4 animate-in fade-in slide-in-from-left-4">
                            <h1 className="text-sm font-black uppercase tracking-tighter italic leading-none">ASRE HAZIR</h1>
                            <p className="text-[9px] font-bold text-[#AA792D] uppercase tracking-widest mt-1">Admin Console</p>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => isMobile && setMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group
                                ${isActive
                                    ? 'bg-[#AA792D] text-white shadow-lg shadow-[#AA792D]/20'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-[#AA792D]'}
                            `}
                        >
                            <div className={`${(collapsed && !isMobile) ? 'mx-auto' : ''}`}>{item.icon}</div>
                            {(!collapsed || isMobile) && <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                        <LogOut size={20} className={(collapsed && !isMobile) ? 'mx-auto' : ''} />
                        {(!collapsed || isMobile) && <span>System Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Global Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 flex items-center justify-between z-40 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
                            className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#AA792D]"
                        >
                            <Layout size={18} />
                        </button>
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <Activity size={14} className={isConnected ? "text-green-500" : "text-red-500"} />
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                {isConnected ? "Live Pulse" : "Signal Lost"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => window.open('/', '_blank')}
                            className="hidden xs:flex items-center gap-3 px-3 md:px-6 py-2.5 bg-[#AA792D] hover:bg-[#8B6123] text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#AA792D]/20 group"
                        >
                            <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" />
                            <span className="hidden md:inline">View Reader</span>
                        </button>

                        <div className="h-8 w-px bg-gray-100 mx-1 md:mx-2" />

                        <div className="flex items-center gap-3 md:gap-4 pl-1 md:pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] md:text-xs font-black text-[#2B2523] uppercase tracking-tight">{user?.displayName || 'Admin'}</p>
                                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest italic truncate max-w-[100px]">{user?.email}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black italic shadow-inner shrink-0 text-[#AA792D]">
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
                <div className="flex-1 overflow-y-auto bg-gray-50 relative custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-4 md:p-10 h-full">
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

            {/* Premium Confirm Modal */}
            <ConfirmModal
                isOpen={confirmDeleteState.isOpen}
                onClose={() => setConfirmDeleteState({ isOpen: false, editionId: null })}
                onConfirm={confirmPurge}
                title="Critical Deletion Sync"
                message="Are you absolutely sure? This will purge the entire edition, all synchronized pages, and all article mappings from the cloud node. This action cannot be reversed."
                confirmText="Execute Purge"
                type="danger"
            />
        </div>
    );
};

export default AdminLayout;
