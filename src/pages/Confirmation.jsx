import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getOrder,
  startOrderPayment,
} from '../services/api'

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting Payment',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function Confirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [paying, setPaying] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')
  const [paymentError, setPaymentError] = useState(false)
  const [paymentButtonVisible, setPaymentButtonVisible] =
    useState(true)

  useEffect(() => {
    if (!orderId) {
      navigate('/orders', { replace: true })
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
      setError(
        err.message || 'Failed to load order'
      )
    } finally {
      setLoading(false)
    }
  }

  async function startPayment() {
    if (!order || paying) {
      return
    }

    setPaying(true)
    setPaymentError(false)
    setPaymentMessage('Starting payment...')

    let payment

    try {
      payment = await startOrderPayment(order.id)
    } catch (err) {
      setPaymentError(true)
      setPaymentMessage(
        'Online payment isn’t available yet. Your order is saved — please contact the store to arrange payment, or place a new order with cash instead.'
      )
      setPaymentButtonVisible(false)
      setPaying(false)
      return
    }

    if (!window.Razorpay) {
      setPaymentError(true)
      setPaymentMessage(
        'Razorpay could not be loaded. Please refresh the page and try again.'
      )
      setPaying(false)
      return
    }

    const razorpay = new window.Razorpay({
      key: payment.keyId,
      order_id: payment.providerOrderId,
      amount: Math.round(
        Number(payment.amount) * 100
      ),
      currency: payment.currency,
      name: 'CD Shopping Hub',
      description: `Order #${order.orderNumber}`,

      handler: () => {
        pollForConfirmation(order.id)
      },

      modal: {
        ondismiss: () => {
          setPaying(false)
          setPaymentMessage('')
        },
      },
    })

    razorpay.open()
  }

  async function pollForConfirmation(id) {
    setPaymentMessage(
      'Confirming your payment...'
    )
    setPaymentButtonVisible(false)

    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      )

      try {
        const updatedOrder = await getOrder(id)

        if (
          updatedOrder.status !==
          'PENDING_PAYMENT'
        ) {
          setOrder(updatedOrder)
          setPaymentMessage('')
          setPaying(false)
          setPaymentButtonVisible(true)
          return
        }
      } catch {
        // Continue polling
      }
    }

    setPaymentMessage(
      'Payment received — confirmation is taking longer than usual. Check Order History shortly, or contact the store.'
    )

    setPaying(false)
  }

  function formatAddress(order) {
    return [
      order.deliveryLine1,
      order.deliveryLine2,
      order.deliveryCity,
      order.deliveryState,
      order.deliveryPincode,
    ]
      .filter(Boolean)
      .join(', ')
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl bg-[#f7f8f4] px-4 py-10">
        <div className="py-20 text-center text-gray-500">
          Loading...
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            {error || 'Order not found'}
          </p>

          <button
            onClick={() => navigate('/orders')}
            className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
          >
            View Orders
          </button>
        </div>
      </main>
    )
  }

  const needsPayment =
    order.paymentMethod === 'UPI' &&
    order.status === 'PENDING_PAYMENT'

  const statusLabel =
    STATUS_LABELS[order.status] ||
    order.status

  const fulfillmentMethod =
    order.fulfillmentMethod === 'DELIVERY'
      ? 'Home Delivery'
      : 'Store Pickup'

  const paymentMethod =
    order.paymentMethod === 'UPI'
      ? 'Payment: UPI'
      : order.fulfillmentMethod === 'DELIVERY'
        ? 'Payment: Cash on Delivery'
        : 'Payment: Cash at Pickup'

  return (
    <main className="min-h-screen bg-[#f7f8f4] pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6">

        {/* Status */}
        <div className="flex flex-col items-center py-6 text-center">
          <span
            className={`material-symbols-outlined text-[64px] ${
              needsPayment
                ? 'text-red-600'
                : 'text-green-700'
            }`}
          >
            {needsPayment
              ? 'schedule'
              : 'check_circle'}
          </span>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {needsPayment
              ? 'Almost There'
              : 'Order Placed!'}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Order #{order.orderNumber} ·{' '}
            {statusLabel}
          </p>
        </div>

        {/* Payment */}
        {needsPayment && (
          <div className="mb-6 space-y-3 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            <p>
              {paymentMessage ||
                'This order still needs to be paid online to be confirmed.'}
            </p>

            {paymentButtonVisible && (
              <button
                onClick={startPayment}
                disabled={paying}
                className="h-11 w-full rounded-lg bg-green-700 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying
                  ? 'Starting payment...'
                  : 'Pay Now'}
              </button>
            )}
          </div>
        )}

        {/* Items */}
        <section className="mb-6 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-3 text-xl font-bold text-gray-900">
            Items
          </h2>

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
                  ₹
                  {Number(
                    item.lineTotal
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Fulfillment */}
        <section className="mb-6 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-3 text-xl font-bold text-gray-900">
            Fulfillment
          </h2>

          <p className="text-sm text-gray-900">
            {fulfillmentMethod}
          </p>

          {order.fulfillmentMethod ===
            'DELIVERY' && (
            <p className="mt-1 text-sm text-gray-500">
              {formatAddress(order)}
            </p>
          )}

          <p className="mt-1 text-sm text-gray-500">
            {paymentMethod}
          </p>
        </section>

        {/* Summary */}
        <section className="mb-8 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Items</span>
            <span>
              ₹
              {Number(
                order.subtotal
              ).toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>Delivery Fee</span>

            <span>
              {Number(order.deliveryFee) > 0
                ? `₹${Number(
                    order.deliveryFee
                  ).toFixed(2)}`
                : 'FREE'}
            </span>
          </div>

          <div className="my-3 h-px bg-gray-200" />

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              Total
            </span>

            <span className="text-2xl font-bold text-green-700">
              ₹
              {Number(
                order.total
              ).toFixed(2)}
            </span>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate(
                `/order-detail?orderId=${order.id}`
              )
            }
            className="flex-1 rounded-lg border border-green-700 py-3 font-semibold text-green-700"
          >
            View Order
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex-1 rounded-lg bg-green-700 py-3 font-semibold text-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  )
}

export default Confirmation