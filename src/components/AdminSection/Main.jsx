import { Stats } from "./Stats"
import { Table } from "./Table"
import { Services } from "./Services"

export const Main = ({ activeTab, sidebarOpen }) => {
  return (
    <main className="transition-all duration-300">
      {/* Page Content */}
      <div className="p-8" style={{ marginLeft: sidebarOpen ? '256px' : '0' }}>
        
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2">Welcome back, Admin</h2>
              <p className="text-gray-400">Here's your appointment system overview</p>
            </div>

            <Stats />
            <Table />
          </>
        )}

        {activeTab === 'appointments' && (
          <>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-2xl font-bold mb-4">Manage Appointments</h3>
            <p className="text-gray-400">View, edit, and manage all your appointments here. You can filter, search, and perform bulk actions.</p>
            
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 PT-8 mt-6">
            <Services />
          </div>
          </>
      )}

        {activeTab === 'clients' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-2xl font-bold mb-4">Client Management</h3>
            <p className="text-gray-400">View and manage your client database. Track client history and preferences.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-2xl font-bold mb-4">Settings</h3>
            <p className="text-gray-400">Configure your appointment system, business hours, and preferences.</p>
          </div>
        )}
        
      </div>
    </main>
  )
}
export default Main;