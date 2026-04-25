import { useState } from 'react';
import { UserSidebar } from '../components/UserSection/UserSidebar';
import { UserTopbar } from '../components/UserSection/UserTopbar';
import { DashboardContent } from '../components/UserSection/DashboardContent';

export const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className=" text-white">
      <UserSidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-screen bg-gray-900">
        <UserTopbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <DashboardContent activeTab={activeTab} sidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
};

export default UserDashboard;
