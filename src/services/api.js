import { API_BASE_URL } from './config'

const AUTH_STORAGE_KEY = 'grocery_customer_session'

export const PENDING_PHONE_KEY = 'grocery_pending_otp_phone'
export const DEV_OTP_KEY = 'grocery_dev_otp_hint'

export function getSession() {
  const session = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!session) return null

  try {
    return JSON.parse(session)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function logout() {
  clearSession()
  window.location.href = '/'
}

export async function apiFetch(path, options = {}) {
  const session = getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null

  const result = await response.json().catch(() => ({}))

  if (response.status === 401) {
    clearSession()
    window.location.href = '/'
    throw new Error('Session expired')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Request failed')
  }

  return result.data
}

export async function requestOtp(phone) {
  return apiFetch('/auth/customer/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export async function verifyOtp(phone, code) {
  const data = await apiFetch('/auth/customer/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })

  if (data?.accessToken) {
    saveSession(data)
  }

  return data
}

export async function getCurrentUser() {
  return apiFetch('/auth/me')
}

export async function updateCustomer(data) {
  return apiFetch('/customers/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function getAddresses() {
  return apiFetch('/customers/me/addresses')
}

export async function addAddress(data) {
  return apiFetch('/customers/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAddress(addressId, data) {
  return apiFetch(`/customers/me/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteAddress(addressId) {
  return apiFetch(`/customers/me/addresses/${addressId}`, {
    method: 'DELETE',
  })
}

export async function getCategories() {
  const data = await apiFetch('/categories')
  return Array.isArray(data) ? data : data?.items || []
}

export async function getCategory(categoryId) {
  return apiFetch(`/categories/${categoryId}`)
}

export async function getBrands() {
  const data = await apiFetch('/brands')
  return Array.isArray(data) ? data : data?.items || []
}

export async function getProducts() {
  const data = await apiFetch('/products?page=1&limit=20')
  return data?.items || []
}

export async function getProductsByCategory(categoryId) {
  const data = await apiFetch(
    `/products?page=1&limit=20&categoryId=${encodeURIComponent(categoryId)}`
  )

  return data?.items || []
}

export async function getProduct(productId) {
  return apiFetch(`/products/${productId}`)
}

export async function getCart() {
  return apiFetch('/cart')
}

export async function addToCart(variantId, quantity) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      variantId,
      quantity,
    }),
  })
}

export async function updateCartItem(itemId, quantity) {
  if (quantity <= 0) {
    return removeCartItem(itemId)
  }

  return apiFetch(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
}

export async function removeCartItem(itemId) {
  return apiFetch(`/cart/items/${itemId}`, {
    method: 'DELETE',
  })
}

export async function clearCart() {
  return apiFetch('/cart', {
    method: 'DELETE',
  })
}

export async function getDeliveryFeeInfo() {
  return apiFetch('/orders/delivery-fee-info')
}

export async function placeOrder(data) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getOrders() {
  return apiFetch('/orders/mine')
}

export async function getOrder(orderId) {
  return apiFetch(`/orders/mine/${orderId}`)
}

export async function cancelOrder(
  orderId,
  reason = 'Cancelled by customer'
) {
  return apiFetch(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export async function startOrderPayment(orderId) {
  return apiFetch(`/orders/${orderId}/pay`, {
    method: 'POST',
  })
}