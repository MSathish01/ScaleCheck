import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles, Sun, Sunrise, Sunset } from 'lucide-react';

export interface AppointmentSlot {
  id: string;
  startTime: string; // "10:00"
  endTime: string;   // "11:30"
  label: string;     // "10:00 AM – 11:30 AM"
  name: string;      // "Morning Batch"
  tag: string;       // "Market Opening"
  icon: 'morning' | 'midday' | 'afternoon' | 'evening';
}

export const STATUTORY_SLOTS: AppointmentSlot[] = [
  {
    id: 'SLOT_MORNING',
    startTime: '10:00',
    endTime: '11:30',
    label: '10:00 AM – 11:30 AM',
    name: 'Morning Window',
    tag: 'Market & Mandi Opening',
    icon: 'morning'
  },
  {
    id: 'SLOT_MIDDAY',
    startTime: '11:30',
    endTime: '13:00',
    label: '11:30 AM – 01:00 PM',
    name: 'Midday Window',
    tag: 'Standard Commercial Hours',
    icon: 'midday'
  },
  {
    id: 'SLOT_AFTERNOON',
    startTime: '14:00',
    endTime: '15:30',
    label: '02:00 PM – 03:30 PM',
    name: 'Afternoon Window',
    tag: 'Post-Lunch Verification',
    icon: 'afternoon'
  },
  {
    id: 'SLOT_LATE_AFTERNOON',
    startTime: '15:30',
    endTime: '17:00',
    label: '03:30 PM – 05:00 PM',
    name: 'Late Window',
    tag: 'Pre-Closing Batch',
    icon: 'evening'
  }
];

interface AppointmentSchedulerProps {
  value: string; // ISO string or "YYYY-MM-DDTHH:mm"
  onChange: (isoValue: string) => void;
  label?: string;
  description?: string;
  minDateOffsetDays?: number; // default 1 (tomorrow)
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  value,
  onChange,
  label = 'Preferred Inspection Date & Time Slot',
  description = 'Select an official Legal Metrology inspection window during working hours.',
  minDateOffsetDays = 1
}) => {
  const pad = (n: number) => (n < 10 ? '0' + n : `${n}`);

  const formatDateYMD = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  // Helper for quick date calculations
  const getDatePlusDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return formatDateYMD(d);
  };

  // Min selectable date (default tomorrow)
  const minDateStr = getDatePlusDays(minDateOffsetDays);

  // Parse initial value or default to tomorrow 10:00 AM
  const parseInitialDate = () => {
    if (value && value.includes('T')) {
      const parts = value.split('T');
      return parts[0];
    }
    return getDatePlusDays(1);
  };

  const parseInitialTime = () => {
    if (value && value.includes('T')) {
      const parts = value.split('T');
      return parts[1]?.slice(0, 5) || '10:00';
    }
    return '10:00';
  };

  const [selectedDate, setSelectedDate] = useState<string>(parseInitialDate());
  const [selectedTime, setSelectedTime] = useState<string>(parseInitialTime());
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);

  // Sync internal state when prop changes from outside
  useEffect(() => {
    if (value && value.includes('T')) {
      const [d, t] = value.split('T');
      if (d) setSelectedDate(d);
      if (t) {
        const timePart = t.slice(0, 5);
        setSelectedTime(timePart);
        const matchesPredefined = STATUTORY_SLOTS.some(s => s.startTime === timePart);
        setIsCustomTime(!matchesPredefined);
      }
    }
  }, [value]);

  // Update parent whenever selectedDate or selectedTime changes
  const updateAppointment = (newDate: string, newTime: string) => {
    setSelectedDate(newDate);
    setSelectedTime(newTime);
    if (newDate && newTime) {
      onChange(`${newDate}T${newTime}:00`);
    } else {
      onChange('');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAppointment(e.target.value, selectedTime);
  };

  const handleSlotSelect = (slot: AppointmentSlot) => {
    setIsCustomTime(false);
    updateAppointment(selectedDate, slot.startTime);
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomTime(true);
    updateAppointment(selectedDate, e.target.value);
  };

  // Format date for human reading
  const formatHumanDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const activeSlot = STATUTORY_SLOTS.find(s => s.startTime === selectedTime);

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <label className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            {label}
          </label>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 text-[10px] font-semibold self-start sm:self-auto">
          <Clock className="w-3 h-3 text-blue-600" />
          Working Hours: 10:00 – 17:00
        </span>
      </div>

      {/* Date Selection Box & Quick Chips */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Native HTML5 clean Date Input (No weird multi-column scrollers) */}
          <div className="relative flex-1">
            <input
              type="date"
              min={minDateStr}
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
            />
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => updateAppointment(getDatePlusDays(1), selectedTime)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedDate === getDatePlusDays(1)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={() => updateAppointment(getDatePlusDays(2), selectedTime)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedDate === getDatePlusDays(2)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              +2 Days
            </button>

            <button
              type="button"
              onClick={() => updateAppointment(getDatePlusDays(3), selectedTime)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedDate === getDatePlusDays(3)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              +3 Days
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Time Slot Grid */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Official Inspection Batch Slots
          </span>
          <button
            type="button"
            onClick={() => setIsCustomTime(!isCustomTime)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            {isCustomTime ? 'Select standard slot' : 'Need custom time?'}
          </button>
        </div>

        {!isCustomTime ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STATUTORY_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot.startTime;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  className={`p-2.5 rounded-xl border text-left transition relative flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/30'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {slot.icon === 'morning' && <Sunrise className="w-4 h-4" />}
                    {slot.icon === 'midday' && <Sun className="w-4 h-4" />}
                    {slot.icon === 'afternoon' && <Sun className="w-4 h-4" />}
                    {slot.icon === 'evening' && <Sunset className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold tracking-tight">
                        {slot.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                      )}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {slot.name} • {slot.tag}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-white rounded-xl border border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Custom Inspection Time</label>
              <span className="text-[10px] text-slate-400">Between 09:30 and 17:30</span>
            </div>
            <input
              type="time"
              value={selectedTime}
              onChange={handleCustomTimeChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Confirmed Appointment Summary Banner */}
      {selectedDate && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <div className="text-[11px] truncate">
              <span className="text-slate-500 font-medium">Appointment: </span>
              <span className="text-blue-900 font-extrabold">{formatHumanDate(selectedDate)}</span>
              <span className="text-slate-400 mx-1">•</span>
              <span className="text-slate-700 font-bold">
                {activeSlot ? activeSlot.label : `${selectedTime} hrs`}
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Auto-Reserved
          </span>
        </div>
      )}
    </div>
  );
};
