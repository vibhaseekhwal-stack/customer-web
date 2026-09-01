requireAuth();

const orderId = new URLSearchParams(window.location.search).get('orderId');
if (!orderId) {
  window.location.href = 'orders.html';
}

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting Payment',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_CLASSES = {
  PENDING_PAYMENT: 'bg-error-container text-on-error-container',
  CONFIRMED: 'bg-primary-container text-on-primary-container',
  PACKED: 'bg-primary-container text-on-primary-container',
  READY: 'bg-tertiary-container text-on-tertiary-container',
  COMPLETED: 'bg-surface-container text-on-surface-variant',
  CANCELLED: 'bg-surface-container text-on-surface-variant',
};

// The real path an order can travel — used to render the timeline in order,
// skipping PENDING_PAYMENT for orders that never needed it (CASH orders
// start straight at CONFIRMED, so showing a "skipped" payment step would be
// misleading rather than informative).
const HAPPY_PATH = ['CONFIRMED', 'PACKED', 'READY', 'COMPLETED'];

const CUSTOMER_CANCELLABLE_STATUSES = ['PENDING_PAYMENT', 'CONFIRMED', 'PACKED'];

async function init() {
  let order;
  try {
    order = await apiFetch(`/orders/mine/${orderId}`);
  } catch (error) {
    document.getElementById('content').innerHTML = `<p class="text-center text-error py-xl">${escapeHtml(error.message)}</p>`;
    return;
  }
  render(order);
}

function render(order) {
  const content = document.getElementById('content');
  const template = document.getElementById('template');
  content.innerHTML = '';
  content.appendChild(template.content.cloneNode(true));

  document.getElementById('orderNumber').textContent = order.orderNumber;
  document.getElementById('orderDate').textContent = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const badge = document.getElementById('statusBadge');
  badge.textContent = STATUS_LABELS[order.status] || order.status;
  badge.className = `status-badge px-sm py-xs rounded-full font-label-lg text-label-lg text-[11px] ${STATUS_CLASSES[order.status] || ''}`;

  renderTimeline(order);

  const itemsList = document.getElementById('itemsList');
  for (const item of order.items) {
    const row = document.createElement('div');
    row.className = 'flex justify-between font-body-sm text-body-sm';
    row.innerHTML = `
      <span>${escapeHtml(item.productName)} <span class="text-on-surface-variant">(${item.weight}${item.unit} × ${item.quantity})</span></span>
      <span>₹${Number(item.lineTotal).toFixed(2)}</span>
    `;
    itemsList.appendChild(row);
  }

  document.getElementById('summarySubtotal').textContent = `₹${Number(order.subtotal).toFixed(2)}`;
  document.getElementById('summaryDeliveryFee').textContent =
    Number(order.deliveryFee) > 0 ? `₹${Number(order.deliveryFee).toFixed(2)}` : 'FREE';
  document.getElementById('summaryTotal').textContent = `₹${Number(order.total).toFixed(2)}`;

  document.getElementById('fulfillmentLine').textContent =
    order.fulfillmentMethod === 'DELIVERY' ? 'Home Delivery' : 'Store Pickup';
  document.getElementById('addressLine').textContent =
    order.fulfillmentMethod === 'DELIVERY'
      ? [order.deliveryLabel, order.deliveryLine1, order.deliveryLine2, order.deliveryCity, order.deliveryState, order.deliveryPincode]
          .filter(Boolean)
          .join(', ')
      : '';
  document.getElementById('paymentLine').textContent =
    order.paymentMethod === 'UPI' ? 'Payment: UPI' : order.fulfillmentMethod === 'DELIVERY' ? 'Payment: Cash on Delivery' : 'Payment: Cash at Pickup';

  if (CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
    document.getElementById('cancelSection').classList.remove('hidden');
    document.getElementById('cancelBtn').addEventListener('click', () => cancelOrder(order.id));
  }
}

function renderTimeline(order) {
  const timeline = document.getElementById('timeline');

  if (order.status === 'CANCELLED') {
    timeline.innerHTML = `
      <div class="flex items-center gap-sm text-error">
        <span class="material-symbols-outlined">cancel</span>
        <span class="font-body-md text-body-md">This order was cancelled${order.cancelReason ? `: ${escapeHtml(order.cancelReason)}` : ''}.</span>
      </div>
    `;
    return;
  }

  const steps = order.paymentMethod === 'UPI' ? ['PENDING_PAYMENT', ...HAPPY_PATH] : HAPPY_PATH;
  const currentIndex = steps.indexOf(order.status);

  timeline.innerHTML = steps
    .map((step, index) => {
      const done = index <= currentIndex;
      const iconColor = done ? 'text-primary' : 'text-on-surface-variant';
      const textColor = done ? 'text-on-surface' : 'text-on-surface-variant';
      return `
        <div class="flex items-center gap-sm">
          <span class="material-symbols-outlined ${iconColor}" style="font-variation-settings: 'FILL' ${done ? 1 : 0};">${done ? 'check_circle' : 'radio_button_unchecked'}</span>
          <span class="font-body-sm text-body-sm ${textColor}">${STATUS_LABELS[step]}</span>
        </div>
      `;
    })
    .join('');
}

async function cancelOrder(orderId) {
  if (!confirm('Cancel this order?')) return;
  const btn = document.getElementById('cancelBtn');
  btn.disabled = true;
  btn.textContent = 'Cancelling…';
  try {
    const order = await apiFetch(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Cancelled by customer' }),
    });
    render(order);
  } catch (error) {
    alert(error.message);
    btn.disabled = false;
    btn.textContent = 'Cancel Order';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

init();
