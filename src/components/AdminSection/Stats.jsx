import { Calendar, Users, BarChart3, Settings } from 'lucide-react'

export const Stats = () => {
  const stats = [
    { label: 'Total Appointments', value: '156', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Active Clients', value: '42', icon: Users, color: 'bg-green-500' },
    { label: 'Revenue', value: '$12,450', icon: BarChart3, color: 'bg-orange-500' },
    { label: 'Pending Tasks', value: '8', icon: Settings, color: 'bg-purple-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, id) => {
        const Icon = stat.icon
        return (
          <div key={id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default Stats;