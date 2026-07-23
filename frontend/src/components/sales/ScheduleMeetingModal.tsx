'use client';
import { useState } from 'react';
import { X, CalendarDays, Clock, Video, Phone, MapPin, Monitor } from 'lucide-react';
import { Meeting, MeetingType } from '@/types';

interface ScheduleMeetingModalProps {
  leadId: string;
  leadName: string;
  company: string;
  onClose: () => void;
  onSchedule: (meeting: Omit<Meeting, 'id'>) => void;
}

const meetingTypes: { value: MeetingType; label: string; icon: React.ElementType }[] = [
  { value: 'Video Call', label: 'Video Call', icon: Video },
  { value: 'Phone Call', label: 'Phone Call', icon: Phone },
  { value: 'In-Person', label: 'In-Person', icon: MapPin },
  { value: 'Demo', label: 'Demo', icon: Monitor },
];

export function ScheduleMeetingModal({ leadId, leadName, company, onClose, onSchedule }: ScheduleMeetingModalProps) {
  const [form, setForm] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'Video Call' as MeetingType,
    agenda: '',
    notes: '',
    followUpRequired: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) return;
    onSchedule({
      leadId,
      leadName,
      company,
      date: form.date,
      time: form.time,
      duration: form.duration,
      type: form.type,
      status: 'Scheduled',
      agenda: form.agenda,
      notes: form.notes,
      followUpRequired: form.followUpRequired,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>
              Schedule Meeting
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{leadName} · {company}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Meeting Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Meeting Type</label>
            <div className="grid grid-cols-2 gap-2">
              {meetingTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, type: value })}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.type === value
                      ? 'bg-[#4C1D95] text-white border-[#4C1D95] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#4C1D95]/40 hover:bg-violet-50/50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <CalendarDays size={12} className="inline mr-1" />Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <Clock size={12} className="inline mr-1" />Time
              </label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Duration</label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Agenda</label>
            <textarea
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="What will be discussed in this meeting?"
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] resize-none"
            />
          </div>

          {/* Follow-up */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.followUpRequired}
              onChange={(e) => setForm({ ...form, followUpRequired: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 accent-[#4C1D95]"
            />
            <span className="text-sm text-slate-700 font-medium">Requires follow-up after meeting</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors shadow-sm"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
