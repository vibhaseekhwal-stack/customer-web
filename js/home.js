requireAuth();

let allProducts = [];
let categoriesCache = [];
let currentCategory = '';
let searchDebounce = null;

async function init() {
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('searchInput').addEventListener('input', (event) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => render(event.target.value.trim()), 300);
  });

  try {
    const [categories, productResult] = await Promise.all([
      apiFetch('/categories'),
      apiFetch('/products?limit=100'),
    ]);
    categoriesCache = categories.filter((c) => c.isActive);
    allProducts = productResult.items.filter((p) => p.isActive && p.variants.some((v) => v.isActive));
    document.getElementById('loadingState').remove();
    renderCategoryChips();
    render('');
    refreshCartBadge();
  } catch (error) {
    document.getElementById('mainContent').innerHTML = `<p class="text-center text-error py-xl">${escapeHtml(error.message)}</p>`;
  }
}

function renderCategoryChips() {
  const container = document.getElementById('categoryGrid');
  container.innerHTML = '';

  const tiles = [{ id: '', name: 'All', slug: 'DEFAULT' }, ...categoriesCache];
  for (const category of tiles) {
    const style = category.slug === 'DEFAULT' ? { icon: 'storefront', tint: '#e9f3ed', fg: '#1b7340' } : getCategoryStyle(category.slug);
    const isActive = currentCategory === category.id;

    const tile = document.createElement('button');
    tile.className = 'flex flex-col items-center gap-0.5 flex-shrink-0 w-16';
    tile.innerHTML = `
      <span class="w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}" style="background:${style.tint}">
        <span class="material-symbols-outlined text-[18px]" style="color:${style.fg}">${style.icon}</span>
      </span>
      <span class="text-[10px] text-center leading-tight line-clamp-2 h-[24px] ${isActive ? 'font-bold text-primary' : 'text-ink-soft'}">${escapeHtml(category.name)}</span>
    `;
    tile.addEventListener('click', () => {
      currentCategory = category.id;
      document.getElementById('searchInput').value = '';
      renderCategoryChips();
      render('');
    });
    container.appendChild(tile);
  }
}

/** Default browse view (no search, no category): grouped horizontal rows, one per category.
 *  Search or a selected category collapses to a single flat filtered grid instead. */
function render(searchTerm) {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  if (!searchTerm && !currentCategory) {
    renderGroupedByCategory(main);
    return;
  }

  const filtered = allProducts.filter((p) => {
    const matchesCategory = !currentCategory || p.categoryId === currentCategory;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  renderFlatGrid(main, filtered, searchTerm ? `Results for "${searchTerm}"` : categoriesCache.find((c) => c.id === currentCategory)?.name || 'Products');
}

function renderGroupedByCategory(main) {
  const sectionTemplate = document.getElementById('sectionTemplate');

  for (const category of categoriesCache) {
    const products = allProducts.filter((p) => p.categoryId === category.id);
    if (products.length === 0) continue;

    const section = sectionTemplate.content.cloneNode(true);
    section.querySelector('.section-title').textContent = category.name;
    const seeAllBtn = section.querySelector('.see-all-btn');
    const row = section.querySelector('.section-row');

    for (const product of products.slice(0, 8)) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex-shrink-0 w-[118px]';
      wrapper.appendChild(buildCard(product));
      row.appendChild(wrapper);
    }

    if (products.length > 8) {
      seeAllBtn.addEventListener('click', () => {
        currentCategory = category.id;
        renderCategoryChips();
        render('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      seeAllBtn.remove();
    }

    main.appendChild(section);
  }

  if (main.children.length === 0) {
    main.innerHTML = '<p class="text-center text-ink-soft py-xl">No products found.</p>';
  }
}

function renderFlatGrid(main, products, heading) {
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center mb-sm';
  header.innerHTML = `<h2 class="font-display text-[16px] font-bold">${escapeHtml(heading)}</h2>`;
  main.appendChild(header);

  if (products.length === 0) {
    main.innerHTML += '<p class="text-center text-ink-soft py-xl">No products found.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-3 gap-sm';
  for (const product of products) {
    grid.appendChild(buildCard(product));
  }
  main.appendChild(grid);
}

function buildCard(product) {
  const cardTemplate = document.getElementById('cardTemplate');
  const card = cardTemplate.content.cloneNode(true).querySelector('.product-card');

  const activeVariants = product.variants.filter((v) => v.isActive);
  const cheapest = activeVariants.reduce((min, v) => (Number(v.sellingPrice) < Number(min.sellingPrice) ? v : min));
  const anyAvailable = activeVariants.some((v) => v.isAvailable);
  const hasDiscount = Number(cheapest.mrp) > Number(cheapest.sellingPrice);
  const discountPct = hasDiscount ? Math.round((1 - Number(cheapest.sellingPrice) / Number(cheapest.mrp)) * 100) : 0;
  const style = getCategoryStyle(product.category?.slug);

  const mediaSlot = card.querySelector('.media-slot');
  mediaSlot.style.background = product.imageUrl ? '#f0f2ec' : style.tint;
  mediaSlot.innerHTML = product.imageUrl
    ? `<img src="${escapeHtml(resolveImageUrl(product.imageUrl))}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover"/>`
    : `<span class="material-symbols-outlined text-[68px]" style="color:${style.fg}; font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48;">${style.icon}</span>`;
  if (hasDiscount) {
    mediaSlot.innerHTML += `<span class="absolute top-1 left-1 bg-accent text-on-accent text-[9px] font-bold px-1.5 py-0.5 rounded">${discountPct}% OFF</span>`;
  }

  card.querySelector('.name-slot').textContent = product.name;
  card.querySelector('.weight-slot').textContent = `${cheapest.weight}${cheapest.unit}`;

  const priceSlot = card.querySelector('.price-slot');
  priceSlot.innerHTML = `
    <span class="text-[13px] font-bold text-ink">₹${Number(cheapest.sellingPrice).toFixed(0)}</span>
    ${hasDiscount ? `<span class="text-[9px] text-ink-soft line-through">₹${Number(cheapest.mrp).toFixed(0)}</span>` : ''}
  `;

  const actionSlot = card.querySelector('.action-slot');
  if (!anyAvailable) {
    actionSlot.innerHTML = '<span class="text-[9px] text-accent font-bold">Out</span>';
  } else if (activeVariants.length === 1) {
    const btn = document.createElement('button');
    btn.className = 'border border-primary text-primary text-[10px] font-bold px-2 py-0.5 rounded';
    btn.textContent = 'ADD';
    btn.addEventListener('click', async (event) => {
      event.stopPropagation();
      btn.disabled = true;
      try {
        await apiFetch('/cart/items', { method: 'POST', body: JSON.stringify({ variantId: activeVariants[0].id, quantity: 1 }) });
        refreshCartBadge();
        btn.textContent = 'ADDED';
        btn.classList.add('bg-primary', 'text-white');
        setTimeout(() => {
          btn.textContent = 'ADD';
          btn.classList.remove('bg-primary', 'text-white');
          btn.disabled = false;
        }, 1200);
      } catch (error) {
        alert(error.message);
        btn.disabled = false;
      }
    });
    actionSlot.appendChild(btn);
  }

  card.addEventListener('click', (event) => {
    if (event.target.closest('.action-slot')) return;
    window.location.href = `product.html?id=${product.id}`;
  });

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

init();
