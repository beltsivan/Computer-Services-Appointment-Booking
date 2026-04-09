import { useState } from 'react';
import { Sidebar } from "../components/AdminSection/Sidebar"
import { Topbar } from "../components/AdminSection/topbar"
import { Main } from "../components/AdminSection/Main"

export const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      
      <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Main activeTab={activeTab} sidebarOpen={sidebarOpen} />
      </div>

    </div>
  )
}