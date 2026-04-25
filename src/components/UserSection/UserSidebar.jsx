import { Calendar, Clock, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export const UserSidebar = ({ sidebarOpen, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 transition-transform duration-300 z-40 ${sidebarOpen ? 'w-64' : '-translate-x-full'}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-600">AppointmentHub</h1>
        <p className="text-sm text-gray-400 mt-1">User Dashboard</p>
      </div>

      <nav className="mt-8 space-y-2 px-4">
        <NavItem 
          icon={Calendar} 
          label="Overview" 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
        />
        <NavItem 
          icon={Clock} 
          label="My Appointments" 
          active={activeTab === 'appointments'} 
          onClick={() => setActiveTab('appointments')} 
        />
        <NavItem 
          icon={User} 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
        />
      </nav>

      <div className="absolute bottom-6 left-4 w-56">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

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

export default UserSidebar;
