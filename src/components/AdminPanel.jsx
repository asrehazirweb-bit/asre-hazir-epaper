import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Chrome, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const AdminPanel = ({ onBack }) => {
    const { user, userData, isAdmin, loading } = useAuth();
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();

    const handleGoogleLogin = async () => {
        setLocalLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const loggedInUser = result.user;

            // Store/Update user profile in Firestore
            await setDoc(doc(db, 'users', loggedInUser.uid), {
                uid: loggedInUser.uid,
                email: loggedInUser.email,
                displayName: loggedInUser.displayName,
                photoURL: loggedInUser.photoURL,
                lastLogin: serverTimestamp(),
                role: 'user', // Default role
                adminRequest: false,
                requestStatus: null
            }, { merge: true });

            console.log("✅ User profile synced with Firestore");

        } catch (err) {
            console.error(err);
            setError('Login failed: ' + err.message);
            setLocalLoading(false);
        }
    };

    const handleRequestAdmin = async () => {
        if (!user) return;
        setLocalLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                adminRequest: true,
                requestStatus: 'pending',
                requestDate: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.error(err);
            setError('Failed to request access: ' + err.message);
        } finally {
            setLocalLoading(false);
        }
    };

    // Enforce real security logic
    const [isTestBypass, setIsTestBypass] = useState(false);

    if (loading && !isTestBypass) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-[#AA792D] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Dummy user for bypass mode
    const dummyUser = {
        displayName: 'Test Admin',
        email: 'test@example.com',
        photoURL: 'https://ui-avatars.com/api/?name=Test+Admin&background=AA792D&color=fff'
    };

    if (!isTestBypass && (!user || !isAdmin)) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-white p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#AA792D]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <button onClick={onBack} className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#AA792D] flex items-center justify-center gap-1 mx-auto transition-colors">
                                <ChevronLeft size={14} /> Back to Reader
                            </button>
                            <div className="mb-6 flex justify-center">
                                <img src="/logo.png" alt="Asre Hazir" className="h-16 w-auto object-contain" />
                            </div>
                            <h2 className="text-3xl font-black text-[#2B2523] tracking-tighter uppercase italic">E-Paper <span className="text-[#AA792D]">Admin</span></h2>
                            <p className="mt-3 text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px]">Security Gateway</p>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 mb-6 animate-shake">
                                {error}
                            </div>
                        )}

                        {user && !isAdmin && (
                            <div className="space-y-4 mb-6">
                                <div className="rounded-xl bg-amber-50 p-6 text-center border border-amber-100 font-sans">
                                    <ShieldCheck className="mx-auto mb-3 text-amber-500" size={32} />
                                    <p className="text-[12px] font-black uppercase tracking-widest text-amber-600 mb-2">Access Required</p>
                                    <p className="text-[10px] font-bold text-amber-500 leading-relaxed">
                                        Your account is authenticated, but you do not have admin privileges for the E-Paper portal.
                                    </p>
                                </div>

                                {userData?.requestStatus === 'pending' ? (
                                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Request Pending</p>
                                        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">A Main Admin will review your request shortly.</p>
                                    </div>
                                ) : userData?.requestStatus === 'rejected' ? (
                                    <div className="bg-red-50 border border-red-100 p-5 rounded-2xl text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">Request Rejected</p>
                                        <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Please contact the system administrator for more information.</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRequestAdmin}
                                        disabled={localLoading}
                                        className="w-full py-4 bg-[#AA792D] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#AA792D]/20 hover:bg-[#8B6225] transition-all disabled:opacity-50 active:scale-95"
                                    >
                                        {localLoading ? 'Submitting...' : 'Request Admin Access'}
                                    </button>
                                )}

                                <button
                                    onClick={() => signOut(auth)}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors py-2"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleGoogleLogin}
                            disabled={localLoading}
                            className="flex w-full items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#2B2523] shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 group disabled:opacity-50"
                        >
                            <Chrome size={20} className="text-[#AA792D] group-hover:rotate-12 transition-transform" />
                            {localLoading ? 'Signing in...' : 'Sign in with Google Account'}
                        </button>

                        <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-4">
                            <Zap size={14} className="text-[#AA792D]" fill="currentColor" />
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
