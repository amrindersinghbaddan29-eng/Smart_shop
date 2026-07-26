import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'
import Addresses from './pages/Addresses'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminMessages from './pages/admin/AdminMessages'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

function AdminProtected({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/login" />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/*" element={
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Protected><Cart /></Protected>} />
            <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
            <Route path="/order-success" element={<Protected><OrderSuccess /></Protected>} />
            <Route path="/orders" element={<Protected><Orders /></Protected>} />
            <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
            <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/addresses" element={<Protected><Addresses /></Protected>} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/admin/*" element={
              <AdminProtected>
                <AdminLayout />
              </AdminProtected>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          <Footer />
        </>
      } />
    </Routes>
  )
}
