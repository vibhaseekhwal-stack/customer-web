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

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    try {
      setLoading(true)

      // Save phone for OTP page
      localStorage.setItem(
        PENDING_PHONE_KEY,
        cleanPhone
      )

      /*
       * Try backend OTP
       */
      const result = await requestOtp(cleanPhone)

      // If backend returns a development OTP
      if (result?.otp) {
        localStorage.setItem(
          DEV_OTP_KEY,
          String(result.otp)
        )
      }

      navigate('/otp')
    } catch (err) {
      console.error('OTP error:', err)

      /*
       * Development fallback
       * Backend unavailable hone par dummy OTP use hoga
       */
      localStorage.setItem(
        DEV_OTP_KEY,
        '1234'
      )

      navigate('/otp')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <span className="text-3xl">
              🥬
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-primary">
            VegGo
          </h1>

          <p className="mt-1 text-sm text-ink-soft">
            Fresh groceries, delivered to your door
          </p>

        </div>

        {/* Card */}
        <div className="rounded-xl bg-white p-6 shadow-md sm:p-8">

          <h2 className="font-display text-2xl font-bold text-ink">
            Welcome back!
          </h2>

          <p className="mt-2 text-sm text-ink-soft">
            Enter your mobile number to continue
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >

            {/* Phone */}
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Mobile Number
            </label>

            <div
              className={`flex overflow-hidden rounded-lg border ${
                error
                  ? 'border-error'
                  : 'border-outline-variant focus-within:border-primary'
              }`}
            >

              <div className="flex items-center border-r border-outline-variant bg-surface px-3 text-sm font-semibold text-ink">
                +91
              </div>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(
                    /\D/g,
                    ''
                  )

                  setPhone(value)
                  setError('')
                }}
                placeholder="Enter mobile number"
                className="w-full bg-white px-4 py-3 text-ink outline-none placeholder:text-ink-soft"
              />

            </div>

            {/* Error */}
            {error && (
              <p className="mt-2 text-sm text-error">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Sending OTP...'
                : 'Send OTP'}
            </button>

          </form>

          {/* Dummy OTP */}
          <div className="mt-5 rounded-lg bg-orange-50 p-3 text-center">
            <p className="text-xs text-ink-soft">
              Development OTP
            </p>

            <p className="mt-1 font-display text-lg font-bold text-accent">
              1234
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-ink-soft">
            By continuing, you agree to our Terms &
            Conditions and Privacy Policy.
          </p>

        </div>

      </div>

    </div>
  )
}

export default Login