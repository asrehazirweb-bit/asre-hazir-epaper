import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { Chrome, LogOut, ChevronLeft } from 'lucide-react';
import ImageUploader from './ImageUploader';

const AdminPanel = ({ onBack }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error(err);
            setError('Login failed: ' + err.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
                    <div className="text-center">
                        <button onClick={onBack} className="mb-4 text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto">
                            <ChevronLeft size={16} /> Back to Reader
                        </button>
                        <h2 className="text-3xl font-extrabold text-gray-900">E-Paper Admin</h2>
                        <p className="mt-2 text-sm text-gray-600">Sign in to upload pages</p>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all active:scale-95"
                    >
                        <Chrome className="h-5 w-5 text-red-500" />
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-gray-500 hover:text-gray-900">
                            <ChevronLeft />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">E-Paper Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="h-10 w-10 rounded-full border border-gray-200"
                        />
                        <button
                            onClick={handleLogout}
                            className="ml-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-8">
                        <ImageUploader />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
