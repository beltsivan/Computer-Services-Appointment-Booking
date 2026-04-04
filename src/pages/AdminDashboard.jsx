import { useState } from 'react';
import { BarChart3, Calendar, Users, Settings, LogOut, Menu, X, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Appointments', value: '156', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Active Clients', value: '42', icon: Users, color: 'bg-green-500' },
    { label: 'Revenue', value: '$12,450', icon: BarChart3, color: 'bg-orange-500' },
    { label: 'Pending Tasks', value: '8', icon: Settings, color: 'bg-purple-500' },
  ];

  const recentAppointments = [
    { id: 1, client: 'John Doe', service: 'Haircut', date: '2026-04-05', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, client: 'Jane Smith', service: 'Manicure', date: '2026-04-05', time: '11:30 AM', status: 'Pending' },
    { id: 3, client: 'Mike Johnson', service: 'Massage', date: '2026-04-06', time: '02:00 PM', status: 'Confirmed' },
    { id: 4, client: 'Sarah Williams', service: 'Facial', date: '2026-04-06', time: '03:30 PM', status: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 transition-transform duration-300 z-40 ${sidebarOpen ? 'w-64' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-orange-600">AppointmentHub</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          <NavItem icon={BarChart3} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={Calendar} label="Appointments" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
          <NavItem icon={Users} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="absolute bottom-6 left-4 w-56">
          <button 
          onClick={() => navigate('/login')}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <>
              <div className="mb-8">
                <h2 className="text-4xl font-bold mb-2">Welcome back, Admin</h2>
                <p className="text-gray-400">Here's your appointment system overview</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, id) => {
                  const Icon = stat.icon;
                  return (
                    <div key={id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                          <p className="text-3xl font-bold mt-2">{stat.value}</p>
                        </div>
                        <div className={`${stat.color} p-3 rounded-lg`}>
                          <Icon size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Appointments */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Recent Appointments</h3>
                  <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition font-medium">
                    <Plus size={18} />
                    New Appointment
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700 bg-opacity-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Service</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Date & Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {recentAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-gray-700 hover:bg-opacity-50 transition">
                          <td className="px-6 py-4">{apt.client}</td>
                          <td className="px-6 py-4">{apt.service}</td>
                          <td className="px-6 py-4">{apt.date} @ {apt.time}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              apt.status === 'Confirmed' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                              apt.status === 'Pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                              'bg-red-500 bg-opacity-20 text-red-400'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button className="text-blue-400 hover:text-blue-300 transition" title="View">
                                <Eye size={18} />
                              </button>
                              <button className="text-orange-400 hover:text-orange-300 transition" title="Edit">
                                <Edit2 size={18} />
                              </button>
                              <button className="text-red-400 hover:text-red-300 transition" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-2xl font-bold mb-4">Manage Appointments</h3>
              <p className="text-gray-400">View, edit, and manage all your appointments here. You can filter, search, and perform bulk actions.</p>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-2xl font-bold mb-4">Client Management</h3>
              <p className="text-gray-400">View and manage your client database. Track client history and preferences.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-2xl font-bold mb-4">Settings</h3>
              <p className="text-gray-400">Configure your appointment system, business hours, and preferences.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Helper NavItem component
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      active ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-700'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);