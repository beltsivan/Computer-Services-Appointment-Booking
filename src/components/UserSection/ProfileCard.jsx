import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

export const ProfileCard = ({ user }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
      <div className="h-32 bg-gradient-to-r from-orange-600 to-orange-800"></div>
      
      <div className="px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 relative z-10">
          <div>
            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-gray-800 flex items-center justify-center mb-4">
              <span className="text-5xl font-bold text-white">
                {user?.user_metadata?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          
          <div className="md:mb-2">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-3xl font-bold mb-2">
            {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
          </h3>
          <p className="text-gray-400 mb-6">Premium Member</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-300">
              <Mail size={20} className="text-orange-500" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Phone size={20} className="text-orange-500" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin size={20} className="text-orange-500" />
              <span>New York, USA</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar size={20} className="text-orange-500" />
              <span>Member since 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
