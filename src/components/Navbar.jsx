import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  UserCircle,
  ShoppingCart,
} from 'lucide-react'

function Navbar() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left Section: Logo */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7ef] text-[#16823b] font-black text-lg transition group-hover:scale-105">
              🛒
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-gray-900 sm:text-lg">
                CD Shopping <span className="text-[#16823b]">Hub</span>
              </h1>
              <p className="text-[10px] font-medium text-gray-400">Fresh & Fast Delivery</p>
            </div>
          </button>

          {/* Navigation Links (Desktop) with Hover Underline & Color Change */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#16823b] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Groceries
            </button>

            <button
              type="button"
              onClick={() => navigate('/staples')}
              className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#16823b] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Staples
            </button>

            {/* Personal Care Button Updated to /personal-care route */}
            <button
              type="button"
              onClick={() => navigate('/personal-care')}
              className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#16823b] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Personal Care
            </button>

            {/* Deals Button Updated to /deals route */}
            <button
              type="button"
              onClick={() => navigate('/deals')}
              className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#16823b] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Deals
            </button>

            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#16823b] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Orders
            </button>
          </nav>
        </div>

        {/* Right Section: Search, Location, Account & Cart */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Search Bar */}
          <div className="hidden sm:flex h-10 w-[220px] lg:w-[280px] items-center gap-2 rounded-xl bg-[#f4f8f4] px-3.5 border border-transparent transition focus-within:border-[#16823b] focus-within:bg-white focus-within:shadow-sm">
            <Search
              size={15}
              strokeWidth={2.2}
              className="shrink-0 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search for groceries, staples..."
              className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* Location Selector */}
          <button
            type="button"
            className="hidden lg:flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
          >
            <MapPin
              size={15}
              strokeWidth={2.2}
              className="text-[#16823b]"
            />
            <span className="max-w-[100px] truncate">Location</span>
          </button>

          {/* Account Profile */}
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
            aria-label="Account"
          >
            <UserCircle
              size={20}
              strokeWidth={2}
            />
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#16823b] px-4 text-xs font-extrabold text-white shadow-md shadow-green-900/20 transition-all hover:bg-[#116d30] active:scale-95"
          >
            <ShoppingCart
              size={16}
              strokeWidth={2.5}
            />
            <span className="hidden sm:inline">Cart</span>
          </button>

        </div>
      </div>
    </header>
  )
}

export default Navbar