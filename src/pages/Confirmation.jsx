
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getOrder,
  startOrderPayment,
} from '../services/api'
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  ReceiptText,
  AlertCircle,
} from 'lucide-react'

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
      setError(err.message || 'Failed to load order')
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
      amount: Math.round(Number(payment.amount) * 100),
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
    setPaymentMessage('Confirming your payment...')
    setPaymentButtonVisible(false)

    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      )

      try {
        const updatedOrder = await getOrder(id)

        if (updatedOrder.status !== 'PENDING_PAYMENT') {
          setOrder(updatedOrder)
          setPaymentMessage('')
          setPaying(false)
          setPaymentButtonVisible(true)
          return
        }
      } catch {
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#315d32]/20 border-t-[#315d32]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a9287]">
            Loading order...
          </p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-md rounded-[24px] border border-[#e1e7dd] bg-white p-8 text-center shadow-[0_20px_60px_rgba(47,70,39,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#202a20]">
            Order not found
          </h2>

          <p className="mt-2 text-sm text-[#8a9287]">
            {error || 'We could not find this order.'}
          </p>

          <button
            onClick={() => navigate('/orders')}
            className="mt-6 w-full rounded-[12px] bg-[#315d32] py-3.5 text-sm font-black text-white transition hover:bg-[#274d29]"
          >
            View Orders
          </button>
        </div>
      </div>
    )
  }

  const needsPayment =
    order.paymentMethod === 'UPI' &&
    order.status === 'PENDING_PAYMENT'

  const statusLabel =
    STATUS_LABELS[order.status] || order.status

  const fulfillmentMethod =
    order.fulfillmentMethod === 'DELIVERY'
      ? 'Home Delivery'
      : 'Store Pickup'

  const paymentMethod =
    order.paymentMethod === 'UPI'
      ? 'UPI'
      : order.fulfillmentMethod === 'DELIVERY'
        ? 'Cash on Delivery'
        : 'Cash at Pickup'

  const subtotal = Number(order.subtotal || 0)
  const deliveryFee = Number(order.deliveryFee || 0)
  const total = Number(order.total || 0)

  return (
    <div className="min-h-screen bg-[#f7f8f2]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs">
          <button
            onClick={() => navigate('/orders')}
            className="font-semibold text-[#6f786d] transition hover:text-[#315d32]"
          >
            Your Orders
          </button>

          <ChevronRight
            size={14}
            className="text-[#a7afa3]"
          />

          <span className="font-bold text-[#315d32]">
            Order Confirmation
          </span>
        </div>

        <section
          className={`overflow-hidden rounded-[22px] border bg-white shadow-[0_12px_35px_rgba(47,70,39,0.06)] ${
            needsPayment
              ? 'border-[#f1d6d6]'
              : 'border-[#dfe7db]'
          }`}
        >
          <div
            className={`px-5 py-7 sm:px-8 ${
              needsPayment
                ? 'bg-[#fff7f7]'
                : 'bg-[#f4f9f0]'
            }`}
          >
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
                  needsPayment
                    ? 'bg-[#fff0f0] text-[#d14343]'
                    : 'bg-[#e4f2dc] text-[#315d32]'
                }`}
              >
                {needsPayment ? (
                  <Clock3 size={34} strokeWidth={1.8} />
                ) : (
                  <CheckCircle2
                    size={38}
                    strokeWidth={1.8}
                  />
                )}
              </div>

              <div className="mt-4 sm:ml-5 sm:mt-0">
                <h1 className="text-2xl font-black tracking-tight text-[#202a20] sm:text-3xl">
                  {needsPayment
                    ? 'Almost there!'
                    : 'Thank you for your order!'}
                </h1>

                <p className="mt-1 text-sm text-[#687166]">
                  {needsPayment
                    ? 'Your order has been created and is waiting for payment.'
                    : 'Your order has been successfully placed.'}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#315d32] shadow-sm">
                    Order #{order.orderNumber}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#687166] shadow-sm">
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {needsPayment && (
            <div className="border-t border-[#f1dede] bg-white px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-4 rounded-[16px] border border-[#f0dddd] bg-[#fff8f8] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffecec] text-[#d14343]">
                    <CreditCard size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#202a20]">
                      Payment required
                    </p>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-[#7d706f]">
                      {paymentMessage ||
                        'Complete your online payment to confirm this order.'}
                    </p>
                  </div>
                </div>

                {paymentButtonVisible && (
                  <button
                    onClick={startPayment}
                    disabled={paying}
                    className="w-full rounded-[11px] bg-[#315d32] px-7 py-3 text-sm font-black text-white shadow-md shadow-[#315d32]/15 transition hover:bg-[#274d29] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {paying
                      ? 'Starting payment...'
                      : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[20px] border border-[#e1e7dd] bg-white shadow-[0_10px_30px_rgba(47,70,39,0.045)]">
              <div className="border-b border-[#edf0ea] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-black text-[#202a20]">
                  Order Details
                </h2>

                <p className="mt-1 text-xs text-[#8a9287]">
                  Items included in your order
                </p>
              </div>

              <div className="divide-y divide-[#edf0ea]">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 px-5 py-5 sm:px-6"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-[#f4f7f1] text-[#315d32]">
                      <ShoppingBag size={25} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <div>
                          <h3 className="text-sm font-black text-[#202a20]">
                            {item.productName}
                          </h3>

                          <p className="mt-1 text-xs text-[#8a9287]">
                            {item.weight}
                            {item.unit} × {item.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-black text-[#202a20]">
                          ₹
                          {Number(
                            item.lineTotal
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#315d32]">
                        <CheckCircle2 size={13} />
                        Order item confirmed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[20px] border border-[#e1e7dd] bg-white shadow-[0_10px_30px_rgba(47,70,39,0.045)]">
              <div className="border-b border-[#edf0ea] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-black text-[#202a20]">
                  Delivery & Payment
                </h2>
              </div>

              <div className="grid grid-cols-1 divide-y divide-[#edf0ea] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="flex gap-3 px-5 py-5 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32]">
                    {order.fulfillmentMethod ===
                    'DELIVERY' ? (
                      <Truck size={19} />
                    ) : (
                      <PackageCheck size={19} />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#969e93]">
                      Fulfillment
                    </p>

                    <p className="mt-1 text-sm font-black text-[#202a20]">
                      {fulfillmentMethod}
                    </p>

                    {order.fulfillmentMethod ===
                      'DELIVERY' && (
                      <p className="mt-1 text-xs leading-5 text-[#7e877c]">
                        {formatAddress(order)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 px-5 py-5 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32]">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#969e93]">
                      Payment Method
                    </p>

                    <p className="mt-1 text-sm font-black text-[#202a20]">
                      {paymentMethod}
                    </p>

                    <p className="mt-1 text-xs text-[#7e877c]">
                      {needsPayment
                        ? 'Payment pending'
                        : 'Payment confirmed'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  navigate(
                    `/order-detail?orderId=${order.id}`
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-[#315d32] bg-white py-3.5 text-sm font-black text-[#315d32] transition hover:bg-[#eef5e7]"
              >
                View Order Details
                <ChevronRight size={17} />
              </button>

              <button
                onClick={() => navigate('/orders')}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#315d32] py-3.5 text-sm font-black text-white shadow-md shadow-[#315d32]/15 transition hover:bg-[#274d29]"
              >
                View All Orders
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="overflow-hidden rounded-[20px] border border-[#e1e7dd] bg-white shadow-[0_15px_40px_rgba(47,70,39,0.07)]">
              <div className="border-b border-[#edf0ea] px-5 py-4">
                <div className="flex items-center gap-2">
                  <ReceiptText
                    size={18}
                    className="text-[#315d32]"
                  />

                  <h2 className="text-base font-black text-[#202a20]">
                    Order Summary
                  </h2>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-[14px] bg-[#f7f8f2] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8a9287]">
                      Order Number
                    </span>

                    <span className="text-xs font-black text-[#202a20]">
                      #{order.orderNumber}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#8a9287]">
                      Status
                    </span>

                    <span className="rounded-full bg-[#e8f2e3] px-2.5 py-1 text-[9px] font-black uppercase text-[#315d32]">
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="my-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7e877c]">
                      Item Total
                    </span>

                    <span className="font-bold text-[#202a20]">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7e877c]">
                      Delivery Fee
                    </span>

                    <span
                      className={`font-bold ${
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

                <div className="border-t border-dashed border-[#dce3d8] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#202a20]">
                      Total
                    </span>

                    <span className="text-2xl font-black text-[#315d32]">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-[13px] border border-[#e5ebe1] p-3">
                    <ShieldCheck
                      size={18}
                      className="shrink-0 text-[#315d32]"
                    />

                    <div>
                      <p className="text-[10px] font-black text-[#202a20]">
                        Secure Order
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#929a8f]">
                        Your order information is protected
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-[13px] border border-[#e5ebe1] p-3">
                    <PackageCheck
                      size={18}
                      className="shrink-0 text-[#315d32]"
                    />

                    <div>
                      <p className="text-[10px] font-black text-[#202a20]">
                        Order Tracking
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#929a8f]">
                        Track your order anytime
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/order-detail?orderId=${order.id}`
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#315d32] py-3 text-xs font-black text-[#315d32] transition hover:bg-[#eef5e7]"
                >
                  Track Order
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#dfe6dc] bg-white py-3.5 text-xs font-black text-[#606960] shadow-sm transition hover:border-[#315d32]/30 hover:bg-[#eef5e7] hover:text-[#315d32]"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </button>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Confirmation

