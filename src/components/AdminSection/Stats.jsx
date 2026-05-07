import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Calendar, Users, BarChart3, Clock } from 'lucide-react';

export const Stats = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeClients: 0,
    pendingTasks: 0,
    completedAppointments: 0,
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

      const { count: completedAppointments, error: completedError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError) throw completedError;


      setStats({
        totalAppointments: totalAppointments || 0,
        activeClients: activeClients || 0,
        pendingTasks: pendingTasks || 0,
        completedAppointments: completedAppointments || 0,
      });

    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'from-blue-500 to-blue-700' },
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: Clock, color: 'from-yellow-500 to-orange-600' },
    { label: 'Completed', value: stats.completedAppointments, icon: BarChart3, color: 'from-gray-500 to-gray-900' },
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
            className="relative overflow-hidden bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 hover:border-orange-500/70 transition-all duration-300 group"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-gray-400 text-xs md:text-sm font-medium truncate">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 text-white">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.color} p-2 md:p-3 rounded-xl flex-shrink-0 shadow-lg shadow-black/20`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                style={{ width: `${Math.min((Number(stat.value) / Math.max(stats.totalAppointments, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
