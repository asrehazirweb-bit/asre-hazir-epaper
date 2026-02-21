import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Chrome, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const AdminPanel = ({ onBack }) => {
    const { user, isAdmin, loading } = useAuth();
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();

    const handleGoogleLogin = async () => {
        setLocalLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error(err);
            setError('Login failed: ' + err.message);
            setLocalLoading(false);
        }
    };

    // Bypass logic for testing
    const [isTestBypass, setIsTestBypass] = useState(true);

    if (loading && !isTestBypass) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Dummy user for bypass mode
    const dummyUser = {
        displayName: 'Test Admin',
        email: 'test@example.com',
        photoURL: 'https://ui-avatars.com/api/?name=Test+Admin&background=0D8ABC&color=fff'
    };

    if (!isTestBypass && (!user || !isAdmin)) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fa] p-4 font-sans">
                <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-white p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <button onClick={onBack} className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto transition-colors">
                                <ChevronLeft size={14} /> Back to Reader
                            </button>
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 mx-auto mb-6">
                                <ShieldCheck className="text-white" size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">E-Paper <span className="text-blue-600">Admin</span></h2>
                            <p className="mt-3 text-sm font-medium text-gray-500 uppercase tracking-widest text-[10px]">Security Gateway</p>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 mb-6 animate-shake">
                                {error}
                            </div>
                        )}

                        {user && !isAdmin && (
                            <div className="rounded-xl bg-amber-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100 mb-6 font-sans">
                                Access Denied: Admin role required.<br />
                                <span className="lowercase font-mono text-[8px] opacity-70">UID: {user.uid}</span>
                            </div>
                        )}

                        <button
                            onClick={handleGoogleLogin}
                            disabled={localLoading}
                            className="flex w-full items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 group disabled:opacity-50"
                        >
                            <Chrome size={20} className="text-red-500 group-hover:animate-spin-slow" />
                            {localLoading ? 'Signing in...' : 'Sign in with Google Account'}
                        </button>

                        <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-4">
                            <Zap size={14} className="text-blue-500" fill="currentColor" />
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Authorized Access Only</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <AdminLayout onBack={onBack} user={user || dummyUser} />;
};

export default AdminPanel;
