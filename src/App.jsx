import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

import Login from './pages/Login'
import Otp from './pages/Otp'
import Home from './pages/Home'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import Account from './pages/Account'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Staples from './pages/Staples'
import PersonalCare from './pages/PersonalCare'
import Deals from './pages/Deals' // <-- Deals import kiya

// Navbar aur Footer ke saath saare app pages
function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7faf7] flex flex-col justify-between">
      <div>
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>

      {/* =========================
          ROOT
      ========================== */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* =========================
          AUTH PAGES
          Navbar & Footer nahi hoga
      ========================== */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/otp"
        element={<Otp />}
      />

      {/* =========================
          APP PAGES
          Navbar & Footer automatically show hoga
      ========================== */}
      <Route element={<AppLayout />}>

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/product/:id"
          element={<Product />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/confirmation"
          element={<Confirmation />}
        />

        <Route
          path="/account"
          element={<Account />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetail />}
        />

        {/* Staples Page Route */}
        <Route
          path="/staples"
          element={<Staples />}
        />

        {/* Personal Care Page Route */}
        <Route
          path="/personal-care"
          element={<PersonalCare />}
        />

        {/* Deals Page Route */}
        <Route
          path="/deals"
          element={<Deals />}
        />

      </Route>

    </Routes>
  )
}

export default App