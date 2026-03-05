import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
    CheckCircle2,
    XCircle,
    Mail,
    Calendar,
    User,
    Shield,
    Clock,
    Search,
    UserCheck,
    UserX,
    Filter
} from 'lucide-react';

const ManageUsers = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('adminRequest', '==', true),
            where('requestStatus', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (userId, action) => {
        setActionLoading(userId);
        try {
            const role = action === 'approved' ? 'admin' : 'user';

            await setDoc(doc(db, 'users', userId), {
                role: role,
                requestStatus: action,
                adminRequest: false,
                approvalDate: serverTimestamp()
            }, { merge: true });

            console.log(`✅ User ${action} successfully`);
        } catch (error) {
            console.error(`Error ${action} user:`, error);
            alert(`Failed to ${action} user. Check console for details.`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#AA792D] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-[#2B2523] tracking-tight uppercase italic flex items-center gap-3">
                        Admin <span className="text-[#AA792D]">Requests</span>
                    </h1>
                    <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Credentials & Permissions Control</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#AA792D] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold w-full md:w-80 shadow-sm focus:ring-4 focus:ring-[#AA792D]/5 focus:border-[#AA792D]/20 outline-none transition-all"
                        />
                    </div>
                    <div className="bg-white border border-gray-100 p-3.5 rounded-2xl text-[#AA792D] shadow-sm">
                        <Filter size={18} />
                    </div>
                </div>
            </div>

            {/* List Section */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-20 text-center shadow-xl shadow-gray-200/50">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                        <Shield size={48} />
                    </div>
                    <h3 className="text-xl font-black text-[#2B2523] uppercase tracking-tight mb-2">No Pending Access Logs</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto">All system access requests have been synchronized and resolved. Check again later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRequests.map((request) => (
                        <div key={request.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-[#AA792D]/5 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#AA792D]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#AA792D]/10 transition-colors"></div>

                            <div className="relative z-10 flex items-start gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner translate-y-1">
                                    {request.photoURL ? (
                                        <img src={request.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-gray-300" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100">Pending Review</span>
                                        <span className="text-[10px] text-gray-300 font-mono">ID: {request.id.slice(0, 8)}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-[#2B2523] uppercase tracking-tight truncate mb-1">
                                        {request.displayName || 'Unnamed User'}
                                    </h3>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Mail size={12} className="text-[#AA792D]" />
                                            <span className="text-[10px] font-bold tracking-wider truncate">{request.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={12} className="text-[#AA792D]" />
                                            <span className="text-[10px] font-bold tracking-wider">
                                                Requested: {request.requestDate?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
                                <button
                                    onClick={() => handleAction(request.id, 'approved')}
                                    disabled={actionLoading === request.id}
                                    className="flex-1 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    <UserCheck size={16} />
                                    {actionLoading === request.id ? 'Processing...' : 'Approve Admin'}
                                </button>
                                <button
                                    onClick={() => handleAction(request.id, 'rejected')}
                                    disabled={actionLoading === request.id}
                                    className="flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <UserX size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
