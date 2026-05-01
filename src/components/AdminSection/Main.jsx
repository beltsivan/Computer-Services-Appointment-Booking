import { Stats } from "./Stats"
import { Table } from "./Table"
import { Services } from "./Services"
import { Clients } from "./Clients"
import { ManageAppointments } from "./ManageAppointments"

export const Main = ({ activeTab, sidebarOpen, sidebarMinimized }) => {
return (
    <main 
      className={`
        transition-all duration-300 bg-gray-900 min-h-screen w-full
        pt-12 lg:pt-12
        ${sidebarMinimized ? 'lg:pl-16' : 'lg:pl-64'}
      `}
    >
      <div className="my-4 p-4 md:p-6 lg:p-8 w-full max-w-full overflow-hidden">
        
        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">Welcome back, Admin</h2>
              <p className="text-gray-400 text-sm md:text-base">Here's your appointment system overview</p>
            </div>
            <Stats />
            <Table />
          </>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 md:space-y-8">
            <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
              <ManageAppointments />
            </div>

            <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
              <Services />
            </div>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
            <Clients />
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 p-4 md:p-6 w-full">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Settings</h3>
            <p className="text-gray-400 text-sm md:text-base">Configure your appointment system, business hours, and preferences.</p>
          </div>
        )}

      </div>
    </main>
  )
}
export default Main;
