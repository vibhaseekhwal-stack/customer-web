import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cancelOrder, getOrder } from '../services/api'

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting Payment',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const HAPPY_PATH = [
  'CONFIRMED',
  'PACKED',
  'READY',
  'COMPLETED',
]

const CUSTOMER_CANCELLABLE_STATUSES = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PACKED',
]

function OrderDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) {
      navigate('/orders')
      return
    }

    loadOrder()
  }, [orderId])

  async function loadOrder() {
    try {
      setLoading(true)
      setError('')

      const data = await getOrder(orderId)
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    const confirmed = window.confirm('Cancel this order?')

    if (!confirmed) return

    try {
      setCancelling(true)

      const updatedOrder = await cancelOrder(order.id)

      setOrder(updatedOrder)
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(false)
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function getStatusClasses(status) {
    if (status === 'PENDING_PAYMENT') {
      return 'bg-red-100 text-red-700'
    }

    if (
      status === 'CONFIRMED' ||
      status === 'PACKED'
    ) {
      return 'bg-green-100 text-green-700'
    }

    if (status === 'READY') {
      return 'bg-orange-100 text-orange-700'
    }

    return 'bg-gray-100 text-gray-600'
  }

  function renderTimeline() {
    if (order.status === 'CANCELLED') {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <span className="material-symbols-outlined">
            cancel
          </span>

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
        ? ['PENDING_PAYMENT', ...HAPPY_PATH]
        : HAPPY_PATH

    const currentIndex = steps.indexOf(order.status)

    return (
      <div className="space-y-3">
        {steps.map((step, index) => {
          const done = index <= currentIndex

          return (
            <div
              key={step}
              className="flex items-center gap-2"
            >
              <span
                className={`material-symbols-outlined ${
                  done
                    ? 'text-green-700'
                    : 'text-gray-400'
                }`}
              >
                {done
                  ? 'check_circle'
                  : 'radio_button_unchecked'}
              </span>

              <span
                className={`text-sm ${
                  done
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[step]}
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
        <p className="text-gray-500">
          Loading order...
        </p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">
            {error || 'Order not found'}
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

  const address =
    order.fulfillmentMethod === 'DELIVERY'
      ? [
          order.deliveryLabel,
          order.deliveryLine1,
          order.deliveryLine2,
          order.deliveryCity,
          order.deliveryState,
          order.deliveryPincode,
        ]
          .filter(Boolean)
          .join(', ')
      : ''

  const paymentText =
    order.paymentMethod === 'UPI'
      ? 'Payment: UPI'
      : order.fulfillmentMethod === 'DELIVERY'
        ? 'Payment: Cash on Delivery'
        : 'Payment: Cash at Pickup'

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-8">
      <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
        <button
          onClick={() => navigate('/orders')}
          className="-ml-2 flex h-12 w-12 items-center justify-center"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <h1 className="font-display text-xl font-bold text-green-700">
          Order Details
        </h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Order #{order.orderNumber}
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
            {STATUS_LABELS[order.status] ||
              order.status}
          </span>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          {renderTimeline()}
        </section>

        <section className="space-y-3 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-gray-500">
            Items
          </h3>

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="text-gray-900">
                  {item.productName}{' '}
                  <span className="text-gray-500">
                    ({item.weight}
                    {item.unit} × {item.quantity})
                  </span>
                </span>

                <span className="shrink-0">
                  ₹{Number(item.lineTotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-[#bdcabb]" />

          <div className="flex justify-between text-sm text-gray-500">
            <span>Items</span>
            <span>
              ₹{Number(order.subtotal).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery Fee</span>
            <span>
              {Number(order.deliveryFee) > 0
                ? `₹${Number(
                    order.deliveryFee
                  ).toFixed(2)}`
                : 'FREE'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-xl font-bold text-gray-900">
              Total
            </span>

            <span className="font-display text-2xl font-bold text-green-700">
              ₹{Number(order.total).toFixed(2)}
            </span>
          </div>
        </section>

        <section className="space-y-2 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-gray-500">
            Fulfillment
          </h3>

          <p className="text-sm text-gray-900">
            {order.fulfillmentMethod === 'DELIVERY'
              ? 'Home Delivery'
              : 'Store Pickup'}
          </p>

          {address && (
            <p className="text-sm leading-6 text-gray-500">
              {address}
            </p>
          )}

          <p className="text-sm text-gray-500">
            {paymentText}
          </p>
        </section>

        {CUSTOMER_CANCELLABLE_STATUSES.includes(
          order.status
        ) && (
          <section className="rounded-xl bg-white p-4">
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