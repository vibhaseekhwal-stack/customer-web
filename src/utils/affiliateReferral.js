const REFERRAL_KEY = 'affiliate_referral_code'

export function saveReferralCode(code) {
  if (!code) return

  const normalizedCode = String(code).trim()

  if (!normalizedCode) return

  localStorage.setItem(REFERRAL_KEY, normalizedCode)
}

export function getReferralCode() {
  return localStorage.getItem(REFERRAL_KEY) || ''
}

export function clearReferralCode() {
  localStorage.removeItem(REFERRAL_KEY)
}

export function captureReferralFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const referralCode = params.get('ref')

  if (referralCode) {
    saveReferralCode(referralCode)
  }

  return referralCode || getReferralCode()
}