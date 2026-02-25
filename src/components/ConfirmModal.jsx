import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "System Authentication Required",
    message = "Are you sure you want to proceed with this critical action?",
    confirmText = "Confirm Action",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-red-50',
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
            border: 'border-red-100'
        },
        warning: {
            bg: 'bg-amber-50',
            icon: 'text-amber-600',
            button: 'bg-[#AA792D] hover:bg-[#8B6123] shadow-[#AA792D]/20',
            border: 'border-amber-100'
        }
    };

    const currentStyle = colors[type] || colors.warning;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#2B2523]/60 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                >
                    {/* Header Decoration */}
                    <div className={`h-2 ${currentStyle.bg}`} />

                    <div className="p-8 md:p-10">
                        {/* Icon & Close */}
                        <div className="flex items-start justify-between mb-8">
                            <div className={`w-14 h-14 ${currentStyle.bg} rounded-2xl flex items-center justify-center border ${currentStyle.border}`}>
                                <AlertTriangle size={28} className={currentStyle.icon} />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Text */}
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-[#2B2523] uppercase tracking-tight italic">
                                {title}
                            </h3>
                            <p className="text-[12px] font-medium leading-relaxed text-gray-500 uppercase tracking-widest">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                            <button
                                onClick={onClose}
                                className="w-full sm:flex-1 px-8 py-4 bg-gray-50 text-[#2B2523] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`w-full sm:flex-1 px-8 py-4 ${currentStyle.button} text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.25rem] transition-all shadow-xl active:scale-95`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="px-10 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Asre-Hazir Secure Protocol</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
