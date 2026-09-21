import React from "react";

function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white pt-10 pb-6 text-[#172019] sm:pt-12 sm:pb-7 lg:pt-16 lg:pb-8">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-5 lg:gap-10 xl:gap-12">

          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7ef] text-xl font-black text-[#16823b]">
                🛒
              </div>

              <div className="min-w-0">
                <span className="text-base font-black tracking-tight text-gray-900 sm:text-lg">
                  CD Shopping <span className="text-[#16823b]">Hub</span>
                </span>

                <p className="text-[10px] font-medium text-gray-400">
                  Fresh & Fast Delivery
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-md text-xs leading-relaxed text-gray-500 sm:text-sm lg:max-w-sm">
              Delivering freshness and quality directly to your doorstep. Your
              trusted local marketplace for daily needs.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-[11px]">
                100% Secure Payments
              </p>

              <div className="flex max-w-md flex-wrap items-center gap-2">
                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-600 sm:text-xs">
                  UPI
                </span>

                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-600 sm:text-xs">
                  GPay
                </span>

                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-600 sm:text-xs">
                  PhonePe
                </span>

                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-600 sm:text-xs">
                  Cards
                </span>

                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-600 sm:text-xs">
                  COD
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Company
            </h4>

            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="#contact"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  Contact Us
                </a>
              </li>

              <li>
                <a
                  href="#locator"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  Store Locator
                </a>
              </li>

              <li>
                <a
                  href="#careers"
                  className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  Careers

                  <span className="rounded-full bg-[#16823b]/10 px-2 py-0.5 text-[8px] font-bold text-[#16823b] sm:text-[9px]">
                    We're hiring
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Support
            </h4>

            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#faq"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  FAQ
                </a>
              </li>

              <li>
                <a
                  href="#privacy"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#terms"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  Terms of Service
                </a>
              </li>

              <li>
                <a
                  href="#help"
                  className="text-xs text-gray-500 transition hover:text-[#16823b] sm:text-sm"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
              Connect With Us
            </h4>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-gray-500 sm:text-sm lg:max-w-xs">
              Questions or feedback? Reach out to us anytime.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="#share"
                aria-label="Share"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600 transition hover:bg-[#edf7ef] hover:text-[#16823b] sm:h-10 sm:w-10"
              >
                🔗
              </a>

              <a
                href="#email"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600 transition hover:bg-[#edf7ef] hover:text-[#16823b] sm:h-10 sm:w-10"
              >
                ✉️
              </a>

              <a
                href="#support"
                aria-label="Support Chat"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600 transition hover:bg-[#edf7ef] hover:text-[#16823b] sm:h-10 sm:w-10"
              >
                💬
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-100 pt-5 sm:mt-12 sm:pt-6 md:flex-row md:justify-between">
          <p className="text-center text-[10px] font-medium text-gray-400 sm:text-xs md:text-left">
            © {new Date().getFullYear()} CD Shopping Hub. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-gray-400 sm:gap-6 sm:text-xs">
            <a
              href="#privacy"
              className="transition hover:text-gray-600"
            >
              Privacy
            </a>

            <a
              href="#terms"
              className="transition hover:text-gray-600"
            >
              Terms
            </a>

            <a
              href="#sitemap"
              className="transition hover:text-gray-600"
            >
              Sitemap
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;

