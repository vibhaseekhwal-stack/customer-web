import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCart,
  getDeliveryFeeInfo,
  getAddresses,
  addAddress,
  placeOrder,
  startOrderPayment,
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
      setLoading(true)
      setError('')

      const [cartResponse, feeResponse, addressResponse] =
        await Promise.all([
          getCart(),
          getDeliveryFeeInfo(),
          getAddresses(),
        ])

      const cartData = cartResponse?.data || cartResponse
      const feeData = feeResponse?.data || feeResponse

      const addressData =
        addressResponse?.data?.addresses ||
        addressResponse?.data ||
        addressResponse?.addresses ||
        addressResponse ||
        []

      const normalizedAddresses = Array.isArray(addressData)
        ? addressData
        : []

      if (!cartData?.items?.length) {
        navigate('/cart')
        return
      }

      setCart(cartData)
      setDeliveryFeeInfo(feeData)
      setAddresses(normalizedAddresses)

      const defaultAddress =
        normalizedAddresses.find((item) => item.isDefault) ||
        normalizedAddresses[0]

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.id || defaultAddress.addressId
        )
        setFulfillmentMethod('DELIVERY')
      } else {
        setFulfillmentMethod('PICKUP')
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load checkout details.'
      )
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
      setError('')

      const payload = {
        label: address.label.trim(),
        line1: address.line1.trim(),
        line2: address.line2.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        ...(addresses.length === 0 ? { isDefault: true } : {}),
      }

      const response = await addAddress(payload)

      const newAddress =
        response?.data?.address ||
        response?.data ||
        response

      const newAddressId =
        newAddress?.id || newAddress?.addressId

      if (!newAddressId) {
        throw new Error('Address could not be saved.')
      }

      setAddresses((current) => [
        ...current,
        newAddress,
      ])

      setSelectedAddressId(newAddressId)
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
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to add address.'
      )
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

      const payload = {
        fulfillmentMethod,
        paymentMethod,
        ...(fulfillmentMethod === 'DELIVERY'
          ? {
              addressId: selectedAddressId,
            }
          : {}),
      }

      const response = await placeOrder(payload)

      const order =
        response?.data?.order ||
        response?.data ||
        response?.order ||
        response

      const orderId =
        order?.id ||
        order?.orderId

      if (!orderId) {
        throw new Error('Order could not be created.')
      }

      if (paymentMethod === 'UPI') {
        const paymentResponse =
          await startOrderPayment(orderId)

        const paymentData =
          paymentResponse?.data ||
          paymentResponse

        const paymentUrl =
          paymentData?.paymentUrl ||
          paymentData?.checkoutUrl ||
          paymentData?.url ||
          paymentData?.redirectUrl

        if (paymentUrl) {
          window.location.href = paymentUrl
          return
        }
      }

      navigate(`/confirmation?orderId=${orderId}`)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to place order.'
      )
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#315d32]/20 border-t-[#315d32]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#8a9287]">
            Loading checkout...
          </p>
        </div>
      </div>
    )
  }

  if (error && !cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-[#e1e7dd] bg-white p-8 text-center shadow-[0_25px_70px_rgba(47,70,39,0.09)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 text-red-500">
            <ShoppingBag size={28} />
          </div>

          <h2 className="text-lg font-black text-[#202a20]">
            Checkout unavailable
          </h2>

          <p className="mt-2 text-sm text-[#8a9287]">
            {error}
          </p>

          <button
            onClick={() => navigate('/cart')}
            className="mt-6 w-full rounded-[18px] bg-[#315d32] py-3.5 text-sm font-black text-white shadow-lg shadow-[#315d32]/20 transition hover:bg-[#274d29]"
          >
            Back to Cart
          </button>
        </div>
      </div>
    )
  }

  const subtotal = Number(
    cart?.subtotal ??
      cart?.subTotal ??
      cart?.grandTotal ??
      0
  )

  const freeThreshold = Number(
    deliveryFeeInfo?.freeThreshold || 0
  )

  const configuredDeliveryFee = Number(
    deliveryFeeInfo?.fee || 0
  )

  const deliveryFee =
    fulfillmentMethod === 'DELIVERY' &&
    freeThreshold > 0 &&
    subtotal < freeThreshold
      ? configuredDeliveryFee
      : fulfillmentMethod === 'DELIVERY' &&
        freeThreshold === 0
        ? configuredDeliveryFee
        : 0

  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-[#f7f8f2] pb-10">
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#969e93]">
            <button
              onClick={() => navigate('/cart')}
              className="transition hover:text-[#315d32]"
            >
              Cart
            </button>

            <ChevronRight size={12} />

            <span className="font-bold text-[#315d32]">
              Checkout
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#202a20] sm:text-3xl">
                Complete Your Order
              </h1>

              <p className="mt-1 text-sm text-[#8a9287]">
                Choose delivery, address and payment method.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-[18px] border border-[#e1e7dd] bg-white px-4 py-3 shadow-sm sm:flex">
              <ShieldCheck
                size={18}
                className="text-[#315d32]"
              />

              <span className="text-[10px] font-black text-[#606960]">
                Secure Checkout
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="rounded-[30px] border border-[#e1e7dd] bg-white p-5 shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef5e7] text-[#315d32]">
                    <Truck size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-[#202a20] sm:text-base">
                      Delivery Options
                    </h2>

                    <p className="mt-0.5 text-[10px] text-[#969e93]">
                      How would you like to receive your order?
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-[#eef5e7] px-3 py-1 text-[9px] font-black uppercase text-[#315d32] sm:block">
                  Step 1
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleFulfillment('DELIVERY')}
                  className={`relative rounded-[20px] border-2 p-4 text-left transition ${
                    fulfillmentMethod === 'DELIVERY'
                      ? 'border-[#315d32] bg-[#eef5e7]'
                      : 'border-[#e1e7dd] bg-white hover:border-[#315d32]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                        fulfillmentMethod === 'DELIVERY'
                          ? 'bg-[#315d32] text-white'
                          : 'bg-[#eef5e7] text-[#315d32]'
                      }`}
                    >
                      <Truck size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#202a20]">
                        Home Delivery
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-[#8a9287]">
                        Get your groceries delivered to your doorstep.
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#315d32]">
                        <Clock3 size={13} />
                        Fast & convenient
                      </div>
                    </div>
                  </div>

                  {fulfillmentMethod === 'DELIVERY' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#315d32] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleFulfillment('PICKUP')}
                  className={`relative rounded-[20px] border-2 p-4 text-left transition ${
                    fulfillmentMethod === 'PICKUP'
                      ? 'border-[#315d32] bg-[#eef5e7]'
                      : 'border-[#e1e7dd] bg-white hover:border-[#315d32]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                        fulfillmentMethod === 'PICKUP'
                          ? 'bg-[#315d32] text-white'
                          : 'bg-[#eef5e7] text-[#315d32]'
                      }`}
                    >
                      <Store size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#202a20]">
                        Store Pickup
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-[#8a9287]">
                        Pick up your order directly from the store.
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#315d32]">
                        <PackageCheck size={13} />
                        Easy pickup
                      </div>
                    </div>
                  </div>

                  {fulfillmentMethod === 'PICKUP' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#315d32] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>
              </div>
            </section>

            {fulfillmentMethod === 'DELIVERY' && (
              <section className="rounded-[30px] border border-[#e1e7dd] bg-white p-5 shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef5e7] text-[#315d32]">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-[#202a20] sm:text-base">
                        Delivery Address
                      </h2>

                      <p className="mt-0.5 text-[10px] text-[#969e93]">
                        Select where you want your order delivered
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-[13px] bg-[#eef5e7] px-3 py-2 text-[10px] font-black text-[#315d32] transition hover:bg-[#315d32] hover:text-white"
                  >
                    <Plus size={14} />
                    Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="w-full rounded-[20px] border border-dashed border-[#315d32]/30 bg-[#f7f8f2] p-7 text-center transition hover:border-[#315d32] hover:bg-[#eef5e7]"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-white text-[#315d32] shadow-sm">
                      <MapPin size={22} />
                    </div>

                    <p className="mt-3 text-sm font-black text-[#202a20]">
                      No saved address
                    </p>

                    <p className="mt-1 text-[11px] text-[#8a9287]">
                      Add your delivery address to continue
                    </p>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((item) => {
                      const itemId =
                        item.id || item.addressId

                      const selected =
                        itemId === selectedAddressId

                      return (
                        <button
                          key={itemId}
                          type="button"
                          onClick={() => selectAddress(itemId)}
                          className={`relative flex w-full items-start gap-3 rounded-[20px] border-2 p-4 text-left transition ${
                            selected
                              ? 'border-[#315d32] bg-[#eef5e7]'
                              : 'border-[#e1e7dd] bg-white hover:border-[#315d32]/30'
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                              selected
                                ? 'bg-[#315d32] text-white'
                                : 'bg-[#eef5e7] text-[#315d32]'
                            }`}
                          >
                            <MapPin size={19} />
                          </div>

                          <div className="min-w-0 flex-1 pr-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-black text-[#202a20]">
                                {item.label || 'Address'}
                              </h3>

                              {item.isDefault && (
                                <span className="rounded-full bg-[#315d32]/10 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-[#315d32]">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-[11px] leading-5 text-[#8a9287]">
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
                                ? 'border-[#315d32] bg-[#315d32] text-white'
                                : 'border-[#d2d9ce] bg-white'
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

            <section className="rounded-[30px] border border-[#e1e7dd] bg-white p-5 shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef5e7] text-[#315d32]">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-[#202a20] sm:text-base">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-[10px] text-[#969e93]">
                      Select your preferred payment option
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full bg-[#eef5e7] px-3 py-1 text-[9px] font-black uppercase text-[#315d32] sm:block">
                  Step 2
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handlePayment('UPI')}
                  className={`relative flex items-center gap-3 rounded-[20px] border-2 p-4 text-left transition ${
                    paymentMethod === 'UPI'
                      ? 'border-[#315d32] bg-[#eef5e7]'
                      : 'border-[#e1e7dd] bg-white hover:border-[#315d32]/30'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                      paymentMethod === 'UPI'
                        ? 'bg-[#315d32] text-white'
                        : 'bg-[#eef5e7] text-[#315d32]'
                    }`}
                  >
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#202a20]">
                      UPI Payment
                    </p>

                    <p className="mt-1 text-[10px] text-[#8a9287]">
                      GPay, PhonePe, Paytm & more
                    </p>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#315d32] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePayment('CASH')}
                  className={`relative flex items-center gap-3 rounded-[20px] border-2 p-4 text-left transition ${
                    paymentMethod === 'CASH'
                      ? 'border-[#315d32] bg-[#eef5e7]'
                      : 'border-[#e1e7dd] bg-white hover:border-[#315d32]/30'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                      paymentMethod === 'CASH'
                        ? 'bg-[#315d32] text-white'
                        : 'bg-[#eef5e7] text-[#315d32]'
                    }`}
                  >
                    <Banknote size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#202a20]">
                      {fulfillmentMethod === 'DELIVERY'
                        ? 'Cash on Delivery'
                        : 'Pay at Pickup'}
                    </p>

                    <p className="mt-1 text-[10px] text-[#8a9287]">
                      Simple & convenient
                    </p>
                  </div>

                  {paymentMethod === 'CASH' && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#315d32] text-white">
                      <Check size={11} />
                    </div>
                  )}
                </button>
              </div>
            </section>

            {error && (
              <div className="flex items-center gap-3 rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                <X size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-[#e1e7dd] bg-white shadow-[0_20px_60px_rgba(47,70,39,0.09)]">
              <div className="bg-[#315d32] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#b8df7d]">
                      Checkout
                    </p>

                    <h2 className="text-lg font-black text-white">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-xs text-white/60">
                      Review your order before placing it
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/10 bg-white/10 text-white">
                    <ReceiptText size={19} />
                  </div>
                </div>
              </div>

              <div className="px-5 py-6">
                <div className="mb-5 rounded-[20px] bg-[#f7f8f2] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-[#315d32] shadow-sm">
                      <ShoppingBag size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-[#202a20]">
                        {cart?.items?.length || 0}{' '}
                        {(cart?.items?.length || 0) === 1
                          ? 'Item'
                          : 'Items'}
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#969e93]">
                        Ready to checkout
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a9287]">
                      Item Total
                    </span>

                    <span className="font-black text-[#202a20]">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8a9287]">
                      Delivery Fee
                    </span>

                    <span
                      className={`font-black ${
                        deliveryFee === 0
                          ? 'text-[#315d32]'
                          : 'text-[#202a20]'
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
                    <div className="mt-4 rounded-[18px] border border-[#dfe9d8] bg-[#eef5e7] p-3.5">
                      <div className="flex gap-2">
                        <Truck
                          size={15}
                          className="mt-0.5 shrink-0 text-[#315d32]"
                        />

                        <p className="text-[10px] font-bold leading-4 text-[#315d32]">
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
                    <div className="mt-4 rounded-[18px] border border-[#dfe9d8] bg-[#eef5e7] p-3.5">
                      <div className="flex items-center gap-2">
                        <Check
                          size={15}
                          className="text-[#315d32]"
                        />

                        <p className="text-[10px] font-black text-[#315d32]">
                          You unlocked FREE delivery!
                        </p>
                      </div>
                    </div>
                  )}

                <div className="my-6 border-t border-dashed border-[#d8dfd4]" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#969e93]">
                      Grand Total
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#315d32]">
                      ₹{total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[18px] border border-[#e1e7dd]">
                  <div className="flex items-center gap-3 border-b border-[#edf0ea] p-3">
                    <ShieldCheck
                      size={17}
                      className="text-[#315d32]"
                    />

                    <div>
                      <p className="text-[10px] font-black text-[#202a20]">
                        Safe & Secure Payment
                      </p>

                      <p className="text-[9px] text-[#969e93]">
                        Your order is protected
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3">
                    <PackageCheck
                      size={17}
                      className="text-[#315d32]"
                    />

                    <div>
                      <p className="text-[10px] font-black text-[#202a20]">
                        Quality Guaranteed
                      </p>

                      <p className="text-[9px] text-[#969e93]">
                        Fresh products delivered
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#dfe6dc] bg-white py-3.5 text-xs font-black text-[#606960] shadow-sm transition hover:border-[#315d32]/30 hover:bg-[#eef5e7] hover:text-[#315d32]"
            >
              <ArrowLeft size={15} />
              Back to Cart
            </button>
          </aside>
        </div>

        <div className="mt-6 rounded-[30px] border border-[#e1e7dd] bg-white p-4 shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:p-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[1.2px] text-[#969e93]">
                Grand Total
              </p>

              <p className="mt-0.5 text-lg font-black text-[#202a20]">
                ₹{total.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#315d32] px-6 text-sm font-black text-white shadow-lg shadow-[#315d32]/20 transition hover:-translate-y-0.5 hover:bg-[#274d29] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[300px]"
            >
              {placingOrder ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {paymentMethod === 'UPI'
                    ? 'Redirecting to Payment...'
                    : 'Placing Order...'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#202a20]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-[#e1e7dd] bg-white shadow-[0_30px_90px_rgba(47,70,39,0.18)]">
            <div className="flex items-center justify-between border-b border-[#edf0ea] px-5 py-5 sm:px-6">
              <div>
                <h3 className="text-lg font-black text-[#202a20]">
                  Add New Address
                </h3>

                <p className="mt-1 text-[10px] text-[#969e93]">
                  Enter your delivery details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#f7f8f2] text-[#606960] transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleAddAddress}
              className="space-y-3 p-5 sm:p-6"
            >
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#606960]">
                  Address Label
                </label>

                <input
                  name="label"
                  value={address.label}
                  onChange={handleAddressChange}
                  placeholder="Home, Work"
                  className="w-full rounded-[14px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#606960]">
                  Address
                </label>

                <input
                  name="line1"
                  value={address.line1}
                  onChange={handleAddressChange}
                  placeholder="House / Flat, Street"
                  required
                  className="w-full rounded-[14px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
                />
              </div>

              <input
                name="line2"
                value={address.line2}
                onChange={handleAddressChange}
                placeholder="Landmark (optional)"
                className="w-full rounded-[14px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#606960]">
                    City
                  </label>

                  <input
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    required
                    className="w-full rounded-[14px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#606960]">
                    State
                  </label>

                  <input
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    required
                    className="w-full rounded-[14px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-[#606960]">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  placeholder="6 digit pincode"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="w-full rounded-[14px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-[14px] border border-[#dfe6dc] py-3.5 text-xs font-black text-[#606960] transition hover:bg-[#f7f8f2]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-[14px] bg-[#315d32] py-3.5 text-xs font-black text-white shadow-lg shadow-[#315d32]/20 transition hover:bg-[#274d29]"
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

