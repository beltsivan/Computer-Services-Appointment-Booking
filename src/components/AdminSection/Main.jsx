import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Stats } from "./Stats"
import { Table } from "./Table"
import { Services } from "./Services"
import { Clients } from "./Clients"
import { ManageAppointments } from "./ManageAppointments"
import { AdminCalendar } from "./AdminCalendar"
import { Calendar, Clock, CheckCircle, AlertCircle, Edit2, Save, X, BarChart3 } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
const formatPeso = (v) => `₱${Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

/** Safely get the service object whether Supabase returns an array or object */
const svc = (apt) => {
  const s = apt?.services;
  if (!s) return null;
  if (Array.isArray(s)) return s[0] || null;
  return s;
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: AlertCircle, cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40' },
  approved: { label: 'Approved', icon: CheckCircle, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/40' },
  ready:    { label: 'Ready',    icon: CheckCircle, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/40' },
  completed: { label: 'Completed', icon: CheckCircle, cls: 'bg-blue-500/10 text-blue-400 border-blue-600/40' },
  cancelled: { label: 'Cancelled', icon: X,     cls: 'bg-red-500/10 text-red-400 border-red-600/40' },
};

/* ─── Approved Bookings Panel ──────────────────────────────── */
const ApprovedBookingsPanel = () => {
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const fetchApproved = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchErr } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, concern_description, status, end_time, total_amount, customer_id, services!appointments_service_id_fkey ( name, price_estimate )')
        .eq('status', 'approved')
        .order('appointment_date', { ascending: true });

      if (fetchErr) throw fetchErr;
      setApprovedBookings(data || []);
    } catch (err) {
      setError(`Failed to load approved bookings: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  const handleSave = async (apt) => {
    setSavingId(apt.id);
    try {
      const updateData = {
        status: 'approved',
        total_amount: editForm.total_amount ?? apt.total_amount ?? svc(apt)?.price_estimate ?? 0,
        concern_description: editForm.concern_description ?? apt.concern_description
      };

      const { error: saveErr } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', apt.id);

      if (saveErr) throw saveErr;

      setApprovedBookings(prev => prev.map(a =>
        a.id === apt.id ? { ...a, ...updateData } : a
      ));
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (apt, newStatus) => {
    setSavingId(apt.id);
    try {
      const { error: updateErr } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', apt.id);

      if (updateErr) throw updateErr;

      setApprovedBookings(prev => prev.map(a =>
        a.id === apt.id ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setSavingId(null);
    }
  };

  // New handler for "Ready to pick up"
  const handleReadyPickup = async (apt) => {
    setSavingId(apt.id);
    try {
      const { error: updateErr } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          concern_description: apt.concern_description ? `${apt.concern_description}\nReady for pick‑up` : 'Ready for pick‑up'
        })
        .eq('id', apt.id);
      if (updateErr) throw updateErr;
      // Remove from approved list (since status changes)
      setApprovedBookings(prev => prev.filter(a => a.id !== apt.id));
    } catch (err) {
      console.error('Ready‑pickup update error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (apt) => {
    setEditingId(apt.id);
    setEditForm({
      total_amount: apt.total_amount ?? svc(apt)?.price_estimate ?? '',
      concern_description: apt.concern_description || ''
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const isEditing = (id) => editingId === id;
  const isSaving = (id) => savingId === id;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-3"></div>
        <p className="text-gray-400 text-sm">Loading approved bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (approvedBookings.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="text-emerald-400/30 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No approved bookings ready for pickup</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-emerald-500 rounded"></div>
        <h3 className="text-xl font-bold text-white">Approved Bookings</h3>
        <span className="text-xs text-gray-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {approvedBookings.length} ready
        </span>
      </div>

      <div className={`space-y-3 ${approvedBookings.length >= 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
        {approvedBookings.map((apt) => {
          const StatusIcon = STATUS_CONFIG[apt.status].icon;
          const basePrice = svc(apt)?.price_estimate ?? 0;
          const totalPrice = apt.total_amount ?? basePrice;
          const isModified = apt.total_amount !== null && apt.total_amount !== basePrice;

          return (
            <div
              key={apt.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{svc(apt)?.name || 'Service'}</h4>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[apt.status].cls}`}>
                    <StatusIcon size={10} />
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleStatusChange(apt, 'ready')}
                    disabled={isSaving(apt.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      apt.status === 'ready'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                    }`}
                  >
                    Ready
                  </button>
                  <button
                    onClick={() => handleStatusChange(apt, 'pending')}
                    disabled={isSaving(apt.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      apt.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-600/40'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleReadyPickup(apt)}
                    disabled={isSaving(apt.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition ${
                      apt.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-600/40'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400'
                    }`}
                  >
                    Ready to pick up
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-orange-500" />
                  {fmtDate(apt.appointment_date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-orange-500" />
                  {fmtTime(apt.appointment_time)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <BarChart3 size={12} /> Total Amount
                      {isModified && (
                        <span className="text-emerald-400 text-[10px] ml-1">(modified)</span>
                      )}
                    </span>
                  </div>

                  {isEditing(apt.id) ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-400 text-sm">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.total_amount || ''}
                        onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="0.00"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingId(null); setEditForm({}); }}
                          disabled={isSaving(apt.id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => handleSave(apt)}
                          disabled={isSaving(apt.id)}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition"
                        >
                          {isSaving(apt.id) ? '...' : <Save size={14} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 text-xl font-bold">
                        {formatPeso(totalPrice)}
                      </span>
                      <div className="flex items-center gap-2">
                        {basePrice > 0 && isModified && (
                          <span className="text-gray-500 text-xs line-through">{formatPeso(basePrice)}</span>
                        )}
                        <button
                          onClick={() => startEdit(apt)}
                          disabled={isSaving(apt.id)}
                          className="text-gray-400 hover:text-emerald-400 transition-opacity opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-700/30 rounded-lg">
                  {isEditing(apt.id) ? (
                    <div className="p-3">
                      <label className="text-xs text-gray-400 mb-1 block">Customer Notes</label>
                      <textarea
                        value={editForm.concern_description || ''}
                        onChange={(e) => handleInputChange('concern_description', e.target.value)}
                        placeholder="Add admin note or description..."
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div className="p-3">
                      <label className="text-xs text-gray-400 mb-1 block">Customer Note</label>
                      {apt.concern_description ? (
                        <p className="text-gray-300 text-sm italic">{apt.concern_description}</p>
                      ) : (
                        <button
                          onClick={() => startEdit(apt)}
                          disabled={isSaving(apt.id)}
                          className="text-gray-500 text-xs hover:text-gray-300 transition"
                        >
                          + Add admin note
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing(apt.id) && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleSave(apt)}
                    disabled={isSaving(apt.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1"
                  >
                    {isSaving(apt.id) ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditForm({}); }}
                    disabled={isSaving(apt.id)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Pending Bookings Panel ──────────────────────────────── */
const PendingBookingsPanel = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchErr } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, concern_description, status, end_time, total_amount, customer_id, services!appointments_service_id_fkey ( name, price_estimate )')
        .eq('status', 'pending')
        .order('appointment_date', { ascending: true });

      if (fetchErr) throw fetchErr;
      setPendingBookings(data || []);
    } catch (err) {
      setError('Failed to load pending bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReady = async (apt) => {
    try {
      const { error: updateErr } = await supabase
        .from('appointments')
        .update({ status: 'ready' })
        .eq('id', apt.id);
      if (updateErr) throw updateErr;
      setPendingBookings(prev => prev.filter(a => a.id !== apt.id));
    } catch (err) {
      console.error('Ready update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-3"></div>
        <p className="text-gray-400 text-sm">Loading pending bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (pendingBookings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-yellow-500 rounded"></div>
        <h3 className="text-xl font-bold text-white">Pending Pick‑up</h3>
        <span className="text-xs text-gray-500 font-medium bg-yellow-500/10 px-2 py-0.5 rounded-full">
          {pendingBookings.length} awaiting
        </span>
      </div>

      <div className={`space-y-3 ${pendingBookings.length >= 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
        {pendingBookings.map((apt) => {
          const basePrice = svc(apt)?.price_estimate ?? 0;
          const totalPrice = apt.total_amount ?? basePrice;
          return (
            <div
              key={apt.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-yellow-500/30 transition-all duration-200"
            >
              <div className="flex flex-wrap items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{svc(apt)?.name || 'Service'}</h4>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-600/40">
                  Pending
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-orange-500" />
                  {fmtDate(apt.appointment_date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-orange-500" />
                  {fmtTime(apt.appointment_time)}
                </div>
                <div className="text-emerald-400 font-bold">{formatPeso(totalPrice)}</div>
              </div>

              <button
                onClick={() => handleReady(apt)}
                className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium"
              >
                Ready to pick up
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Main = ({ activeTab, sidebarOpen, sidebarMinimized }) => {
return (
    <main
      className={
        `
        transition-all duration-300 bg-gray-900 min-h-screen w-full
        pt-16 lg:pt-16
        ${sidebarMinimized ? 'lg:pl-16' : 'lg:pl-64'}
      `
      }
    >
      <div className="p-4 md:p-6 lg:p-8 w-full max-w-full overflow-hidden">

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">Welcome back, Admin</h2>
              <p className="text-gray-400 text-sm md:text-base">Here's your appointment system overview</p>
            </div>
            <Stats />
            <ApprovedBookingsPanel />
            <Table />
          </>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 md:space-y-8">
            <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
              <ManageAppointments />
            </div>

            <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
              <Services />
            </div>
          </div>
        )}

        {/* Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 md:space-y-8">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">Calendar</h2>
              <p className="text-gray-400 text-sm md:text-base">View all appointments by date — pending, approved, and completed</p>
            </div>
            <AdminCalendar />
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
            <Clients />
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Settings</h3>
            <p className="text-gray-400 text-sm md:text-base">Configure your appointment system, business hours, and preferences.</p>
          </div>
        )}

      </div>
    </main>
  )   
}   
export default Main;