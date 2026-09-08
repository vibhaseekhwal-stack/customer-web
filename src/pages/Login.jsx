
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  requestOtp,
  PENDING_PHONE_KEY,
  DEV_OTP_KEY,
} from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const cleanPhone = phone.trim()

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)

    try {
      const data = await requestOtp(cleanPhone)

      localStorage.setItem(
        PENDING_PHONE_KEY,
        cleanPhone
      )

      if (data?.devOnlyOtp) {
        sessionStorage.setItem(
          DEV_OTP_KEY,
          String(data.devOnlyOtp)
        )
      }

      navigate('/otp')
    } catch (err) {
      console.error('OTP error:', err)
      setError(err?.message || 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8f2]">

      {/* Organic Background */}
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#dceacb]" />
      <div className="absolute -bottom-56 -right-40 h-[600px] w-[600px] rounded-full bg-[#e7efd9]" />

      <div className="absolute left-[7%] top-[16%] text-[70px] opacity-20">
        ✦
      </div>

      <div className="absolute right-[10%] top-[12%] text-[42px] opacity-20">
        ·
      </div>

      <div className="absolute bottom-[18%] left-[8%] text-[50px] opacity-20">
        +
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">

        <div className="w-full max-w-[1020px]">

          {/* Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">

            <div className="relative flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#315d32] shadow-lg shadow-[#315d32]/20">

              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 21C12 21 5 17.5 5 11V5.5C8 5.5 10.5 6.5 12 9C13.5 6.5 16 5.5 19 5.5V11C19 17.5 12 21 12 21Z"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9V17"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

            </div>

            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-[#244327]">
                CD Shopping Hub
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[2px] text-[#81907b]">
                Fresh · Local · Simple
              </p>
            </div>

          </div>

          {/* Main */}
          <div className="grid overflow-hidden rounded-[36px] border border-white/80 bg-white/80 shadow-[0_30px_100px_rgba(47,70,39,0.12)] backdrop-blur-xl md:grid-cols-[1fr_430px]">

            {/* Visual Side */}
            <div className="relative hidden min-h-[620px] overflow-hidden bg-[#315d32] md:block">

              {/* Shapes */}
              <div className="absolute -right-28 -top-28 h-[360px] w-[360px] rounded-full bg-[#86a95f]/30" />
              <div className="absolute -bottom-32 -left-32 h-[430px] w-[430px] rounded-full border-[70px] border-[#9bbb72]/10" />

              {/* Floating Items */}
              <div className="absolute right-[13%] top-[15%] flex h-16 w-16 rotate-12 items-center justify-center rounded-2xl bg-white/10 text-3xl backdrop-blur-md">
                🍅
              </div>

              <div className="absolute bottom-[24%] left-[11%] flex h-16 w-16 -rotate-12 items-center justify-center rounded-2xl bg-white/10 text-3xl backdrop-blur-md">
                🥑
              </div>

              <div className="absolute bottom-[13%] right-[17%] flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-md">
                🍋
              </div>

              <div className="relative z-10 flex h-full flex-col justify-center px-12 lg:px-16">

                <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#b8df7d]" />
                  Your local grocery store
                </span>

                <h2 className="max-w-[480px] font-display text-[48px] font-bold leading-[1.05] tracking-[-1.5px] text-white lg:text-[54px]">
                  Good food,
                  <br />
                  <span className="text-[#b8df7d]">
                    good mood.
                  </span>
                </h2>

                <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-white/65">
                  Everything you need for your everyday kitchen,
                  carefully picked and delivered from stores around you.
                </p>

                {/* Mini Stats */}
                <div className="mt-10 flex gap-3">

                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-lg font-bold text-white">
                      Fresh
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/50">
                      Every day
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-lg font-bold text-white">
                      Local
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/50">
                      Near you
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-lg font-bold text-white">
                      Easy
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/50">
                      To order
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* Login */}
            <div className="flex min-h-[620px] items-center bg-white px-7 py-12 sm:px-10">

              <div className="w-full">

                <div className="mb-9">

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef5e7]">

                    <svg
                      width="27"
                      height="27"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="6"
                        y="3"
                        width="12"
                        height="18"
                        rx="3"
                        stroke="#315d32"
                        strokeWidth="1.7"
                      />

                      <path
                        d="M9 7H15"
                        stroke="#315d32"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="12"
                        cy="17"
                        r="1"
                        fill="#315d32"
                      />
                    </svg>

                  </div>

                  <h2 className="font-display text-[30px] font-bold leading-tight text-[#202a20]">
                    Let's get you in.
                  </h2>

                  <p className="mt-2 max-w-[320px] text-sm leading-6 text-[#8a9287]">
                    Enter your phone number. We'll verify you
                    with a quick one-time code.
                  </p>

                </div>

                <form onSubmit={handleSubmit}>

                  <label
                    htmlFor="phone"
                    className="mb-2.5 block text-xs font-bold uppercase tracking-[1px] text-[#606960]"
                  >
                    Mobile number
                  </label>

                  {/* Unique Input */}
                  <div
                    className={`flex h-[62px] items-center rounded-[20px] border bg-[#fafcf8] px-2 transition-all ${
                      error
                        ? 'border-red-400 ring-4 ring-red-100'
                        : 'border-[#e0e6dc] focus-within:border-[#5e9742] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6c9d50]/10'
                    }`}
                  >

                    <div className="flex h-[48px] items-center rounded-[15px] bg-[#edf3e9] px-4">
                      <span className="text-sm font-bold text-[#4d594c]">
                        +91
                      </span>
                    </div>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(/\D/g, '')

                        setPhone(value)
                        setError('')
                      }}
                      placeholder="98765 43210"
                      className="h-full w-full bg-transparent px-4 text-[15px] font-medium text-[#202820] outline-none placeholder:text-[#aab1a6]"
                    />

                    {phone.length === 10 && (
                      <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e5f2dc]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12L9.5 16.5L19 7"
                            stroke="#4e8b38"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}

                  </div>

                  {error && (
                    <p className="mt-2.5 text-xs font-medium text-red-500">
                      {error}
                    </p>
                  )}

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-5 flex h-[62px] w-full items-center justify-between rounded-[20px] bg-[#315d32] px-5 text-sm font-bold text-white shadow-lg shadow-[#315d32]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#274d29] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <span>
                      {loading ? 'Sending OTP...' : 'Continue securely'}
                    </span>

                    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 transition-transform duration-200 group-hover:translate-x-1">

                      {loading ? (
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.3"
                          />
                          <path
                            d="M21 12a9 9 0 0 0-9-9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12H19M13 6L19 12L13 18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}

                    </span>

                  </button>

                </form>

                {/* Trust */}
                <div className="mt-8 flex items-center gap-3 border-t border-[#edf0ea] pt-6">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f5ec]">

                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 3L19 6V11.5C19 16.2 16 19.5 12 21C8 19.5 5 16.2 5 11.5V6L12 3Z"
                        stroke="#527e45"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12L11 14L15 10"
                        stroke="#527e45"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#4b554a]">
                      Safe & secure
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-[#969e93]">
                      Your number is protected and only used for verification.
                    </p>
                  </div>

                </div>

                {/* Terms */}
                <p className="mt-7 text-center text-[10px] leading-5 text-[#9aa197]">
                  By continuing, you agree to our{' '}
                  <span className="font-semibold text-[#527e45]">
                    Terms & Conditions
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-[#527e45]">
                    Privacy Policy
                  </span>
                  .
                </p>

              </div>
            </div>

          </div>

          <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-[#9aa197]">
            FRESH SHOPPING · MADE SIMPLE
          </p>

        </div>
      </div>
    </main>
  )
}

export default Login

