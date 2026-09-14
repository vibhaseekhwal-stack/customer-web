import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  UserCircle,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">

          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => handleNavigate("/home")}
              className="group flex min-w-0 items-center gap-2 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf7ef] text-lg font-black text-[#16823b] transition group-hover:scale-105 sm:h-10 sm:w-10">
                🛒
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-black tracking-tight text-gray-900 sm:text-base lg:text-lg">
                  CD Shopping{" "}
                  <span className="text-[#16823b]">Hub</span>
                </h1>

                <p className="hidden text-[10px] font-medium text-gray-400 sm:block">
                  Fresh & Fast Delivery
                </p>
              </div>
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              <button
                type="button"
                onClick={() => handleNavigate("/home")}
                className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#16823b] after:transition-transform hover:after:scale-x-100"
              >
                Groceries
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/staples")}
                className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#16823b] after:transition-transform hover:after:scale-x-100"
              >
                Staples
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/personal-care")}
                className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#16823b] after:transition-transform hover:after:scale-x-100"
              >
                Personal Care
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/deals")}
                className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#16823b] after:transition-transform hover:after:scale-x-100"
              >
                Deals
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/orders")}
                className="relative px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#16823b] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#16823b] after:transition-transform hover:after:scale-x-100"
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">

            <div className="hidden h-10 w-[200px] items-center gap-2 rounded-xl border border-transparent bg-[#f4f8f4] px-3.5 transition focus-within:border-[#16823b] focus-within:bg-white focus-within:shadow-sm sm:flex lg:w-[280px]">
              <Search
                size={15}
                strokeWidth={2.2}
                className="shrink-0 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search for groceries..."
                className="w-full bg-transparent text-xs font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 lg:flex"
            >
              <MapPin
                size={15}
                strokeWidth={2.2}
                className="text-[#16823b]"
              />

              <span className="max-w-[100px] truncate">
                Location
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/account")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b] sm:h-10 sm:w-10"
              aria-label="Account"
            >
              <UserCircle
                size={20}
                strokeWidth={2}
              />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/cart")}
              className="flex h-9 items-center gap-2 rounded-xl bg-[#16823b] px-3 text-xs font-extrabold text-white shadow-md shadow-green-900/20 transition-all hover:bg-[#116d30] active:scale-95 sm:h-10 sm:px-4"
            >
              <ShoppingCart
                size={16}
                strokeWidth={2.5}
              />

              <span className="hidden sm:inline">
                Cart
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b] md:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu
                size={21}
                strokeWidth={2.3}
              />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-white md:hidden">

          <div className="flex h-full min-h-0 w-full flex-col bg-white">

            <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm sm:px-6">

              <button
                type="button"
                onClick={() => handleNavigate("/home")}
                className="group flex items-center gap-2 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7ef] text-lg font-black text-[#16823b] transition group-hover:scale-105">
                  🛒
                </div>

                <div>
                  <h1 className="text-sm font-black tracking-tight text-gray-900">
                    CD Shopping{" "}
                    <span className="text-[#16823b]">Hub</span>
                  </h1>

                  <p className="text-[9px] font-medium text-gray-400">
                    Fresh & Fast Delivery
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                aria-label="Close menu"
              >
                <X
                  size={21}
                  strokeWidth={2.3}
                />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-6">

              <div className="mb-4 flex h-11 w-full items-center gap-2 rounded-xl bg-[#f4f8f4] px-3.5">
                <Search
                  size={16}
                  strokeWidth={2.2}
                  className="shrink-0 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search for groceries..."
                  className="w-full bg-transparent text-xs font-medium text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>

              <nav className="flex flex-col">

                <button
                  type="button"
                  onClick={() => handleNavigate("/home")}
                  className="rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  Groceries
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/staples")}
                  className="rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  Staples
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/personal-care")}
                  className="rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  Personal Care
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/deals")}
                  className="rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  Deals
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/orders")}
                  className="rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  Orders
                </button>

                <div className="my-2 h-px bg-gray-100" />

                <button
                  type="button"
                  onClick={() => handleNavigate("/account")}
                  className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  <UserCircle
                    size={18}
                    strokeWidth={2}
                  />

                  Account
                </button>

                <button
                  type="button"
                  className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-left text-sm font-medium text-gray-700 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
                >
                  <MapPin
                    size={18}
                    strokeWidth={2}
                    className="text-[#16823b]"
                  />

                  Location
                </button>

              </nav>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;