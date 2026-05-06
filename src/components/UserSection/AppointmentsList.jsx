import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Calendar, Clock, CheckCircle, AlertCircle, XCircle,
  Loader2, ClipboardList, Plus, X, Wrench, Tag, Search,
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
const today = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};
const normalizeTime = (time) => time?.slice(0, 5);
const servicePrice = (service) => Number(service.price_estimate ?? service.price ?? 0);
const ACTIVE_BOOKING_STATUSES = ['pending', 'approved'];
const BOOKING_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];
const isPastSlot = (date, time) => new Date(`${date}T${time}`) <= new Date();

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: AlertCircle, cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40' },
  approved: { label: 'Approved', icon: CheckCircle, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/40' },
  completed: { label: 'Completed', icon: CheckCircle, cls: 'bg-blue-500/10 text-blue-400 border-blue-600/40' },
  cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-red-500/10 text-red-400 border-red-600/40' },
};

/* ─── Book Appointment Modal ──────────────────────────────── */
const BookModal = ({ services, onClose, onBooked }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [formData, setFormData] = useState({ date: '', time: '', concern: '' });
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableSlots = formData.date
    ? BOOKING_SLOTS.filter((slot) => !bookedSlots.includes(slot) && !isPastSlot(formData.date, slot))
    : [];

  const categories = [...new Set(services.map((service) => service.category).filter(Boolean))].sort();
  const filteredServices = services.filter((service) => {
    const query = serviceSearch.trim().toLowerCase();
    const matchesSearch = !query || [service.name, service.category, service.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesPrice = maxPrice === '' || servicePrice(service) <= Number(maxPrice);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  useEffect(() => {
    let active = true;

    const fetchBookedSlots = async () => {
      if (!formData.date) {
        setBookedSlots([]);
        return;
      }

      setSlotsLoading(true);
      setError('');

      try {
        const { data, error: fetchErr } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('appointment_date', formData.date)
          .in('status', ACTIVE_BOOKING_STATUSES);

        if (fetchErr) throw fetchErr;
        if (!active) return;

        const taken = [...new Set((data || []).map((apt) => normalizeTime(apt.appointment_time)).filter(Boolean))];
        setBookedSlots(taken);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load available time slots.');
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    fetchBookedSlots();

    return () => {
      active = false;
    };
  }, [formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) { setError('Date and time are required.'); return; }
    if (!selectedService) { setError('Please select a service.'); return; }
    if (!availableSlots.includes(formData.time)) { setError('That time slot is no longer available. Please choose another slot.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: conflicts, error: conflictErr } = await supabase
        .from('appointments')
        .select('id, appointment_time')
        .eq('appointment_date', formData.date)
        .in('status', ACTIVE_BOOKING_STATUSES);

      if (conflictErr) throw conflictErr;

      const hasConflict = (conflicts || []).some((apt) => normalizeTime(apt.appointment_time) === formData.time);
      if (hasConflict) {
        setBookedSlots((prev) => [...new Set([...prev, formData.time])]);
        setFormData((prev) => ({ ...prev, time: '' }));
        setError('Someone just booked that time. Please choose another available slot.');
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
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max price"
                    className="bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-xl placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
                {filteredServices.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No services match your filters.</p>
                ) : (
                  filteredServices.map((s) => (
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
                      onChange={(e) => setFormData(p => ({ ...p, date: e.target.value, time: '' }))}
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Time <span className="text-orange-500">*</span>
                    </label>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-300 text-sm">
                        <Loader2 size={16} className="animate-spin text-orange-500" />
                        Checking available slots...
                      </div>
                    ) : formData.date ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BOOKING_SLOTS.map((slot) => {
                          const unavailable = !availableSlots.includes(slot);
                          const selected = formData.time === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={unavailable}
                              onClick={() => setFormData(p => ({ ...p, time: slot }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${selected
                                  ? 'bg-orange-600 border-orange-500 text-white'
                                  : unavailable
                                    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-700 border-gray-600 text-gray-200 hover:border-orange-500 hover:text-white'
                                }`}
                            >
                              {fmtTime(slot)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 text-sm">
                        Select a date to see available time slots.
                      </div>
                    )}
                    {formData.date && !slotsLoading && availableSlots.length === 0 && (
                      <p className="text-xs text-red-300 mt-2">No slots are available for this date.</p>
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
                      disabled={loading || slotsLoading || !formData.time}
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
export const AppointmentsList = ({ fullView = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [aptRes, svcRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, concern_description, status, created_at, service_id, services!appointments_service_id_fkey ( name, price_estimate, duration_minutes )')
          .eq('customer_id', user.id)
          .order('appointment_date', { ascending: false }),
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
  };

  const displayed = fullView ? appointments : appointments.slice(0, 3);

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
          <p className="text-gray-400 text-lg font-medium">No appointments yet</p>
          <p className="text-gray-500 text-sm mb-6">Book your first appointment to get started</p>
          <button
            onClick={() => setShowBook(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
          >
            <Plus size={18} />
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((apt) => {
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
                        {apt.services?.[0]?.name || 'Service'}
                      </h3>
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
                      {apt.services?.[0]?.price_estimate != null && (
                        <div className="text-orange-400 font-bold">
                          {formatPeso(apt.services[0].price_estimate)}
                        </div>
                      )}
                    </div>

                    {apt.concern_description && (
                      <div className={`rounded-xl px-4 py-2.5 text-sm mt-2 ${hasSuggestion ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' : 'bg-gray-700/60 text-gray-400'}`}>
                        {hasSuggestion ? (
                          <>
                            <p className="font-semibold text-blue-400 mb-1">📅 Admin Suggested a Schedule</p>
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
                    {apt.status === 'approved' && (
                      <p className="text-emerald-400/80 text-xs mt-3 flex items-center gap-1.5">
                        <CheckCircle size={12} />
                        Your appointment is confirmed!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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
