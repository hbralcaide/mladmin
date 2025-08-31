import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import Stalls from './pages/Stalls'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import MarketSections from './pages/MarketSections'
import Products from './pages/Products'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="market-sections" element={<MarketSections />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="stalls" element={<Stalls />} />
            <Route path="products" element={<Products />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App