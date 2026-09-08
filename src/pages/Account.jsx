import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSession,
  saveSession,
  logout,
  getAddresses,
  updateCustomer,
  addAddress,
  updateAddress,
  deleteAddress,
  getOrders,
  getCart,
} from '../services/api'
import {
  User,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  LogOut,
  ArrowLeft,
  X,
  ShieldCheck,
  Package,
  CreditCard,
  Heart,
  ChevronRight,
  ShoppingCart,
  Home,
  Briefcase,
  MapPinned,
} from 'lucide-react'

function Account() {
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(
    getSession()?.customer || {}
  )
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [cartCount, setCartCount] = useState(0)

  const [showNameForm, setShowNameForm] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const emptyAddress = {
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  }

  const [address, setAddress] = useState(emptyAddress)

  useEffect(() => {
    loadAccountData()
  }, [])

  async function loadAccountData() {
    try {
      const [addressData, orderData, cartData] =
        await Promise.all([
          getAddresses(),
          getOrders(),
          getCart(),
        ])

      setAddresses(addressData || [])
      setOrders(orderData || [])
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

      if (!session) return

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

  function openAddressModal() {
    setEditingAddressId(null)
    setAddress(emptyAddress)
    setShowAddressModal(true)
  }

  function openEditAddress(item) {
    setEditingAddressId(item.id)

    setAddress({
      label: item.label || '',
      line1: item.line1 || '',
      line2: item.line2 || '',
      city: item.city || '',
      state: item.state || '',
      pincode: item.pincode || '',
    })

    setShowAddressModal(true)
  }

  async function handleAddressSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)

      if (editingAddressId) {
        const updatedAddress = await updateAddress(
          editingAddressId,
          address
        )

        setAddresses((current) =>
          current.map((item) =>
            item.id === editingAddressId
              ? { ...item, ...updatedAddress }
              : item
          )
        )
      } else {
        const payload = { ...address }

        if (addresses.length === 0) {
          payload.isDefault = true
        }

        const newAddress = await addAddress(payload)

        setAddresses((current) => [
          ...current,
          newAddress,
        ])
      }

      closeAddressModal()
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

  function handleAddressChange(event) {
    const { name, value } = event.target

    setAddress((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function closeAddressModal() {
    setShowAddressModal(false)
    setEditingAddressId(null)
    setAddress(emptyAddress)
  }

  const accountCards = [
    {
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      icon: Package,
      action: () => navigate('/orders'),
    },
    {
      title: 'Login & Security',
      description: 'Edit your name and account details',
      icon: ShieldCheck,
      action: openNameForm,
    },
    {
      title: 'Your Addresses',
      description: 'Edit addresses for orders and delivery',
      icon: MapPin,
      action: () =>
        document
          .getElementById('addresses')
          ?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      title: 'Your Payments',
      description: 'Manage your payment preferences',
      icon: CreditCard,
      action: () => {},
    },
    {
      title: 'Your Wishlist',
      description: 'View and manage saved products',
      icon: Heart,
      action: () => {},
    },
    {
      title: 'Your Cart',
      description: `${cartCount} ${
        cartCount === 1 ? 'item' : 'items'
      } currently in your cart`,
      icon: ShoppingCart,
      action: () => navigate('/cart'),
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ShieldCheck size={24} />
          </div>

          <p className="mb-4 text-xs font-bold text-red-500">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-black text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-20">
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 px-4 py-6 text-white shadow-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-white/20"
              title="Go Back"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-lg font-black tracking-tight sm:text-2xl">
                My Account
              </h1>

              <p className="text-[11px] font-medium text-green-100">
                Manage profile and delivery locations
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          >
            <ShoppingCart size={19} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-green-800">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-green-700">
                <User size={30} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-black text-gray-900 sm:text-lg">
                    {customer?.name || 'Add your name'}
                  </h2>

                  <button
                    onClick={openNameForm}
                    className="rounded-lg p-1 text-gray-400 transition hover:bg-emerald-50 hover:text-green-700"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  {customer?.phone
                    ? `+91 ${customer.phone}`
                    : 'No phone linked'}
                </p>

                {customer?.isPhoneVerified && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-700">
                    <ShieldCheck size={13} />
                    Phone verified
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                Total Orders
              </p>

              <p className="mt-1 text-xl font-black text-gray-900">
                {orders.length}
              </p>
            </div>
          </div>
        </section>

        {showNameForm && (
          <form className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                Edit Profile
              </h3>

              <button
                type="button"
                onClick={() => setShowNameForm(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your full name"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-green-600"
                autoFocus
              />

              <button
                type="submit"
                disabled={saving}
                onClick={handleNameSubmit}
                className="rounded-xl bg-green-700 px-7 py-3 text-xs font-black text-white shadow-md shadow-green-900/20 transition hover:bg-green-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        <section className="mb-7">
          <h2 className="mb-4 px-1 text-sm font-black uppercase tracking-wider text-gray-500">
            Your Account
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accountCards.map((card) => {
              const Icon = card.icon

              return (
                <button
                  key={card.title}
                  onClick={card.action}
                  className="group flex min-h-[125px] items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-green-700">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-gray-900">
                      {card.title}
                    </h3>

                    <p className="mt-1 text-[11px] font-medium leading-5 text-gray-500">
                      {card.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="mt-1 shrink-0 text-gray-300 transition group-hover:text-green-700"
                  />
                </button>
              )
            })}
          </div>
        </section>

        <section
          id="addresses"
          className="rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">
                Your Addresses
              </h2>

              <p className="mt-1 text-[11px] font-medium text-gray-500">
                Manage your delivery addresses
              </p>
            </div>

            <button
              onClick={openAddressModal}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-xs font-black text-green-700 transition hover:bg-emerald-100"
            >
              <Plus size={15} />
              Add New Address
            </button>
          </div>

          <div className="p-5">
            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                <MapPinned
                  size={36}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="text-xs font-bold text-gray-500">
                  No saved addresses yet.
                </p>

                <p className="mt-1 text-[11px] text-gray-400">
                  Add an address for fast grocery delivery.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-green-700">
                          {item.label?.toLowerCase() === 'work' ? (
                            <Briefcase size={17} />
                          ) : (
                            <Home size={17} />
                          )}
                        </div>

                        <div>
                          <h3 className="text-xs font-black text-gray-900">
                            {item.label || 'Address'}
                          </h3>

                          {item.isDefault && (
                            <span className="text-[9px] font-bold uppercase text-green-700">
                              Default address
                            </span>
                          )}
                        </div>
                      </div>

                      {item.isDefault && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-bold text-green-800">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="mt-4 min-h-[65px] text-xs font-medium leading-6 text-gray-500">
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

                    <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                      <button
                        onClick={() =>
                          openEditAddress(item)
                        }
                        className="flex items-center gap-1 text-[11px] font-black text-green-700 hover:underline"
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <span className="h-4 w-px bg-gray-200" />

                      <button
                        onClick={() =>
                          handleDeleteAddress(item.id)
                        }
                        className="flex items-center gap-1 text-[11px] font-black text-red-500 hover:underline"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <button
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you want to log out?'
              )
            ) {
              logout()
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 py-3.5 text-xs font-black text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                {editingAddressId
                  ? 'Edit Address'
                  : 'Add New Address'}
              </h3>

              <button
                onClick={closeAddressModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddressSubmit}
              className="space-y-3.5 p-6"
            >
              <input
                name="label"
                value={address.label}
                onChange={handleAddressChange}
                placeholder="Label (e.g. Home, Work, Parents)"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium outline-none focus:border-green-600"
              />

              <input
                name="line1"
                value={address.line1}
                onChange={handleAddressChange}
                placeholder="House / Flat No., Building / Street Name *"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium outline-none focus:border-green-600"
              />

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium outline-none focus:border-green-600"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City *"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium outline-none focus:border-green-600"
                />

                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State *"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium outline-none focus:border-green-600"
                />
              </div>

              <input
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode *"
                required
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium outline-none focus:border-green-600"
              />

              <div className="flex gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-green-700 py-3 text-xs font-black text-white shadow-md shadow-green-900/20 transition hover:bg-green-800 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingAddressId
                      ? 'Update Address'
                      : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Account