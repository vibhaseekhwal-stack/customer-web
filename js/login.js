if (getSession()) {
  window.location.href = 'home.html';
}

const form = document.getElementById('loginForm');
const errorBox = document.getElementById('errorBox');
const sendOtpBtn = document.getElementById('sendOtpBtn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.classList.add('hidden');

  const phone = document.getElementById('phone').value.trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    errorBox.textContent = 'Enter a valid 10-digit mobile number.';
    errorBox.classList.remove('hidden');
    return;
  }

  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = 'Sending…';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const body = await response.json();
    if (!response.ok || body.success === false) {
      throw new Error(body.message || 'Could not send OTP');
    }

    localStorage.setItem(PENDING_PHONE_KEY, phone);
    // Only present when no real SMS provider is configured — never shown
    // in production, and never anything but the truth about what happened.
    if (body.data.devOnlyOtp) {
      sessionStorage.setItem('grocery_dev_otp_hint', body.data.devOnlyOtp);
    }
    window.location.href = 'otp.html';
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove('hidden');
  } finally {
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = 'Send OTP';
  }
});
