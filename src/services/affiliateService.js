import { apiFetch } from './api'

export async function getMyAffiliate() {
  return apiFetch('/affiliates/me')
}

export async function applyAffiliate(data) {
  return apiFetch('/affiliates/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getMyAffiliateStats() {
  return apiFetch('/affiliates/me/stats')
}

export async function getMyAffiliateEarnings() {
  return apiFetch('/affiliates/me/earnings')
}

export async function getMyAffiliatePayouts() {
  return apiFetch('/affiliates/me/payouts')
}

export async function requestAffiliatePayout(data) {
  return apiFetch('/affiliates/me/payouts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}