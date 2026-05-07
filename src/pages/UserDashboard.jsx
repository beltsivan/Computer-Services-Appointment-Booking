import { useState, useEffect } from 'react';
import { UserSidebar } from '../components/UserSection/UserSidebar';
import { UserTopbar } from '../components/UserSection/UserTopbar';
import { DashboardContent } from '../components/UserSection/DashboardContent';

export const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Handle window resize - sidebar behavior based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, default to sidebar open (expanded by default)
        setSidebarOpen(true);
        setSidebarMinimized(false);
      } else {
        // On mobile, default to sidebar closed
        setSidebarOpen(false);
        setSidebarMinimized(false);
      }
    };

    // Set initial state based on window size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle navigation - close mobile sidebar after selection
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle sidebar minimize toggle
  const handleMinimizeToggle = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen w-full overflow-x-hidden">
      <UserSidebar
        sidebarOpen={sidebarOpen}
        sidebarMinimized={sidebarMinimized}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onMinimizeToggle={handleMinimizeToggle}
      />

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300 min-h-screen w-full
        `}
      >
        {/* Topbar - fixed on mobile, fixed alongside sidebar on desktop */}
        <UserTopbar
          sidebarOpen={sidebarOpen}
          sidebarMinimized={sidebarMinimized}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
        />

        {/* Page Content */}
        <DashboardContent activeTab={activeTab} sidebarOpen={sidebarOpen} sidebarMinimized={sidebarMinimized} />
      </div>
    </div>
  );
};

export default UserDashboard;
