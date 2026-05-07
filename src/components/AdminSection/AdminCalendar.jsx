import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, ChevronRight, Loader2, Calendar, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_COLORS = {
  pending: {
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    label: 'Pending',
    icon: AlertCircle,
  },
  approved: {
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    label: 'Approved',
    icon: CheckCircle,
  },
  completed: {
    dot: 'bg-blue-400',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    label: 'Completed',
    icon: CheckCircle,
  },
};

const formatTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const formatPeso = (v) => `₱${Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

// Helper to safely get service name from either object or array format
const getServiceName = (services) => {
  if (!services) return 'Service';
  if (Array.isArray(services)) return services[0]?.name || 'Service';
  return services.name || 'Service';
};

const getServicePrice = (services) => {
  if (!services) return 0;
  if (Array.isArray(services)) return services[0]?.price_estimate ?? 0;
  return services.price_estimate ?? 0;
};

export const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchErr } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status, concern_description, total_amount, customer_id, services!appointments_service_id_fkey ( name, price_estimate )')
        .in('status', ['pending', 'approved', 'completed'])
        .order('appointment_date', { ascending: true });

      if (fetchErr) throw fetchErr;

      // Also fetch customer info
      const customerIds = [...new Set((data || []).map(a => a.customer_id).filter(Boolean))];
      let usersMap = {};

      if (customerIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', customerIds);

        usersMap = Object.fromEntries((usersData || []).map(u => [u.id, u]));
      }

      const merged = (data || []).map(a => ({
        ...a,
        customer: usersMap[a.customer_id] || null,
      }));

      setAppointments(merged);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter((a) => a.status === filterStatus);
  }, [appointments, filterStatus]);

  // Group by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    filteredAppointments.forEach((apt) => {
      const dateKey = apt.appointment_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [filteredAppointments]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formatDateKey = (day) => {
    if (!day) return null;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateKey = formatDateKey(day);
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
  };

  const getStatusCounts = (day) => {
    const dateKey = formatDateKey(day);
    const apts = appointmentsByDate[dateKey] || [];
    const counts = { pending: 0, approved: 0, completed: 0 };
    apts.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return counts;
  };

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const summary = { pending: 0, approved: 0, completed: 0, total: 0 };
    filteredAppointments.forEach((apt) => {
      const aptDate = new Date(apt.appointment_date);
      if (aptDate.getFullYear() === year && aptDate.getMonth() === month) {
        if (summary[apt.status] !== undefined) summary[apt.status]++;
        summary.total++;
      }
    });
    return summary;
  }, [filteredAppointments, year, month]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={36} className="text-orange-500 animate-spin mb-3" />
        <p className="text-gray-400">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
        {error}
        <button onClick={fetchAppointments} className="ml-3 underline hover:text-red-200">Retry</button>
      </div>
    );
  }

  const selectedAppointments = selectedDate ? (appointmentsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-6">
      {/* Monthly Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{monthlySummary.total}</p>
          <p className="text-xs text-gray-400 mt-1">Total This Month</p>
        </div>
        <div className="bg-gray-800 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{monthlySummary.pending}</p>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
        <div className="bg-gray-800 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{monthlySummary.approved}</p>
          <p className="text-xs text-gray-400 mt-1">Approved</p>
        </div>
        <div className="bg-gray-800 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{monthlySummary.completed}</p>
          <p className="text-xs text-gray-400 mt-1">Completed</p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="hidden sm:flex bg-gray-900 rounded-lg p-1 gap-1">
              {[
                { key: 'all', label: 'All', activeClass: 'text-gray-300' },
                { key: 'pending', label: 'Pending', activeClass: 'text-yellow-400' },
                { key: 'approved', label: 'Approved', activeClass: 'text-emerald-400' },
                { key: 'completed', label: 'Completed', activeClass: 'text-blue-400' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    filterStatus === f.key
                      ? 'bg-gray-700 ' + f.activeClass
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Mobile filter dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="sm:hidden bg-gray-700 border border-gray-600 text-white px-3 py-1.5 rounded-lg text-xs focus:outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchAppointments}
              className="w-9 h-9 md:w-10 md:h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>

            {/* Nav Arrows */}
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="w-9 h-9 md:w-10 md:h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="w-9 h-9 md:w-10 md:h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-gray-500 text-xs md:text-sm font-semibold py-2 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dateKey = formatDateKey(day);
            const isCurrentDay = dateKey === todayKey;
            const isSelected = selectedDate === dateKey;
            const counts = day ? getStatusCounts(day) : { pending: 0, approved: 0, completed: 0 };
            const hasAny = counts.pending > 0 || counts.approved > 0 || counts.completed > 0;

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  relative min-h-[60px] md:min-h-[85px] flex flex-col items-center p-1
                  rounded-xl transition-all duration-150
                  ${day ? 'cursor-pointer hover:bg-gray-700/50' : ''}
                  ${isCurrentDay ? 'bg-orange-600/20 ring-2 ring-orange-500/60' : ''}
                  ${isSelected && !isCurrentDay ? 'bg-gray-700 ring-2 ring-orange-400/50' : ''}
                  ${isSelected && isCurrentDay ? 'ring-2 ring-orange-400' : ''}
                `}
              >
                {day && (
                  <>
                    <span className={`text-xs md:text-sm font-semibold mb-0.5
                      ${isCurrentDay ? 'text-orange-400' : 'text-gray-300'}
                    `}>
                      {day}
                    </span>

                    {/* Status count badges */}
                    {hasAny && (
                      <div className="flex flex-col gap-[2px] w-full mt-auto">
                        {counts.pending > 0 && (
                          <div className="flex items-center gap-0.5 bg-yellow-500/20 rounded px-1 py-[2px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-bold text-yellow-400 leading-tight truncate">
                              {counts.pending} <span className="hidden md:inline">Pend</span>
                            </span>
                          </div>
                        )}
                        {counts.approved > 0 && (
                          <div className="flex items-center gap-0.5 bg-emerald-500/20 rounded px-1 py-[2px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 leading-tight truncate">
                              {counts.approved} <span className="hidden md:inline">Appr</span>
                            </span>
                          </div>
                        )}
                        {counts.completed > 0 && (
                          <div className="flex items-center gap-0.5 bg-blue-500/20 rounded px-1 py-[2px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-bold text-blue-400 leading-tight truncate">
                              {counts.completed} <span className="hidden md:inline">Done</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-5 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-400 text-xs md:text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-gray-400 text-xs md:text-sm">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-gray-400 text-xs md:text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-3 h-3 rounded bg-orange-600/30 ring-1 ring-orange-500" />
            <span className="text-gray-400 text-xs md:text-sm">Today</span>
          </div>
        </div>
      </div>

      {/* Selected Date Detail Panel */}
      {selectedDate && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-orange-400" />
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-white text-xs transition"
              >
                Close
              </button>
            </div>
          </div>

          {selectedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No appointments on this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Quick summary badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {(() => {
                  const pc = selectedAppointments.filter(a => a.status === 'pending').length;
                  const ac = selectedAppointments.filter(a => a.status === 'approved').length;
                  const cc = selectedAppointments.filter(a => a.status === 'completed').length;
                  return (
                    <>
                      {pc > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertCircle size={12} /> {pc} Pending
                        </span>
                      )}
                      {ac > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle size={12} /> {ac} Approved
                        </span>
                      )}
                      {cc > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle size={12} /> {cc} Completed
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {selectedAppointments.map((apt) => {
                const cfg = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                const StatusIcon = cfg.icon;
                const price = apt.total_amount ?? getServicePrice(apt.services);
                const customerName = apt.customer
                  ? `${apt.customer.first_name || ''} ${apt.customer.last_name || ''}`.trim() || apt.customer.email
                  : 'Unknown';

                return (
                  <div
                    key={apt.id}
                    className={`flex items-center gap-3 md:gap-4 bg-gray-900/60 rounded-xl p-3 md:p-4 border ${cfg.border} transition hover:bg-gray-900/80`}
                  >
                    <div className={`w-1.5 h-14 rounded-full ${cfg.dot} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {getServiceName(apt.services)}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        Client: {customerName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={11} />
                          {apt.appointment_time ? formatTime(apt.appointment_time) : 'No time set'}
                        </span>
                        {price > 0 && (
                          <span className="text-emerald-400 font-bold text-xs">
                            {formatPeso(price)}
                          </span>
                        )}
                      </div>
                      {apt.concern_description && (
                        <p className="text-gray-500 text-xs mt-1 italic truncate">{apt.concern_description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${cfg.bg} ${cfg.text} flex-shrink-0`}>
                      <StatusIcon size={10} />
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
