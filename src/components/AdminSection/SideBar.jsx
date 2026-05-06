import { createElement } from 'react';
import { BarChart3, Calendar, ClipboardList, Users, Settings, LogOut, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export const Sidebar = ({ sidebarOpen, sidebarMinimized, activeTab, setActiveTab, onMinimizeToggle }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Overlay backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setActiveTab(activeTab)}
        />
      )}
      
<aside 
        className={`fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 transition-transform duration-300 z-40 
          ${sidebarMinimized ? 'w-16' : 'w-64'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          lg:block
        `}
      >
        {/* Logo & Brand */}
        <div className={`p-4 ${sidebarMinimized ? 'px-2' : ''}`}>
          <div className={`flex items-center ${sidebarMinimized ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench size={20} className="text-white" />
            </div>
            {!sidebarMinimized && (
              <div>
                <h1 className="text-xl font-bold text-orange-500">AppointmentHub</h1>
                <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Minimize Toggle Button - only show on desktop */}
        <button
          onClick={onMinimizeToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600 transition z-50"
          aria-label={sidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {sidebarMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation */}
        <nav className={`mt-4 space-y-2 ${sidebarMinimized ? 'px-2' : 'px-4'}`}>
          <NavItem 
            icon={BarChart3} 
            label={sidebarMinimized ? '' : 'Overview'} 
            active={activeTab === 'overview'} 
            onClick={() => handleNavClick('overview')} 
            minimized={sidebarMinimized}
          />
          <NavItem 
            icon={ClipboardList} 
            label={sidebarMinimized ? '' : 'Appointments'} 
            active={activeTab === 'appointments'} 
            onClick={() => handleNavClick('appointments')} 
            minimized={sidebarMinimized}
          />
          <NavItem 
            icon={Calendar} 
            label={sidebarMinimized ? '' : 'Calendar'} 
            active={activeTab === 'calendar'} 
            onClick={() => handleNavClick('calendar')} 
            minimized={sidebarMinimized}
          />
          <NavItem 
            icon={Users} 
            label={sidebarMinimized ? '' : 'Clients'} 
            active={activeTab === 'clients'} 
            onClick={() => handleNavClick('clients')} 
            minimized={sidebarMinimized}
          />
          <NavItem 
            icon={Settings} 
            label={sidebarMinimized ? '' : 'Settings'} 
            active={activeTab === 'settings'} 
            onClick={() => handleNavClick('settings')} 
            minimized={sidebarMinimized}
          />
        </nav>

        {/* Logout Button */}
        <div className={`absolute bottom-6 ${sidebarMinimized ? 'left-2 right-2 w-auto' : 'left-4 w-[calc(100%-32px)]'}`}>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition font-medium ${sidebarMinimized ? 'justify-center px-2' : ''}`}
          >
            <LogOut size={20} />
            {!sidebarMinimized && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, active, onClick, minimized }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
      active 
        ? 'bg-orange-600 text-white' 
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    } ${minimized ? 'justify-center px-2' : ''}`}
  >
    {createElement(icon, { size: 20 })}
    {!minimized && <span className="font-medium text-sm">{label}</span>}
  </button>
);

export default Sidebar;
