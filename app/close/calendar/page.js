'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function CloseCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock close schedule data
  const closeEvents = {
    '2024-12-27': [
      { id: 1, title: 'Bank Reconciliation Due', type: 'task', status: 'completed', time: '17:00' },
      { id: 2, title: 'AR/AP Review', type: 'task', status: 'in_progress', time: '14:00' }
    ],
    '2024-12-28': [
      { id: 3, title: 'All Reconciliations Complete', type: 'milestone', status: 'at_risk', time: 'EOD' },
      { id: 4, title: 'Intercompany Settlements', type: 'task', status: 'pending', time: '16:00' }
    ],
    '2024-12-30': [
      { id: 5, title: 'Management Review Meeting', type: 'milestone', status: 'on_track', time: '10:00' },
      { id: 6, title: 'Variance Analysis Complete', type: 'task', status: 'pending', time: '15:00' }
    ],
    '2025-01-02': [
      { id: 7, title: 'Final Close', type: 'milestone', status: 'on_track', time: 'EOD' }
    ],
    '2025-01-03': [
      { id: 8, title: 'Close Review & Sign-off', type: 'milestone', status: 'on_track', time: '09:00' }
    ]
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (day) => {
    const dateKey = getDateKey(day);
    return closeEvents[dateKey] || [];
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Close Calendar"
          subtitle="Smart scheduling and tracking for your close process"
        />

        {/* Calendar Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Calendar Header */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-[#101828]">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button className="flex items-center gap-2 bg-[#101828] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors">
                <Plus size={20} />
                Add Event
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square"></div>
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const events = getEventsForDate(day);
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    } ${selectedDate === day ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="h-full flex flex-col">
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {events.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded mb-1 truncate ${
                              event.type === 'milestone'
                                ? event.status === 'at_risk'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-purple-100 text-purple-700'
                                : event.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : event.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-gray-500">+{events.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Details Sidebar */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-[#101828] mb-4">
                Events for {monthNames[month]} {selectedDate}, {year}
              </h3>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {event.status === 'completed' ? (
                            <CheckCircle className="text-green-500" size={18} />
                          ) : event.status === 'at_risk' ? (
                            <AlertCircle className="text-red-500" size={18} />
                          ) : (
                            <Clock className="text-blue-500" size={18} />
                          )}
                          <h4 className="font-semibold text-[#101828]">{event.title}</h4>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.type === 'milestone'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {event.time}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          event.status === 'completed' ? 'bg-green-100 text-green-700' :
                          event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'at_risk' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="mx-auto mb-2 text-gray-300" size={48} />
                  <p>No events scheduled for this date</p>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Milestones */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#101828] mb-4">Upcoming Milestones</h3>
            <div className="space-y-3">
              {Object.entries(closeEvents)
                .flatMap(([date, events]) =>
                  events
                    .filter(e => e.type === 'milestone')
                    .map(e => ({ ...e, date }))
                )
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(event => (
                  <div key={event.id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-[#101828] text-sm">{event.title}</h4>
                      {event.status === 'at_risk' ? (
                        <AlertCircle className="text-red-500" size={18} />
                      ) : (
                        <CheckCircle className="text-green-500" size={18} />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{event.date} at {event.time}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        event.status === 'at_risk' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {event.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
