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

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)

    try {
      // Request OTP from backend
      const data = await requestOtp(cleanPhone)

      // Save phone for OTP page
      localStorage.setItem(
        PENDING_PHONE_KEY,
        cleanPhone
      )

      // Save development OTP if backend provides it
      if (data?.devOnlyOtp) {
        sessionStorage.setItem(
          DEV_OTP_KEY,
          String(data.devOnlyOtp)
        )
      }

      // Go to OTP page
      navigate('/otp')

    } catch (err) {
      console.error('OTP error:', err)

      setError(
        err?.message || 'Could not send OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">

      <div className="w-full max-w-[384px]">

        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-[24px] font-bold leading-[30px] text-primary">
            CD Shopping Hub
          </h1>

          <p className="mt-1 text-body-sm text-on-surface-variant">
            Fresh groceries, delivered from your neighbourhood shop.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm sm:p-8">

          <h2 className="font-display text-headline-sm font-bold text-ink">
            Log in with your phone
          </h2>

          <p className="mt-1 text-body-sm text-ink-soft">
            We'll send you a one-time code to verify.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-5"
          >

            {/* Mobile Number */}
            <label
              htmlFor="phone"
              className="mb-2 block text-label-lg text-ink"
            >
              Mobile Number
            </label>

            <div
              className={`flex h-12 overflow-hidden rounded-lg border ${
                error
                  ? 'border-error'
                  : 'border-outline-variant focus-within:border-primary'
              }`}
            >
              <div className="flex w-[58px] shrink-0 items-center justify-center border-r border-outline-variant bg-surface-container-low text-body-sm text-on-surface-variant">
                +91
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
                  const value = event.target.value.replace(
                    /\D/g,
                    ''
                  )

                  setPhone(value)
                  setError('')
                }}
                placeholder="98765 43210"
                className="w-full bg-white px-4 text-body-sm text-ink outline-none placeholder:text-ink-soft"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="mt-2 text-body-sm text-error">
                {error}
              </p>
            )}

            {/* Send OTP */}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 h-12 w-full rounded-lg bg-primary font-body text-label-lg text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>

          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs leading-5 text-ink-soft">
            By continuing, you agree to our{' '}
            <span className="font-semibold text-primary">
              Terms & Conditions
            </span>{' '}
            and{' '}
            <span className="font-semibold text-primary">
              Privacy Policy
            </span>
            .
          </p>

        </div>
      </div>

    </main>
  )
}

export default Login