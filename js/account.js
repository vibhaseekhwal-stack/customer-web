const session = requireAuth();
refreshCartBadge();

let addresses = [];

function renderProfile() {
  const customer = getSession()?.customer;
  document.getElementById('nameDisplay').textContent = customer?.name || 'Add your name';
  document.getElementById('phoneDisplay').textContent = `+91 ${customer?.phone || ''}`;
}

document.getElementById('editNameBtn').addEventListener('click', () => {
  const form = document.getElementById('nameForm');
  form.classList.toggle('hidden');
  document.getElementById('nameInput').value = getSession()?.customer?.name || '';
});

document.getElementById('nameForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('nameInput').value.trim();
  try {
    const updated = await apiFetch('/customers/me', { method: 'PATCH', body: JSON.stringify({ name }) });
    const current = getSession();
    saveSession({ ...current, customer: { ...current.customer, ...updated } });
    renderProfile();
    document.getElementById('nameForm').classList.add('hidden');
  } catch (error) {
    alert(error.message);
  }
});

async function loadAddresses() {
  try {
    addresses = await apiFetch('/customers/me/addresses');
  } catch (error) {
    alert(error.message);
    return;
  }
  renderAddresses();
}

function renderAddresses() {
  const list = document.getElementById('addressList');
  const noAddressMsg = document.getElementById('noAddressMsg');
  list.innerHTML = '';

  if (addresses.length === 0) {
    noAddressMsg.classList.remove('hidden');
    return;
  }
  noAddressMsg.classList.add('hidden');

  for (const address of addresses) {
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_12px_rgba(0,0,0,0.04)] flex gap-md items-start';
    card.innerHTML = `
      <span class="material-symbols-outlined text-primary mt-1">home_pin</span>
      <div class="flex-1">
        <h3 class="font-label-lg text-label-lg mb-xs">${escapeHtml(address.label || 'Address')}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml([address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', '))}</p>
      </div>
      <button class="text-on-surface-variant hover:text-error delete-address-btn" data-address-id="${address.id}">
        <span class="material-symbols-outlined text-[20px]">delete</span>
      </button>
    `;
    card.querySelector('.delete-address-btn').addEventListener('click', () => deleteAddress(address.id));
    list.appendChild(card);
  }
}

async function deleteAddress(addressId) {
  if (!confirm('Remove this address?')) return;
  try {
    await apiFetch(`/customers/me/addresses/${addressId}`, { method: 'DELETE' });
    addresses = addresses.filter((a) => a.id !== addressId);
    renderAddresses();
  } catch (error) {
    alert(error.message);
  }
}

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
    renderAddresses();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    event.target.reset();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Log out?')) logout();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

renderProfile();
loadAddresses();
