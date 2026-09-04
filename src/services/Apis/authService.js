import apiClient from '../Interceptor/axiosInstance'

const AUTH_STORAGE_KEY =
  'grocery_customer_session'

export const PENDING_PHONE_KEY =
  'grocery_pending_otp_phone'

export const DEV_OTP_KEY =
  'grocery_dev_otp_hint'


// ========================================
// SESSION
// ========================================

export function getSession() {
  const session = localStorage.getItem(
    AUTH_STORAGE_KEY
  )

  if (!session) {
    return null
  }

  try {
    return JSON.parse(session)
  } catch {
    localStorage.removeItem(
      AUTH_STORAGE_KEY
    )

    return null
  }
}


export function saveSession(session) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session)
  )
}


export function clearSession() {
  localStorage.removeItem(
    AUTH_STORAGE_KEY
  )
}


export function logout() {
  clearSession()

  localStorage.removeItem(
    PENDING_PHONE_KEY
  )

  sessionStorage.removeItem(
    DEV_OTP_KEY
  )

  window.location.href = '/'
}


// ========================================
// REQUEST OTP / LOGIN
// ========================================

export async function requestOtp(phone) {
  try {
    const response = await apiClient.post(
      '/auth/customer/request-otp',
      {
        phone,
      }
    )

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      'Failed to send OTP'
    )
  }
}


// ========================================
// VERIFY OTP
// ========================================

export async function verifyOtp(
  phone,
  code
) {
  try {
    const response = await apiClient.post(
      '/auth/customer/verify-otp',
      {
        phone,
        code,
      }
    )

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      'Incorrect code'
    )
  }
}