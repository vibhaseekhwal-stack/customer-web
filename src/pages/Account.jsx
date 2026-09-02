import React, { useEffect, useState } from 'react'
import {
  getSession,
  saveSession,
  logout,
  getAddresses,
  updateCustomer,
  addAddress,
  deleteAddress,
  getCart,
} from '../services/api'

function Account() {
  const [customer, setCustomer] = useState(getSession()?.customer || {})
  const [addresses, setAddresses] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [showNameForm, setShowNameForm] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [address, setAddress] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    loadAccountData()
  }, [])

  async function loadAccountData() {
    try {
      const [addressData, cartData] = await Promise.all([
        getAddresses(),
        getCart(),
      ])

      setAddresses(addressData || [])
      setCartCount(cartData?.itemCount || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function openNameForm() {
    setName(customer?.name || '')
    setShowNameForm(true)
  }

  async function handleNameSubmit(event) {
    event.preventDefault()

    if (!name.trim()) return

    try {
      setSaving(true)

      const updated = await updateCustomer({
        name: name.trim(),
      })

      const session = getSession()

      const updatedCustomer = {
        ...session.customer,
        ...updated,
      }

      saveSession({
        ...session,
        customer: updatedCustomer,
      })

      setCustomer(updatedCustomer)
      setShowNameForm(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!window.confirm('Remove this address?')) return

    try {
      await deleteAddress(addressId)

      setAddresses((current) =>
        current.filter((item) => item.id !== addressId)
      )
    } catch (err) {
      alert(err.message)
    }
  }

  function openAddressModal() {
    setAddress({
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    })

    setShowAddressModal(true)
  }

  async function handleAddressSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)

      const payload = {
        ...address,
      }

      if (addresses.length === 0) {
        payload.isDefault = true
      }

      const newAddress = await addAddress(payload)

      setAddresses((current) => [...current, newAddress])
      setShowAddressModal(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleAddressChange(event) {
    const { name, value } = event.target

    setAddress((current) => ({
      ...current,
      [name]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <p className="text-center text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-24">
      <header className="sticky top-0 z-40 flex h-14 items-center bg-white px-4 shadow-sm">
        <h1 className="font-display text-xl font-bold text-green-700">
          Account
        </h1>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
        <section className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <span className="material-symbols-outlined text-3xl">
              person
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold text-gray-900">
                {customer?.name || 'Add your name'}
              </h2>

              <button
                onClick={openNameForm}
                className="text-gray-500 hover:text-green-700"
              >
                <span className="material-symbols-outlined text-lg">
                  edit
                </span>
              </button>
            </div>

            <p className="text-sm text-gray-500">
              {customer?.phone ? `+91 ${customer.phone}` : ''}
            </p>
          </div>
        </section>

        {showNameForm && (
          <form
            onSubmit={handleNameSubmit}
            className="flex gap-2 rounded-xl bg-white p-4 shadow-sm"
          >
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Saved Addresses
            </h2>

            <button
              onClick={openAddressModal}
              className="flex items-center gap-1 font-semibold text-green-700"
            >
              <span className="material-symbols-outlined text-lg">
                add
              </span>
              Add New
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">
              No saved addresses yet.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                >
                  <span className="material-symbols-outlined mt-1 text-green-700">
                    home_pin
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-semibold text-gray-900">
                      {item.label || 'Address'}
                    </h3>

                    <p className="text-sm leading-6 text-gray-500">
                      {[
                        item.line1,
                        item.line2,
                        item.city,
                        item.state,
                        item.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(item.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <span className="material-symbols-outlined">
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={() => {
            if (window.confirm('Log out?')) {
              logout()
            }
          }}
          className="w-full rounded-lg border border-red-500 py-3 font-semibold text-red-500"
        >
          Log Out
        </button>
      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mt-8 w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-5 text-xl font-bold text-gray-900">
              Add Address
            </h3>

            <form
              onSubmit={handleAddressSubmit}
              className="space-y-3"
            >
              <input
                name="label"
                value={address.label}
                onChange={handleAddressChange}
                placeholder="Label (e.g. Home, Work)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <input
                name="line1"
                value={address.line1}
                onChange={handleAddressChange}
                placeholder="House / Flat, Street"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <input
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="City"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <input
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder="State"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <input
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-green-700 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-gray-200 bg-white px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <a
          href="/"
          className="flex flex-col items-center px-4 py-1 text-gray-500"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px]">Home</span>
        </a>

        <a
          href="/cart"
          className="relative flex flex-col items-center px-4 py-1 text-gray-500"
        >
          <span className="material-symbols-outlined">
            shopping_cart
          </span>
          <span className="text-[10px]">Cart</span>

          {cartCount > 0 && (
            <span className="absolute right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </a>

        <a
          href="/orders"
          className="flex flex-col items-center px-4 py-1 text-gray-500"
        >
          <span className="material-symbols-outlined">
            receipt_long
          </span>
          <span className="text-[10px]">Orders</span>
        </a>

        <a
          href="/account"
          className="flex flex-col items-center rounded-full bg-green-700 px-4 py-1 text-white"
        >
          <span className="material-symbols-outlined">
            person
          </span>
          <span className="text-[10px]">Account</span>
        </a>
      </nav>
    </div>
  )
}

export default Account