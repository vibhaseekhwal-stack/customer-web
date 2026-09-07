import React from 'react'

function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white pt-16 pb-8 text-[#172019]">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
      

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7ef] text-xl font-black text-[#16823b]">
                🛒
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-gray-900">
                  CD Shopping <span className="text-[#16823b]">Hub</span>
                </span>
                <p className="text-[10px] font-medium text-gray-400">
                  Fresh & Fast Delivery
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-gray-500">
              Delivering freshness and quality directly to your doorstep. Your trusted local marketplace for daily needs.
            </p>

            {/* Payment Options / Trust Badges */}
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                100% Secure Payments
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <span className="rounded-md border border-gray-200 px-2 py-1 bg-gray-50">UPI</span>
                <span className="rounded-md border border-gray-200 px-2 py-1 bg-gray-50">GPay</span>
                <span className="rounded-md border border-gray-200 px-2 py-1 bg-gray-50">PhonePe</span>
                <span className="rounded-md border border-gray-200 px-2 py-1 bg-gray-50">Cards</span>
                <span className="rounded-md border border-gray-200 px-2 py-1 bg-gray-50">COD</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="#about" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#locator" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  Store Locator
                </a>
              </li>
              <li>
                <a href="#careers" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  Careers <span className="ml-1 rounded-full bg-[#16823b]/10 px-2 py-0.5 text-[9px] font-bold text-[#16823b]">We're hiring</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Support
            </h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="#faq" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#help" className="text-xs text-gray-500 transition hover:text-[#16823b]">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Connect With Us
            </h4>
            <p className="mt-4 text-xs text-gray-500">
              Questions or feedback? Reach out to us anytime.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#share"
                aria-label="Share"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
              >
                🔗
              </a>
              <a
                href="#email"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
              >
                ✉️
              </a>
              <a
                href="#support"
                aria-label="Support Chat"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-[#edf7ef] hover:text-[#16823b]"
              >
                💬
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Section */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-6 gap-4">
          <p className="text-xs font-medium text-gray-400">
            © {new Date().getFullYear()} CD Shopping Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <a href="#privacy" className="hover:text-gray-600">Privacy</a>
            <a href="#terms" className="hover:text-gray-600">Terms</a>
            <a href="#sitemap" className="hover:text-gray-600">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer