import { API_BASE_URL } from './config'

const AUTH_STORAGE_KEY = 'grocery_customer_session'

export const PENDING_PHONE_KEY = 'grocery_pending_otp_phone'
export const DEV_OTP_KEY = 'grocery_dev_otp_hint'

export function getSession() {
  const session = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!session) {
    return null
  }

  try {
    return JSON.parse(session)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
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

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  )

  if (response.status === 204) {
    return null
  }

  const result = await response
    .json()
    .catch(() => ({}))

  if (response.status === 401) {
    clearSession()
    window.location.href = '/'
    throw new Error('Session expired')
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || 'Request failed'
    )
  }

  return result.data
}

export async function requestOtp(phone) {
  const response = await fetch(
    `${API_BASE_URL}/auth/customer/request-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    }
  )

  const result = await response
    .json()
    .catch(() => ({}))

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || 'Failed to send OTP'
    )
  }

  return result.data
}

export async function verifyOtp(phone, code) {
  const response = await fetch(
    `${API_BASE_URL}/auth/customer/verify-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
      }),
    }
  )

  const result = await response
    .json()
    .catch(() => ({}))

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || 'Incorrect code'
    )
  }

  return result.data
}

export async function getCategories() {
  const response = await fetch(
    `${API_BASE_URL}/categories`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch categories'
    )
  }

  const result = await response.json()

  return result.data || []
}

export async function getCategory(categoryId) {
  return apiFetch(
    `/categories/${categoryId}`
  )
}

export async function getBrands() {
  const response = await fetch(
    `${API_BASE_URL}/brands`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch brands'
    )
  }

  const result = await response.json()

  return result.data || []
}

export async function getProducts() {
  const response = await fetch(
    `${API_BASE_URL}/products?limit=100`
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch products'
    )
  }

  const result = await response.json()

  return result.data?.items || []
}

export async function getProduct(productId) {
  return apiFetch(
    `/products/${productId}`
  )
}

export async function getAddresses() {
  return apiFetch(
    '/customers/me/addresses'
  )
}

export async function updateCustomer(data) {
  return apiFetch('/customers/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function addAddress(data) {
  return apiFetch(
    '/customers/me/addresses',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )
}

export async function updateAddress(addressId, data) {
  return apiFetch(
    `/customers/me/addresses/${addressId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  )
}

export async function deleteAddress(addressId) {
  return apiFetch(
    `/customers/me/addresses/${addressId}`,
    {
      method: 'DELETE',
    }
  )
}

export async function getCart() {
  return apiFetch('/cart')
}

export async function addToCart(
  variantId,
  quantity
) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      variantId,
      quantity,
    }),
  })
}

export async function updateCartItem(
  itemId,
  quantity
) {
  if (quantity <= 0) {
    return apiFetch(
      `/cart/items/${itemId}`,
      {
        method: 'DELETE',
      }
    )
  }

  return apiFetch(
    `/cart/items/${itemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        quantity,
      }),
    }
  )
}

export async function removeCartItem(itemId) {
  return apiFetch(
    `/cart/items/${itemId}`,
    {
      method: 'DELETE',
    }
  )
}

export async function clearCart() {
  return apiFetch(
    '/cart',
    {
      method: 'DELETE',
    }
  )
}

export async function getDeliveryFeeInfo() {
  return apiFetch(
    '/orders/delivery-fee-info'
  )
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
  return apiFetch(
    `/orders/mine/${orderId}`
  )
}

export async function cancelOrder(
  orderId,
  reason = 'Cancelled by customer'
) {
  return apiFetch(
    `/orders/${orderId}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({
        reason,
      }),
    }
  )
}

export async function startOrderPayment(orderId) {
  return apiFetch(
    `/orders/${orderId}/pay`,
    {
      method: 'POST',
    }
  )
}