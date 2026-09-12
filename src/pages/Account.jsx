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
  const [loggingOut, setLoggingOut] = useState(false)
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

  async function handleLogout() {
    if (loggingOut) return

    const confirmed = window.confirm(
      'Are you sure you want to log out?'
    )

    if (!confirmed) return

    try {
      setLoggingOut(true)
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
      setLoggingOut(false)
      alert(err.message)
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#315d32] border-t-transparent" />
          <p className="text-xs font-bold uppercase tracking-wide text-[#81907b]">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-white bg-white p-8 text-center shadow-[0_20px_60px_rgba(47,70,39,0.10)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
            <ShieldCheck size={24} />
          </div>

          <p className="mb-4 text-xs font-bold text-red-500">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#315d32] px-5 py-2.5 text-xs font-black text-white transition hover:bg-[#274d29]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] pb-20">
      <div className="bg-[#315d32] px-4 py-6 text-white shadow-lg shadow-[#315d32]/15 sm:px-8">
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

              <p className="text-[11px] font-medium text-[#dceacb]">
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
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b8df7d] px-1 text-[9px] font-black text-[#274d29]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_rgba(47,70,39,0.08)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#dceacb] bg-[#eef5e7] text-[#315d32]">
                <User size={30} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-black text-[#202a20] sm:text-lg">
                    {customer?.name || 'Add your name'}
                  </h2>

                  <button
                    onClick={openNameForm}
                    className="rounded-lg p-1 text-[#9aa197] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>

                <p className="mt-1 text-xs font-medium text-[#8a9287]">
                  {customer?.phone
                    ? `+91 ${customer.phone}`
                    : 'No phone linked'}
                </p>

                {customer?.isPhoneVerified && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#4e8b38]">
                    <ShieldCheck size={13} />
                    Phone verified
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#eef5e7] px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#527e45]">
                Total Orders
              </p>

              <p className="mt-1 text-xl font-black text-[#202a20]">
                {orders.length}
              </p>
            </div>
          </div>
        </section>

        {showNameForm && (
          <form
            onSubmit={handleNameSubmit}
            className="mb-6 rounded-[26px] border border-[#dceacb] bg-white p-5 shadow-[0_18px_50px_rgba(47,70,39,0.07)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#202a20]">
                Edit Profile
              </h3>

              <button
                type="button"
                onClick={() => setShowNameForm(false)}
                className="rounded-lg p-1 text-[#9aa197] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
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
                className="flex-1 rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-bold text-[#202820] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
                autoFocus
              />

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#315d32] px-7 py-3 text-xs font-black text-white shadow-md shadow-[#315d32]/20 transition hover:bg-[#274d29] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        <section className="mb-7">
          <h2 className="mb-4 px-1 text-sm font-black uppercase tracking-wider text-[#606960]">
            Your Account
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accountCards.map((card) => {
              const Icon = card.icon

              return (
                <button
                  key={card.title}
                  onClick={card.action}
                  className="group flex min-h-[125px] items-start gap-4 rounded-[24px] border border-white bg-white p-5 text-left shadow-[0_12px_35px_rgba(47,70,39,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#dceacb] hover:shadow-[0_18px_45px_rgba(47,70,39,0.10)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dceacb] bg-[#eef5e7] text-[#315d32]">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-[#202a20]">
                      {card.title}
                    </h3>

                    <p className="mt-1 text-[11px] font-medium leading-5 text-[#8a9287]">
                      {card.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    className="mt-1 shrink-0 text-[#c2c9bd] transition group-hover:translate-x-1 group-hover:text-[#315d32]"
                  />
                </button>
              )
            })}
          </div>
        </section>

        <section
          id="addresses"
          className="rounded-[26px] border border-white bg-white shadow-[0_18px_50px_rgba(47,70,39,0.07)]"
        >
          <div className="flex flex-col gap-3 border-b border-[#edf0ea] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[#202a20]">
                Your Addresses
              </h2>

              <p className="mt-1 text-[11px] font-medium text-[#8a9287]">
                Manage your delivery addresses
              </p>
            </div>

            <button
              onClick={openAddressModal}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#dceacb] bg-[#eef5e7] px-4 py-2.5 text-xs font-black text-[#315d32] transition hover:bg-[#e1edd7]"
            >
              <Plus size={15} />
              Add New Address
            </button>
          </div>

          <div className="p-5">
            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dfe5da] bg-[#fafcf8] p-10 text-center">
                <MapPinned
                  size={36}
                  className="mx-auto mb-3 text-[#b4bdb0]"
                />

                <p className="text-xs font-bold text-[#606960]">
                  No saved addresses yet.
                </p>

                <p className="mt-1 text-[11px] text-[#969e93]">
                  Add an address for fast grocery delivery.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#edf0ea] bg-[#fafcf8] p-5 transition hover:border-[#dceacb] hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dceacb] bg-[#eef5e7] text-[#315d32]">
                          {item.label?.toLowerCase() === 'work' ? (
                            <Briefcase size={17} />
                          ) : (
                            <Home size={17} />
                          )}
                        </div>

                        <div>
                          <h3 className="text-xs font-black text-[#202a20]">
                            {item.label || 'Address'}
                          </h3>

                          {item.isDefault && (
                            <span className="text-[9px] font-bold uppercase text-[#4e8b38]">
                              Default address
                            </span>
                          )}
                        </div>
                      </div>

                      {item.isDefault && (
                        <span className="rounded-full bg-[#e5f2dc] px-2 py-1 text-[9px] font-bold text-[#315d32]">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="mt-4 min-h-[65px] text-xs font-medium leading-6 text-[#737c70]">
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

                    <div className="mt-4 flex items-center gap-4 border-t border-[#edf0ea] pt-4">
                      <button
                        onClick={() =>
                          openEditAddress(item)
                        }
                        className="flex items-center gap-1 text-[11px] font-black text-[#315d32] transition hover:text-[#274d29] hover:underline"
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <span className="h-4 w-px bg-[#dfe5da]" />

                      <button
                        onClick={() =>
                          handleDeleteAddress(item.id)
                        }
                        className="flex items-center gap-1 text-[11px] font-black text-[#b95b52] transition hover:text-[#9f4038] hover:underline"
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
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e8c9c5] bg-[#fff6f4] py-3.5 text-xs font-black text-[#b95b52] transition hover:bg-[#ffebe8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={16} />
          {loggingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1d2b1e]/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(29,43,30,0.25)]">
            <div className="flex items-center justify-between border-b border-[#edf0ea] px-6 py-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#202a20]">
                {editingAddressId
                  ? 'Edit Address'
                  : 'Add New Address'}
              </h3>

              <button
                onClick={closeAddressModal}
                className="rounded-lg p-1 text-[#9aa197] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
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
                className="w-full rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-medium text-[#202a20] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
              />

              <input
                name="line1"
                value={address.line1}
                onChange={handleAddressChange}
                placeholder="House / Flat No., Building / Street Name *"
                required
                className="w-full rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-medium text-[#202a20] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
              />

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-medium text-[#202a20] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City *"
                  required
                  className="w-full rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-medium text-[#202a20] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
                />

                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State *"
                  required
                  className="w-full rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-medium text-[#202a20] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
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
                className="w-full rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-medium text-[#202a20] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
              />

              <div className="flex gap-3 border-t border-[#edf0ea] pt-4">
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="flex-1 rounded-xl border border-[#dfe5da] bg-white py-3 text-xs font-bold text-[#606960] transition hover:bg-[#f7f8f2]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#315d32] py-3 text-xs font-black text-white shadow-md shadow-[#315d32]/20 transition hover:bg-[#274d29] disabled:opacity-50"
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