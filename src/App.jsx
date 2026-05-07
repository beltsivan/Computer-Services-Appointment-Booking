import { Routes, Route } from "react-router-dom"
import { Home } from "./pages/Home"
import { Auth } from "./pages/AuthPage"
import { Admin } from "./pages/Admin"
import { UserDashboard } from "./pages/UserDashboard"
  
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard" element={<UserDashboard />} />
    </Routes>
  )
}
export default App
