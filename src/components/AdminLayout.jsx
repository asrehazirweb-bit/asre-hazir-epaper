import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
    LogOut,
    LayoutDashboard,
    Upload,
    FileText,
    Settings,
    Search,
    RefreshCw,
    User,
    Newspaper,
    Clock,
    Eye,
    AlertTriangle,
    TrendingUp,
    Edit,
    Home,
    Monitor,
    BarChart3,
    Layers
} from 'lucide-react';
import ImageUploader from './ImageUploader';

const AdminLayout = ({ onBack, user }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [editions, setEditions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Mock data for demonstration - replace with real Firestore data
    const mockEditions = [
        {
            id: 'ED-001',
            name: 'Morning Edition',
            status: 'PUBLISHED',
            online: true,
            battery: 85,
            lastSync: '2 min ago',
            syncTime: 103,
            thumbnail: 'https://via.placeholder.com/200x280/333/fff?text=Front+Page',
            pages: 24,
            readers: 1234
        },
        {
            id: 'ED-002',
            name: 'Evening Edition',
            status: 'PUBLISHED',
            online: true,
            battery: 78,
            lastSync: '5 min ago',
            syncTime: 98,
            thumbnail: 'https://via.placeholder.com/200x280/444/fff?text=Evening',
            pages: 20,
            readers: 987
        },
        {
            id: 'ED-003',
            name: 'Weekend Special',
            status: 'DRAFT',
            online: false,
            battery: 45,
            lastSync: '103 min ago',
            syncTime: 45,
            thumbnail: 'https://via.placeholder.com/200x280/555/fff?text=Weekend',
            pages: 32,
            readers: 2341
        },
        {
            id: 'ED-004',
            name: 'Sports Section',
            status: 'PUBLISHED',
            online: true,
            battery: 92,
            lastSync: '1 min ago',
            syncTime: 156,
            thumbnail: 'https://via.placeholder.com/200x280/666/fff?text=Sports',
            pages: 16,
            readers: 1567
        },
        {
            id: 'ED-005',
            name: 'Business Daily',
            status: 'PUBLISHED',
            online: true,
            battery: 67,
            lastSync: '8 min ago',
            syncTime: 203,
            thumbnail: 'https://via.placeholder.com/200x280/777/fff?text=Business',
            pages: 18,
            readers: 2109
        },
        {
            id: 'ED-006',
            name: 'Sunday Magazine',
            status: 'SCHEDULED',
            online: false,
            battery: 34,
            lastSync: '120 min ago',
            syncTime: 34,
            thumbnail: 'https://via.placeholder.com/200x280/888/fff?text=Magazine',
            pages: 48,
            readers: 3456
        }
    ];

    useEffect(() => {
        setEditions(mockEditions);
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        onBack();
    };

    const handleSyncAll = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert('All editions synced successfully!');
        }, 2000);
    };

    const filteredEditions = editions.filter(edition =>
        edition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        edition.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        totalEditions: editions.length,
        activeEditions: editions.filter(e => e.status === 'PUBLISHED').length,
        lowBattery: editions.filter(e => e.battery < 50).length,
        totalReaders: editions.reduce((sum, e) => sum + e.readers, 0)
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'editions', label: 'Editions', icon: <Newspaper size={18} /> },
        { id: 'content', label: 'Content', icon: <Layers size={18} /> },
        { id: 'templates', label: 'Templates', icon: <Monitor size={18} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 dark:bg-gray-950 flex flex-col">
                {/* Brand */}
                <div className="h-20 flex items-center justify-center border-b border-gray-700">
                    <h1 className="text-3xl font-bold text-white tracking-wider">EPAPER</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${activeTab === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <Home size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8">
                    <div className="flex items-center gap-6">
                        {/* Preview Toggle */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                PREVIEW ON DEVICE
                            </span>
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${previewMode ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${previewMode ? 'transform translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Edition ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Sync Button */}
                        <button
                            onClick={handleSyncAll}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            SYNC ALL DEVICES
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User size={18} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user?.displayName || 'Admin User'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <LogOut size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                        TOTAL EDITIONS:
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalEditions}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                        ACTIVE EDITIONS:
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {stats.activeEditions}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-yellow-500" />
                                        LOW BATTERY:
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {stats.lowBattery}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                        TOTAL READERS:
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {(stats.totalReaders / 1000).toFixed(1)}k
                                    </div>
                                </div>
                            </div>

                            {/* E-Paper First Section */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    E-Paper First
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEditions.map((edition) => (
                                        <div
                                            key={edition.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                        >
                                            {/* Header */}
                                            <div className="mb-4">
                                                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                                    EDITION ID: {edition.id}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex gap-4 mb-4">
                                                {/* Thumbnail */}
                                                <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={edition.thumbnail}
                                                        alt={edition.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {edition.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            STATUS
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {edition.status}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {edition.online ? 'ONLINE' : 'OFFLINE'} ({edition.battery}%)
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {edition.syncTime} min ago
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    LAST SYNC: {edition.lastSync}
                                                </div>
                                                <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors">
                                                    EDIT
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'editions' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Upload New Edition
                                </h2>
                                <ImageUploader onUploadComplete={(url) => console.log('Uploaded:', url)} />
                            </div>
                        </div>
                    )}

                    {activeTab !== 'dashboard' && activeTab !== 'editions' && (
                        <div className="text-center py-20">
                            <div className="text-gray-400 text-lg mb-4">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                            </div>
                            <div className="text-gray-500 text-sm">
                                This section is under development
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
