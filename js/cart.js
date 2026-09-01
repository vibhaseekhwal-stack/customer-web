requireAuth();

async function loadCart() {
  try {
    const cart = await apiFetch('/cart');
    render(cart);
  } catch (error) {
    alert(error.message);
  }
}

function render(cart) {
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('emptyCart');
  const billEl = document.getElementById('billSummary');
  const checkoutBar = document.getElementById('checkoutBar');
  itemsEl.innerHTML = '';

  if (cart.items.length === 0) {
    emptyEl.classList.remove('hidden');
    billEl.classList.add('hidden');
    checkoutBar.classList.add('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  billEl.classList.remove('hidden');
  checkoutBar.classList.remove('hidden');

  for (const item of cart.items) {
    const style = getCategoryStyle(item.product.category?.slug);
    const mediaHtml = item.product.imageUrl
      ? `<img src="${escapeHtml(resolveImageUrl(item.product.imageUrl))}" alt="${escapeHtml(item.product.name)}" class="w-full h-full object-cover rounded-lg"/>`
      : `<span class="material-symbols-outlined text-[32px]" style="color:${style.fg}; font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48;">${style.icon}</span>`;

    const row = document.createElement('div');
    row.className = 'flex items-center gap-md p-md bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.04)]';
    row.innerHTML = `
      <div class="w-[64px] h-[64px] rounded-lg flex items-center justify-center flex-shrink-0" style="background:${item.product.imageUrl ? '#f0f2ec' : style.tint}">
        ${mediaHtml}
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-body-md text-body-md font-semibold text-on-surface truncate">${escapeHtml(item.product.name)}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${item.variant.weight}${item.variant.unit}</p>
        <p class="font-price-sm text-price-sm text-primary mt-xs">₹${item.variant.sellingPrice.toFixed(2)}</p>
        ${!item.isAvailable ? '<p class="text-error text-[12px] font-semibold mt-xs">No longer available</p>' : ''}
      </div>
      <div class="flex flex-col items-end gap-sm">
        <button class="text-on-surface-variant hover:text-error remove-btn" data-item-id="${item.id}">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
        <div class="flex items-center border border-primary rounded-lg overflow-hidden">
          <button class="px-sm py-xs text-primary decrement-btn" data-item-id="${item.id}" data-qty="${item.quantity}"><span class="material-symbols-outlined text-[16px]">remove</span></button>
          <span class="font-label-lg text-label-lg w-[24px] text-center">${item.quantity}</span>
          <button class="px-sm py-xs text-primary increment-btn" data-item-id="${item.id}" data-qty="${item.quantity}"><span class="material-symbols-outlined text-[16px]">add</span></button>
        </div>
      </div>
    `;
    itemsEl.appendChild(row);
  }

  document.getElementById('subtotalDisplay').textContent = `₹${cart.grandTotal.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `₹${cart.grandTotal.toFixed(2)}`;

  itemsEl.querySelectorAll('.remove-btn').forEach((btn) =>
    btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, 0)),
  );
  itemsEl.querySelectorAll('.decrement-btn').forEach((btn) =>
    btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, Number(btn.dataset.qty) - 1)),
  );
  itemsEl.querySelectorAll('.increment-btn').forEach((btn) =>
    btn.addEventListener('click', () => updateQuantity(btn.dataset.itemId, Number(btn.dataset.qty) + 1)),
  );
}

async function updateQuantity(itemId, newQuantity) {
  try {
    if (newQuantity <= 0) {
      await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
    } else {
      await apiFetch(`/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQuantity }),
      });
    }
    refreshCartBadge();
    loadCart();
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
  window.location.href = 'checkout.html';
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

loadCart();
