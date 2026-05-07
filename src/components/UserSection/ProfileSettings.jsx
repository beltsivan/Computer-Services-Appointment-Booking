import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Lock, Save, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const ProfileSettings = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.firstName || user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.lastName || user?.user_metadata?.last_name || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
    city: user?.user_metadata?.city || '',
    zipCode: user?.user_metadata?.zipCode || user?.user_metadata?.zip_code || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();

      if (!firstName || !lastName) {
        setMessage({ type: 'error', text: 'First name and last name are required' });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          firstName,
          lastName,
          first_name: firstName,
          last_name: lastName,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
          zip_code: formData.zipCode.trim(),
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        const { error: profileError } = await supabase
          .from('users')
          .update({ first_name: firstName, last_name: lastName })
          .eq('id', user.id);

        if (profileError) throw profileError;

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        onUpdate?.();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'Unable to delete account because no user is signed in.' });
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete your account? This will remove your profile and appointment data.');
    if (!confirmed) return;

    const finalConfirmed = window.confirm('This action cannot be undone. Continue deleting your account?');
    if (!finalConfirmed) return;

    setDeleteLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error: deleteError } = await supabase.rpc('delete_current_user');
      if (deleteError) throw deleteError;

      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete account. Please try again.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
            ? 'bg-green-900 border border-green-700 text-green-200'
            : 'bg-red-900 border border-red-700 text-red-200'
          }`}>
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail size={18} /> Email (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Phone size={18} /> Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin size={18} /> Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleFormChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Lock size={24} />
          Change Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2"
          >
            <Lock size={20} />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>



      {/* Danger Zone */}
      <div className="bg-red-900 border border-red-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-red-200">Danger Zone</h2>
        <p className="text-red-100 mb-4">Permanently delete your account and all associated data</p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
          className="bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2"
        >
          {deleteLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          {deleteLoading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};
