import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCart,
  getDeliveryFeeInfo,
  getAddresses,
  addAddress,
  placeOrder,
} from '../services/api'
import {
  ArrowLeft,
  Truck,
  Store,
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  Check,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  X,
  Clock3,
  PackageCheck,
  ReceiptText,
} from 'lucide-react'

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
    setError('')
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
      setFulfillmentMethod('DELIVERY')
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
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#16823b]/20 border-t-[#16823b]" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Loading checkout...
          </p>
        </div>
      </div>
    )
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ShoppingBag size={28} />
          </div>

          <h2 className="text-lg font-black text-[#172019]">
            Checkout unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={() => navigate('/cart')}
            className="mt-6 w-full rounded-2xl bg-[#16823b] py-3.5 text-sm font-black text-white transition hover:bg-[#116d30]"
          >
            Back to Cart
          </button>
        </div>
      </div>
    )
  }

  const subtotal = Number(cart?.grandTotal || 0)

  const freeThreshold = Number(
    deliveryFeeInfo?.freeThreshold || 0
  )

  const deliveryFee =
    fulfillmentMethod === 'DELIVERY' &&
    deliveryFeeInfo &&
    subtotal < freeThreshold
      ? Number(deliveryFeeInfo.fee || 0)
      : 0

  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-[#f7faf7] pb-10">

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">

        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400">
            <button
              onClick={() => navigate('/cart')}
              className="transition hover:text-[#16823b]"
            >
              Cart
            </button>

            <ChevronRight size={12} />

            <span className="font-bold text-[#16823b]">
              Checkout
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#172019] sm:text-3xl">
                Complete Your Order
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Choose delivery, address and payment method.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-2xl border border-[#16823b]/10 bg-white px-4 py-3 shadow-sm sm:flex">
              <ShieldCheck
                size={18}
                className="text-[#16823b]"
              />

              <span className="text-[10px] font-black text-gray-500">
                Secure Checkout
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          <div className="space-y-5">

            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                    <Truck size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-[#172019] sm:text-base">
                      Delivery Options
                    </h2>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      How would you like to receive your order?
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-[#f4f8f4] px-3 py-1 text-[9px] font-black uppercase text-[#16823b] sm:block">
                  Step 1
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() => handleFulfillment('DELIVERY')}
                  className={`relative rounded-2xl border-2 p-4 text-left transition ${
                    fulfillmentMethod === 'DELIVERY'
                      ? 'border-[#16823b] bg-[#f4f8f4]'
                      : 'border-gray-100 bg-white hover:border-[#16823b]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        fulfillmentMethod === 'DELIVERY'
                          ? 'bg-[#16823b] text-white'
                          : 'bg-[#f4f8f4] text-[#16823b]'
                      }`}
                    >
                      <Truck size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#172019]">
                        Home Delivery
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-gray-500">
                        Get your groceries delivered to your doorstep.
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#16823b]">
                        <Clock3 size={13} />
                        Fast & convenient
                      </div>
                    </div>
                  </div>

                  {fulfillmentMethod === 'DELIVERY' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#16823b] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleFulfillment('PICKUP')}
                  className={`relative rounded-2xl border-2 p-4 text-left transition ${
                    fulfillmentMethod === 'PICKUP'
                      ? 'border-[#16823b] bg-[#f4f8f4]'
                      : 'border-gray-100 bg-white hover:border-[#16823b]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        fulfillmentMethod === 'PICKUP'
                          ? 'bg-[#16823b] text-white'
                          : 'bg-[#f4f8f4] text-[#16823b]'
                      }`}
                    >
                      <Store size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#172019]">
                        Store Pickup
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-gray-500">
                        Pick up your order directly from the store.
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#16823b]">
                        <PackageCheck size={13} />
                        Easy pickup
                      </div>
                    </div>
                  </div>

                  {fulfillmentMethod === 'PICKUP' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#16823b] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>

              </div>
            </section>

            {fulfillmentMethod === 'DELIVERY' && (
              <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-5 flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-[#172019] sm:text-base">
                        Delivery Address
                      </h2>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Select where you want your order delivered
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#f4f8f4] px-3 py-2 text-[10px] font-black text-[#16823b] transition hover:bg-[#16823b] hover:text-white"
                  >
                    <Plus size={14} />
                    Add Address
                  </button>

                </div>

                {addresses.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="w-full rounded-2xl border border-dashed border-[#16823b]/30 bg-[#f7faf7] p-7 text-center transition hover:border-[#16823b] hover:bg-[#f4f8f4]"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#16823b] shadow-sm">
                      <MapPin size={22} />
                    </div>

                    <p className="mt-3 text-sm font-black text-[#172019]">
                      No saved address
                    </p>

                    <p className="mt-1 text-[11px] text-gray-500">
                      Add your delivery address to continue
                    </p>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((item) => {
                      const selected =
                        item.id === selectedAddressId

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectAddress(item.id)}
                          className={`relative flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                            selected
                              ? 'border-[#16823b] bg-[#f4f8f4]'
                              : 'border-gray-100 bg-white hover:border-[#16823b]/30'
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? 'bg-[#16823b] text-white'
                                : 'bg-[#f4f8f4] text-[#16823b]'
                            }`}
                          >
                            <MapPin size={19} />
                          </div>

                          <div className="min-w-0 flex-1 pr-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-black text-[#172019]">
                                {item.label || 'Address'}
                              </h3>

                              {item.isDefault && (
                                <span className="rounded-full bg-[#16823b]/10 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-[#16823b]">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-[11px] leading-5 text-gray-500">
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

                          <div
                            className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              selected
                                ? 'border-[#16823b] bg-[#16823b] text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {selected && <Check size={10} />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

              </section>
            )}

            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-[#172019] sm:text-base">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Select your preferred payment option
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-[#f4f8f4] px-3 py-1 text-[9px] font-black uppercase text-[#16823b] sm:block">
                  Step 2
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() => handlePayment('UPI')}
                  className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                    paymentMethod === 'UPI'
                      ? 'border-[#16823b] bg-[#f4f8f4]'
                      : 'border-gray-100 bg-white hover:border-[#16823b]/30'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      paymentMethod === 'UPI'
                        ? 'bg-[#16823b] text-white'
                        : 'bg-[#f4f8f4] text-[#16823b]'
                    }`}
                  >
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#172019]">
                      UPI Payment
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      GPay, PhonePe, Paytm & more
                    </p>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#16823b] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePayment('CASH')}
                  className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                    paymentMethod === 'CASH'
                      ? 'border-[#16823b] bg-[#f4f8f4]'
                      : 'border-gray-100 bg-white hover:border-[#16823b]/30'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      paymentMethod === 'CASH'
                        ? 'bg-[#16823b] text-white'
                        : 'bg-[#f4f8f4] text-[#16823b]'
                    }`}
                  >
                    <Banknote size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#172019]">
                      {fulfillmentMethod === 'DELIVERY'
                        ? 'Cash on Delivery'
                        : 'Pay at Pickup'}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      Simple & convenient
                    </p>
                  </div>

                  {paymentMethod === 'CASH' && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#16823b] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>

              </div>
            </section>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                <X size={16} />
                <span>{error}</span>
              </div>
            )}

          </div>

          <aside className="lg:sticky lg:top-5 lg:self-start">

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5">
                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-base font-black text-[#172019]">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Review your order before placing it
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                    <ReceiptText size={18} />
                  </div>

                </div>
              </div>

              <div className="px-5 py-5">

                <div className="mb-5 rounded-2xl bg-[#f7faf7] p-3">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#16823b] shadow-sm">
                      <ShoppingBag size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-[#172019]">
                        {cart?.items?.length || 0}{' '}
                        {(cart?.items?.length || 0) === 1
                          ? 'Item'
                          : 'Items'}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Ready to checkout
                      </p>
                    </div>

                  </div>
                </div>

                <div className="space-y-4 text-sm">

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      Item Total
                    </span>

                    <span className="font-bold text-[#172019]">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      Delivery Fee
                    </span>

                    <span
                      className={`font-black ${
                        deliveryFee === 0
                          ? 'text-[#16823b]'
                          : 'text-[#172019]'
                      }`}
                    >
                      {deliveryFee === 0
                        ? 'FREE'
                        : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                </div>

                {deliveryFee > 0 &&
                  freeThreshold > subtotal && (
                    <div className="mt-4 rounded-2xl bg-[#f4f8f4] p-3">
                      <div className="flex gap-2">
                        <Truck
                          size={15}
                          className="mt-0.5 shrink-0 text-[#16823b]"
                        />

                        <p className="text-[10px] font-bold leading-4 text-[#16823b]">
                          Add ₹
                          {(freeThreshold - subtotal).toFixed(0)}
                          {' '}more to get FREE delivery.
                        </p>
                      </div>
                    </div>
                  )}

                {deliveryFee === 0 &&
                  fulfillmentMethod === 'DELIVERY' &&
                  freeThreshold > 0 &&
                  subtotal >= freeThreshold && (
                    <div className="mt-4 rounded-2xl bg-[#f4f8f4] p-3">
                      <div className="flex items-center gap-2">
                        <Check
                          size={15}
                          className="text-[#16823b]"
                        />

                        <p className="text-[10px] font-black text-[#16823b]">
                          You unlocked FREE delivery!
                        </p>
                      </div>
                    </div>
                  )}

                <div className="my-5 border-t border-dashed border-gray-200" />

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Grand Total
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#16823b]">
                      ₹{total.toFixed(2)}
                    </p>
                  </div>

                </div>

                <div className="mt-5 rounded-2xl border border-gray-100">

                  <div className="flex items-center gap-3 border-b border-gray-100 p-3">
                    <ShieldCheck
                      size={17}
                      className="text-[#16823b]"
                    />

                    <div>
                      <p className="text-[10px] font-black text-[#172019]">
                        Safe & Secure Payment
                      </p>

                      <p className="text-[9px] text-gray-400">
                        Your order is protected
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3">
                    <PackageCheck
                      size={17}
                      className="text-[#16823b]"
                    />

                    <div>
                      <p className="text-[10px] font-black text-[#172019]">
                        Quality Guaranteed
                      </p>

                      <p className="text-[9px] text-gray-400">
                        Fresh products delivered
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-xs font-black text-gray-600 transition hover:border-[#16823b]/30 hover:bg-[#f4f8f4] hover:text-[#16823b]"
            >
              <ArrowLeft size={15} />
              Back to Cart
            </button>

          </aside>

        </div>

        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                Grand Total
              </p>

              <p className="mt-0.5 text-lg font-black text-[#172019]">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#16823b] px-6 text-sm font-black text-white shadow-lg shadow-[#16823b]/20 transition hover:bg-[#116d30] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[300px]"
            >
              {placingOrder ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <ChevronRight
                    size={18}
                    strokeWidth={3}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

          </div>
        </div>

      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">

              <div>
                <h3 className="text-lg font-black text-[#172019]">
                  Add New Address
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Enter your delivery details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={17} />
              </button>

            </div>

            <form
              onSubmit={handleAddAddress}
              className="space-y-3 p-5 sm:p-6"
            >

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Address Label
                </label>

                <input
                  name="label"
                  value={address.label}
                  onChange={handleAddressChange}
                  placeholder="Home, Work"
                  className="w-full rounded-xl border border-gray-200 bg-[#f7faf7] px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Address
                </label>

                <input
                  name="line1"
                  value={address.line1}
                  onChange={handleAddressChange}
                  placeholder="House / Flat, Street"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-[#f7faf7] px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:bg-white"
                />
              </div>

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-xl border border-gray-200 bg-[#f7faf7] px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:bg-white"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-gray-500">
                    City
                  </label>

                  <input
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-[#f7faf7] px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-gray-500">
                    State
                  </label>

                  <input
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-[#f7faf7] px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:bg-white"
                  />
                </div>

              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  placeholder="6 digit pincode"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-[#f7faf7] px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3.5 text-xs font-black text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#16823b] py-3.5 text-xs font-black text-white shadow-lg shadow-[#16823b]/20 transition hover:bg-[#116d30]"
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