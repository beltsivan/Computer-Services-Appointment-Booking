import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const profileFromUser = (user) => {
  const metadata = user?.user_metadata || {};
  const fullName = metadata.full_name || metadata.fullName || metadata.display_name || metadata.displayName || metadata.name || '';
  const [fallbackFirstName = '', fallbackLastName = ''] = fullName.trim().split(/\s+/, 2);

  return {
    firstName: metadata.firstName || metadata.first_name || fallbackFirstName || '',
    lastName: metadata.lastName || metadata.last_name || fallbackLastName || '',
    phone: metadata.phone || '',
    address: metadata.address || '',
    city: metadata.city || '',
    zipCode: metadata.zipCode || metadata.zip_code || '',
  };
};

export const ProfileCard = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profileFromUser(user));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const profile = profileFromUser(user);
  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || user?.email || 'User';
  const displayAddress = [profile.address, profile.city, profile.zipCode].filter(Boolean).join(', ');
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Unknown';

  const openEditor = () => {
    setFormData(profileFromUser(user));
    setMessage({ type: '', text: '' });
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    if (!firstName || !lastName) {
      setMessage({ type: 'error', text: 'First name and last name are required.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const profileData = {
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        zip_code: formData.zipCode.trim(),
      };

      const { error: authError } = await supabase.auth.updateUser({ data: profileData });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('users')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', user.id);
      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setEditing(false);
      await onUpdate?.();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-orange-600 to-orange-800"></div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 relative z-10">
            <div>
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-gray-800 flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-white">
                  {profile.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            <div className="md:mb-2">
              <button
                onClick={openEditor}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-900/60 border border-green-700 text-green-200'
                : 'bg-red-900/60 border border-red-700 text-red-200'
            }`}>
              <AlertCircle size={18} />
              <span>{message.text}</span>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-3xl font-bold mb-2">{displayName}</h3>
            <p className="text-gray-400 mb-6">Premium Member</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={20} className="text-orange-500" />
                <span>{user?.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={20} className="text-orange-500" />
                <span>{profile.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={20} className="text-orange-500" />
                <span>{displayAddress || 'No address provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar size={20} className="text-orange-500" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
                <p className="text-sm text-gray-400">Update your account details.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {message.type === 'error' && message.text && (
              <div className="mb-5 p-4 rounded-lg flex items-center gap-3 bg-red-900/60 border border-red-700 text-red-200">
                <AlertCircle size={18} />
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-200">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-200">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-200">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
