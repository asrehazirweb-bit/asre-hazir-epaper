import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { LogOut, ChevronLeft, LayoutDashboard, Upload, FileText, Settings, ShieldCheck, Zap } from 'lucide-react';
import ImageUploader from './ImageUploader';

const AdminLayout = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(auth.currentUser);

    const handleLogout = async () => {
        await auth.signOut();
        onBack();
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'upload', label: 'Upload Pages', icon: <Upload size={18} /> },
        { id: 'manage', label: 'Manage Editions', icon: <FileText size={18} /> },
    ];

    return (
        <div className="flex h-screen bg-[#f8f9fa] transition-colors duration-500 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-xl z-20">
                <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter leading-none">E-Paper</h2>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Admin Desk</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
                    <div>
                        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Operations</p>
                        <nav className="space-y-1.5">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={`${activeTab === item.id ? 'text-white' : 'group-hover:text-slate-900'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Platform</p>
                        <nav className="space-y-1.5">
                            <button onClick={onBack} className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group">
                                <ChevronLeft size={18} className="group-hover:text-slate-900 transition-colors" />
                                <span className="text-sm font-bold tracking-tight">Exit Admin</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group cursor-not-allowed opacity-50">
                                <Settings size={18} />
                                <span className="text-sm font-bold tracking-tight">System Config</span>
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4">
                        <div className="flex items-center gap-3">
                            <img src={user?.photoURL} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{user?.displayName || 'Admin'}</p>
                                <p className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Authorized
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 p-3.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <LogOut size={16} />
                        <span>Sign Out Account</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 transition-all duration-500 pt-8 px-8 pb-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200/50">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
                            <span>Admin</span>
                            <span className="text-slate-900">/</span>
                            <span className="text-gray-900 italic">{activeTab}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">v2.0.1 Stable</span>
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-blue-400 shadow-lg">
                                <Zap size={14} fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Welcome to <span className="text-blue-600">E-Paper Desk</span></h1>
                                    <p className="text-gray-500 text-lg max-w-xl">Manage your digital publication archives and upload new editions with high fidelity zoom-and-pan capabilities.</p>
                                    <div className="mt-10">
                                        <button onClick={() => setActiveTab('upload')} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20">
                                            Start New Upload
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Total Pages', value: '12', color: 'bg-blue-600' },
                                    { label: 'Active Editions', value: '0', color: 'bg-slate-900' },
                                    { label: 'Total Hotspots', value: '0', color: 'bg-zinc-400' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                        <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                                        <div className={`h-1 w-12 ${stat.color} mt-4 rounded-full`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <ImageUploader onUploadComplete={(url) => console.log('Uploaded:', url)} />
                        </div>
                    )}

                    {activeTab === 'manage' && (
                        <div className="py-20 text-center text-gray-400 italic font-medium uppercase tracking-widest text-[10px] animate-in fade-in duration-700">
                            Management module under development...
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
