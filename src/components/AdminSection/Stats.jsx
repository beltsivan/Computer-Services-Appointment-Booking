import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Calendar, Users, BarChart3, Settings, Loader2 } from 'lucide-react';

export const Stats = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeClients: 0,
    revenue: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total appointments count
      const { count: totalAppointments, error: aptError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      if (aptError) throw aptError;

      // Fetch active clients count (role = 'customer')
      const { count: activeClients, error: clientError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (clientError) throw clientError;

      // Fetch pending appointments count
      const { count: pendingTasks, error: pendingError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch completed appointments to calculate revenue
      const { data: completedAppointments, error: completedError } = await supabase
        .from('appointments')
        .select('id, services!appointments_service_id_fkey ( price_estimate )')
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Calculate total revenue
      const revenue = completedAppointments?.reduce((sum, apt) => {
        const price = apt.services?.[0]?.price_estimate || 0;
        return sum + Number(price);
      }, 0) || 0;

      setStats({
        totalAppointments: totalAppointments || 0,
        activeClients: activeClients || 0,
        revenue: revenue,
        pendingTasks: pendingTasks || 0
      });

    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statsData = [
    { label: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'bg-green-500' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: BarChart3, color: 'bg-orange-500' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: Settings, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-3 bg-gray-700 rounded w-20" />
                <div className="h-8 bg-gray-700 rounded w-16" />
              </div>
              <div className="w-12 h-12 bg-gray-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {statsData.map((stat, id) => {
        const Icon = stat.icon;
        return (
          <div
            key={id}
            className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-400 text-xs md:text-sm font-medium truncate">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 md:p-3 rounded-lg flex-shrink-0 ml-3`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
