import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Eye, Edit2, Trash2, Loader2, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-600/40' },
  approved: { label: 'Approved', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-600/40' },
  completed: { label: 'Completed', cls: 'bg-blue-500/20 text-blue-400 border-blue-600/40' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/20 text-red-400 border-red-600/40' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

/** Safely get the service object whether Supabase returns an array or object */
const svc = (apt) => {
  const s = apt?.services;
  if (!s) return null;
  if (Array.isArray(s)) return s[0] || null;
  return s;
};

export const Table = ({ onRefresh }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch appointments with user and service details
      const { data: aptData, error: aptErr } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status, created_at, customer_id, service_id, services!appointments_service_id_fkey ( name, price_estimate )')
        .order('created_at', { ascending: false })
        .limit(10);

      if (aptErr) throw aptErr;

      // Fetch users for customer info
      const { data: usersData, error: usrErr } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', 'customer');

      if (usrErr) throw usrErr;

      const usersMap = Object.fromEntries((usersData || []).map((u) => [u.id, u]));

      // Merge user data with appointments
      const merged = (aptData || []).map((a) => ({
        ...a,
        users: usersMap[a.customer_id] || null
      }));

      setAppointments(merged);
    } catch (e) {
      setError(`Failed to load appointments: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last) => {
    const f = first?.charAt(0) ?? '';
    const l = last?.charAt(0) ?? '';
    return (f + l).toUpperCase() || '?';
  };

  const getCustomerName = (apt) => {
    const user = apt.users;
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email || 'Unknown';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Appointments</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={32} className="text-orange-500 animate-spin mb-3" />
          <p className="text-gray-400">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Appointments</h3>
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg md:text-xl font-bold text-white">Recent Appointments</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-100 font-bold">{appointments.length} appointments</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className={`overflow-y-auto ${appointments.length >= 5 ? 'max-h-[420px]' : ''}`}>
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-300">Client</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-300 hidden md:table-cell">Service</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-300">Date & Time</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-300">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={apt.id} className="hover:bg-gray-700/30 transition">

                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
                            {getInitials(apt.users?.first_name, apt.users?.last_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[120px] md:max-w-none">
                              {getCustomerName(apt)}
                            </p>
                            <p className="text-gray-500 text-xs md:hidden truncate">
                              {svc(apt)?.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                        <span className="text-gray-300">
                          {svc(apt)?.name || '—'}
                        </span>
                      </td>

                      <td className="px-4 md:px-6 py-4">
                        <div className="text-gray-300 text-sm">
                          <p>{fmtDate(apt.appointment_date)}</p>
                          <p className="text-gray-500">{fmtTime(apt.appointment_time)}</p>
                        </div>
                      </td>

                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-400 hover:text-blue-300 p-1.5 md:p-2 hover:bg-gray-700 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-orange-400 hover:text-orange-300 p-1.5 md:p-2 hover:bg-gray-700 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 p-1.5 md:p-2 hover:bg-gray-700 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  )
}
export default Table;
