import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCart,
  getDeliveryFeeInfo,
  getAddresses,
  addAddress,
  placeOrder,
} from '../services/api'

function Checkout() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(null)
  const [deliveryFeeInfo, setDeliveryFeeInfo] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [fulfillmentMethod, setFulfillmentMethod] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')
  const [showAddressModal, setShowAddressModal] = useState(false)

  const [address, setAddress] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    try {
      const [cartData, feeData, addressData] = await Promise.all([
        getCart(),
        getDeliveryFeeInfo(),
        getAddresses(),
      ])

      if (!cartData?.items?.length) {
        navigate('/cart')
        return
      }

      setCart(cartData)
      setDeliveryFeeInfo(feeData)
      setAddresses(addressData || [])

      const defaultAddress =
        addressData?.find((item) => item.isDefault) ||
        addressData?.[0]

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        setFulfillmentMethod('DELIVERY')
      } else {
        setFulfillmentMethod('PICKUP')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFulfillment(method) {
    setFulfillmentMethod(method)
    setError('')
  }

  function handlePayment(method) {
    setPaymentMethod(method)
    setError('')
  }

  function handleAddressChange(event) {
    const { name, value } = event.target

    setAddress((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function selectAddress(id) {
    setSelectedAddressId(id)
  }

  async function handleAddAddress(event) {
    event.preventDefault()

    try {
      const payload = { ...address }

      if (addresses.length === 0) {
        payload.isDefault = true
      }

      const newAddress = await addAddress(payload)

      setAddresses((current) => [...current, newAddress])
      setSelectedAddressId(newAddress.id)
      setShowAddressModal(false)

      setAddress({
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
      })
    } catch (err) {
      alert(err.message)
    }
  }

  async function handlePlaceOrder() {
    setError('')

    if (!fulfillmentMethod) {
      setError('Choose a fulfillment method.')
      return
    }

    if (
      fulfillmentMethod === 'DELIVERY' &&
      !selectedAddressId
    ) {
      setError('Add or select a delivery address.')
      return
    }

    if (!paymentMethod) {
      setError('Choose a payment method.')
      return
    }

    try {
      setPlacingOrder(true)

      const order = await placeOrder({
        fulfillmentMethod,
        paymentMethod,
        ...(fulfillmentMethod === 'DELIVERY'
          ? { addressId: selectedAddressId }
          : {}),
      })

      navigate(`/confirmation?orderId=${order.id}`)
    } catch (err) {
      setError(err.message)
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    )
  }

  if (error && !cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>

          <button
            onClick={() => navigate('/cart')}
            className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
          >
            Back to Cart
          </button>
        </div>
      </div>
    )
  }

  const subtotal = Number(cart?.grandTotal || 0)

  const deliveryFee =
    fulfillmentMethod === 'DELIVERY' &&
    deliveryFeeInfo &&
    subtotal < Number(deliveryFeeInfo.freeThreshold || 0)
      ? Number(deliveryFeeInfo.fee || 0)
      : 0

  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-32">
      <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
        <button
          onClick={() => navigate('/cart')}
          className="-ml-2 flex h-12 w-12 items-center justify-center"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <h1 className="font-display text-xl font-bold text-green-700">
          Checkout
        </h1>
      </header>

      <main className="mx-auto mt-4 max-w-2xl space-y-8 px-4">
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">
            1. Fulfillment
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleFulfillment('DELIVERY')}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-center ${
                fulfillmentMethod === 'DELIVERY'
                  ? 'border-green-700 bg-green-700/10 text-green-700'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined mb-2 text-[32px]">
                local_shipping
              </span>

              <span className="font-semibold">
                Home Delivery
              </span>
            </button>

            <button
              onClick={() => handleFulfillment('PICKUP')}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-center ${
                fulfillmentMethod === 'PICKUP'
                  ? 'border-green-700 bg-green-700/10 text-green-700'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined mb-2 text-[32px]">
                storefront
              </span>

              <span className="font-semibold">
                Store Pickup
              </span>
            </button>
          </div>
        </section>

        {fulfillmentMethod === 'DELIVERY' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                2. Delivery Address
              </h2>

              <button
                onClick={() => setShowAddressModal(true)}
                className="flex items-center gap-1 font-semibold text-green-700"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">
                No saved addresses yet — add one to continue.
              </p>
            ) : (
              <div className="space-y-2">
                {addresses.map((item) => {
                  const selected =
                    item.id === selectedAddressId

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectAddress(item.id)}
                      className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left ${
                        selected
                          ? 'border-green-700 bg-green-700/10'
                          : 'border-gray-300'
                      }`}
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
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">
            3. Payment Method
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => handlePayment('UPI')}
              className={`flex items-center gap-2 rounded-xl border-2 p-4 text-left ${
                paymentMethod === 'UPI'
                  ? 'border-green-700 bg-green-700/10 text-green-700'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                qr_code_scanner
              </span>

              <span className="font-semibold">
                UPI (GPay, PhonePe, Paytm)
              </span>
            </button>

            <button
              onClick={() => handlePayment('CASH')}
              className={`flex items-center gap-2 rounded-xl border-2 p-4 text-left ${
                paymentMethod === 'CASH'
                  ? 'border-green-700 bg-green-700/10 text-green-700'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                payments
              </span>

              <span className="font-semibold">
                {fulfillmentMethod === 'DELIVERY'
                  ? 'Cash on Delivery'
                  : 'Pay at Pickup'}
              </span>
            </button>
          </div>
        </section>

        <section className="space-y-2 rounded-xl bg-[#efeeea] p-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Items</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee > 0
                ? `₹${deliveryFee.toFixed(2)}`
                : 'FREE'}
            </span>
          </div>

          <div className="my-2 h-px w-full bg-gray-300" />

          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold">
              Total
            </span>

            <span className="text-2xl font-bold text-green-700">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </section>

        {error && (
          <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 z-40 w-full bg-[#faf9f5] px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-green-700 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}

            {!placingOrder && (
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            )}
          </button>
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mt-8 w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-5 font-display text-xl font-bold">
              Add Address
            </h3>

            <form
              onSubmit={handleAddAddress}
              className="space-y-3"
            >
              <input
                name="label"
                value={address.label}
                onChange={handleAddressChange}
                placeholder="Label (e.g. Home, Work)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />

              <input
                name="line1"
                value={address.line1}
                onChange={handleAddressChange}
                placeholder="House / Flat, Street"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />

              <input
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="City"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />

              <input
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder="State"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />

              <input
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-green-700 py-3 font-semibold text-white"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout