import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  requestOtp,
  PENDING_PHONE_KEY,
  DEV_OTP_KEY,
} from '../services/api'

import { getReferralCode } from '../utils/affiliateReferral'

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

      const referralCode = getReferralCode()

      if (referralCode) {
        sessionStorage.setItem(
          'affiliate_pending_referral',
          referralCode
        )
      }

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
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#f7f8f2]">
      {/* Keep your existing Login UI exactly here */}
    </main>
  )
}

export default Login