import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from './ProfileCard';
import { StatsCard } from './StatsCard';
import { AppointmentsList } from './AppointmentsList';
import { ProfileSettings } from './ProfileSettings';
import { UserCalendar } from './UserCalendar';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export const DashboardContent = ({ activeTab, sidebarMinimized }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        navigate('/Auth');
        return;
      }

      setUser(authUser);

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('status')
        .eq('customer_id', authUser.id);

      if (appointmentsError) throw appointmentsError;

      const stats = (appointments || []).reduce((acc, appointment) => {
        acc.totalBookings += 1;

        if (['pending', 'approved'].includes(appointment.status)) {
          acc.upcomingAppointments += 1;
        }

        if (appointment.status === 'completed') {
          acc.completedAppointments += 1;
        }

        return acc;
      }, {
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalBookings: 0,
      });

      setUserStats({
        upcomingAppointments: stats.upcomingAppointments,
        completedAppointments: stats.completedAppointments,
        totalBookings: stats.totalBookings,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <main
        className={`
          transition-all duration-300 bg-gray-900 min-h-screen w-full
          pt-16 lg:pt-16
          ${sidebarMinimized ? 'lg:pl-16' : 'lg:pl-64'}
        `}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">
            <Calendar className="text-orange-600" size={48} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`
        transition-all duration-300 bg-gray-900 min-h-screen w-full
        pt-16 lg:pt-16
        ${sidebarMinimized ? 'lg:pl-16' : 'lg:pl-64'}
      `}
    >
      <div className="p-4 md:p-6 lg:p-8 w-full max-w-full overflow-hidden">
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

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-2">Calendar</h2>
              <p className="text-gray-400">View your appointment schedule</p>
            </div>
            <UserCalendar />
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
