requireAuth();
refreshCartBadge();

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

async function loadOrders() {
  const list = document.getElementById('ordersList');
  let orders;
  try {
    orders = await apiFetch('/orders/mine');
  } catch (error) {
    list.innerHTML = `<p class="text-center text-error py-xl">${escapeHtml(error.message)}</p>`;
    return;
  }

  if (orders.length === 0) {
    list.classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    return;
  }

  const template = document.getElementById('orderCardTemplate');
  list.innerHTML = '';
  for (const order of orders) {
    const card = template.content.cloneNode(true);
    card.querySelector('.order-number').textContent = order.orderNumber;
    card.querySelector('.order-date').textContent = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const badge = card.querySelector('.status-badge');
    badge.textContent = STATUS_LABELS[order.status] || order.status;
    badge.className = `status-badge px-sm py-xs rounded-full font-label-lg text-label-lg text-[11px] ${STATUS_CLASSES[order.status] || ''}`;

    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    card.querySelector('.order-items-summary').textContent = `${itemCount} item${itemCount === 1 ? '' : 's'} · ${order.items.map((i) => i.productName).join(', ')}`;
    card.querySelector('.order-total').textContent = `₹${Number(order.total).toFixed(2)}`;

    card.querySelector('.track-btn').addEventListener('click', () => {
      window.location.href = `order-detail.html?orderId=${order.id}`;
    });

    const reorderBtn = card.querySelector('.reorder-btn');
    if (order.status === 'CANCELLED') {
      reorderBtn.remove();
    } else {
      reorderBtn.addEventListener('click', () => reorder(order, reorderBtn));
    }

    list.appendChild(card);
  }
}

async function reorder(order, btn) {
  btn.disabled = true;
  btn.textContent = 'Adding…';

  let succeeded = 0;
  const failed = [];
  for (const item of order.items) {
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
      });
      succeeded += 1;
    } catch {
      failed.push(item.productName);
    }
  }

  refreshCartBadge();
  btn.disabled = false;
  btn.textContent = 'Reorder';

  if (failed.length > 0) {
    alert(
      `Added ${succeeded} item(s) to your cart. Could not add: ${failed.join(', ')} — they may no longer be available.`,
    );
  }
  if (succeeded > 0) {
    window.location.href = 'cart.html';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

loadOrders();
