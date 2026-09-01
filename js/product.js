requireAuth();

const productId = new URLSearchParams(window.location.search).get('id');
let product = null;
let selectedVariant = null;
let quantity = 1;

async function init() {
  if (!productId) {
    window.location.href = 'home.html';
    return;
  }
  try {
    product = await apiFetch(`/products/${productId}`);
    render();
  } catch (error) {
    document.getElementById('productContent').innerHTML = `<div class="text-center text-error py-xl">${escapeHtml(error.message)}</div>`;
  }
}

function render() {
  const activeVariants = product.variants.filter((v) => v.isActive);
  selectedVariant = activeVariants.find((v) => v.isAvailable) || activeVariants[0];

  const style = getCategoryStyle(product.category?.slug);
  const mediaHtml = product.imageUrl
    ? `<img src="${escapeHtml(resolveImageUrl(product.imageUrl))}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover"/>`
    : `<span class="material-symbols-outlined text-[140px]" style="color:${style.fg}; font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48;">${style.icon}</span>`;

  document.getElementById('productContent').innerHTML = `
    <div class="aspect-square rounded-xl flex items-center justify-center mb-md" style="background:${product.imageUrl ? '#f0f2ec' : style.tint}">
      ${mediaHtml}
    </div>
    <p class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(product.brand?.name || product.category?.name || '')}</p>
    <h2 class="font-headline-md text-headline-md font-bold mb-sm">${escapeHtml(product.name)}</h2>
    ${product.description ? `<p class="font-body-md text-body-md text-on-surface-variant mb-md">${escapeHtml(product.description)}</p>` : ''}

    <h3 class="font-label-lg text-label-lg text-on-surface-variant mb-sm mt-md">Pack Size</h3>
    <div class="flex gap-sm flex-wrap mb-md" id="variantPills"></div>

    <div class="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_12px_rgba(0,0,0,0.04)]" id="priceBlock"></div>
  `;

  renderVariantPills(activeVariants);
  renderPriceBlock();
}

function renderVariantPills(activeVariants) {
  const container = document.getElementById('variantPills');
  container.innerHTML = '';
  for (const variant of activeVariants) {
    const pill = document.createElement('button');
    const isSelected = variant.id === selectedVariant.id;
    pill.className = isSelected
      ? 'px-4 py-2 rounded-full border-2 border-primary bg-primary-container/10 text-primary font-label-lg text-label-lg'
      : 'px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-lg text-label-lg' +
        (variant.isAvailable ? '' : ' opacity-50');
    pill.textContent = `${variant.weight}${variant.unit}`;
    pill.addEventListener('click', () => {
      selectedVariant = variant;
      quantity = 1;
      renderVariantPills(activeVariants);
      renderPriceBlock();
    });
    container.appendChild(pill);
  }
}

function renderPriceBlock() {
  const mrp = Number(selectedVariant.mrp);
  const sellingPrice = Number(selectedVariant.sellingPrice);
  const hasDiscount = mrp > sellingPrice;

  let stockLine = '<span class="text-primary text-body-sm font-semibold">In Stock</span>';
  if (!selectedVariant.isAvailable) {
    stockLine = '<span class="text-error text-body-sm font-semibold">Out of Stock</span>';
  } else if (selectedVariant.isLowStock) {
    stockLine = '<span class="text-secondary text-body-sm font-semibold">Only a few left — order soon</span>';
  }

  document.getElementById('priceBlock').innerHTML = `
    <div class="flex items-baseline gap-sm mb-xs">
      <span class="font-price-lg text-price-lg text-on-surface">₹${sellingPrice.toFixed(2)}</span>
      ${hasDiscount ? `<span class="text-body-sm text-on-surface-variant line-through">₹${mrp.toFixed(2)}</span>` : ''}
    </div>
    ${stockLine}
  `;

  const actionBar = document.getElementById('actionBar');
  const addBtn = document.getElementById('addToCartBtn');
  quantity = 1;
  document.getElementById('quantityDisplay').textContent = quantity;

  if (selectedVariant.isAvailable) {
    actionBar.classList.remove('hidden');
    addBtn.disabled = false;
    addBtn.textContent = 'Add to Cart';
  } else {
    actionBar.classList.remove('hidden');
    addBtn.disabled = true;
    addBtn.textContent = 'Out of Stock';
  }
}

document.getElementById('decrementBtn').addEventListener('click', () => {
  if (quantity > 1) {
    quantity -= 1;
    document.getElementById('quantityDisplay').textContent = quantity;
  }
});
document.getElementById('incrementBtn').addEventListener('click', () => {
  quantity += 1;
  document.getElementById('quantityDisplay').textContent = quantity;
});

document.getElementById('addToCartBtn').addEventListener('click', async () => {
  const btn = document.getElementById('addToCartBtn');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Adding…';
  try {
    await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
    });
    btn.textContent = 'Added ✓';
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 500);
  } catch (error) {
    alert(error.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

init();
