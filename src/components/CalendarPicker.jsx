import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap } from 'lucide-react';

const CalendarPicker = ({ editions, selectedDate, onDateSelect }) => {
    // We use a local state for the month we are viewing in the calendar
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();

    // Map editions to a set of dates for fast lookup
    const editionDates = useMemo(() => {
        return new Set(editions.map(e => e.editionDate));
    }, [editions]);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

    const changeMonth = (offset) => {
        setViewDate(new Date(year, month + offset, 1));
    };

    const handleDateClick = (day) => {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onDateSelect(formattedDate);
    };

    const days = [];
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Add empty slots for the start offset
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10 md:h-12 md:w-12" />);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hasEdition = editionDates.has(dateStr);
        const isSelected = selectedDate === dateStr;
        const isToday = todayStr === dateStr;

        days.push(
            <div key={d} className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center relative">
                <button
                    onClick={() => handleDateClick(d)}
                    className={`
                        w-8 h-8 md:w-10 md:h-10 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center justify-center relative z-10
                        ${isSelected
                            ? 'bg-[#AA792D] text-white shadow-lg shadow-[#AA792D]/40 scale-110'
                            : hasEdition
                                ? 'bg-[#AA792D]/10 text-[#AA792D] border border-[#AA792D]/20 hover:bg-[#AA792D]/20'
                                : 'text-gray-400 hover:bg-gray-50'
                        }
                    `}
                >
                    {d}
                    {hasEdition && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#AA792D] rounded-full ring-2 ring-white" />
                    )}
                </button>
                {isToday && !isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl p-6 md:p-8 max-w-md mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#AA792D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex flex-col">
                    <h3 className="text-sm font-black text-[#2B2523] uppercase tracking-tighter italic">
                        {monthNames[month]} <span className="text-[#AA792D]">{year}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon size={10} className="text-[#AA792D]" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Intelligence Calendar</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all text-gray-400 hover:text-[#AA792D]"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all text-gray-400 hover:text-[#AA792D]"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-4 relative z-10">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{day}</span>
                    </div>
                ))}
            </div>

            {/* Month Days */}
            <div className="grid grid-cols-7 gap-1 relative z-10">
                {days}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#AA792D]" />
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Active Archives</span>
                    </div>
                    <div className="w-px h-3 bg-gray-100" />
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Present Day</span>
                    </div>
                </div>
                <Zap size={10} className="text-[#AA792D]/30" />
            </div>
        </div>
    );
};

export default CalendarPicker;
