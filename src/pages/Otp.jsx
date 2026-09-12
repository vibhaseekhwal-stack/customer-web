import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  requestOtp,
  verifyOtp,
} from '../services/api'

const PENDING_PHONE_KEY = 'grocery_pending_otp_phone'
const DEV_OTP_KEY = 'grocery_dev_otp_hint'

function Otp() {
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(30)

  useEffect(() => {
    const storedPhone = localStorage.getItem(PENDING_PHONE_KEY)

    if (!storedPhone) {
      navigate('/login', { replace: true })
      return
    }

    setPhone(storedPhone)

    const storedDevOtp =
      sessionStorage.getItem(DEV_OTP_KEY) ||
      localStorage.getItem(DEV_OTP_KEY)

    if (storedDevOtp) {
      setDevOtp(storedDevOtp)
    }
  }, [navigate])

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  function handleBack() {
    navigate('/login')
  }

  async function handleVerify(event) {
    event.preventDefault()

    setError('')

    const trimmedCode = code.trim()

    if (!trimmedCode) {
      setError('Please enter the OTP')
      return
    }

    if (trimmedCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    try {
      setVerifying(true)

      const data = await verifyOtp(phone, trimmedCode)

      console.log('OTP verification response:', data)

      const session = JSON.parse(
        localStorage.getItem(
          'grocery_customer_session'
        )
      )

      console.log(
        'Saved customer session:',
        session
      )

      if (!session?.accessToken) {
        throw new Error(
          'Login successful, but access token was not received.'
        )
      }

      navigate('/home', {
        replace: true,
      })
    } catch (err) {
      console.error(
        'OTP verification error:',
        err
      )

      setError(
        err?.message || 'Incorrect code'
      )
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    if (resending || secondsLeft > 0) {
      return
    }

    setError('')

    try {
      setResending(true)

      const data = await requestOtp(phone)

      if (data?.devOnlyOtp) {
        sessionStorage.setItem(
          DEV_OTP_KEY,
          String(data.devOnlyOtp)
        )

        localStorage.setItem(
          DEV_OTP_KEY,
          String(data.devOnlyOtp)
        )

        setDevOtp(String(data.devOnlyOtp))
      }

      setCode('')
      setSecondsLeft(30)
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError(
        err?.message || 'Failed to resend OTP'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8f2]">
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#dceacb]" />
      <div className="absolute -bottom-52 -right-40 h-[580px] w-[580px] rounded-full bg-[#e6efd9]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-5">
        <div className="w-full max-w-[900px]">
          <div className="mb-5 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#315d32]">
                <span className="text-xl text-white">✓</span>
              </div>

              <div>
                <h1 className="text-base font-bold text-[#244327]">
                  CD Shopping Hub
                </h1>

                <p className="text-[8px] font-medium uppercase tracking-[2px] text-[#87927f]">
                  Fresh · Local · Simple
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_25px_70px_rgba(47,70,39,0.12)] md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative hidden min-h-[500px] overflow-hidden bg-[#315d32] md:block">
              <div className="absolute -right-28 -top-28 h-[350px] w-[350px] rounded-full bg-[#91b96a]/25" />

              <div className="relative z-10 flex h-full flex-col justify-center px-10 lg:px-12">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/10 text-2xl">
                    🔐
                  </div>

                  <div className="text-[10px] font-semibold text-white/50">
                    SECURE
                    <br />
                    VERIFICATION
                  </div>
                </div>

                <h2 className="text-[34px] font-bold leading-[1.08] text-white">
                  Almost there.
                  <br />
                  <span className="text-[#b8df7d]">
                    One little code.
                  </span>
                </h2>

                <p className="mt-4 max-w-[300px] text-xs leading-5 text-white/60">
                  We sent a six-digit verification code
                  to your mobile number. Enter it here
                  and you're ready to shop.
                </p>

                <div className="mt-6 flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-9 w-8 rounded-lg border border-white/10 bg-white/10"
                    />
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b8df7d] text-xs font-bold text-[#315d32]">
                    ✓
                  </div>

                  <span className="text-[10px] text-white/55">
                    Your account stays protected
                  </span>
                </div>
              </div>
            </div>

            <div className="flex min-h-[500px] items-center px-6 py-7 sm:px-10 lg:px-12">
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-5 flex items-center gap-2 text-xs font-bold text-[#7d867a] transition hover:text-[#315d32]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ed]">
                    ←
                  </span>

                  Change number
                </button>

                <div className="mb-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#eef5e7]">
                    <span className="text-xl text-[#315d32]">⌨</span>
                  </div>

                  <h2 className="text-[26px] font-bold leading-tight text-[#202a20]">
                    Verify your number
                  </h2>

                  <p className="mt-1.5 text-xs leading-5 text-[#899188]">
                    Enter the 6-digit code we sent to
                  </p>

                  <div className="mt-1.5">
                    <span className="rounded-lg bg-[#f0f5eb] px-2.5 py-1 text-xs font-bold text-[#315d32]">
                      +91 {phone}
                    </span>
                  </div>
                </div>

                {devOtp && (
                  <div className="mb-4 rounded-2xl border border-[#d9e9cc] bg-[#f2f8ec] p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e0efd4]">
                        🧪
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-[#416b36]">
                          Testing mode
                        </p>

                        <p className="mt-0.5 text-[10px] leading-4 text-[#71826b]">
                          SMS provider is not configured.
                          Your OTP is
                          <span className="ml-1 font-bold tracking-wider text-[#315d32]">
                            {devOtp}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-xl bg-[#fff0ef] px-3 py-2.5 text-[11px] font-medium text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify}>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[1px] text-[#667064]">
                    Verification code
                  </label>

                  <div
                    className={`rounded-[17px] border bg-[#fafcf8] p-1.5 transition-all ${
                      error
                        ? 'border-red-400 ring-4 ring-red-100'
                        : 'border-[#dfe6db] focus-within:border-[#5d9641] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6c9d50]/10'
                    }`}
                  >
                    <input
                      value={code}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)

                        setCode(value)
                        setError('')
                      }}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      required
                      className="h-[50px] w-full bg-transparent px-3 text-center text-[25px] font-bold tracking-[0.4em] text-[#273027] outline-none placeholder:text-[#c6ccc2]"
                    />
                  </div>

                  <p className="mt-1.5 text-center text-[9px] text-[#9ba39a]">
                    Enter all 6 digits to continue
                  </p>

                  <button
                    type="submit"
                    disabled={
                      verifying ||
                      code.length !== 6
                    }
                    className="group mt-4 flex h-[52px] w-full items-center justify-between rounded-[17px] bg-[#315d32] px-4 text-xs font-bold text-white shadow-lg shadow-[#315d32]/15 transition-all hover:-translate-y-0.5 hover:bg-[#274d29] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {verifying
                        ? 'Verifying...'
                        : 'Verify & continue'}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white/10">
                      {verifying ? '...' : '→'}
                    </span>
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="mb-1.5 text-[10px] text-[#9ba39a]">
                    Didn't receive the code?
                  </p>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={
                      secondsLeft > 0 ||
                      resending
                    }
                    className="text-[11px] font-bold text-[#4d873b] transition hover:text-[#315d32] disabled:cursor-not-allowed disabled:text-[#b7beb4]"
                  >
                    {resending
                      ? 'Sending a new code...'
                      : secondsLeft > 0
                        ? `Resend code in ${secondsLeft}s`
                        : 'Resend OTP'}
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 border-t border-[#edf0ea] pt-4 text-[9px] text-[#9aa197]">
                  🛡 Secure one-time verification
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[9px] font-medium tracking-[1.5px] text-[#9ba39a]">
            FRESH SHOPPING · MADE SIMPLE
          </p>
        </div>
      </div>
    </main>
  )
}

export default Otp