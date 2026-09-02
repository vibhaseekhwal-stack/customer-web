import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  requestOtp,
  verifyOtp,
  saveSession,
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
    const storedPhone = localStorage.getItem(
      PENDING_PHONE_KEY
    )

    if (!storedPhone) {
      navigate('/', { replace: true })
      return
    }

    setPhone(storedPhone)

    const storedDevOtp =
      sessionStorage.getItem(DEV_OTP_KEY)

    if (storedDevOtp) {
      setDevOtp(storedDevOtp)
    }
  }, [navigate])

  // Resend countdown
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
    navigate('/')
  }

  async function handleVerify(event) {
    event.preventDefault()

    setError('')

    const trimmedCode = code.trim()

    if (!trimmedCode) {
      setError('Please enter the OTP')
      return
    }

    try {
      setVerifying(true)

      const data = await verifyOtp(
        phone,
        trimmedCode
      )

      saveSession({
        accessToken: data.accessToken,
        customer: data.customer,
      })

      localStorage.removeItem(PENDING_PHONE_KEY)
      sessionStorage.removeItem(DEV_OTP_KEY)

      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Incorrect code')
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
          data.devOnlyOtp
        )

        setDevOtp(data.devOnlyOtp)
      }

      setSecondsLeft(30)
    } catch (err) {
      setError(
        err.message || 'Failed to resend OTP'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 flex items-center gap-1 text-sm font-semibold text-gray-500"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>

          Change number
        </button>

        {/* Card */}
        <div className="rounded-xl bg-white p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-1 text-xl font-bold text-gray-900">
            Enter the code
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Sent to{' '}
            <span className="font-semibold text-gray-900">
              +91 {phone}
            </span>
          </p>

          {/* Development OTP */}
          {devOtp && (
            <div className="mb-4 rounded-lg border border-green-700 bg-green-50 p-3 text-sm text-green-700">
              Testing mode — no SMS provider is set
              up yet, so your code is:{' '}
              <strong>{devOtp}</strong>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerify}>
            <input
              value={code}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)

                setCode(value)
              }}
              inputMode="numeric"
              maxLength={6}
              placeholder="------"
              autoComplete="one-time-code"
              required
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-green-700"
            />

            <button
              type="submit"
              disabled={verifying}
              className="h-12 w-full rounded-lg bg-green-700 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying
                ? 'Verifying...'
                : 'Verify & Continue'}
            </button>
          </form>

          {/* Resend */}
          <button
            type="button"
            onClick={handleResend}
            disabled={
              secondsLeft > 0 ||
              resending
            }
            className="mt-4 w-full text-center text-sm font-semibold text-green-700 disabled:text-gray-400"
          >
            {resending ? (
              'Resending...'
            ) : secondsLeft > 0 ? (
              <>
                Resend OTP ({secondsLeft}s)
              </>
            ) : (
              'Resend OTP'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Otp