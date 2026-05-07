import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Users, Mail, Search, RefreshCw, UserCircle2, ShieldCheck } from 'lucide-react';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .order('email', { ascending: true });

      if (fetchError) throw fetchError;
      setClients(data || []);
    } catch (err) {
      setError('Failed to load clients. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : value || '');

  const getProfileValue = (client, keys) => {
    const metadataSources = [client, client?.user_metadata, client?.raw_user_meta_data, client?.metadata];

    for (const source of metadataSources) {
      for (const key of keys) {
        const value = normalizeValue(source?.[key]);
        if (value) return value;
      }
    }

    return '';
  };

  const getFirstName = (client) => {
    const firstName = getProfileValue(client, ['first_name', 'firstName', 'firstname', 'fname', 'given_name']);
    const fullName = getProfileValue(client, ['full_name', 'fullName', 'display_name', 'displayName', 'name']);
    return firstName || fullName.split(' ')[0] || 'Name not available';
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const full = `${getFirstName(c)} ${c.email ?? ''}`.toLowerCase();
    return full.includes(q);
  });

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase() || '?';
  };

  const avatarColors = [
    'from-orange-500 to-orange-700',
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-emerald-500 to-emerald-700',
    'from-pink-500 to-pink-700',
    'from-cyan-500 to-cyan-700',
  ];
  const getColor = (id) => avatarColors[(id?.charCodeAt(0) ?? 0) % avatarColors.length];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2 text-white">Client Management</h2>
        <p className="text-gray-400">All registered customers in the system</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Count badge */}
          <div className="flex items-center gap-2 bg-gray-700 border border-gray-600 px-4 py-2.5 rounded-xl">
            <Users size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-white">{filtered.length} Clients</span>
          </div>
          {/* Refresh */}
          <button
            onClick={fetchClients}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-800 border border-gray-700 rounded-2xl">
          <UserCircle2 size={56} className="text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">
            {search ? 'No clients match your search.' : 'No registered clients yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((client) => {
            const firstName = getFirstName(client);

            return (
              <div
                key={client.id}
                className="group bg-gray-800 border border-gray-700 hover:border-orange-500 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-orange-900/10"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${getColor(client.id)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                  >
                    {getInitials(firstName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base truncate">
                      {client.email}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 mt-0.5">
                      <ShieldCheck size={12} />
                      Customer
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mb-4" />

                {/* Email */}
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="truncate">{client.email || 'No email provided'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Clients;
