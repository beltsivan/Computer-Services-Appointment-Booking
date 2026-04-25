import { Menu, X } from 'lucide-react';

export const UserTopbar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between p-6" style={{ marginLeft: sidebarOpen ? '256px' : '0' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white transition"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserTopbar;
