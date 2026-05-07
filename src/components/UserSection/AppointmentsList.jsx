import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Calendar, Clock, CheckCircle, AlertCircle, XCircle,
  Loader2, ClipboardList, Plus, X, Wrench, Tag,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
const formatPeso = (v) => `₱${Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split('T')[0];

/** Safely get the service object whether Supabase returns an array or object */
const svc = (apt) => {
  const s = apt?.services;
  if (!s) return null;
  if (Array.isArray(s)) return s[0] || null;
  return s;
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: AlertCircle, cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40' },
  approved: { label: 'Approved', icon: CheckCircle, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/40' },
  completed: { label: 'Completed', icon: CheckCircle, cls: 'bg-blue-500/10 text-blue-400 border-blue-600/40' },
  cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-red-500/10 text-red-400 border-red-600/40' },
};

/* ─── Time‑slot helpers ───────────────────────────────────── */
const SLOT_GAP_MINUTES = 60; // minimum gap between bookings

/** Convert "HH:MM" → total minutes since midnight */
const timeToMinutes = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Check if `candidateTime` (HH:MM) conflicts with any existing appointment on that day */
const hasTimeConflict = (candidateTime, bookedTimes) => {
  const candidateMin = timeToMinutes(candidateTime);
  if (candidateMin === null) return false;
  return bookedTimes.some((bt) => {
    const bookedMin = timeToMinutes(bt);
    if (bookedMin === null) return false;
    return Math.abs(candidateMin - bookedMin) < SLOT_GAP_MINUTES;
  });
};

/** Return the blocked window label around a booked time */
const blockedWindow = (bookedTime) => {
  const mins = timeToMinutes(bookedTime);
  if (mins === null) return '';
  const from = Math.max(0, mins - SLOT_GAP_MINUTES + 1);
  const to = Math.min(24 * 60 - 1, mins + SLOT_GAP_MINUTES - 1);
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (m) => {
    const hr = Math.floor(m / 60);
    const mn = m % 60;
    const h12 = hr > 12 ? hr - 12 : hr || 12;
    return `${h12}:${pad(mn)} ${hr >= 12 ? 'PM' : 'AM'}`;
  };
  return `${fmt(from)} – ${fmt(to)}`;
};

/* ─── Book Appointment Modal ──────────────────────────────── */
const BookModal = ({ services, onClose, onBooked }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ date: '', time: '', concern: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Booked‑slot awareness
  const [bookedSlots, setBookedSlots] = useState([]);   // existing appointment_time values
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timeWarning, setTimeWarning] = useState('');

  /** Fetch existing bookings for the selected date (pending + approved only) */
  const fetchBookedSlots = async (date) => {
    if (!date) { setBookedSlots([]); return; }
    try {
      setLoadingSlots(true);
      const { data, error: fetchErr } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', date)
        .in('status', ['pending', 'approved']);
      if (fetchErr) throw fetchErr;
      setBookedSlots((data || []).map((r) => r.appointment_time).filter(Boolean));
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  /** Called when the user picks a date */
  const handleDateChange = (date) => {
    setFormData((p) => ({ ...p, date, time: '' }));
    setTimeWarning('');
    setError('');
    fetchBookedSlots(date);
  };

  /** Called when the user picks a time */
  const handleTimeChange = (time) => {
    setFormData((p) => ({ ...p, time }));
    if (hasTimeConflict(time, bookedSlots)) {
      setTimeWarning('This time is too close to an existing booking. Please choose a time at least 1 hour apart from booked slots.');
    } else {
      setTimeWarning('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) { setError('Date and time are required.'); return; }

    // Final conflict check before submitting
    if (hasTimeConflict(formData.time, bookedSlots)) {
      setError('The selected time conflicts with an existing booking. Each appointment requires a 1‑hour gap. Please pick a different time.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Double‑check on the server side right before insert
      const { data: latestSlots } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', formData.date)
        .in('status', ['pending', 'approved']);
      const latestTimes = (latestSlots || []).map((r) => r.appointment_time).filter(Boolean);
      if (hasTimeConflict(formData.time, latestTimes)) {
        setError('Someone just booked a nearby time slot. Please choose a different time.');
        setBookedSlots(latestTimes);
        setLoading(false);
        return;
      }

      const { error: insertErr } = await supabase.from('appointments').insert([{
        customer_id: user.id,
        service_id: selectedService.id,
        appointment_date: formData.date,
        appointment_time: formData.time,
        concern_description: formData.concern || null,
        status: 'pending',
      }]);
      if (insertErr) throw insertErr;
      setSuccess(true);
      setTimeout(() => { onBooked(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {step === 1 ? 'Select a Service' : 'Booking Details'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {services.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No services available yet.</p>
              ) : (
                services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className="w-full flex items-start gap-4 bg-gray-700/60 hover:bg-gray-700 border border-gray-600 hover:border-orange-500 rounded-xl px-5 py-4 text-left transition group"
                  >
                    <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600/30 transition">
                      <Wrench size={18} className="text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{s.name}</p>
                      {s.category && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Tag size={11} className="text-gray-500" />
                          <span className="text-gray-500 text-xs">{s.category}</span>
                        </div>
                      )}
                      {s.description && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{s.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-orange-400 font-bold text-sm">
                        {formatPeso(s.price_estimate ?? s.price)}
                      </p>
                      {s.duration_minutes && (
                        <p className="text-gray-500 text-xs">{s.duration_minutes} min</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 bg-orange-600/10 border border-orange-600/30 rounded-xl px-4 py-3 mb-5">
                <Wrench size={16} className="text-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{selectedService.name}</p>
                  <p className="text-orange-400 text-xs font-semibold">{formatPeso(selectedService.price_estimate ?? selectedService.price)}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white text-xs underline transition"
                >
                  Change
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center py-8">
                  <CheckCircle size={48} className="text-emerald-400 mb-3" />
                  <p className="text-white font-bold text-lg">Booking Submitted!</p>
                  <p className="text-gray-400 text-sm mt-1">Waiting for admin approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Date <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={today()}
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  {/* Booked slots indicator — shown after a date is selected */}
                  {formData.date && (
                    <div className="rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-3">
                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Loader2 size={14} className="animate-spin" /> Checking availability…
                        </div>
                      ) : bookedSlots.length === 0 ? (
                        <p className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                          <CheckCircle size={13} /> All time slots are available for this date.
                        </p>
                      ) : (
                        <div>
                          <p className="text-yellow-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <AlertCircle size={13} /> {bookedSlots.length} booking{bookedSlots.length > 1 ? 's' : ''} on this date — unavailable windows:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {bookedSlots
                              .slice()
                              .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
                              .map((t, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-600/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                >
                                  <Clock size={11} />
                                  {blockedWindow(t)}
                                </span>
                              ))}
                          </div>
                          <p className="text-gray-500 text-[10px] mt-2">
                            Choose a time at least 1 hour before or after each booked slot.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Time <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 bg-gray-700 border rounded-xl text-white focus:outline-none transition ${timeWarning ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-orange-500'
                        }`}
                    />
                    {timeWarning && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} /> {timeWarning}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Concern / Description <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.concern}
                      onChange={(e) => setFormData(p => ({ ...p, concern: e.target.value }))}
                      placeholder="Describe your concern or what you need..."
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none text-sm transition"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-xl transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !!timeWarning}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────── */
export const AppointmentsList = ({ fullView = false, statuses = null, emptyTitle = 'No appointments yet', emptyDescription = 'Book your first appointment to get started' }) => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [error, setError] = useState('');
  const statusFilter = Array.isArray(statuses) ? statuses.join(',') : '';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let aptQuery = supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, concern_description, status, total_amount, created_at, service_id, services!appointments_service_id_fkey ( name, price_estimate, duration_minutes, category )')
          .eq('customer_id', user.id);

      if (statusFilter) {
        aptQuery = aptQuery.in('status', statusFilter.split(','));
      }

      const [aptRes, svcRes] = await Promise.all([
        aptQuery.order('appointment_date', { ascending: false }),
        supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (aptRes.error) throw aptRes.error;
      if (svcRes.error) throw svcRes.error;

      setAppointments(aptRes.data || []);
      setServices(svcRes.data || []);
    } catch (err) {
      setError('Failed to load appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayed = fullView ? appointments : appointments.slice(0, 3);
  const groupedSections = [
    { status: 'pending', title: 'Pending Appointments', items: appointments.filter((a) => a.status === 'pending') },
    { status: 'approved', title: 'Approved Appointments', items: appointments.filter((a) => a.status === 'approved') },
    { status: 'cancelled', title: 'Cancelled Appointments', items: appointments.filter((a) => a.status === 'cancelled') },
    { status: 'completed', title: 'Completed Appointments', items: appointments.filter((a) => a.status === 'completed') },
  ];

  const renderAppointmentCard = (apt) => {
    const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    const hasSuggestion = apt.concern_description?.startsWith('[Admin suggested schedule]');

    return (
      <div
        key={apt.id}
        className="bg-gray-800 border border-gray-700 hover:border-orange-500/40 rounded-2xl p-6 transition-all duration-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 bg-orange-600/15 border border-orange-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench size={22} className="text-orange-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-white font-bold text-base">
                {svc(apt)?.name || 'Service'}
              </h3>
              {svc(apt)?.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-600/30">
                  <Tag size={10} />
                  {svc(apt).category}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                <StatusIcon size={12} />
                {cfg.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-500" />
                {fmtDate(apt.appointment_date)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-orange-500" />
                {fmtTime(apt.appointment_time)}
              </div>
              {svc(apt)?.price_estimate != null && (
                <div className="text-orange-400 font-bold">
                  {formatPeso(svc(apt).price_estimate)}
                </div>
              )}
            </div>

            {apt.concern_description && (
              <div className={`rounded-xl px-4 py-2.5 text-sm mt-2 ${hasSuggestion ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' : 'bg-gray-700/60 text-gray-400'}`}>
                {hasSuggestion ? (
                  <>
                    <p className="font-semibold text-blue-400 mb-1">Admin Suggested a Schedule</p>
                    <p>{apt.concern_description.replace('[Admin suggested schedule]: ', '')}</p>
                  </>
                ) : (
                  <p className="italic">{apt.concern_description}</p>
                )}
              </div>
            )}

            {apt.status === 'pending' && (
              <p className="text-yellow-400/80 text-xs mt-3 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Awaiting admin approval
              </p>
            )}
            {apt.status === 'completed' && (
              <div className="mt-3 space-y-2">
                {apt.total_amount != null && apt.total_amount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-600/30 rounded-xl px-4 py-2.5">
                    <span className="text-gray-400 text-xs">Total to Pay:</span>
                    <span className="text-emerald-400 font-bold text-lg">{formatPeso(apt.total_amount)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 size={36} className="text-orange-500 animate-spin mb-3" />
        <p className="text-gray-400">Loading your appointments...</p>
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

  return (
    <>
      {/* Book Button (only in full view) */}
      {fullView && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowBook(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl transition"
          >
            <Plus size={18} />
            Book an Appointment
          </button>
        </div>
      )}

      {/* Empty state */}
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-800 border border-gray-700 rounded-2xl">
          <ClipboardList size={52} className="text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">{emptyTitle}</p>
          <p className="text-gray-500 text-sm mb-6">{emptyDescription}</p>
          {fullView && (
            <button
              onClick={() => setShowBook(true)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
            >
              <Plus size={18} />
              Book an Appointment
            </button>
          )}
        </div>
      ) : fullView ? (
        <div className="space-y-6">
          {groupedSections.map((section) => {
            const cfg = STATUS_CONFIG[section.status] || STATUS_CONFIG.pending;
            const SectionIcon = cfg.icon;

            return (
              <section key={section.status} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border ${cfg.cls}`}>
                      <SectionIcon size={16} />
                    </span>
                    <h3 className="text-white text-lg font-bold">{section.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-700/70 border border-gray-600 rounded-full px-3 py-1">
                    {section.items.length} {section.items.length === 1 ? 'appointment' : 'appointments'}
                  </span>
                </div>

                {section.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 px-4 py-6 text-sm text-gray-500">
                    No {section.title.toLowerCase()}.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.items.map(renderAppointmentCard)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className={`space-y-4 ${appointments.length >= 5 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
          {displayed.map(renderAppointmentCard)}

          {!fullView && appointments.length > 3 && (
            <div className="text-center">
              <p className="text-gray-500 text-sm">+{appointments.length - 3} more appointments</p>
            </div>
          )}
        </div>
      )}

      {showBook && (
        <BookModal
          services={services}
          onClose={() => setShowBook(false)}
          onBooked={fetchData}
        />
      )}
    </>
  );
};

export default AppointmentsList;
