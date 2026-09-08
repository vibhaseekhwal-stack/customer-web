import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CreditCard,
  MapPin,
  PackageCheck,
  XCircle
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

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      setCancelling(true)
      setError('')

      const updatedOrder = await cancelOrder(
        order.id || order.orderId,
        'Cancelled by customer'
      )

      setOrder(updatedOrder)
    } catch (err) {
      setError(err?.message || 'Unable to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  const handlePayment = async () => {
    const id = order?.id || order?.orderId

    if (!id) return

    try {
      setPaying(true)
      setError('')

      const paymentData = await startOrderPayment(id)

      if (paymentData?.paymentUrl) {
        window.location.href = paymentData.paymentUrl
        return
      }

      if (paymentData?.url) {
        window.location.href = paymentData.url
        return
      }

      if (paymentData?.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl
        return
      }

      await loadOrder()
    } catch (err) {
      setError(err?.message || 'Unable to start payment.')
    } finally {
      setPaying(false)
    }
  }

  const formatDate = date => {
    if (!date) return 'Date unavailable'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return String(date)
    }

    return parsed.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusClasses = status => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-red-100 text-red-700'
      case 'CONFIRMED':
      case 'PACKED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'READY':
        return 'bg-orange-100 text-orange-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getAddress = () => {
    if (order?.fulfillmentMethod !== 'DELIVERY') {
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
  }

  const getPaymentText = () => {
    if (order?.paymentMethod === 'UPI') {
      return 'UPI'
    }

    if (order?.fulfillmentMethod === 'DELIVERY') {
      return 'Cash on Delivery'
    }

    return 'Cash at Pickup'
  }

  const renderTimeline = () => {
    if (order.status === 'CANCELLED') {
      return (
        <div className="flex items-center gap-3 text-red-600">
          <XCircle size={21} />
          <span className="text-sm">
            This order was cancelled
            {order.cancelReason
              ? `: ${order.cancelReason}`
              : '.'}
          </span>
        </div>
      )
    }

    const steps =
      order.paymentMethod === 'UPI'
        ? ['PENDING_PAYMENT', ...TIMELINE]
        : TIMELINE

    const currentIndex = steps.indexOf(order.status)

    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const done = currentIndex >= index
          const isCurrent = step === order.status

          return (
            <div
              key={step}
              className="flex items-center gap-3"
            >
              {done ? (
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-green-700"
                />
              ) : (
                <Circle
                  size={20}
                  className="shrink-0 text-gray-300"
                />
              )}

              <span
                className={`text-sm ${
                  isCurrent
                    ? 'font-bold text-gray-900'
                    : done
                      ? 'text-gray-700'
                      : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[step] || step}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
        <div className="text-center">
          <PackageCheck
            size={32}
            className="mx-auto animate-pulse text-green-700"
          />
          <p className="mt-3 text-sm text-gray-500">
            Loading order...
          </p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">
            {error}
          </p>

          <button
            onClick={() => navigate('/orders')}
            className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const address = getAddress()
  const paymentText = getPaymentText()
  const orderNumber =
    order.orderNumber ||
    order.id ||
    order.orderId

  const isPendingPayment =
    order.status === 'PENDING_PAYMENT' &&
    order.paymentMethod === 'UPI'

  const canCancel =
    CANCELLABLE_STATUSES.includes(order.status)

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-8">
      <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
        <button
          onClick={() => navigate('/orders')}
          className="-ml-2 flex h-12 w-12 items-center justify-center text-gray-700"
        >
          <ArrowLeft size={21} />
        </button>

        <h1 className="font-display text-xl font-bold text-green-700">
          Order Details
        </h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Order #{orderNumber}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${getStatusClasses(
              order.status
            )}`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </section>

        {isPendingPayment && (
          <section className="rounded-xl border border-red-200 bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <CreditCard
                size={22}
                className="text-red-600"
              />

              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Payment Pending
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Complete your UPI payment to confirm this order.
                </p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={paying}
              className="mt-4 w-full rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying ? 'Starting Payment...' : 'Pay Now'}
            </button>
          </section>
        )}

        <section className="rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          {renderTimeline()}
        </section>

        <section className="space-y-4 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-gray-500">
            Items
          </h3>

          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div
                key={item?.id || index}
                className="flex justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {item?.productName || item?.name || 'Product'}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {item?.weight
                      ? `${item.weight}${item.unit || ''} × `
                      : ''}
                    {item?.quantity || 1}
                  </p>
                </div>

                <span className="shrink-0 font-medium text-gray-900">
                  ₹{Number(item?.lineTotal || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-[#bdcabb]" />

          <div className="flex justify-between text-sm text-gray-500">
            <span>Items</span>
            <span>
              ₹{Number(order.subtotal || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery Fee</span>
            <span>
              {Number(order.deliveryFee || 0) > 0
                ? `₹${Number(order.deliveryFee).toFixed(2)}`
                : 'FREE'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-xl font-bold text-gray-900">
              Total
            </span>

            <span className="font-display text-2xl font-bold text-green-700">
              ₹{Number(order.total || 0).toFixed(2)}
            </span>
          </div>
        </section>

        <section className="space-y-3 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-gray-500">
            Fulfillment
          </h3>

          <div className="flex items-start gap-3">
            <MapPin
              size={20}
              className="mt-0.5 shrink-0 text-green-700"
            />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {order.fulfillmentMethod === 'DELIVERY'
                  ? 'Home Delivery'
                  : 'Store Pickup'}
              </p>

              {address && (
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {address}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard
              size={20}
              className="shrink-0 text-green-700"
            />

            <div>
              <p className="text-xs font-semibold text-gray-500">
                Payment Method
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {paymentText}
              </p>
            </div>
          </div>
        </section>

        {canCancel && (
          <section className="rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full rounded-lg border border-red-500 py-3 font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling
                ? 'Cancelling...'
                : 'Cancel Order'}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default OrderDetail