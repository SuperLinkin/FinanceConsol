'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  Eye,
  Video,
  Bell,
  MapPin,
  FileText,
  List,
  Grid3x3,
  Repeat,
  Edit,
  Trash2,
  UserCheck
} from 'lucide-react';

export default function CloseCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // January 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewType, setViewType] = useState('month'); // 'day', 'week', 'month'
  const [selectedSection, setSelectedSection] = useState('calendar'); // 'calendar' or 'meetings'
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showMeetingPanel, setShowMeetingPanel] = useState(false);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Team members from Team Management (matching the structure)
  const teamMembers = [
    { id: 'EMP001', name: 'John Doe', role: 'Owner', email: 'john.doe@company.com' },
    { id: 'EMP002', name: 'Sarah Williams', role: 'Reviewer', email: 'sarah.w@company.com' },
    { id: 'EMP003', name: 'Jane Smith', role: 'Owner', email: 'jane.smith@company.com' },
    { id: 'EMP004', name: 'Mike Johnson', role: 'Both', email: 'mike.j@company.com' },
    { id: 'EMP005', name: 'David Martinez', role: 'Owner', email: 'david.m@company.com' },
    { id: 'EMP006', name: 'Emily Brown', role: 'Reviewer', email: 'emily.b@company.com' }
  ];

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting', // meeting, milestone, review, deadline
    date: '',
    time: '',
    duration: '60',
    location: '',
    attendees: '',
    description: '',
    reminder: '15'
  });

  // New meeting form state
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    selectedAttendees: [],
    description: '',
    recurring: 'none', // none, daily, weekly, monthly, custom
    recurringEndDate: '',
    customRecurringDays: []
  });

  // Mock tasks auto-populated from task management
  const tasks = [
    {
      taskId: 'T001',
      taskName: 'Bank Reconciliation - Main Account',
      owner: 'John Doe',
      reviewer: 'Sarah Williams',
      chartOfAccount: '1010 - Cash and Cash Equivalents',
      workDayStart: 'Day 1',
      workDayEnd: 'Day 2',
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      status: 'completed',
      description: 'Reconcile the main bank account by comparing the bank statement with the general ledger.'
    },
    {
      taskId: 'T002',
      taskName: 'Revenue Recognition Review',
      owner: 'Jane Smith',
      reviewer: 'Mike Johnson',
      chartOfAccount: '4000 - Revenue',
      workDayStart: 'Day 2',
      workDayEnd: 'Day 3',
      startDate: '2025-01-02',
      endDate: '2025-01-03',
      status: 'completed',
      description: 'Review all revenue transactions for the period to ensure proper recognition.'
    },
    {
      taskId: 'T003',
      taskName: 'Intercompany Reconciliation',
      owner: 'Mike Johnson',
      reviewer: 'John Doe',
      chartOfAccount: '2100 - Intercompany Payables',
      workDayStart: 'Day 1',
      workDayEnd: 'Day 3',
      startDate: '2025-01-01',
      endDate: '2025-01-03',
      status: 'in_progress',
      description: 'Reconcile all intercompany transactions between subsidiaries.'
    },
    {
      taskId: 'T004',
      taskName: 'Fixed Assets Depreciation',
      owner: 'Sarah Williams',
      reviewer: 'Jane Smith',
      chartOfAccount: '1200 - Fixed Assets',
      workDayStart: 'Day 3',
      workDayEnd: 'Day 4',
      startDate: '2025-01-03',
      endDate: '2025-01-04',
      status: 'pending',
      description: 'Calculate and record monthly depreciation for all fixed assets.'
    },
    {
      taskId: 'T005',
      taskName: 'Final Journal Entry Review',
      owner: 'John Doe',
      reviewer: 'Sarah Williams',
      chartOfAccount: '9999 - Various',
      workDayStart: 'Day 4',
      workDayEnd: 'Day 5',
      startDate: '2025-01-04',
      endDate: '2025-01-05',
      status: 'delayed',
      description: 'Review and approve all journal entries posted during the close period.'
    },
    {
      taskId: 'T006',
      taskName: 'Accounts Receivable Aging',
      owner: 'Jane Smith',
      reviewer: 'Mike Johnson',
      chartOfAccount: '1100 - Accounts Receivable',
      workDayStart: 'Day 2',
      workDayEnd: 'Day 3',
      startDate: '2025-01-06',
      endDate: '2025-01-07',
      status: 'near_deadline',
      description: 'Review AR aging and allowance for doubtful accounts.'
    },
    {
      taskId: 'T007',
      taskName: 'Inventory Valuation Review',
      owner: 'Sarah Williams',
      reviewer: 'John Doe',
      chartOfAccount: '1300 - Inventory',
      workDayStart: 'Day 3',
      workDayEnd: 'Day 4',
      startDate: '2025-01-08',
      endDate: '2025-01-09',
      status: 'pending',
      description: 'Review inventory valuation and obsolescence reserves.'
    },
    {
      taskId: 'T008',
      taskName: 'Accruals and Prepayments',
      owner: 'Mike Johnson',
      reviewer: 'Jane Smith',
      chartOfAccount: '1500 - Prepaid Expenses',
      workDayStart: 'Day 1',
      workDayEnd: 'Day 2',
      startDate: '2025-01-10',
      endDate: '2025-01-11',
      status: 'in_progress',
      description: 'Review and record accruals and prepayments for the period.'
    }
  ];

  // Mock events data
  const [events, setEvents] = useState([
    {
      id: 'evt1',
      title: 'Monthly Close Kickoff',
      type: 'meeting',
      date: '2025-01-02',
      time: '09:00',
      duration: '60',
      location: 'Conference Room A',
      attendees: 'John Doe, Sarah Williams, Jane Smith, Mike Johnson',
      description: 'Kickoff meeting for January 2025 close cycle'
    },
    {
      id: 'evt2',
      title: 'Reconciliation Deadline',
      type: 'deadline',
      date: '2025-01-03',
      time: '17:00',
      duration: '0',
      location: '',
      attendees: '',
      description: 'All reconciliations must be completed by this date'
    },
    {
      id: 'evt3',
      title: 'CFO Review Meeting',
      type: 'review',
      date: '2025-01-08',
      time: '14:00',
      duration: '90',
      location: 'Virtual - Zoom',
      attendees: 'CFO, Controllers, Finance Team',
      description: 'Review January financial results with CFO'
    },
    {
      id: 'evt4',
      title: 'Q1 Close Milestone',
      type: 'milestone',
      date: '2025-01-10',
      time: '23:59',
      duration: '0',
      location: '',
      attendees: '',
      description: 'Target date for completing Q1 close'
    }
  ]);

  // Mock meetings data with recurring info
  const [meetings, setMeetings] = useState([
    {
      id: 'm1',
      title: 'Daily Standup',
      date: '2025-01-02',
      time: '09:00',
      duration: '15',
      location: 'Virtual - Teams',
      attendees: [
        { id: 'EMP001', name: 'John Doe' },
        { id: 'EMP002', name: 'Sarah Williams' },
        { id: 'EMP003', name: 'Jane Smith' }
      ],
      description: 'Daily team sync',
      recurring: 'daily',
      recurringEndDate: '2025-01-31'
    },
    {
      id: 'm2',
      title: 'Weekly Close Review',
      date: '2025-01-06',
      time: '14:00',
      duration: '60',
      location: 'Conference Room B',
      attendees: [
        { id: 'EMP001', name: 'John Doe' },
        { id: 'EMP004', name: 'Mike Johnson' }
      ],
      description: 'Weekly review of close progress',
      recurring: 'weekly',
      recurringEndDate: '2025-03-31'
    },
    {
      id: 'm3',
      title: 'Monthly Financial Review',
      date: '2025-01-15',
      time: '10:00',
      duration: '120',
      location: 'Board Room',
      attendees: [
        { id: 'EMP001', name: 'John Doe' },
        { id: 'EMP002', name: 'Sarah Williams' },
        { id: 'EMP003', name: 'Jane Smith' },
        { id: 'EMP004', name: 'Mike Johnson' }
      ],
      description: 'Comprehensive monthly financial review with all stakeholders',
      recurring: 'monthly',
      recurringEndDate: '2025-12-31'
    },
    {
      id: 'm4',
      title: 'Year-End Planning',
      date: '2025-01-20',
      time: '15:00',
      duration: '90',
      location: 'Virtual - Zoom',
      attendees: [
        { id: 'EMP001', name: 'John Doe' },
        { id: 'EMP005', name: 'David Martinez' }
      ],
      description: 'Plan year-end close activities',
      recurring: 'none',
      recurringEndDate: ''
    }
  ]);

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

  const nextPeriod = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewType === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const prevPeriod = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewType === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getTasksForDate = (dateStr) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      const targetDate = new Date(dateStr);
      return targetDate >= taskStart && targetDate <= taskEnd;
    });
  };

  const getEventsForDate = (dateStr) => {
    return events.filter(event => event.date === dateStr);
  };

  const getTaskStatusColor = (task) => {
    const today = new Date();
    const endDate = new Date(task.endDate);
    const daysUntilDeadline = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (task.status === 'completed') {
      return 'bg-green-100 text-green-700 border-green-300';
    } else if (task.status === 'delayed' || daysUntilDeadline < 0) {
      return 'bg-red-100 text-red-700 border-red-300';
    } else if (task.status === 'near_deadline' || daysUntilDeadline <= 1) {
      return 'bg-amber-100 text-amber-700 border-amber-300';
    } else if (task.status === 'in_progress') {
      return 'bg-blue-100 text-blue-700 border-blue-300';
    } else {
      return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-700';
      case 'deadline': return 'bg-red-100 text-red-700';
      case 'review': return 'bg-purple-100 text-purple-700';
      case 'milestone': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecurringLabel = (recurring) => {
    switch (recurring) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'custom': return 'Custom';
      default: return 'One-time';
    }
  };

  const handleScheduleEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('Please fill in required fields: Title, Date, and Time');
      return;
    }

    const event = {
      id: `evt${events.length + 1}`,
      ...newEvent
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      type: 'meeting',
      date: '',
      time: '',
      duration: '60',
      location: '',
      attendees: '',
      description: '',
      reminder: '15'
    });
    setShowEventPanel(false);
    alert('Event scheduled successfully!');
  };

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      alert('Please fill in required fields: Title, Date, and Time');
      return;
    }

    if (newMeeting.selectedAttendees.length === 0) {
      alert('Please select at least one attendee');
      return;
    }

    const meeting = {
      id: `m${meetings.length + 1}`,
      title: newMeeting.title,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: newMeeting.duration,
      location: newMeeting.location,
      attendees: newMeeting.selectedAttendees.map(id => {
        const member = teamMembers.find(m => m.id === id);
        return { id, name: member.name };
      }),
      description: newMeeting.description,
      recurring: newMeeting.recurring,
      recurringEndDate: newMeeting.recurringEndDate || ''
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      duration: '60',
      location: '',
      selectedAttendees: [],
      description: '',
      recurring: 'none',
      recurringEndDate: '',
      customRecurringDays: []
    });
    setShowMeetingPanel(false);
    alert('Meeting created successfully!');
  };

  const toggleAttendee = (employeeId) => {
    if (newMeeting.selectedAttendees.includes(employeeId)) {
      setNewMeeting({
        ...newMeeting,
        selectedAttendees: newMeeting.selectedAttendees.filter(id => id !== employeeId)
      });
    } else {
      setNewMeeting({
        ...newMeeting,
        selectedAttendees: [...newMeeting.selectedAttendees, employeeId]
      });
    }
  };

  const handleDeleteMeeting = (id) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(meetings.filter(m => m.id !== id));
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Close Calendar"
          subtitle="Manage tasks, events, meetings, and close timeline"
        />

        {/* Content */}
        <div className="px-8 py-6">
          {/* Section Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button
              onClick={() => setSelectedSection('calendar')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                selectedSection === 'calendar'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar & Events
              {selectedSection === 'calendar' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedSection('meetings')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                selectedSection === 'meetings'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Meetings & Recurring Events
              {selectedSection === 'meetings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          </div>

          {/* SECTION 1: Calendar & Events */}
          {selectedSection === 'calendar' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Left Section: Calendar View */}
              <div className="col-span-2 space-y-6">
                {/* Calendar Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={prevPeriod}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-[#101828]">
                          {viewType === 'month' && `${monthNames[month]} ${year}`}
                          {viewType === 'week' && `Week of ${monthNames[month]} ${currentDate.getDate()}, ${year}`}
                          {viewType === 'day' && `${monthNames[month]} ${currentDate.getDate()}, ${year}`}
                        </h2>
                      </div>
                      <button
                        onClick={nextPeriod}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewType('day')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            viewType === 'day'
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Day
                        </button>
                        <button
                          onClick={() => setViewType('week')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            viewType === 'week'
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Week
                        </button>
                        <button
                          onClick={() => setViewType('month')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            viewType === 'month'
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Month
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid - Month View */}
                {viewType === 'month' && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="grid grid-cols-7 gap-2">
                      {/* Day Headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
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
                        const dateKey = getDateKey(day);
                        const dayTasks = getTasksForDate(dateKey);
                        const dayEvents = getEventsForDate(dateKey);
                        const isToday =
                          day === new Date().getDate() &&
                          month === new Date().getMonth() &&
                          year === new Date().getFullYear();

                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDate(day)}
                            className={`min-h-[120px] border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                              isToday ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'
                            } ${selectedDate === day ? 'ring-2 ring-indigo-500' : ''}`}
                          >
                            <div className="h-full flex flex-col">
                              <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                                {day}
                              </div>
                              <div className="flex-1 overflow-hidden space-y-1">
                                {/* Tasks */}
                                {dayTasks.slice(0, 2).map(task => (
                                  <div
                                    key={task.taskId}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(task);
                                      setShowTaskDetails(true);
                                    }}
                                    className={`text-xs px-2 py-1 rounded border truncate ${getTaskStatusColor(task)}`}
                                  >
                                    {task.taskId}
                                  </div>
                                ))}
                                {/* Events */}
                                {dayEvents.slice(0, 1).map(event => (
                                  <div
                                    key={event.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                      setShowEventDetails(true);
                                    }}
                                    className={`text-xs px-2 py-1 rounded truncate ${getEventTypeColor(event.type)}`}
                                  >
                                    📅 {event.title}
                                  </div>
                                ))}
                                {(dayTasks.length + dayEvents.length > 3) && (
                                  <div className="text-xs text-slate-500">+{dayTasks.length + dayEvents.length - 3} more</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Week View */}
                {viewType === 'week' && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="grid grid-cols-7 gap-4">
                      {Array.from({ length: 7 }).map((_, index) => {
                        const date = new Date(currentDate);
                        date.setDate(date.getDate() - date.getDay() + index);
                        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const dayTasks = getTasksForDate(dateKey);
                        const dayEvents = getEventsForDate(dateKey);

                        return (
                          <div key={index} className="border border-slate-200 rounded-lg p-3">
                            <div className="text-sm font-semibold text-slate-600 mb-2">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mb-3">{date.getDate()}</div>
                            <div className="space-y-2">
                              {dayTasks.map(task => (
                                <div
                                  key={task.taskId}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDetails(true);
                                  }}
                                  className={`text-xs px-2 py-1.5 rounded border cursor-pointer ${getTaskStatusColor(task)}`}
                                >
                                  {task.taskId}
                                </div>
                              ))}
                              {dayEvents.map(event => (
                                <div
                                  key={event.id}
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowEventDetails(true);
                                  }}
                                  className={`text-xs px-2 py-1.5 rounded cursor-pointer ${getEventTypeColor(event.type)}`}
                                >
                                  📅 {event.time}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Day View */}
                {viewType === 'day' && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="space-y-3">
                      {/* Time slots */}
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                        const dayTasks = getTasksForDate(dateKey);
                        const dayEvents = getEventsForDate(dateKey).filter(e => {
                          const eventHour = parseInt(e.time.split(':')[0]);
                          return eventHour === hour;
                        });

                        return (
                          <div key={hour} className="flex gap-4">
                            <div className="w-20 text-sm text-slate-600 font-medium">
                              {String(hour).padStart(2, '0')}:00
                            </div>
                            <div className="flex-1 border-l-2 border-slate-200 pl-4 min-h-[60px]">
                              {dayEvents.map(event => (
                                <div
                                  key={event.id}
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowEventDetails(true);
                                  }}
                                  className={`px-3 py-2 rounded-lg cursor-pointer mb-2 ${getEventTypeColor(event.type)}`}
                                >
                                  <div className="font-semibold text-sm">{event.title}</div>
                                  <div className="text-xs opacity-75">{event.time} • {event.duration}min</div>
                                </div>
                              ))}
                              {hour === 0 && dayTasks.map(task => (
                                <div
                                  key={task.taskId}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDetails(true);
                                  }}
                                  className={`px-3 py-2 rounded-lg border cursor-pointer mb-2 ${getTaskStatusColor(task)}`}
                                >
                                  <div className="font-semibold text-sm">{task.taskId} - {task.taskName}</div>
                                  <div className="text-xs opacity-75">All day task</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Status Legend</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-xs text-slate-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                      <span className="text-xs text-slate-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
                      <span className="text-xs text-slate-600">Near Deadline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                      <span className="text-xs text-slate-600">Delayed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section: Events & Scheduling */}
              <div className="col-span-1 space-y-6">
                {/* Schedule Event Button */}
                <button
                  onClick={() => setShowEventPanel(true)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg"
                >
                  <Plus size={20} />
                  Schedule Event
                </button>

                {/* Upcoming Events */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#101828]">Upcoming Events</h3>
                    <CalendarIcon size={20} className="text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    {events
                      .filter(e => new Date(e.date) >= new Date())
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .slice(0, 5)
                      .map(event => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDetails(true);
                          }}
                          className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-[#101828]">{event.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={12} />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {event.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <CalendarIcon className="mx-auto mb-2 text-slate-300" size={48} />
                        <p className="text-sm">No upcoming events</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Tasks Today */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#101828]">Active Tasks</h3>
                    <List size={20} className="text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter(t => t.status === 'in_progress' || t.status === 'near_deadline')
                      .slice(0, 5)
                      .map(task => (
                        <div
                          key={task.taskId}
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskDetails(true);
                          }}
                          className={`px-3 py-2 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getTaskStatusColor(task)}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs">{task.taskId}</span>
                            <span className="text-xs opacity-75">{task.endDate}</span>
                          </div>
                          <div className="text-xs font-medium truncate">{task.taskName}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="text-xs text-slate-600 mb-1">Total Tasks</div>
                    <div className="text-2xl font-bold text-[#101828]">{tasks.length}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="text-xs text-slate-600 mb-1">Completed</div>
                    <div className="text-2xl font-bold text-green-600">
                      {tasks.filter(t => t.status === 'completed').length}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="text-xs text-slate-600 mb-1">In Progress</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {tasks.filter(t => t.status === 'in_progress').length}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                    <div className="text-xs text-slate-600 mb-1">Delayed</div>
                    <div className="text-2xl font-bold text-red-600">
                      {tasks.filter(t => t.status === 'delayed').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Meetings & Recurring Events */}
          {selectedSection === 'meetings' && (
            <div>
              {/* Create Meeting Button */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#101828]">Meeting Management</h3>
                    <p className="text-sm text-slate-600">Create and manage meetings with team members</p>
                  </div>
                  <button
                    onClick={() => setShowMeetingPanel(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Create Meeting
                  </button>
                </div>
              </div>

              {/* Meetings List */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Meeting Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Duration</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Attendees</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Recurring</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {meetings.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                            <Users className="mx-auto mb-2 text-slate-300" size={48} />
                            <p>No meetings scheduled</p>
                          </td>
                        </tr>
                      ) : (
                        meetings.map(meeting => (
                          <tr
                            key={meeting.id}
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setShowMeetingDetails(true);
                            }}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3">
                              <span className="text-sm font-semibold text-[#101828]">{meeting.title}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-slate-700">
                                <div>{meeting.date}</div>
                                <div className="text-xs text-slate-500">{meeting.time}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-700">{meeting.duration} min</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{meeting.location}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {meeting.attendees.slice(0, 3).map(attendee => (
                                  <div
                                    key={attendee.id}
                                    className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center"
                                    title={attendee.name}
                                  >
                                    <span className="text-indigo-600 text-xs font-semibold">
                                      {attendee.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                ))}
                                {meeting.attendees.length > 3 && (
                                  <div className="text-xs text-slate-600 ml-1">
                                    +{meeting.attendees.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {meeting.recurring !== 'none' ? (
                                <div className="flex items-center gap-1">
                                  <Repeat size={14} className="text-indigo-600" />
                                  <span className="text-xs font-medium text-indigo-600">
                                    {getRecurringLabel(meeting.recurring)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">One-time</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeeting(meeting);
                                    setShowMeetingDetails(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMeeting(meeting.id);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Meeting"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Meeting Stats */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Meetings</p>
                  <p className="text-3xl font-bold text-[#101828]">{meetings.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Recurring</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {meetings.filter(m => m.recurring !== 'none').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">One-time</p>
                  <p className="text-3xl font-bold text-green-600">
                    {meetings.filter(m => m.recurring === 'none').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Team Members</p>
                  <p className="text-3xl font-bold text-purple-600">{teamMembers.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Event Side Panel */}
      {showEventPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowEventPanel(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Schedule Event</h2>
              <button
                onClick={() => setShowEventPanel(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="meeting">Meeting</option>
                  <option value="review">Review</option>
                  <option value="deadline">Deadline</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Conference Room A or Zoom link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Users size={14} className="inline mr-1" />
                  Attendees
                </label>
                <input
                  type="text"
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Comma-separated names or emails"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Bell size={14} className="inline mr-1" />
                  Reminder (minutes before)
                </label>
                <select
                  value={newEvent.reminder}
                  onChange={(e) => setNewEvent({...newEvent, reminder: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="0">No reminder</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828] min-h-[100px]"
                  placeholder="Add event details, agenda, or notes..."
                  rows="4"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Video size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Calendar Sync (Coming Soon)</p>
                    <p>Events will be synced with Google Calendar, Outlook, and other calendar services.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={handleScheduleEvent}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Schedule Event
                </button>
                <button
                  onClick={() => setShowEventPanel(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Meeting Side Panel */}
      {showMeetingPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMeetingPanel(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Create Meeting</h2>
              <button
                onClick={() => setShowMeetingPanel(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Enter meeting title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({...newMeeting, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Conference Room A or Zoom link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Repeat size={14} className="inline mr-1" />
                  Recurring
                </label>
                <select
                  value={newMeeting.recurring}
                  onChange={(e) => setNewMeeting({...newMeeting, recurring: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="none">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {newMeeting.recurring !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Recurring End Date
                  </label>
                  <input
                    type="date"
                    value={newMeeting.recurringEndDate}
                    onChange={(e) => setNewMeeting({...newMeeting, recurringEndDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave empty for no end date</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <UserCheck size={14} className="inline mr-1" />
                  Select Attendees <span className="text-red-500">*</span>
                </label>
                <div className="border border-slate-300 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                  <div className="space-y-2">
                    {teamMembers.map(member => (
                      <label
                        key={member.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newMeeting.selectedAttendees.includes(member.id)}
                          onChange={() => toggleAttendee(member.id)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 text-xs font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#101828]">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                          <span className="text-xs text-slate-500">{member.role}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {newMeeting.selectedAttendees.length} attendee(s) selected
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Description
                </label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828] min-h-[100px]"
                  placeholder="Add meeting agenda, notes, or details..."
                  rows="4"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={handleCreateMeeting}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Meeting
                </button>
                <button
                  onClick={() => setShowMeetingPanel(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Meeting Details Side Panel */}
      {showMeetingDetails && selectedMeeting && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMeetingDetails(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Meeting Details</h2>
              <button
                onClick={() => setShowMeetingDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Title</label>
                <p className="text-lg font-semibold text-[#101828]">{selectedMeeting.title}</p>
              </div>

              {selectedMeeting.recurring !== 'none' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Repeat size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">
                        {getRecurringLabel(selectedMeeting.recurring)} Meeting
                      </p>
                      {selectedMeeting.recurringEndDate && (
                        <p className="text-xs text-indigo-700">Until {selectedMeeting.recurringEndDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                  <p className="text-base font-semibold text-[#101828]">{selectedMeeting.date}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                  <p className="text-base font-semibold text-[#101828]">{selectedMeeting.time}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Duration</label>
                <p className="text-sm text-slate-700">{selectedMeeting.duration} minutes</p>
              </div>

              {selectedMeeting.location && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    <MapPin size={14} className="inline mr-1" />
                    Location
                  </label>
                  <p className="text-sm text-slate-700">{selectedMeeting.location}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  <Users size={14} className="inline mr-1" />
                  Attendees ({selectedMeeting.attendees.length})
                </label>
                <div className="space-y-2">
                  {selectedMeeting.attendees.map(attendee => (
                    <div key={attendee.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-xs font-semibold">
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700">{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMeeting.description && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Description</label>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedMeeting.description}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-6 flex gap-3">
                <button
                  onClick={() => setShowMeetingDetails(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Task Details Side Panel */}
      {showTaskDetails && selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowTaskDetails(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#101828]">Task Details</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedTask.taskId}</p>
              </div>
              <button
                onClick={() => setShowTaskDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Task Name</label>
                <p className="text-lg font-semibold text-[#101828]">{selectedTask.taskName}</p>
              </div>

              <div className={`px-4 py-3 rounded-lg border ${getTaskStatusColor(selectedTask)}`}>
                <div className="flex items-center gap-2">
                  {selectedTask.status === 'completed' && <CheckCircle size={20} />}
                  {selectedTask.status === 'delayed' && <AlertCircle size={20} />}
                  {selectedTask.status === 'in_progress' && <Clock size={20} />}
                  <span className="font-semibold">Status: {selectedTask.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <label className="block text-xs font-medium text-slate-500 mb-2">Description</label>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Owner</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-semibold">
                        {selectedTask.owner.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">{selectedTask.owner}</p>
                      <p className="text-xs text-slate-500">Task Owner</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Reviewer</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Eye size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">{selectedTask.reviewer}</p>
                      <p className="text-xs text-slate-500">Reviewer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-[#101828] mb-4">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                    <p className="text-base font-semibold text-[#101828]">{selectedTask.startDate}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedTask.workDayStart}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                    <p className="text-base font-semibold text-[#101828]">{selectedTask.endDate}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedTask.workDayEnd}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <label className="block text-xs font-medium text-slate-500 mb-2">Chart of Account</label>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-indigo-900">{selectedTask.chartOfAccount}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex gap-3">
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Event Details Side Panel */}
      {showEventDetails && selectedEvent && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowEventDetails(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Event Details</h2>
              <button
                onClick={() => setShowEventDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Title</label>
                <p className="text-lg font-semibold text-[#101828]">{selectedEvent.title}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getEventTypeColor(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                  <p className="text-base font-semibold text-[#101828]">{selectedEvent.date}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                  <p className="text-base font-semibold text-[#101828]">{selectedEvent.time}</p>
                </div>
              </div>

              {selectedEvent.duration !== '0' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Duration</label>
                  <p className="text-sm text-slate-700">{selectedEvent.duration} minutes</p>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    <MapPin size={14} className="inline mr-1" />
                    Location
                  </label>
                  <p className="text-sm text-slate-700">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.attendees && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    <Users size={14} className="inline mr-1" />
                    Attendees
                  </label>
                  <p className="text-sm text-slate-700">{selectedEvent.attendees}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Description</label>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-6 flex gap-3">
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
