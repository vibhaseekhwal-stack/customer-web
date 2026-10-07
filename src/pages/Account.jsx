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
  HandCoins,
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
      const [addressData, orderData, cartData] = await Promise.all([
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
    {
      title: 'Affiliate Programme',
      description: 'Earn rewards by referring friends and family',
      icon: HandCoins,
      action: () => navigate('/affiliate'),
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#315d32] border-t-transparent" />

          <p className="text-center text-[10px] font-bold uppercase tracking-wide text-[#81907b] sm:text-xs">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-white bg-white p-6 text-center shadow-[0_20px_60px_rgba(47,70,39,0.10)] sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#315d32]">
            <ShieldCheck size={24} />
          </div>

          <p className="mb-4 break-words text-xs font-bold text-red-500">
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
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8f2] pb-12 sm:pb-16 lg:pb-20">
      <div className="bg-[#315d32] px-3 py-4 text-white shadow-lg shadow-[#315d32]/15 sm:px-6 sm:py-5 md:px-8 lg:py-6">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-white/20 sm:h-10 sm:w-10"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight sm:text-xl md:text-2xl">
                My Account
              </h1>

              <p className="truncate text-[9px] font-medium text-[#dceacb] sm:text-[11px]">
                Manage profile and delivery locations
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-6 md:px-7 lg:px-8">
        <section className="mb-5 rounded-[22px] border border-white/80 bg-white p-4 shadow-[0_18px_50px_rgba(47,70,39,0.08)] sm:mb-6 sm:rounded-[26px] sm:p-5 md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#dceacb] bg-[#eef5e7] text-[#315d32] sm:h-16 sm:w-16">
                <User size={27} className="sm:h-[30px] sm:w-[30px]" />
              </div>

              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <h2 className="min-w-0 truncate text-sm font-black text-[#202a20] sm:text-lg">
                    {customer?.name || 'Add your name'}
                  </h2>

                  <button
                    onClick={openNameForm}
                    className="shrink-0 rounded-lg p-1 text-[#9aa197] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
                    aria-label="Edit name"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>

                <p className="mt-1 truncate text-[11px] font-medium text-[#8a9287] sm:text-xs">
                  {customer?.phone
                    ? `+91 ${customer.phone}`
                    : 'No phone linked'}
                </p>

                {customer?.isPhoneVerified && (
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-[#4e8b38] sm:mt-2 sm:text-[10px]">
                    <ShieldCheck size={12} />
                    Phone verified
                  </div>
                )}
              </div>
            </div>

            <div className="w-full rounded-2xl bg-[#eef5e7] px-4 py-3 sm:w-auto sm:min-w-[130px] sm:px-5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#527e45] sm:text-[10px]">
                Total Orders
              </p>

              <p className="mt-1 text-lg font-black text-[#202a20] sm:text-xl">
                {orders.length}
              </p>
            </div>
          </div>
        </section>

        {showNameForm && (
          <form
            onSubmit={handleNameSubmit}
            className="mb-5 rounded-[22px] border border-[#dceacb] bg-white p-4 shadow-[0_18px_50px_rgba(47,70,39,0.07)] sm:mb-6 sm:rounded-[26px] sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#202a20] sm:text-sm">
                Edit Profile
              </h3>

              <button
                type="button"
                onClick={() => setShowNameForm(false)}
                className="shrink-0 rounded-lg p-1 text-[#9aa197] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
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
                className="min-w-0 flex-1 rounded-xl border border-[#e0e6dc] bg-[#fafcf8] px-4 py-3 text-xs font-bold text-[#202820] outline-none transition focus:border-[#5e9742] focus:bg-white focus:ring-4 focus:ring-[#6c9d50]/10"
                autoFocus
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#315d32] px-7 py-3 text-xs font-black text-white shadow-md shadow-[#315d32]/20 transition hover:bg-[#274d29] disabled:opacity-50 sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        <section className="mb-6 sm:mb-7">
          <h2 className="mb-3 px-1 text-xs font-black uppercase tracking-wider text-[#606960] sm:mb-4 sm:text-sm">
            Your Account
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {accountCards.map((card) => {
              const Icon = card.icon

              return (
                <button
                  key={card.title}
                  onClick={card.action}
                  className="group flex min-h-[112px] w-full min-w-0 items-start gap-3 rounded-[20px] border border-white bg-white p-4 text-left shadow-[0_12px_35px_rgba(47,70,39,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#dceacb] hover:shadow-[0_18px_45px_rgba(47,70,39,0.10)] sm:min-h-[125px] sm:gap-4 sm:rounded-[24px] sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dceacb] bg-[#eef5e7] text-[#315d32] sm:h-11 sm:w-11">
                    <Icon size={20} className="sm:h-[22px] sm:w-[22px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-black text-[#202a20] sm:text-sm">
                      {card.title}
                    </h3>

                    <p className="mt-1 text-[10px] font-medium leading-5 text-[#8a9287] sm:text-[11px]">
                      {card.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="mt-1 shrink-0 text-[#c2c9bd] transition group-hover:translate-x-1 group-hover:text-[#315d32]"
                  />
                </button>
              )
            })}
          </div>
        </section>

        <section
          id="addresses"
          className="rounded-[22px] border border-white bg-white shadow-[0_18px_50px_rgba(47,70,39,0.07)] sm:rounded-[26px]"
        >
          <div className="flex flex-col gap-3 border-b border-[#edf0ea] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 md:p-6">
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[#202a20] sm:text-base">
                Your Addresses
              </h2>

              <p className="mt-1 text-[10px] font-medium text-[#8a9287] sm:text-[11px]">
                Manage your delivery addresses
              </p>
            </div>

            <button
              onClick={openAddressModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dceacb] bg-[#eef5e7] px-4 py-2.5 text-xs font-black text-[#315d32] transition hover:bg-[#e1edd7] sm:w-auto"
            >
              <Plus size={15} />
              Add New Address
            </button>
          </div>

          <div className="p-4 sm:p-5 md:p-6">
            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dfe5da] bg-[#fafcf8] p-8 text-center sm:p-10">
                <MapPinned
                  size={34}
                  className="mx-auto mb-3 text-[#b4bdb0]"
                />

                <p className="text-xs font-bold text-[#606960]">
                  No saved addresses yet.
                </p>

                <p className="mt-1 text-[10px] text-[#969e93] sm:text-[11px]">
                  Add an address for fast grocery delivery.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                {addresses.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-0 rounded-2xl border border-[#edf0ea] bg-[#fafcf8] p-4 transition hover:border-[#dceacb] hover:bg-white hover:shadow-sm sm:p-5"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dceacb] bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10">
                          {item.label?.toLowerCase() === 'work' ? (
                            <Briefcase size={16} />
                          ) : (
                            <Home size={16} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-xs font-black text-[#202a20]">
                            {item.label || 'Address'}
                          </h3>

                          {item.isDefault && (
                            <span className="text-[8px] font-bold uppercase text-[#4e8b38] sm:text-[9px]">
                              Default address
                            </span>
                          )}
                        </div>
                      </div>

                      {item.isDefault && (
                        <span className="shrink-0 rounded-full bg-[#e5f2dc] px-2 py-1 text-[8px] font-bold text-[#315d32] sm:text-[9px]">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="mt-4 min-h-0 break-words text-[11px] font-medium leading-6 text-[#737c70] sm:min-h-[65px] sm:text-xs">
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
                        onClick={() => openEditAddress(item)}
                        className="flex items-center gap-1 text-[10px] font-black text-[#315d32] transition hover:text-[#274d29] hover:underline sm:text-[11px]"
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <span className="h-4 w-px bg-[#dfe5da]" />

                      <button
                        onClick={() =>
                          handleDeleteAddress(item.id)
                        }
                        className="flex items-center gap-1 text-[10px] font-black text-[#b95b52] transition hover:text-[#9f4038] hover:underline sm:text-[11px]"
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e8c9c5] bg-[#fff6f4] py-3.5 text-xs font-black text-[#b95b52] transition hover:bg-[#ffebe8] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6"
        >
          <LogOut size={16} />
          {loggingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1d2b1e]/55 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="my-auto max-h-[calc(100dvh-32px)] w-full max-w-md overflow-y-auto rounded-[24px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(29,43,30,0.25)] sm:max-h-[calc(100dvh-48px)] sm:rounded-[30px]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#edf0ea] bg-white px-4 py-4 sm:px-6">
              <h3 className="min-w-0 truncate text-xs font-black uppercase tracking-wider text-[#202a20] sm:text-sm">
                {editingAddressId
                  ? 'Edit Address'
                  : 'Add New Address'}
              </h3>

              <button
                onClick={closeAddressModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9aa197] transition hover:bg-[#eef5e7] hover:text-[#315d32]"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddressSubmit}
              className="space-y-3 p-4 sm:space-y-3.5 sm:p-6"
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

              <div className="flex flex-col gap-2.5 border-t border-[#edf0ea] pt-4 sm:flex-row sm:gap-3">
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