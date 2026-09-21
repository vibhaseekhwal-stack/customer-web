
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
        <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div className="min-w-0">
              <p className="text-sm font-bold text-red-700">
                Order Cancelled
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-red-600">
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
              className="relative flex min-w-0 items-center gap-3"
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
                className={`min-w-0 break-words text-sm ${
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
                <span className="ml-auto shrink-0 rounded-full bg-[#f4f8f4] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#16823b] sm:px-2.5 sm:text-[10px]">
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
      <div className="min-h-screen overflow-x-hidden bg-[#f7faf7] px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-5 h-10 w-32 animate-pulse rounded-xl bg-gray-200" />

          <div className="animate-pulse rounded-2xl border border-[#dce8de] bg-white p-4 sm:p-6">
            <div className="h-7 w-52 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-64 max-w-full rounded bg-gray-100" />
            <div className="mt-7 h-28 rounded-xl bg-gray-100" />
            <div className="mt-5 h-40 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#f7faf7] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm sm:p-7">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#172019]">
            Unable to load order
          </h2>

          <p className="mt-2 break-words text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate('/orders')
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16823b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#116d30] sm:w-auto"
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7faf7] pb-8 sm:pb-10">
      <header className="sticky top-0 z-40 border-b border-[#dce8de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center px-3 py-2 sm:min-h-16 sm:px-5 lg:px-8">
          <button
            onClick={() =>
              navigate('/orders')
            }
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-[#f4f8f4] hover:text-[#16823b] sm:mr-3 sm:h-10 sm:w-10"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
              My Orders
            </p>

            <h1 className="truncate text-base font-bold text-[#172019] sm:text-lg">
              Order Details
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        {error && (
          <div className="mb-4 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <span className="min-w-0 break-words">
              {error}
            </span>

            <button
              onClick={loadOrder}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-red-700 shadow-sm sm:w-auto"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16823b] text-white shadow-sm sm:h-11 sm:w-11">
                <ReceiptText size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="break-all text-xl font-bold tracking-tight text-[#172019] sm:text-2xl">
                  Order #{orderNumber}
                </h2>

                <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit max-w-full items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold sm:text-xs ${getStatusClasses(
              order.status
            )}`}
          >
            <StatusIcon size={14} />
            <span className="break-words">
              {STATUS_LABELS[
                order.status
              ] || order.status}
            </span>
          </span>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4 sm:space-y-5">
            {isPendingPayment && (
              <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                <div className="bg-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm sm:h-10 sm:w-10">
                      <WalletCards size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-red-700">
                        Payment Pending
                      </h3>

                      <p className="mt-0.5 break-words text-[10px] leading-5 text-red-600 sm:text-xs">
                        Complete your UPI payment to confirm this order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
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

            <section className="min-w-0 rounded-2xl border border-[#dce8de] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b] sm:h-10 sm:w-10">
                  <PackageCheck size={19} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#172019] sm:text-base">
                    Order Status
                  </h3>

                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    Track your order progress
                  </p>
                </div>
              </div>

              {renderTimeline()}
            </section>

            <section className="min-w-0 rounded-2xl border border-[#dce8de] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#172019] sm:text-base">
                    Order Items
                  </h3>

                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                    {items.length} item
                    {items.length !== 1
                      ? 's'
                      : ''} in this order
                  </p>
                </div>

                <ShoppingBag
                  size={19}
                  className="shrink-0 text-[#16823b]"
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
                        className="flex min-w-0 items-center gap-2.5 rounded-xl bg-[#f7faf7] p-2.5 sm:gap-3 sm:p-3"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white sm:h-16 sm:w-16">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <ShoppingBag
                              size={21}
                              className="text-[#16823b]"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-xs font-bold leading-5 text-[#172019] sm:text-sm">
                            {name}
                          </h4>

                          <p className="mt-0.5 break-words text-[10px] text-gray-500 sm:mt-1 sm:text-xs">
                            {item?.weight
                              ? `${item.weight}${item.unit || ''} × `
                              : ''}
                            Qty: {quantity}
                          </p>

                          {price > 0 && (
                            <p className="mt-0.5 text-[10px] text-gray-400 sm:mt-1 sm:text-xs">
                              ₹{price.toFixed(2)} each
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-[#172019] sm:text-sm">
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

          <div className="min-w-0 space-y-4 sm:space-y-5">
            <section className="min-w-0 rounded-2xl border border-[#dce8de] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b] sm:h-10 sm:w-10">
                  <ReceiptText size={19} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#172019] sm:text-base">
                    Payment Summary
                  </h3>

                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    Order amount breakdown
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Items
                  </span>

                  <span className="shrink-0 font-medium text-[#172019]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Delivery Fee
                  </span>

                  <span className="shrink-0 font-medium text-[#172019]">
                    {deliveryFee > 0
                      ? `₹${deliveryFee.toFixed(2)}`
                      : 'FREE'}
                  </span>
                </div>

                <div className="my-3 h-px bg-[#dce8de]" />

                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm font-bold text-[#172019] sm:text-base">
                    Total
                  </span>

                  <span className="shrink-0 text-xl font-bold text-[#16823b] sm:text-2xl">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-[#dce8de] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b] sm:h-10 sm:w-10">
                  <MapPin size={19} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#172019] sm:text-base">
                    Delivery & Payment
                  </h3>

                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    Order fulfillment details
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-[#f7faf7] p-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[#16823b]"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-500 sm:text-xs">
                        Fulfillment
                      </p>

                      <p className="mt-1 break-words text-xs font-bold text-[#172019] sm:text-sm">
                        {order.fulfillmentMethod ===
                        'DELIVERY'
                          ? 'Home Delivery'
                          : 'Store Pickup'}
                      </p>

                      {getAddress && (
                        <p className="mt-1 break-words text-[10px] leading-5 text-gray-500 sm:text-xs">
                          {getAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f7faf7] p-3">
                  <div className="flex items-start gap-3">
                    <CreditCard
                      size={18}
                      className="mt-0.5 shrink-0 text-[#16823b]"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-500 sm:text-xs">
                        Payment Method
                      </p>

                      <p className="mt-1 break-words text-xs font-bold capitalize text-[#172019] sm:text-sm">
                        {getPaymentText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {canCancel && (
              <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 sm:h-10 sm:w-10">
                    <Ban size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#172019]">
                      Cancel Order
                    </h3>

                    <p className="mt-0.5 break-words text-[10px] leading-5 text-gray-500 sm:text-xs">
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#172019] sm:text-lg">
                  Cancel Order
                </h2>

                <p className="mt-0.5 break-all text-[10px] text-gray-500 sm:text-xs">
                  Order #{orderNumber}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCancelModal(
                    false
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 sm:p-4">
                <p className="break-words text-sm font-semibold text-red-700">
                  Are you sure you want to cancel this order?
                </p>

                <p className="mt-1 break-words text-[10px] leading-5 text-red-600 sm:text-xs">
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
                className="mt-4 w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-[#172019] outline-none transition placeholder:text-gray-400 focus:border-[#16823b] focus:ring-2 focus:ring-[#16823b]/10 sm:px-4"
              />

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={() => {
                    setShowCancelModal(
                      false
                    )
                    setCancelReason('')
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Keep Order
                </button>

                <button
                  onClick={
                    handleCancel
                  }
                  disabled={cancelling}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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

