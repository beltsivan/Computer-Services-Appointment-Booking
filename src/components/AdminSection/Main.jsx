import { Stats } from "./Stats"
import { Table } from "./Table"
import { Appointments } from "./appointments"
import { Clients } from "./clients"
import { Settings } from "./settings"

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

        {activeTab === 'appointments' && <Appointments />}

        {activeTab === 'clients' && <Clients />}

        {activeTab === 'settings' && <Settings />}
      </div>
    </main>
  )
}
export default Main;