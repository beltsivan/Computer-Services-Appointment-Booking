import { Stats } from "./Stats"
import { Table } from "./Table"
import { Services } from "./Services"
import { Clients } from "./Clients"
import { ManageAppointments } from "./ManageAppointments"

export const Main = ({ activeTab, sidebarOpen }) => {
  return (
    <main className="transition-all duration-300 bg-gray-800 min-h-screen" >
      <div className="p-8" style={{ marginLeft: sidebarOpen ? '256px' : '0' }}>

        {/* ── Overview ── */}
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

        {/* ── Appointments ── */}
        {activeTab === 'appointments' && (
          <div className="space-y-8">
            {/* Manage Appointments */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <ManageAppointments />
            </div>

            {/* Services Management */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <Services />
            </div>
          </div>
        )}

        {/* ── Clients ── */}
        {activeTab === 'clients' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <Clients />
          </div>
        )}

        {/* ── Settings ── */}
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