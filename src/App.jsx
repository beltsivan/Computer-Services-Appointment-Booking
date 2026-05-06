import { Routes, Route } from "react-router-dom"
import { Home } from "./pages/Home"
import { Auth } from "./pages/AuthPage"
import { Admin } from "./pages/Admin"
import { UserDashboard } from "./pages/UserDashboard"
import { ProtectedRoute } from "./components/Authentication/ProtectedRoute"
  
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Auth" element={<Auth />} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><Admin /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRole="customer"><UserDashboard /></ProtectedRoute>} />
    </Routes>
  )
}
export default App
