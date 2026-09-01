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

  const needsPayment = order.paymentMethod === 'UPI' && order.status === 'PENDING_PAYMENT';

  document.getElementById('statusIcon').textContent = needsPayment ? 'schedule' : 'check_circle';
  document.getElementById('statusIcon').classList.toggle('text-primary', !needsPayment);
  document.getElementById('statusIcon').classList.toggle('text-error', needsPayment);
  document.getElementById('statusHeading').textContent = needsPayment ? 'Almost There' : 'Order Placed!';
  document.getElementById('orderNumber').textContent = order.orderNumber;
  document.getElementById('statusSubtext').innerHTML = `Order #${order.orderNumber} &middot; ${STATUS_LABELS[order.status] || order.status}`;

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

  document.getElementById('fulfillmentMethodLine').textContent =
    order.fulfillmentMethod === 'DELIVERY' ? 'Home Delivery' : 'Store Pickup';
  document.getElementById('addressLine').textContent =
    order.fulfillmentMethod === 'DELIVERY'
      ? [order.deliveryLine1, order.deliveryLine2, order.deliveryCity, order.deliveryState, order.deliveryPincode]
          .filter(Boolean)
          .join(', ')
      : '';
  document.getElementById('paymentMethodLine').textContent =
    order.paymentMethod === 'UPI' ? 'Payment: UPI' : order.fulfillmentMethod === 'DELIVERY' ? 'Payment: Cash on Delivery' : 'Payment: Cash at Pickup';

  document.getElementById('summarySubtotal').textContent = `₹${Number(order.subtotal).toFixed(2)}`;
  document.getElementById('summaryDeliveryFee').textContent =
    Number(order.deliveryFee) > 0 ? `₹${Number(order.deliveryFee).toFixed(2)}` : 'FREE';
  document.getElementById('summaryTotal').textContent = `₹${Number(order.total).toFixed(2)}`;

  document.getElementById('viewOrderLink').href = `order-detail.html?orderId=${order.id}`;

  if (needsPayment) {
    const paymentBox = document.getElementById('paymentBox');
    paymentBox.classList.remove('hidden');
    document.getElementById('paymentMessage').textContent =
      'This order still needs to be paid online to be confirmed.';
    document.getElementById('payNowBtn').addEventListener('click', () => startPayment(order));
  }
}

async function startPayment(order) {
  const btn = document.getElementById('payNowBtn');
  btn.disabled = true;
  btn.textContent = 'Starting payment…';

  let payment;
  try {
    payment = await apiFetch(`/orders/${order.id}/pay`, { method: 'POST' });
  } catch (error) {
    document.getElementById('paymentMessage').textContent =
      'Online payment isn’t available yet. Your order is saved — please contact the store to arrange payment, or place a new order with cash instead.';
    btn.classList.add('hidden');
    return;
  }

  const razorpay = new Razorpay({
    key: payment.keyId,
    order_id: payment.providerOrderId,
    amount: Math.round(payment.amount * 100),
    currency: payment.currency,
    name: 'CD Shopping Hub',
    description: `Order #${order.orderNumber}`,
    handler: () => pollForConfirmation(order.id),
    modal: {
      ondismiss: () => {
        btn.disabled = false;
        btn.textContent = 'Pay Now';
      },
    },
  });
  razorpay.open();
}

async function pollForConfirmation(orderId) {
  const paymentMessage = document.getElementById('paymentMessage');
  paymentMessage.textContent = 'Confirming your payment…';
  document.getElementById('payNowBtn').classList.add('hidden');

  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const order = await apiFetch(`/orders/mine/${orderId}`);
      if (order.status !== 'PENDING_PAYMENT') {
        render(order);
        return;
      }
    } catch {
      // keep polling
    }
  }
  paymentMessage.textContent =
    'Payment received — confirmation is taking longer than usual. Check Order History shortly, or contact the store.';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

init();
