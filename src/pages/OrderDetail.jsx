
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CreditCard,
  MapPin,
  PackageCheck,
  X,
  XCircle,
  WalletCards,
  RefreshCw,
  ShoppingBag,
  ReceiptText,
  Ban,
  Clock3
} from 'lucide-react'
import {
  cancelOrder,
  getOrder,
  startOrderPayment
} from '../services/api'

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting Payment',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

const TIMELINE = [
  'CONFIRMED',
  'PACKED',
  'READY',
  'COMPLETED'
]

const CANCELLABLE_STATUSES = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PACKED'
]

function OrderDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (!orderId) {
      navigate('/orders')
      return
    }

    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getOrder(orderId)
      setOrder(data)
    } catch (err) {
      setError(err?.message || 'Unable to load order details.')
    } finally {
      setLoading(false)
    }
  }

  const getOrderId = orderData =>
    orderData?.id ||
    orderData?.orderId ||
    orderData?._id

  const handleCancel = async () => {
    const id = getOrderId(order)

    if (!id) return

    try {
      setCancelling(true)
      setError('')

      const updatedOrder = await cancelOrder(
        id,
        cancelReason.trim() || 'Cancelled by customer'
      )

      setOrder(updatedOrder?.data || updatedOrder)
      setShowCancelModal(false)
      setCancelReason('')
    } catch (err) {
      setError(err?.message || 'Unable to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  const normalizePaymentResponse = data => {
    const response = data?.data || data

    return {
      keyId:
        response?.keyId ||
        response?.key ||
        response?.razorpayKeyId,

      providerOrderId:
        response?.providerOrderId ||
        response?.razorpayOrderId ||
        response?.orderId,

      amount:
        response?.amount ??
        response?.payableAmount ??
        response?.totalAmount ??
        response?.total,

      currency:
        response?.currency || 'INR',

      paymentUrl:
        response?.paymentUrl ||
        response?.checkoutUrl ||
        response?.url ||
        response?.redirectUrl
    }
  }

  const handlePayment = async () => {
    const id = getOrderId(order)

    if (!id || paying) return

    try {
      setPaying(true)
      setError('')

      const rawPaymentData =
        await startOrderPayment(id)

      const payment =
        normalizePaymentResponse(rawPaymentData)

      if (
        payment.paymentUrl &&
        !payment.keyId &&
        !payment.providerOrderId
      ) {
        window.location.href =
          payment.paymentUrl
        return
      }

      if (!window.Razorpay) {
        setError(
          'Razorpay could not be loaded. Please refresh the page and try again.'
        )
        setPaying(false)
        return
      }

      if (
        !payment.keyId ||
        !payment.providerOrderId
      ) {
        setError(
          'Payment information is incomplete. Please try again.'
        )
        setPaying(false)
        return
      }

      const numericAmount =
        Number(payment.amount)

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        setError(
          'Invalid payment amount received from server.'
        )
        setPaying(false)
        return
      }

      const razorpay =
        new window.Razorpay({
          key: payment.keyId,
          order_id:
            payment.providerOrderId,
          amount: Math.round(
            numericAmount * 100
          ),
          currency:
            payment.currency,
          name: 'CD Shopping Hub',
          description: `Order #${order?.orderNumber || id}`,

          handler: async () => {
            setError('')
            setPaying(false)
            await loadOrder()
          },

          modal: {
            ondismiss: () => {
              setPaying(false)
            }
          },

          theme: {
            color: '#16823b'
          }
        })

      razorpay.on(
        'payment.failed',
        response => {
          setPaying(false)
          setError(
            response?.error?.description ||
            'Payment failed. Please try again.'
          )
        }
      )

      razorpay.open()
    } catch (err) {
      setPaying(false)
      setError(
        err?.message ||
        'Unable to start payment.'
      )
    }
  }

  const formatDate = date => {
    if (!date) return 'Date unavailable'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return String(date)
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusClasses = status => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-red-50 text-red-600 border-red-200'

      case 'CONFIRMED':
      case 'PACKED':
        return 'bg-amber-50 text-amber-700 border-amber-200'

      case 'READY':
        return 'bg-blue-50 text-blue-700 border-blue-200'

      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200'

      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-200'

      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircle2

      case 'CANCELLED':
        return XCircle

      case 'PENDING_PAYMENT':
        return WalletCards

      case 'READY':
        return PackageCheck

      default:
        return Clock3
    }
  }

  const getAddress = useMemo(() => {
    if (
      order?.fulfillmentMethod !==
      'DELIVERY'
    ) {
      return ''
    }

    return [
      order?.deliveryLabel,
      order?.deliveryLine1,
      order?.deliveryLine2,
      order?.deliveryCity,
      order?.deliveryState,
      order?.deliveryPincode
    ]
      .filter(Boolean)
      .join(', ')
  }, [order])

  const getPaymentText = useMemo(() => {
    if (order?.paymentMethod === 'UPI') {
      return 'UPI'
    }

    if (
      order?.fulfillmentMethod ===
      'DELIVERY'
    ) {
      return 'Cash on Delivery'
    }

    return 'Cash at Pickup'
  }, [order])

  const items = Array.isArray(order?.items)
    ? order.items
    : []

  const subtotal = Number(
    order?.subtotal || 0
  )

  const deliveryFee = Number(
    order?.deliveryFee || 0
  )

  const total = Number(
    order?.total ??
    order?.grandTotal ??
    subtotal + deliveryFee
  )

  const isPendingPayment =
    order?.status ===
      'PENDING_PAYMENT' &&
    order?.paymentMethod === 'UPI'

  const canCancel =
    CANCELLABLE_STATUSES.includes(
      order?.status
    )

  const renderTimeline = () => {
    if (order.status === 'CANCELLED') {
      return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-bold text-red-700">
                Order Cancelled
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {order.cancelReason ||
                  'This order was cancelled by the customer.'}
              </p>
            </div>
          </div>
        </div>
      )
    }

    const steps =
      order.paymentMethod === 'UPI'
        ? [
            'PENDING_PAYMENT',
            ...TIMELINE
          ]
        : TIMELINE

    const currentIndex =
      steps.indexOf(order.status)

    return (
      <div className="relative space-y-5">
        {steps.map((step, index) => {
          const done =
            currentIndex >= index

          const isCurrent =
            step === order.status

          const Icon =
            done
              ? CheckCircle2
              : Circle

          return (
            <div
              key={step}
              className="relative flex items-center gap-3"
            >
              {index <
                steps.length - 1 && (
                <span
                  className={`absolute left-[9px] top-6 h-5 w-px ${
                    currentIndex > index
                      ? 'bg-[#16823b]'
                      : 'bg-gray-200'
                  }`}
                />
              )}

              <Icon
                size={20}
                className={`relative z-10 shrink-0 ${
                  done
                    ? 'text-[#16823b]'
                    : 'text-gray-300'
                }`}
              />

              <span
                className={`text-sm ${
                  isCurrent
                    ? 'font-bold text-[#172019]'
                    : done
                      ? 'font-medium text-gray-700'
                      : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[step] ||
                  step}
              </span>

              {isCurrent && (
                <span className="ml-auto rounded-full bg-[#f4f8f4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#16823b]">
                  Current
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-10 w-32 animate-pulse rounded-xl bg-gray-200" />

          <div className="animate-pulse rounded-2xl border border-[#dce8de] bg-white p-6">
            <div className="h-7 w-52 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-64 rounded bg-gray-100" />

            <div className="mt-8 h-28 rounded-xl bg-gray-100" />

            <div className="mt-5 h-40 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf7] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#172019]">
            Unable to load order
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate('/orders')
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16823b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#116d30]"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  if (!order) return null

  const orderNumber =
    order.orderNumber ||
    order.id ||
    order.orderId

  const StatusIcon =
    getStatusIcon(order.status)

  return (
    <div className="min-h-screen bg-[#f7faf7] pb-10">
      <header className="sticky top-0 z-40 border-b border-[#dce8de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() =>
              navigate('/orders')
            }
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-[#f4f8f4] hover:text-[#16823b]"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <p className="text-xs font-medium text-gray-500">
              My Orders
            </p>

            <h1 className="text-lg font-bold text-[#172019]">
              Order Details
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={loadOrder}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-red-700 shadow-sm"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16823b] text-white shadow-sm">
                <ReceiptText size={21} />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#172019]">
                  Order #{orderNumber}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${getStatusClasses(
              order.status
            )}`}
          >
            <StatusIcon size={15} />
            {STATUS_LABELS[
              order.status
            ] || order.status}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {isPendingPayment && (
              <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                <div className="bg-red-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                      <WalletCards size={20} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-red-700">
                        Payment Pending
                      </h3>

                      <p className="mt-0.5 text-xs text-red-600">
                        Complete your UPI payment to confirm this order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <button
                    onClick={
                      handlePayment
                    }
                    disabled={paying}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16823b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#116d30] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CreditCard
                      size={17}
                      className={
                        paying
                          ? 'animate-pulse'
                          : ''
                      }
                    />

                    {paying
                      ? 'Processing...'
                      : 'Pay Now'}
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-[#dce8de] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <PackageCheck size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#172019]">
                    Order Status
                  </h3>

                  <p className="text-xs text-gray-500">
                    Track your order progress
                  </p>
                </div>
              </div>

              {renderTimeline()}
            </section>

            <section className="rounded-2xl border border-[#dce8de] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#172019]">
                    Order Items
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {items.length} item
                    {items.length !== 1
                      ? 's'
                      : ''} in this order
                  </p>
                </div>

                <ShoppingBag
                  size={20}
                  className="text-[#16823b]"
                />
              </div>

              <div className="space-y-3">
                {items.map(
                  (item, index) => {
                    const quantity =
                      Number(
                        item?.quantity || 1
                      )

                    const price =
                      Number(
                        item?.price ||
                        item?.unitPrice ||
                        item?.sellingPrice ||
                        0
                      )

                    const lineTotal =
                      Number(
                        item?.lineTotal ??
                        price * quantity
                      )

                    const name =
                      item?.productName ||
                      item?.name ||
                      item?.product?.name ||
                      'Product'

                    const image =
                      item?.image ||
                      item?.imageUrl ||
                      item?.productImage ||
                      item?.product?.image ||
                      ''

                    return (
                      <div
                        key={
                          item?.id ||
                          index
                        }
                        className="flex items-center gap-3 rounded-xl bg-[#f7faf7] p-3"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag
                              size={23}
                              className="text-[#16823b]"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-[#172019]">
                            {name}
                          </h4>

                          <p className="mt-1 text-xs text-gray-500">
                            {item?.weight
                              ? `${item.weight}${item.unit || ''} × `
                              : ''}
                            Qty: {quantity}
                          </p>

                          {price > 0 && (
                            <p className="mt-1 text-xs text-gray-400">
                              ₹{price.toFixed(2)} each
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-[#172019]">
                            ₹
                            {lineTotal.toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[#dce8de] bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <ReceiptText size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#172019]">
                    Payment Summary
                  </h3>

                  <p className="text-xs text-gray-500">
                    Order amount breakdown
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Items
                  </span>

                  <span className="font-medium text-[#172019]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Delivery Fee
                  </span>

                  <span className="font-medium text-[#172019]">
                    {deliveryFee > 0
                      ? `₹${deliveryFee.toFixed(2)}`
                      : 'FREE'}
                  </span>
                </div>

                <div className="my-3 h-px bg-[#dce8de]" />

                <div className="flex items-end justify-between">
                  <span className="text-base font-bold text-[#172019]">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-[#16823b]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#dce8de] bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <MapPin size={20} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#172019]">
                    Delivery & Payment
                  </h3>

                  <p className="text-xs text-gray-500">
                    Order fulfillment details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-[#f7faf7] p-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[#16823b]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-gray-500">
                        Fulfillment
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#172019]">
                        {order.fulfillmentMethod ===
                        'DELIVERY'
                          ? 'Home Delivery'
                          : 'Store Pickup'}
                      </p>

                      {getAddress && (
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {getAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f7faf7] p-3">
                  <div className="flex items-center gap-3">
                    <CreditCard
                      size={18}
                      className="shrink-0 text-[#16823b]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-gray-500">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-bold capitalize text-[#172019]">
                        {getPaymentText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {canCancel && (
              <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Ban size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#172019]">
                      Cancel Order
                    </h3>

                    <p className="text-xs text-gray-500">
                      You can cancel this order at this stage.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowCancelModal(
                      true
                    )
                  }
                  className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  Cancel Order
                </button>
              </section>
            )}
          </div>
        </div>
      </main>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#172019]">
                  Cancel Order
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Order #{orderNumber}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCancelModal(
                    false
                  )
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Are you sure you want to cancel this order?
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  This action may not be reversible.
                </p>
              </div>

              <textarea
                value={cancelReason}
                onChange={e =>
                  setCancelReason(
                    e.target.value
                  )
                }
                placeholder="Enter cancellation reason"
                rows={4}
                className="mt-4 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:ring-2 focus:ring-[#16823b]/10"
              />

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => {
                    setShowCancelModal(
                      false
                    )
                    setCancelReason('')
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Keep Order
                </button>

                <button
                  onClick={
                    handleCancel
                  }
                  disabled={cancelling}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling
                    ? 'Cancelling...'
                    : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail

