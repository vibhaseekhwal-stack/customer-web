import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSession,
  requestOtp,
  PENDING_PHONE_KEY,
  DEV_OTP_KEY,
} from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getSession()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmedPhone = phone.trim()

    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError(
        'Enter a valid 10-digit mobile number.'
      )
      return
    }

    try {
      setLoading(true)

      const data = await requestOtp(trimmedPhone)

      localStorage.setItem(
        PENDING_PHONE_KEY,
        trimmedPhone
      )

      if (data?.devOnlyOtp) {
        sessionStorage.setItem(
          DEV_OTP_KEY,
          data.devOnlyOtp
        )
      }

      navigate('/otp')
    } catch (err) {
      setError(
        err.message || 'Could not send OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Welcome
          </h1>

          <p className="mb-6 text-sm text-gray-500">
            Enter your mobile number to continue
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Mobile Number
            </label>

            <div className="mb-4 flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-green-700">
              <span className="flex items-center border-r border-gray-300 px-3 text-sm text-gray-500">
                +91
              </span>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(event) => {
                  setPhone(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10)
                  )
                }}
                placeholder="Enter mobile number"
                className="w-full border-0 px-3 py-3 text-sm outline-none focus:ring-0"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-green-700 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Sending...'
                : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login