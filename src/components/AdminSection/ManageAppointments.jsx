import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Search, RefreshCw, Calendar, Clock, User,
  CheckCircle, XCircle, AlertCircle, Loader2, ClipboardList,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: AlertCircle,   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40' },
  approved:  { label: 'Approved',  icon: CheckCircle,   cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/40' },
  completed: { label: 'Completed', icon: CheckCircle,   cls: 'bg-blue-500/10 text-blue-400 border-blue-600/40' },
  cancelled: { label: 'Cancelled', icon: XCircle,       cls: 'bg-red-500/10 text-red-400 border-red-600/40' },
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

export const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null); // appointment obj
  const [scheduleInput, setScheduleInput] = useState('');
  const [scheduleSending, setScheduleSending] = useState(false);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch appointments + services
      const { data: aptData, error: aptErr } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, concern_description, status, created_at, customer_id, service_id, services!appointments_service_id_fkey ( name, price_estimate, category )')
        .order('appointment_date', { ascending: false });
      if (aptErr) throw aptErr;

      // Fetch all public.users (customers) to merge
      const { data: usersData, error: usrErr } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', 'customer');
      if (usrErr) throw usrErr;

      const usersMap = Object.fromEntries((usersData || []).map((u) => [u.id, u]));
      const merged = (aptData || []).map((a) => ({ ...a, users: usersMap[a.customer_id] || null }));
      setAppointments(merged);
    } catch (e) {
      setError('Failed to load appointments.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (apt) => {
    if (!window.confirm('Are you sure you want to approve this appointment?')) return;

    setUpdatingId(apt.id);
    try {
      const { error: upErr } = await supabase
        .from('appointments')
        .update({ status: 'approved' })
        .eq('id', apt.id);
      if (upErr) throw upErr;
      setAppointments((prev) =>
        prev.map((a) => a.id === apt.id ? { ...a, status: 'approved' } : a)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    setUpdatingId(id);
    try {
      const { error: upErr } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (upErr) throw upErr;
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const openScheduleModal = (apt) => {
    setScheduleModal(apt);
    setScheduleInput('');
  };

  const sendAvailableSchedule = async () => {
    if (!scheduleInput.trim() || !scheduleModal) return;
    if (!window.confirm('Are you sure you want to send this suggested schedule?')) return;

    setScheduleSending(true);
    // In a real app you'd send a notification; here we update concern_description as a simple store
    // and mark status as 'pending' still (admin proposes a new time)
    try {
      const note = `[Admin suggested schedule]: ${scheduleInput.trim()}`;
      const { error: upErr } = await supabase
        .from('appointments')
        .update({ concern_description: note })
        .eq('id', scheduleModal.id);
      if (upErr) throw upErr;
      setAppointments((prev) =>
        prev.map((a) => a.id === scheduleModal.id ? { ...a, concern_description: note } : a)
      );
      setScheduleModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setScheduleSending(false);
    }
  };

  const filtered = appointments.filter((a) => {
    const customer = a.users;
    const fullName = `${customer?.first_name ?? ''} ${customer?.last_name ?? ''} ${customer?.email ?? ''}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const getInitials = (first, last) =>
    ((first?.charAt(0) ?? '') + (last?.charAt(0) ?? '')).toUpperCase() || '?';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2 text-white">Manage Appointments</h2>
        <p className="text-gray-400">View, approve, and manage all customer bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: appointments.length, color: 'border-gray-600', text: 'text-white' },
          { label: 'Pending', value: counts.pending || 0, color: 'border-yellow-600/50', text: 'text-yellow-400' },
          { label: 'Approved', value: counts.approved || 0, color: 'border-emerald-600/50', text: 'text-emerald-400' },
          { label: 'Completed', value: counts.completed || 0, color: 'border-blue-600/50', text: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className={`bg-gray-800 border ${s.color} rounded-xl px-5 py-4`}>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500 transition cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-800 border border-gray-700 rounded-2xl">
          <Loader2 size={40} className="text-orange-500 animate-spin mb-3" />
          <p className="text-gray-400">Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-800 border border-gray-700 rounded-2xl">
          <ClipboardList size={52} className="text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">
            {search ? 'No appointments match your search.' : 'No appointments found.'}
          </p>
        </div>
      ) : (
        <div className={`space-y-4 ${filtered.length >= 5 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
          {filtered.map((apt) => {
            const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const customer = apt.users;
            const isUpdating = updatingId === apt.id;
            const hasSuggestedSchedule = apt.concern_description?.startsWith('[Admin suggested schedule]');

            return (
              <div
                key={apt.id}
                className="bg-gray-800 border border-gray-700 hover:border-orange-500/50 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(customer?.first_name, customer?.last_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-white font-bold text-lg">
                        {customer?.first_name && customer?.last_name
                          ? `${customer.first_name} ${customer.last_name}`
                          : customer?.email || 'Unknown Customer'}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-orange-500 flex-shrink-0" />
                        <span className="truncate">{customer?.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                        <span>{fmtDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-500 flex-shrink-0" />
                        <span>{fmtTime(apt.appointment_time)}</span>
                      </div>
                    </div>

                    {/* Service */}
                    {svc(apt) && (
                      <div className="inline-flex items-center gap-2 bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-300 mb-3">
                        <span className="font-medium text-white">{svc(apt).name}</span>
                        {svc(apt)?.category && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-600/30">
                            {svc(apt).category}
                          </span>
                        )}
                        {svc(apt)?.price_estimate != null && (
                          <span className="text-orange-400 font-semibold">
                            ₱{Number(svc(apt).price_estimate).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Concern / Suggested schedule note */}
                    {apt.concern_description && (
                      <p className={`text-sm mt-1 italic ${hasSuggestedSchedule ? 'text-blue-400' : 'text-gray-500'}`}>
                        {apt.concern_description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 md:min-w-[140px]">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(apt)}
                          disabled={isUpdating}
                          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                        >
                          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Approve
                        </button>
                        <button
                          onClick={() => openScheduleModal(apt)}
                          disabled={isUpdating}
                          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                        >
                          <Calendar size={14} />
                          Suggest Time
                        </button>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={isUpdating}
                          className="flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-red-800/60 disabled:opacity-50 text-gray-300 text-sm font-semibold px-4 py-2 rounded-xl transition"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'approved' && (
                      <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
                        <CheckCircle size={16} /> Approved
                      </span>
                    )}
                    {apt.status === 'completed' && (
                      <span className="text-blue-400 text-sm font-semibold flex items-center gap-1.5">
                        <CheckCircle size={16} /> Completed
                      </span>
                    )}
                    {apt.status === 'cancelled' && (
                      <span className="text-red-400 text-sm font-semibold flex items-center gap-1.5">
                        <XCircle size={16} /> Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggest Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Suggest Available Schedule</h3>
            <p className="text-gray-400 text-sm mb-6">
              Send an available schedule to{' '}
              <span className="text-orange-400 font-semibold">
                {scheduleModal.users?.first_name} {scheduleModal.users?.last_name}
              </span>{' '}
              for{' '}
              <span className="text-white font-semibold">{fmtDate(scheduleModal.appointment_date)}</span>.
            </p>
            <textarea
              rows={3}
              value={scheduleInput}
              onChange={(e) => setScheduleInput(e.target.value)}
              placeholder="e.g. Available slots: 10:00 AM or 2:00 PM on April 28"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none text-sm transition"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setScheduleModal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={sendAvailableSchedule}
                disabled={scheduleSending || !scheduleInput.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {scheduleSending ? <Loader2 size={16} className="animate-spin" /> : null}
                Send Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
