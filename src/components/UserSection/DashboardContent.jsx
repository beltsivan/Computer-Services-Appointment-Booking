import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from './ProfileCard';
import { StatsCard } from './StatsCard';
import { AppointmentsList } from './AppointmentsList';
import { ProfileSettings } from './ProfileSettings';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export const DashboardContent = ({ activeTab, sidebarOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ marginLeft: sidebarOpen ? '256px' : '0' }}>
        <div className="animate-spin">
          <Calendar className="text-orange-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <main className="transition-all duration-300">
      <div className="p-8" style={{ marginLeft: sidebarOpen ? '256px' : '0' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Welcome back, {user?.user_metadata?.firstName || 'User'}!</h2>
              <p className="text-gray-400">Here's your appointment overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                icon={<Calendar className="text-orange-400" size={32} />}
                title="Upcoming Appointments"
                value={userStats.upcomingAppointments}
                color="from-emerald-500 to-emerald-700"
              />
              <StatsCard
                icon={<Clock className="text-blue-400" size={32} />}
                title="Completed Bookings"
                value={userStats.completedAppointments}
                color="from-emerald-500 to-emerald-700"
              />
              <StatsCard
                icon={<CheckCircle className="text-green-400" size={32} />}
                title="Total Appointments"
                value={userStats.totalBookings}
                color="from-emerald-500 to-emerald-700"
              />
            </div>

            {/* Profile Card */}


            {/* Recent Appointments */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Recent Appointments</h3>
              <AppointmentsList />
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-2">My Appointments</h2>
              <p className="text-gray-400">Book and track all your service appointments</p>
            </div>
            <AppointmentsList fullView={true} />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">My Profile</h2>
              <p className="text-gray-400">View your profile information</p>
            </div>
            <ProfileCard user={user} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Settings</h2>
              <p className="text-gray-400">Manage your account settings</p>
            </div>
            <ProfileSettings user={user} onUpdate={fetchUserData} />
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardContent;
