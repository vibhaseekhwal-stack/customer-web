import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

import Login from './pages/Login'
import Otp from './pages/Otp'
import Home from './pages/Home'
import Product from './pages/Product'
import Category from './pages/Category'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import Account from './pages/Account'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Staples from './pages/Staples'
import PersonalCare from './pages/PersonalCare'
import Deals from './pages/Deals'

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7faf7] flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/otp"
        element={<Otp />}
      />

      <Route element={<AppLayout />}>
        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/category/:categoryId"
          element={<Category />}
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

        <Route
          path="/staples"
          element={<Staples />}
        />

        <Route
          path="/personal-care"
          element={<PersonalCare />}
        />

        <Route
          path="/deals"
          element={<Deals />}
        />
      </Route>
    </Routes>
  )
}

export default App