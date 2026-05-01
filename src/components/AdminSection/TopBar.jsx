import { Menu, X, Bell, Search } from 'lucide-react';

export const Topbar = ({ sidebarOpen, sidebarMinimized, setSidebarOpen, activeTab }) => {
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

return (
    <header 
      className={`
        bg-gray-800 border-b border-gray-700 fixed top-0 z-20 w-full
        transition-all duration-300
        left-64 lg:left-64
      `}
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-lg lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Search bar - hidden on small screens */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition w-64"
              />
            </div>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications - hidden on small screens */}
          <button className="hidden md:flex relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
          
          {/* Admin Avatar */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-base cursor-pointer hover:bg-orange-700 transition">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
