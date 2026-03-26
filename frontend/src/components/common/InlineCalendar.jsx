import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const InlineCalendar = ({ value, onChange, darkMode = false }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, currentMonth: false, date: null });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0, 0, 0, 0);
      days.push({ day: d, currentMonth: true, date, isPast: date < today });
    }

    // Next month's leading days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: null });
    }

    return days;
  }, [viewMonth, viewYear]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelect = (dayObj) => {
    if (!dayObj.currentMonth || dayObj.isPast) return;
    const y = viewYear;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(dayObj.day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
  };

  const isSelected = (dayObj) => {
    if (!selectedDate || !dayObj.date) return false;
    return dayObj.date.getTime() === selectedDate.getTime();
  };

  const isToday = (dayObj) => {
    if (!dayObj.date) return false;
    return dayObj.date.getTime() === today.getTime();
  };

  // Prevent navigating to past months
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const base = darkMode
    ? { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white', muted: 'text-white/30', hoverBg: 'hover:bg-white/10' }
    : { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-900', muted: 'text-slate-300', hoverBg: 'hover:bg-slate-100' };

  return (
    <div className={`rounded-3xl ${base.bg} border ${base.border} p-5 select-none`}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            canGoPrev
              ? `${base.hoverBg} ${base.text} cursor-pointer`
              : `${base.muted} cursor-not-allowed opacity-30`
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className={`text-sm font-black ${base.text} tracking-tight`}>
            {MONTHS[viewMonth]}
          </p>
          <p className={`text-[9px] font-bold ${darkMode ? 'text-white/40' : 'text-slate-400'} uppercase tracking-widest`}>
            {viewYear}
          </p>
        </div>
        <button
          type="button"
          onClick={goToNextMonth}
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${base.hoverBg} ${base.text} transition-all`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className={`text-center text-[8px] font-black uppercase tracking-widest py-1 ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, idx) => {
          const selected = isSelected(dayObj);
          const todayMark = isToday(dayObj);

          if (!dayObj.currentMonth) {
            return (
              <div
                key={idx}
                className={`w-full aspect-square flex items-center justify-center text-[11px] font-bold ${base.muted} rounded-xl`}
              >
                {dayObj.day}
              </div>
            );
          }

          if (dayObj.isPast) {
            return (
              <div
                key={idx}
                className={`w-full aspect-square flex items-center justify-center text-[11px] font-bold ${base.muted} rounded-xl cursor-not-allowed line-through`}
              >
                {dayObj.day}
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(dayObj)}
              className={`w-full aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all relative ${
                selected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : todayMark
                    ? `ring-2 ring-blue-400/50 ${base.text} ${base.hoverBg}`
                    : `${base.text} ${base.hoverBg}`
              }`}
            >
              {dayObj.day}
              {todayMark && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InlineCalendar;
