requireAuth();

const INACTIVE_OPTION = 'border-outline-variant text-on-surface-variant';
const ACTIVE_OPTION = 'border-primary bg-primary-container/10 text-primary';

let cart = null;
let deliveryFeeInfo = null;
let addresses = [];
let fulfillmentMethod = null;
let paymentMethod = null;
let selectedAddressId = null;

async function init() {
  try {
    [cart, deliveryFeeInfo, addresses] = await Promise.all([
      apiFetch('/cart'),
      apiFetch('/orders/delivery-fee-info'),
      apiFetch('/customers/me/addresses'),
    ]);
  } catch (error) {
    alert(error.message);
    return;
  }

  if (cart.items.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  renderAddresses();
  selectFulfillment(addresses.length > 0 ? 'DELIVERY' : 'PICKUP');
  updateSummary();
}

function selectFulfillment(method) {
  fulfillmentMethod = method;
  document.getElementById('deliveryOption').className = `fulfillment-option border-2 rounded-xl p-md flex flex-col items-center text-center ${method === 'DELIVERY' ? ACTIVE_OPTION : INACTIVE_OPTION}`;
  document.getElementById('pickupOption').className = `fulfillment-option border-2 rounded-xl p-md flex flex-col items-center text-center ${method === 'PICKUP' ? ACTIVE_OPTION : INACTIVE_OPTION}`;
  document.getElementById('addressSection').classList.toggle('hidden', method !== 'DELIVERY');
  document.getElementById('cashLabel').textContent = method === 'DELIVERY' ? 'Cash on Delivery' : 'Pay at Pickup';
  updateSummary();
}

function selectPayment(method) {
  paymentMethod = method;
  document.getElementById('upiOption').className = `payment-option border-2 rounded-xl p-md flex items-center gap-sm text-left ${method === 'UPI' ? ACTIVE_OPTION : INACTIVE_OPTION}`;
  document.getElementById('cashOption').className = `payment-option border-2 rounded-xl p-md flex items-center gap-sm text-left ${method === 'CASH' ? ACTIVE_OPTION : INACTIVE_OPTION}`;
}

document.getElementById('deliveryOption').addEventListener('click', () => selectFulfillment('DELIVERY'));
document.getElementById('pickupOption').addEventListener('click', () => selectFulfillment('PICKUP'));
document.getElementById('upiOption').addEventListener('click', () => selectPayment('UPI'));
document.getElementById('cashOption').addEventListener('click', () => selectPayment('CASH'));

function renderAddresses() {
  const list = document.getElementById('addressList');
  const noAddressMsg = document.getElementById('noAddressMsg');
  list.innerHTML = '';

  if (addresses.length === 0) {
    noAddressMsg.classList.remove('hidden');
    return;
  }
  noAddressMsg.classList.add('hidden');

  if (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId)) {
    selectedAddressId = addresses.find((a) => a.isDefault)?.id || addresses[0].id;
  }

  for (const address of addresses) {
    const card = document.createElement('button');
    const isSelected = address.id === selectedAddressId;
    card.type = 'button';
    card.className = `w-full text-left border-2 rounded-xl p-md flex gap-md items-start ${isSelected ? 'border-primary bg-primary-container/10' : 'border-outline-variant'}`;
    card.innerHTML = `
      <span class="material-symbols-outlined text-primary mt-1">home_pin</span>
      <div class="flex-1">
        <h3 class="font-label-lg text-label-lg mb-xs">${escapeHtml(address.label || 'Address')}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml([address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', '))}</p>
      </div>
    `;
    card.addEventListener('click', () => {
      selectedAddressId = address.id;
      renderAddresses();
    });
    list.appendChild(card);
  }
}

function updateSummary() {
  const subtotal = cart.grandTotal;
  const deliveryFee =
    fulfillmentMethod === 'DELIVERY' && subtotal < deliveryFeeInfo.freeThreshold ? deliveryFeeInfo.fee : 0;
  const total = subtotal + deliveryFee;

  document.getElementById('summarySubtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('summaryDeliveryFee').textContent = deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE';
  document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;
}

document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  const errorBox = document.getElementById('errorBox');
  errorBox.classList.add('hidden');

  if (!fulfillmentMethod) return showCheckoutError('Choose a fulfillment method.');
  if (fulfillmentMethod === 'DELIVERY' && !selectedAddressId) return showCheckoutError('Add or select a delivery address.');
  if (!paymentMethod) return showCheckoutError('Choose a payment method.');

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  try {
    const order = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        fulfillmentMethod,
        paymentMethod,
        ...(fulfillmentMethod === 'DELIVERY' ? { addressId: selectedAddressId } : {}),
      }),
    });
    window.location.href = `confirmation.html?orderId=${order.id}`;
  } catch (error) {
    showCheckoutError(error.message);
    btn.disabled = false;
    btn.innerHTML = 'Place Order <span class="material-symbols-outlined">arrow_forward</span>';
  }
});

function showCheckoutError(message) {
  const errorBox = document.getElementById('errorBox');
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

// Add-address modal
const modal = document.getElementById('addressModalBackdrop');
document.getElementById('addAddressBtn').addEventListener('click', () => {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
});
document.getElementById('cancelAddressBtn').addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
});

document.getElementById('addressForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  if (addresses.length === 0) payload.isDefault = true;

  try {
    const newAddress = await apiFetch('/customers/me/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    addresses.push(newAddress);
    selectedAddressId = newAddress.id;
    renderAddresses();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    event.target.reset();
  } catch (error) {
    alert(error.message);
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

init();
