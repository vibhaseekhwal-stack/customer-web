import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  User,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  LogOut,
  ArrowLeft,
  Home,
  CheckCircle2,
  X,
  ShieldAlert,
  Sparkles,
  MapPinned
} from 'lucide-react'

function Account() {
  const navigate = useNavigate()
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
      const payload = { ...address }

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
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f4f7f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
          <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f4f7f4] px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4">
            <ShieldAlert size={24} />
          </div>
          <p className="mb-4 text-xs font-bold text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-20">
      
      {/* Top Header Banner matching Theme */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 text-white px-4 sm:px-8 py-6 shadow-md">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-white/20 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight">My Account</h1>
              <p className="text-[11px] text-green-100 font-medium">Manage profile and delivery locations</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl space-y-5 px-4 sm:px-6 py-6">
        
        {/* Profile Card */}
        <section className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-green-700 border border-emerald-100">
              <User size={30} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base sm:text-lg font-black text-gray-900">
                  {customer?.name || 'Add your name'}
                </h2>
                <button
                  onClick={openNameForm}
                  className="text-gray-400 hover:text-green-700 transition p-1 cursor-pointer"
                  title="Edit Name"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {customer?.phone ? `+91 ${customer.phone}` : 'No phone linked'}
              </p>
            </div>
          </div>
        </section>

        {/* Inline Name Edit Form */}
        {showNameForm && (
          <form
            onSubmit={handleNameSubmit}
            className="flex gap-2 rounded-2xl bg-white p-4 shadow-sm border border-emerald-100 animate-fadeIn"
          >
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-green-600 bg-gray-50/50"
              autoFocus
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-green-900/20 transition hover:bg-green-800 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}

        {/* Addresses Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Saved Addresses
            </h2>

            <button
              onClick={openAddressModal}
              className="flex items-center gap-1.5 text-xs font-black text-green-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition hover:bg-emerald-100 cursor-pointer"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add New</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <MapPinned size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-500">No saved addresses yet.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Add an address for fast grocery delivery.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100 group transition hover:border-green-200"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                    <MapPin size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-xs font-black text-gray-900 flex items-center gap-2">
                      {item.label || 'Address'}
                      {item.isDefault && (
                        <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </h3>

                    <p className="text-xs leading-relaxed text-gray-500 font-medium">
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
                    className="text-gray-400 hover:text-red-500 transition p-1.5 cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout()
              }
            }}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border border-red-200 bg-red-50/50 py-3.5 text-xs font-black text-red-600 shadow-sm transition hover:bg-red-100/50 active:scale-95 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </main>

      {/* Address Modal Dialog */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-xs px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                Add New Address
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-3.5">
              <input
                name="label"
                value={address.label}
                onChange={handleAddressChange}
                placeholder="Label (e.g. Home, Work, Parents)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium outline-none focus:border-green-600 bg-gray-50/50"
              />

              <input
                name="line1"
                value={address.line1}
                onChange={handleAddressChange}
                placeholder="House / Flat No., Building / Street Name *"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium outline-none focus:border-green-600 bg-gray-50/50"
              />

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium outline-none focus:border-green-600 bg-gray-50/50"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City *"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium outline-none focus:border-green-600 bg-gray-50/50"
                />

                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State *"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium outline-none focus:border-green-600 bg-gray-50/50"
                />
              </div>

              <input
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode *"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xs font-medium outline-none focus:border-green-600 bg-gray-50/50"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-green-700 py-3 text-xs font-black text-white shadow-md shadow-green-900/20 transition hover:bg-green-800 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Address'}
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