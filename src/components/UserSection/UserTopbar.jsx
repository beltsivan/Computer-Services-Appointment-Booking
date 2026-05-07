import { UserCircle } from "lucide-react";
export const UserTopbar = ({ sidebarMinimized }) => {

  return (
    <header
      className={`
        bg-gray-800 border-b border-gray-700 fixed top-0 z-20
        transition-all duration-300
        h-18
        ${sidebarMinimized ? 'left-16 right-0' : 'left-64 right-0'}
      `}
    >
      <div className="flex items-center justify-end h-full px-4">
        {/* User Avatar - always visible on right */}
        <div className="w-9 h-9  rounded-full flex items-center justify-center font-bold text-white text-sm cursor-pointer hover:bg-gray-700 transition">
          <UserCircle className="w-10 h-10 text-orange-500" />
        </div>
      </div>
    </header>
  );
};

export default UserTopbar;
