import { Plus, Eye, Edit2, Trash2 } from 'lucide-react'

export const Table = () => {

  const recentAppointments = [
    { id: 1, client: 'Sample1', service: 'Upgrade PC', date: '2026-04-05', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, client: 'Sample2', service: 'Clean PC', date: '2026-04-05', time: '11:30 AM', status: 'Pending' },
    { id: 3, client: 'Sample3', service: 'Repair PC', date: '2026-04-06', time: '02:00 PM', status: 'Confirmed' },
    { id: 4, client: 'Sample4', service: 'Clean Laptop', date: '2026-04-06', time: '03:30 PM', status: 'Cancelled' },
  ]

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-xl font-bold">Recent Appointments</h3>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition font-medium">
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700 bg-opacity-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date & Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {recentAppointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-700 hover:bg-opacity-50 transition">
                
                <td className="px-6 py-4">{apt.client}</td>
                <td className="px-6 py-4">{apt.service}</td>
                <td className="px-6 py-4">{apt.date} @ {apt.time}</td>

                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apt.status === 'Confirmed'
                      ? 'bg-green-500 bg-opacity-20 text-green-400'
                      : apt.status === 'Pending'
                      ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      : 'bg-red-500 bg-opacity-20 text-red-400'
                  }`}>
                    {apt.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    
                    <button className="text-blue-400 hover:text-blue-300" title="View">
                      <Eye size={18} />
                    </button>

                    <button className="text-orange-400 hover:text-orange-300" title="Edit">
                      <Edit2 size={18} />
                    </button>

                    <button className="text-red-400 hover:text-red-300" title="Delete">
                      <Trash2 size={18} />
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  )
}
export default Table;