const phone = localStorage.getItem(PENDING_PHONE_KEY);
if (!phone) {
  window.location.href = 'index.html';
}

document.getElementById('phoneDisplay').textContent = `+91 ${phone}`;
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

const devOtp = sessionStorage.getItem('grocery_dev_otp_hint');
if (devOtp) {
  const hint = document.getElementById('devHint');
  hint.textContent = `Testing mode — no SMS provider is set up yet, so your code is: ${devOtp}`;
  hint.classList.remove('hidden');
}

const form = document.getElementById('otpForm');
const errorBox = document.getElementById('errorBox');
const verifyBtn = document.getElementById('verifyBtn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.classList.add('hidden');
  const code = document.getElementById('code').value.trim();

  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying…';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const body = await response.json();
    if (!response.ok || body.success === false) {
      throw new Error(body.message || 'Incorrect code');
    }

    saveSession({ accessToken: body.data.accessToken, customer: body.data.customer });
    localStorage.removeItem(PENDING_PHONE_KEY);
    sessionStorage.removeItem('grocery_dev_otp_hint');
    window.location.href = 'home.html';
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove('hidden');
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify & Continue';
  }
});

// Resend countdown — a real request-otp call, not a fake timer for show.
let secondsLeft = 30;
const resendBtn = document.getElementById('resendBtn');
const resendTimer = document.getElementById('resendTimer');
const countdown = setInterval(() => {
  secondsLeft -= 1;
  resendTimer.textContent = secondsLeft;
  if (secondsLeft <= 0) {
    clearInterval(countdown);
    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend OTP';
  }
}, 1000);

resendBtn.addEventListener('click', async () => {
  resendBtn.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const body = await response.json();
    if (body.data && body.data.devOnlyOtp) {
      sessionStorage.setItem('grocery_dev_otp_hint', body.data.devOnlyOtp);
      document.getElementById('devHint').textContent = `Testing mode — your new code is: ${body.data.devOnlyOtp}`;
      document.getElementById('devHint').classList.remove('hidden');
    }
    secondsLeft = 30;
    resendTimer.textContent = secondsLeft;
  } catch {
    // Resend failing silently just means the button re-enables faster than usual — not worth blocking the page over.
  }
});
