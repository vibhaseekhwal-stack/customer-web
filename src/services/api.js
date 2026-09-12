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

export async function logout() {
  const session = getSession()

  const refreshToken =
    session?.refreshToken ||
    session?.tokens?.refreshToken ||
    session?.data?.refreshToken

  if (!refreshToken) {
    throw new Error('Refresh token not found')
  }

  console.log('Logout API calling...')

  const response = await fetch(
    `${API_BASE_URL}/auth/customer/logout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }
  )

  console.log('Logout API response received:', response.status)

  const result = await response.json().catch(() => ({}))

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Logout failed')
  }

  console.log('Logout successful:', result)

  await new Promise((resolve) => setTimeout(resolve, 5000))

  clearSession()
  localStorage.removeItem(PENDING_PHONE_KEY)
  localStorage.removeItem(DEV_OTP_KEY)
  sessionStorage.removeItem(DEV_OTP_KEY)

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

  if (response.status === 204) {
    return null
  }

  const result = await response.json().catch(() => ({}))

  if (response.status === 401) {
    clearSession()
    localStorage.removeItem(PENDING_PHONE_KEY)
    localStorage.removeItem(DEV_OTP_KEY)
    sessionStorage.removeItem(DEV_OTP_KEY)
    window.location.href = '/'
    throw new Error('Session expired')
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Request failed')
  }

  return result.data
}

export async function healthCheck() {
  return apiFetch('/health')
}

export async function requestOtp(phone) {
  const data = await apiFetch('/auth/customer/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })

  localStorage.setItem(PENDING_PHONE_KEY, phone)

  if (data?.devOnlyOtp) {
    localStorage.setItem(
      DEV_OTP_KEY,
      String(data.devOnlyOtp)
    )

    sessionStorage.setItem(
      DEV_OTP_KEY,
      String(data.devOnlyOtp)
    )
  }

  return data
}

export async function verifyOtp(phone, code) {
  const data = await apiFetch('/auth/customer/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      code,
    }),
  })

  const accessToken =
    data?.accessToken ||
    data?.token ||
    data?.tokens?.accessToken ||
    data?.data?.accessToken

  const refreshToken =
    data?.refreshToken ||
    data?.tokens?.refreshToken ||
    data?.data?.refreshToken

  const customer =
    data?.customer ||
    data?.user ||
    data?.data?.customer ||
    data?.data?.user ||
    null

  if (!accessToken) {
    throw new Error(
      'Login successful, but access token was not received.'
    )
  }

  saveSession({
    ...data,
    accessToken,
    refreshToken,
    customer,
  })

  localStorage.removeItem(PENDING_PHONE_KEY)
  localStorage.removeItem(DEV_OTP_KEY)
  sessionStorage.removeItem(DEV_OTP_KEY)

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

export async function getBrand(brandId) {
  return apiFetch(`/brands/${brandId}`)
}

export async function getProducts({
  page = 1,
  limit = 20,
  search = '',
  categoryId = '',
  brandId = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (search) {
    params.append('search', search)
  }

  if (categoryId) {
    params.append('categoryId', categoryId)
  }

  if (brandId) {
    params.append('brandId', brandId)
  }

  const data = await apiFetch(`/products?${params.toString()}`)

  return Array.isArray(data) ? data : data?.items || []
}

export async function getProductsByCategory(categoryId) {
  return getProducts({
    page: 1,
    limit: 20,
    categoryId,
  })
}

export async function getProductsByBrand(brandId) {
  return getProducts({
    page: 1,
    limit: 20,
    brandId,
  })
}

export async function searchProducts(search) {
  return getProducts({
    page: 1,
    limit: 20,
    search,
  })
}

export async function getProduct(productId) {
  return apiFetch(`/products/${productId}`)
}

export async function getProductBySku(sku) {
  return apiFetch(
    `/products/barcode/${encodeURIComponent(sku)}`
  )
}

export async function getCart() {
  return apiFetch('/cart')
}

export async function addToCart(variantId, quantity = 1) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      variantId,
      quantity,
    }),
  })
}

export async function updateCartItem(cartItemId, quantity) {
  if (quantity <= 0) {
    return removeCartItem(cartItemId)
  }

  return apiFetch(`/cart/items/${cartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      quantity,
    }),
  })
}

export async function removeCartItem(cartItemId) {
  return apiFetch(`/cart/items/${cartItemId}`, {
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
    body: JSON.stringify({
      reason,
    }),
  })
}

export async function startOrderPayment(orderId) {
  return apiFetch(`/orders/${orderId}/pay`, {
    method: 'POST',
  })
}