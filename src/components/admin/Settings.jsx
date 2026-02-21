import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Globe, Moon, Save, Trash2, Camera, Mail, Info, Key, Fingerprint, CloudSync } from 'lucide-react';

const Settings = ({ user }) => {
    const [profile, setProfile] = useState({
        displayName: user?.displayName || 'Admin User',
        email: user?.email || 'admin@asrehazir.com',
        role: 'Super Admin',
        notifications: true,
        darkMode: true,
        language: 'English'
    });

    return (
        <div className="space-y-12 pb-20 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* 👤 PROFILE ARCHITECTURE */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="premium-card p-10 flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Status Glow */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />

                        <div className="relative mt-8 w-28 h-28">
                            <div className="w-full h-full rounded-2xl bg-[#1f2937] p-1 border border-white/10 shadow-2xl relative z-10 overflow-hidden group-hover:rotate-2 transition-transform duration-500">
                                <img
                                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}&background=2563EB&color=fff`}
                                    className="w-full h-full object-cover rounded-xl"
                                    alt="Admin Profile"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <div className="absolute -inset-2 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="mt-8 space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight leading-none italic uppercase">{profile.displayName}</h3>
                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/5 px-4 py-1.5 rounded-full inline-block border border-blue-500/10">
                                {profile.role}
                            </div>
                        </div>

                        <div className="mt-12 w-full pt-10 border-t border-white/5 space-y-6">
                            <div className="flex items-center justify-between text-left">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gray-500"><Mail size={14} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Digital ID</p>
                                        <p className="text-xs font-bold text-gray-300 truncate w-40">{profile.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-left">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gray-500"><Shield size={14} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Security Node</p>
                                        <p className="text-xs font-bold text-gray-300">Level 4 Clearance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-6 bg-red-500/5 border-red-500/10 group cursor-pointer hover:bg-red-500/10 transition-all">
                        <div className="flex items-center gap-4 text-red-500">
                            <div className="p-3 bg-red-500/10 rounded-xl group-hover:rotate-12 transition-transform"><Trash2 size={20} /></div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest">Decommission Account</h4>
                                <p className="text-[10px] opacity-70 mt-1">Safe-wipe all administrative data.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📝 SETTINGS FORM */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Module */}
                    <div className="premium-card p-10 bg-[#111827]/50">
                        <div className="flex items-center gap-4 mb-12 border-b border-white/5 pb-6">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><User size={20} /></div>
                            <div>
                                <h4 className="text-lg font-bold text-white tracking-tight uppercase italic">Administrative Profile</h4>
                                <p className="text-xs text-gray-500">Modify your public-facing newsroom identity.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Identity Name</label>
                                <input
                                    type="text"
                                    value={profile.displayName}
                                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-[#0B0F19]/80 border border-white/10 focus:border-blue-500 rounded-xl text-sm font-bold text-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">System Alias</label>
                                <input
                                    type="text"
                                    placeholder="@chief_admin"
                                    className="w-full px-5 py-3.5 bg-[#0B0F19]/80 border border-white/10 focus:border-blue-500 rounded-xl text-sm font-bold text-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security & Logic */}
                    <div className="premium-card p-10 bg-[#111827]/50">
                        <div className="flex items-center gap-4 mb-12 border-b border-white/5 pb-6">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Key size={20} /></div>
                            <div>
                                <h4 className="text-lg font-bold text-white tracking-tight uppercase italic">System Controls</h4>
                                <p className="text-xs text-gray-500">Configure global interface behavior and sync protocols.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Real-time Pulse Notifications', desc: 'Instant alerts for publishing failures', icon: <Bell size={18} />, active: profile.notifications },
                                { label: 'Universal Dark Interface', desc: 'Applied across all administrative nodes', icon: <Moon size={18} />, active: profile.darkMode },
                                { label: 'Hardware Biometric Sync', desc: 'Unlock sensitive modules with fingerprint', icon: <Fingerprint size={18} />, active: false },
                                { label: 'Cloud Propagation', desc: 'Auto-sync assets to edge nodes', icon: <CloudSync size={18} />, active: true }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/5 cursor-pointer group">
                                    <div className="flex items-center gap-5">
                                        <div className="text-gray-500 group-hover:text-white transition-colors">{item.icon}</div>
                                        <div>
                                            <div className="text-xs font-bold text-white uppercase tracking-widest">{item.label}</div>
                                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">{item.desc}</div>
                                        </div>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${item.active ? 'bg-blue-600' : 'bg-gray-800'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${item.active ? 'translate-x-5' : ''}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="px-10 py-5 bg-white text-black hover:bg-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center gap-4">
                            <Save size={18} /> Deploy Policy Updates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
