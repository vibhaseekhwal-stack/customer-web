// Thin wrapper around fetch() for talking to the grocery backend as a
// logged-in customer. Keeps auth-token handling and the {success, data}
// envelope unwrapping in one place instead of repeated on every page.

const AUTH_STORAGE_KEY = 'grocery_customer_session';
const PENDING_PHONE_KEY = 'grocery_pending_otp_phone';

function getSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function requireAuth() {
  const session = getSession();
  if (!session || !session.accessToken) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

function logout() {
  clearSession();
  window.location.href = 'index.html';
}

/**
 * Calls the API. Automatically attaches the customer auth token when
 * logged in, and unwraps the {success, data} / {success:false, message}
 * envelope the backend always responds with.
 */
async function apiFetch(path, options = {}) {
  const session = getSession();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session && session.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearSession();
    window.location.href = 'index.html';
    throw new Error('Session expired — please log in again');
  }

  if (!response.ok || body.success === false) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || `Request failed (HTTP ${response.status})`);
  }

  return body.data;
}

/** Cart badge count shown in the bottom nav — kept as a tiny shared helper since every page's nav needs it. */
async function refreshCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge || !getSession()) return;
  try {
    const cart = await apiFetch('/cart');
    if (cart.itemCount > 0) {
      badge.textContent = cart.itemCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch {
    // Non-critical — a stale/missing badge count is not worth interrupting the page for.
  }
}
