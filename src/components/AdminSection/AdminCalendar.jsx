import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, ChevronRight, Loader2, CalendarDays } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const getServiceName = (appointment) => {
  const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
  return service?.name || 'Service';
};

export const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status, customer_id, services!appointments_service_id_fkey ( name )')
        .in('status', ['pending', 'approved'])
        .order('appointment_date', { ascending: true });

      if (appointmentError) throw appointmentError;

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', 'customer');

      if (usersError) throw usersError;

      const usersMap = Object.fromEntries((usersData || []).map((user) => [user.id, user]));
      setAppointments((appointmentData || []).map((appointment) => ({
        ...appointment,
        customer: usersMap[appointment.customer_id] || null,
      })));
    } catch (err) {
      setError(err.message || 'Failed to load appointment calendar.');
      console.error('Error fetching admin calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    appointments.forEach((appointment) => {
      if (!grouped[appointment.appointment_date]) grouped[appointment.appointment_date] = [];
      grouped[appointment.appointment_date].push(appointment);
    });
    return grouped;
  }, [appointments]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(day);

    return days;
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().split('T')[0];

  const formatDateKey = (day) => {
    if (!day) return null;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAppointmentsForDay = (day) => {
    const dateKey = formatDateKey(day);
    return appointmentsByDate[dateKey] || [];
  };

  const handleDayHover = (day, event) => {
    const dateKey = formatDateKey(day);
    if (!dateKey || !appointmentsByDate[dateKey]?.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredDate(dateKey);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  const counts = appointments.reduce((acc, appointment) => {
    acc[appointment.status] = (acc[appointment.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-800 border border-gray-700 rounded-2xl">
        <Loader2 size={36} className="text-orange-500 animate-spin mb-3" />
        <p className="text-gray-400">Loading admin calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-5 py-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Tracked</p>
          <p className="text-3xl font-bold text-white">{appointments.length}</p>
        </div>
        <div className="bg-gray-800 border border-yellow-600/50 rounded-xl px-5 py-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">{counts.pending || 0}</p>
        </div>
        <div className="bg-gray-800 border border-emerald-600/50 rounded-xl px-5 py-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Approved</p>
          <p className="text-3xl font-bold text-emerald-400">{counts.approved || 0}</p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-600/15 border border-orange-600/30 flex items-center justify-center">
              <CalendarDays size={22} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{MONTHS[month]} {year}</h2>
              <p className="text-gray-400 text-sm">Pending and approved appointments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const dateKey = formatDateKey(day);
            const isCurrentDay = dateKey === today;

            return (
              <div
                key={index}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition ${day ? 'hover:bg-gray-700 cursor-pointer' : ''} ${isCurrentDay ? 'bg-orange-600 text-white' : ''}`}
                onMouseEnter={(event) => day && handleDayHover(day, event)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {day && (
                  <>
                    <span className={`text-sm font-medium ${isCurrentDay ? 'text-white' : 'text-gray-300'}`}>{day}</span>
                    {dayAppointments.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayAppointments.slice(0, 4).map((appointment) => (
                          <span
                            key={appointment.id}
                            className={`w-1.5 h-1.5 rounded-full ${appointment.status === 'approved' ? 'bg-emerald-400' : 'bg-yellow-400'}`}
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

        {hoveredDate && (
          <div
            className="fixed z-50 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 shadow-xl transform -translate-x-1/2 -translate-y-full pointer-events-none max-w-xs"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="text-white font-semibold text-sm mb-2">
              {new Date(`${hoveredDate}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-orange-400 font-bold text-lg mb-2">
              {appointmentsByDate[hoveredDate]?.length || 0} appointment(s)
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {(appointmentsByDate[hoveredDate] || []).map((appointment) => {
                const customer = appointment.customer;
                const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.email || 'Customer';

                return (
                  <div key={appointment.id} className="flex items-start gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full mt-1 ${appointment.status === 'approved' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                    <div>
                      <p className="text-gray-300">{getServiceName(appointment)}</p>
                      <p className="text-gray-500">{customerName} {appointment.appointment_time ? `- ${formatTime(appointment.appointment_time)}` : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-gray-600" />
          </div>
        )}

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
    </div>
  );
};

export default AdminCalendar;
