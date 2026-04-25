import { BarChart3, Calendar, Users, Settings, LogOut, Menu, X, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Sidebar = ({ sidebarOpen, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/Auth');
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 transition-transform duration-300 z-40 ${sidebarOpen ? 'w-64' : '-translate-x-full'}`}>
      
      <div className="p-6 ">
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

export default Sidebar;