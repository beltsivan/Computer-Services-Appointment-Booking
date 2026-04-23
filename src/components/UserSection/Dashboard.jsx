import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, User, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from './ProfileCard';
import { StatsCard } from './StatsCard';
import { AppointmentsList } from './AppointmentsList';
import { ProfileSettings } from './ProfileSettings';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate('/Auth');
        return;
      }

      setUser(authUser);
      
      // Fetch user stats
      setUserStats({
        upcomingAppointments: 5,
        completedAppointments: 12,
        totalBookings: 17,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin">
          <Calendar className="text-orange-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Welcome, {user?.user_metadata?.firstName || 'User'}!</h1>
              <p className="text-orange-100 mt-2">Manage your appointments and profile</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'overview'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Calendar size={20} className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'appointments'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Clock size={20} className="inline mr-2" />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'settings'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Settings size={20} className="inline mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Profile Card */}
            <ProfileCard user={user} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                icon={<Calendar className="text-orange-400" size={32} />}
                title="Upcoming Appointments"
                value={userStats.upcomingAppointments}
                color="from-orange-600 to-orange-800"
              />
              <StatsCard
                icon={<Clock className="text-blue-400" size={32} />}
                title="Completed Bookings"
                value={userStats.completedAppointments}
                color="from-blue-600 to-blue-800"
              />
              <StatsCard
                icon={<CheckCircle className="text-green-400" size={32} />}
                title="Total Appointments"
                value={userStats.totalBookings}
                color="from-green-600 to-green-800"
              />
            </div>

            {/* Recent Appointments */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Appointments</h2>
              <AppointmentsList />
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Appointments</h2>
            <AppointmentsList fullView={true} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <ProfileSettings user={user} onUpdate={fetchUserData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
