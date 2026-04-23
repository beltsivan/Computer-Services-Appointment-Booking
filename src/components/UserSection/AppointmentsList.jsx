import { Calendar, Clock, MapPin, User, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export const AppointmentsList = ({ fullView = false }) => {
  const appointments = [
    {
      id: 1,
      service: 'Deep Cleaning',
      date: '2024-05-15',
      time: '10:00 AM',
      location: '123 Main St, New York',
      provider: 'John Smith',
      status: 'confirmed',
      price: '$150',
    },
    {
      id: 2,
      service: 'Regular Cleaning',
      date: '2024-05-20',
      time: '2:00 PM',
      location: '456 Oak Ave, New York',
      provider: 'Sarah Johnson',
      status: 'pending',
      price: '$100',
    },
    {
      id: 3,
      service: 'Window Cleaning',
      date: '2024-05-10',
      time: '11:30 AM',
      location: '789 Pine Rd, New York',
      provider: 'Mike Brown',
      status: 'completed',
      price: '$80',
    },
    {
      id: 4,
      service: 'Carpet Cleaning',
      date: '2024-05-25',
      time: '9:00 AM',
      location: '321 Elm St, New York',
      provider: 'Emma Wilson',
      status: 'confirmed',
      price: '$200',
    },
  ];

  const displayedAppointments = fullView ? appointments : appointments.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'completed':
        return 'bg-blue-900 text-blue-200 border-blue-700';
      default:
        return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {displayedAppointments.map((appointment) => (
        <div
          key={appointment.id}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-600 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-white">{appointment.service}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar size={16} className="text-orange-500" />
                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={16} className="text-orange-500" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={16} className="text-orange-500" />
                  <span>{appointment.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User size={16} className="text-orange-500" />
                  <span>{appointment.provider}</span>
                </div>
              </div>
            </div>

            <div className="text-right ml-4 flex flex-col items-end justify-between">
              <span className="text-2xl font-bold text-orange-500">{appointment.price}</span>
              <ChevronRight size={24} className="text-gray-600 group-hover:text-orange-600 transition mt-8" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
            <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition">
              Reschedule
            </button>
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition">
              Cancel
            </button>
          </div>
        </div>
      ))}

      {!fullView && appointments.length > 3 && (
        <button className="w-full bg-gray-800 border border-gray-700 hover:border-orange-600 text-orange-600 hover:text-orange-500 py-3 rounded-xl font-semibold transition mt-6">
          View All Appointments
        </button>
      )}

      {displayedAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No appointments scheduled yet</p>
          <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition">
            Book an Appointment
          </button>
        </div>
      )}
    </div>
  );
};
