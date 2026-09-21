
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

  const handleSubmit = async event => {
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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f8f2]">

      <div className="pointer-events-none absolute -left-32 -top-32 h-[300px] w-[300px] rounded-full bg-[#dceacb] blur-[2px] sm:-left-40 sm:-top-40 sm:h-[450px] sm:w-[450px] lg:h-[520px] lg:w-[520px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[380px] w-[380px] rounded-full bg-[#e7efd9] sm:-bottom-56 sm:-right-40 sm:h-[500px] sm:w-[500px] lg:h-[600px] lg:w-[600px]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] text-[45px] opacity-15 sm:text-[60px] lg:text-[70px]">
        ✦
      </div>

      <div className="pointer-events-none absolute right-[8%] top-[10%] text-[30px] opacity-15 sm:text-[40px] lg:text-[42px]">
        ·
      </div>

      <div className="pointer-events-none absolute bottom-[15%] left-[7%] text-[35px] opacity-15 sm:text-[45px] lg:text-[50px]">
        +
      </div>

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-3 py-5 sm:px-5 sm:py-8 lg:px-8">

        <div className="w-full max-w-[1080px]">

          <div className="mb-4 flex items-center justify-center gap-2.5 sm:mb-5 sm:gap-3">

            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#315d32] shadow-lg shadow-[#315d32]/20 sm:h-12 sm:w-12 sm:rounded-[18px]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="sm:h-[27px] sm:w-[27px]"
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

            <div className="min-w-0">
              <h1 className="font-display truncate text-lg font-bold tracking-tight text-[#244327] sm:text-xl">
                CD Shopping Hub
              </h1>

              <p className="text-[8px] font-medium uppercase tracking-[1.5px] text-[#81907b] sm:text-[10px] sm:tracking-[2px]">
                Fresh · Local · Simple
              </p>
            </div>

          </div>

          <div className="grid w-full overflow-hidden rounded-[26px] border border-white/80 bg-white/90 shadow-[0_20px_70px_rgba(47,70,39,0.10)] backdrop-blur-xl sm:rounded-[32px] md:min-h-[600px] md:grid-cols-[1fr_400px] lg:min-h-[620px] lg:grid-cols-[1fr_430px] lg:rounded-[36px]">

            <div className="relative hidden overflow-hidden bg-[#315d32] md:block">

              <div className="absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#86a95f]/30 lg:h-[360px] lg:w-[360px]" />

              <div className="absolute -bottom-28 -left-28 h-[360px] w-[360px] rounded-full border-[55px] border-[#9bbb72]/10 lg:-bottom-32 lg:-left-32 lg:h-[430px] lg:w-[430px]" />

              <div className="absolute right-[12%] top-[14%] flex h-14 w-14 rotate-12 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-md lg:h-16 lg:w-16 lg:text-3xl">
                🍅
              </div>

              <div className="absolute bottom-[23%] left-[9%] flex h-14 w-14 -rotate-12 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-md lg:h-16 lg:w-16 lg:text-3xl">
                🥑
              </div>

              <div className="absolute bottom-[12%] right-[15%] flex h-12 w-12 rotate-6 items-center justify-center rounded-2xl bg-white/10 text-xl backdrop-blur-md lg:h-14 lg:w-14 lg:text-2xl">
                🍋
              </div>

              <div className="relative z-10 flex h-full flex-col justify-center px-8 py-10 lg:px-14">

                <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[10px] font-medium text-white/80 backdrop-blur-md lg:mb-6 lg:px-4 lg:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8df7d] lg:h-2 lg:w-2" />
                  Your local grocery store
                </span>

                <h2 className="font-display text-[38px] font-bold leading-[1.05] tracking-[-1px] text-white lg:text-[54px] lg:tracking-[-1.5px]">
                  Good food,
                  <br />
                  <span className="text-[#b8df7d]">
                    good mood.
                  </span>
                </h2>

                <p className="mt-5 max-w-[410px] text-[13px] leading-6 text-white/65 lg:mt-6 lg:text-[15px] lg:leading-7">
                  Everything you need for your everyday kitchen,
                  carefully picked and delivered from stores around you.
                </p>

                <div className="mt-8 flex flex-wrap gap-2.5 lg:mt-10 lg:gap-3">

                  <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur-md lg:px-4 lg:py-3">
                    <p className="text-base font-bold text-white lg:text-lg">
                      Fresh
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/50 lg:text-[10px]">
                      Every day
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur-md lg:px-4 lg:py-3">
                    <p className="text-base font-bold text-white lg:text-lg">
                      Local
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/50 lg:text-[10px]">
                      Near you
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur-md lg:px-4 lg:py-3">
                    <p className="text-base font-bold text-white lg:text-lg">
                      Easy
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/50 lg:text-[10px]">
                      To order
                    </p>
                  </div>

                </div>
              </div>
            </div>

            <div className="flex min-h-[570px] items-center bg-white px-5 py-8 sm:px-8 sm:py-10 md:min-h-0 md:px-7 lg:px-10">

              <div className="mx-auto w-full max-w-[390px]">

                <div className="mb-7 sm:mb-9">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#eef5e7] sm:mb-6 sm:h-14 sm:w-14 sm:rounded-[20px]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="sm:h-[27px] sm:w-[27px]"
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

                  <h2 className="font-display text-[26px] font-bold leading-tight text-[#202a20] sm:text-[30px]">
                    Let's get you in.
                  </h2>

                  <p className="mt-2 max-w-[320px] text-xs leading-5 text-[#8a9287] sm:text-sm sm:leading-6">
                    Enter your phone number. We'll verify you
                    with a quick one-time code.
                  </p>

                </div>

                <form onSubmit={handleSubmit}>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[1px] text-[#606960] sm:mb-2.5 sm:text-xs"
                  >
                    Mobile number
                  </label>

                  <div
                    className={`flex h-14 items-center rounded-[17px] border bg-[#fafcf8] px-1.5 transition-all sm:h-[62px] sm:rounded-[20px] sm:px-2 ${
                      error
                        ? 'border-red-400 ring-4 ring-red-100'
                        : 'border-[#e0e6dc] focus-within:border-[#5e9742] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6c9d50]/10'
                    }`}
                  >

                    <div className="flex h-11 shrink-0 items-center rounded-[13px] bg-[#edf3e9] px-3 sm:h-12 sm:rounded-[15px] sm:px-4">
                      <span className="text-xs font-bold text-[#4d594c] sm:text-sm">
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
                      onChange={event => {
                        const value =
                          event.target.value.replace(/\D/g, '')

                        setPhone(value)
                        setError('')
                      }}
                      placeholder="98765 43210"
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#202820] outline-none placeholder:text-[#aab1a6] sm:px-4 sm:text-[15px]"
                    />

                    {phone.length === 10 && (
                      <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5f2dc] sm:mr-3 sm:h-7 sm:w-7">
                        <svg
                          width="14"
                          height="14"
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
                    <p className="mt-2 text-[10px] font-medium text-red-500 sm:text-xs">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-4 flex h-14 w-full items-center justify-between rounded-[17px] bg-[#315d32] px-4 text-xs font-bold text-white shadow-lg shadow-[#315d32]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#274d29] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:h-[62px] sm:rounded-[20px] sm:px-5 sm:text-sm"
                  >

                    <span>
                      {loading
                        ? 'Sending OTP...'
                        : 'Continue securely'}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200 group-hover:translate-x-1 sm:h-10 sm:w-10 sm:rounded-[14px]">

                      {loading ? (
                        <svg
                          className="h-4 w-4 animate-spin sm:h-5 sm:w-5"
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
                          width="18"
                          height="18"
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

                <div className="mt-6 flex items-center gap-2.5 border-t border-[#edf0ea] pt-5 sm:mt-8 sm:gap-3 sm:pt-6">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f5ec] sm:h-9 sm:w-9 sm:rounded-xl">
                    <svg
                      width="16"
                      height="16"
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

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#4b554a] sm:text-xs">
                      Safe & secure
                    </p>

                    <p className="mt-0.5 text-[8px] leading-4 text-[#969e93] sm:text-[10px]">
                      Your number is protected and only used for verification.
                    </p>
                  </div>

                </div>

                <p className="mt-6 text-center text-[8px] leading-4 text-[#9aa197] sm:mt-7 sm:text-[10px] sm:leading-5">
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

          <p className="mt-3 text-center text-[8px] font-medium tracking-[1.5px] text-[#9aa197] sm:mt-4 sm:text-[10px] sm:tracking-wide">
            FRESH SHOPPING · MADE SIMPLE
          </p>

        </div>
      </div>
    </main>
  )
}

export default Login

