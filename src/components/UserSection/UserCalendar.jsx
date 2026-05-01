import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const UserCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status, services ( name )')
        .eq('customer_id', user.id)
        .in('status', ['pending', 'approved'])
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    appointments.forEach((apt) => {
      const dateKey = apt.appointment_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  // Get calendar grid for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().split('T')[0];

  const formatDateKey = (day) => {
    if (!day) return null;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayHover = (day, e) => {
    const dateKey = formatDateKey(day);
    if (dateKey && appointmentsByDate[dateKey]?.length > 0) {
      setHoveredDate(dateKey);
      const rect = e.target.getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  };

  const handleDayLeave = () => {
    setHoveredDate(null);
  };

  const isToday = (day) => {
    const dateKey = formatDateKey(day);
    return dateKey === today;
  };

  const getAppointmentsForDay = (day) => {
    const dateKey = formatDateKey(day);
    return appointmentsByDate[dateKey] || [];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={36} className="text-orange-500 animate-spin mb-3" />
        <p className="text-gray-400">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-gray-400 text-sm font-medium py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={`
                relative aspect-square flex flex-col items-center justify-center
                rounded-xl transition cursor-pointer
                ${day ? 'hover:bg-gray-700' : ''}
                ${isCurrentDay ? 'bg-orange-600 text-white' : ''}
              `}
              onMouseEnter={(e) => day && handleDayHover(day, e)}
              onMouseLeave={handleDayLeave}
            >
              {day && (
                <>
                  <span className={`text-sm font-medium ${isCurrentDay ? 'text-white' : 'text-gray-300'}`}>
                    {day}
                  </span>
                  {/* Dot indicator */}
                  {hasAppointments && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayAppointments.slice(0, 3).map((apt, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === 'approved' ? 'bg-emerald-400' : 'bg-yellow-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y
          }}
        >
          <div className="text-white font-semibold text-sm mb-2">
            {new Date(hoveredDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="text-orange-400 font-bold text-lg mb-2">
            {getAppointmentsForDay(calendarDays.find((d) => formatDateKey(d) === hoveredDate)).length} appointment(s)
          </div>
          <div className="space-y-1">
            {getAppointmentsForDay(calendarDays.find((d) => formatDateKey(d) === hoveredDate)).map((apt) => (
              <div key={apt.id} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${apt.status === 'approved' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                <span className="text-gray-300">{apt.services?.name || 'Service'}</span>
                <span className="text-gray-500">
                  {apt.appointment_time && formatTime(apt.appointment_time)}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-gray-600" />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-gray-400 text-sm">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-gray-400 text-sm">Approved</span>
        </div>
      </div>
    </div>
  );
};

const formatTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default UserCalendar;
