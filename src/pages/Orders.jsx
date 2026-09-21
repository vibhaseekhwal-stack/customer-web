import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  PackageCheck,
  Truck,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  ReceiptText,
  MapPin,
  CreditCard,
  RefreshCw,
  ShoppingBasket,
  X,
  Ban,
  WalletCards
} from 'lucide-react'
import {
  getOrders,
  getOrder,
  getCart,
  addToCart,
  cancelOrder,
  startOrderPayment
} from '../services/api'

function Orders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [paying, setPaying] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [cancelReason, setCancelReason] = useState('')
  const [cancelOrderId, setCancelOrderId] = useState(null)

  const getOrderId = order =>
    order?.id ||
    order?.orderId ||
    order?._id

  const getOrderStatus = order =>
    String(
      order?.status ||
      order?.orderStatus ||
      order?.order_state ||
      ''
    ).toUpperCase()

  const getOrderItems = order =>
    Array.isArray(order?.items)
      ? order.items
      : Array.isArray(order?.orderItems)
        ? order.orderItems
        : Array.isArray(order?.products)
          ? order.products
          : []

  const getItemName = item =>
    item?.productName ||
    item?.name ||
    item?.product?.name ||
    item?.variantName ||
    item?.variant?.name ||
    'Product'

  const getItemImage = item =>
    item?.image ||
    item?.imageUrl ||
    item?.productImage ||
    item?.product?.image ||
    item?.product?.imageUrl ||
    item?.variant?.image ||
    ''

  const getItemQuantity = item =>
    Number(item?.quantity ?? item?.qty ?? 1)

  const getItemPrice = item =>
    Number(
      item?.price ??
      item?.unitPrice ??
      item?.sellingPrice ??
      item?.product?.price ??
      item?.variant?.price ??
      0
    )

  const getOrderTotal = order => {
    const value =
      order?.grandTotal ??
      order?.totalAmount ??
      order?.total ??
      order?.amount ??
      order?.finalAmount ??
      order?.payableAmount

    if (value !== undefined && value !== null) {
      return Number(value)
    }

    return getOrderItems(order).reduce(
      (sum, item) =>
        sum + getItemPrice(item) * getItemQuantity(item),
      0
    )
  }

  const getOrderDate = order =>
    order?.createdAt ||
    order?.orderDate ||
    order?.created_at ||
    order?.date

  const getAddress = order =>
    order?.address ||
    order?.deliveryAddress ||
    order?.shippingAddress

  const getPaymentMethod = order =>
    order?.paymentMethod ||
    order?.payment?.method

  const normalizeOrders = data => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.content)) return data.data.content
    if (Array.isArray(data?.content)) return data.content
    if (Array.isArray(data?.orders)) return data.orders
    if (Array.isArray(data?.data?.orders)) return data.data.orders
    return []
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const [ordersData, cartData] = await Promise.all([
        getOrders(),
        getCart()
      ])

      setOrders(normalizeOrders(ordersData))
      setCart(cartData)
    } catch (err) {
      setError(
        err?.message ||
        'Unable to load your orders.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrderDetails = async orderId => {
    try {
      setLoadingDetails(true)
      setError('')

      const data = await getOrder(orderId)
      setSelectedOrder(data)
    } catch (err) {
      setError(
        err?.message ||
        'Unable to load order details.'
      )
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewDetails = async order => {
    const orderId = getOrderId(order)

    if (!orderId) return

    await loadOrderDetails(orderId)
  }

  const handleReorder = async order => {
    const orderId = getOrderId(order)
    const items = getOrderItems(order)

    if (!items.length) {
      setError('No items available for reorder.')
      return
    }

    try {
      setReordering(orderId)
      setError('')

      for (const item of items) {
        const variantId =
          item?.variantId ||
          item?.variant?.id ||
          item?.productVariantId

        if (variantId) {
          await addToCart(
            variantId,
            getItemQuantity(item)
          )
        }
      }

      const updatedCart = await getCart()
      setCart(updatedCart)

      navigate('/cart')
    } catch (err) {
      setError(
        err?.message ||
        'Unable to reorder this order.'
      )
    } finally {
      setReordering(null)
    }
  }

  const openCancelModal = orderId => {
    setCancelOrderId(orderId)
    setCancelReason('')
  }

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return

    try {
      setCancelling(cancelOrderId)
      setError('')

      await cancelOrder(
        cancelOrderId,
        cancelReason.trim() || 'Cancelled by customer'
      )

      setCancelOrderId(null)
      setCancelReason('')

      await loadOrders()
    } catch (err) {
      setError(
        err?.message ||
        'Unable to cancel this order.'
      )
    } finally {
      setCancelling(null)
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

  const wait = ms =>
    new Promise(resolve => setTimeout(resolve, ms))

  const pollPaymentStatus = async orderId => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await wait(2000)

      try {
        const updatedOrder = await getOrder(orderId)
        const status = getOrderStatus(updatedOrder)

        if (
          status &&
          ![
            'PENDING_PAYMENT',
            'PAYMENT_PENDING'
          ].includes(status)
        ) {
          setOrders(currentOrders =>
            currentOrders.map(order =>
              getOrderId(order) === orderId
                ? updatedOrder
                : order
            )
          )

          setPaying(null)

          return true
        }
      } catch {
        continue
      }
    }

    return false
  }

  const handlePayment = async orderId => {
    if (!orderId || paying) return

    try {
      setPaying(orderId)
      setError('')

      const rawPaymentData =
        await startOrderPayment(orderId)

      const payment =
        normalizePaymentResponse(rawPaymentData)

      if (
        payment.paymentUrl &&
        !payment.keyId &&
        !payment.providerOrderId
      ) {
        window.location.href = payment.paymentUrl
        return
      }

      if (!window.Razorpay) {
        setError(
          'Razorpay could not be loaded. Please refresh the page and try again.'
        )
        setPaying(null)
        return
      }

      if (
        !payment.keyId ||
        !payment.providerOrderId
      ) {
        setError(
          'Payment information is incomplete. Please try again.'
        )
        setPaying(null)
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
        setPaying(null)
        return
      }

      const razorpay = new window.Razorpay({
        key: payment.keyId,
        order_id: payment.providerOrderId,
        amount: Math.round(
          numericAmount * 100
        ),
        currency: payment.currency,
        name: 'CD Shopping Hub',
        description: `Order #${orderId}`,

        handler: async () => {
          setError('')

          const confirmed =
            await pollPaymentStatus(orderId)

          if (!confirmed) {
            setPaying(null)
            setError(
              'Payment received, but order confirmation is taking longer than usual. Please refresh your orders shortly.'
            )
          } else {
            await loadOrders()
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(null)
          }
        },

        theme: {
          color: '#315d32'
        }
      })

      razorpay.on(
        'payment.failed',
        response => {
          setPaying(null)
          setError(
            response?.error?.description ||
            'Payment failed. Please try again.'
          )
        }
      )

      razorpay.open()
    } catch (err) {
      setPaying(null)
      setError(
        err?.message ||
        'Unable to start payment.'
      )
    }
  }

  const getStatusConfig = status => {
    if (
      [
        'DELIVERED',
        'COMPLETED',
        'SUCCESS',
        'FULFILLED'
      ].includes(status)
    ) {
      return {
        label: 'Delivered',
        icon: CheckCircle2,
        className:
          'bg-[#eef5e7] text-[#315d32] border-[#dfe9d8]'
      }
    }

    if (
      [
        'CANCELLED',
        'CANCELED',
        'REJECTED'
      ].includes(status)
    ) {
      return {
        label: 'Cancelled',
        icon: XCircle,
        className:
          'bg-red-50 text-red-600 border-red-100'
      }
    }

    if (
      [
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DISPATCHED'
      ].includes(status)
    ) {
      return {
        label: 'On the way',
        icon: Truck,
        className:
          'bg-[#eef5e7] text-[#315d32] border-[#dfe9d8]'
      }
    }

    if (
      [
        'CONFIRMED',
        'ACCEPTED',
        'PROCESSING',
        'PREPARING'
      ].includes(status)
    ) {
      return {
        label: 'Processing',
        icon: PackageCheck,
        className:
          'bg-[#eef5e7] text-[#315d32] border-[#dfe9d8]'
      }
    }

    if (
      [
        'PENDING_PAYMENT',
        'PAYMENT_PENDING'
      ].includes(status)
    ) {
      return {
        label: 'Awaiting Payment',
        icon: WalletCards,
        className:
          'bg-[#fff5f4] text-red-600 border-red-100'
      }
    }

    return {
      label: status
        ? status
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char =>
              char.toUpperCase()
            )
        : 'Pending',
      icon: Clock3,
      className:
        'bg-[#f7f8f2] text-[#606960] border-[#e1e7dd]'
    }
  }

  const completedStatuses = [
    'DELIVERED',
    'COMPLETED',
    'SUCCESS',
    'FULFILLED',
    'CANCELLED',
    'CANCELED',
    'REJECTED'
  ]

  const activeOrders = useMemo(
    () =>
      orders.filter(
        order =>
          !completedStatuses.includes(
            getOrderStatus(order)
          )
      ),
    [orders]
  )

  const pastOrders = useMemo(
    () =>
      orders.filter(order =>
        completedStatuses.includes(
          getOrderStatus(order)
        )
      ),
    [orders]
  )

  const visibleOrders =
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'past'
        ? pastOrders
        : orders

  const cartCount = Array.isArray(cart?.items)
    ? cart.items.reduce(
        (sum, item) =>
          sum + Number(item?.quantity || 0),
        0
      )
    : 0

  const formatDate = date => {
    if (!date) return 'Date unavailable'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return String(date)
    }

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = date => {
    if (!date) return ''

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return ''
    }

    return parsed.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8f2] px-3 py-4 pb-8 sm:px-5 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6">
            <div className="h-9 w-44 animate-pulse rounded-[14px] bg-[#e1e7dd]" />
            <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded-full bg-[#e8ede5]" />
          </div>

          <div className="space-y-4 sm:space-y-5">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="animate-pulse rounded-[24px] border border-[#e1e7dd] bg-white p-4 shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:rounded-[30px] sm:p-5"
              >
                <div className="h-5 w-48 max-w-full rounded-full bg-[#e1e7dd]" />
                <div className="mt-5 h-20 rounded-[18px] bg-[#f7f8f2]" />
                <div className="mt-4 h-10 rounded-[14px] bg-[#f7f8f2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f8f2] px-3 py-4 pb-8 sm:px-5 sm:py-6 lg:px-8 lg:py-7">
      <div className="mx-auto w-full max-w-6xl">

        <div className="mb-5 sm:mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#315d32] text-white shadow-lg shadow-[#315d32]/20 sm:h-12 sm:w-12 sm:rounded-[16px]">
                <ShoppingBag size={21} />
              </div>

              <div className="min-w-0">
                <p className="mb-0.5 text-[8px] font-black uppercase tracking-[1.4px] text-[#969e93] sm:text-[9px]">
                
                </p>

                <h1 className="truncate text-2xl font-black tracking-tight text-[#202a20] sm:text-3xl">
                  My Orders
                </h1>

                <p className="mt-0.5 text-xs text-[#8a9287] sm:text-sm">
                  Track and manage your orders
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[17px] border border-[#dfe6dc] bg-white px-4 py-3 text-xs font-black text-[#202a20] shadow-sm transition hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32] sm:w-auto"
            >
              <ShoppingBasket size={18} />
              Cart

              {cartCount > 0 && (
                <span className="rounded-full bg-[#315d32] px-2 py-0.5 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-words">
              {error}
            </span>

            <button
              onClick={loadOrders}
              className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-[13px] bg-white px-3 py-2 font-black text-red-600 shadow-sm transition hover:bg-red-50"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-3 gap-1 rounded-[20px] border border-[#e1e7dd] bg-white p-1.5 shadow-sm sm:mb-6 sm:rounded-[22px]">
          {[
            ['all', 'All Orders', orders.length],
            ['active', 'Active', activeOrders.length],
            ['past', 'Past', pastOrders.length]
          ].map(([tab, label, count]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-w-0 rounded-[14px] px-1.5 py-3 text-[10px] font-black transition sm:rounded-[16px] sm:px-3 sm:text-sm ${
                activeTab === tab
                  ? 'bg-[#315d32] text-white shadow-lg shadow-[#315d32]/15'
                  : 'text-[#606960] hover:bg-[#eef5e7] hover:text-[#315d32]'
              }`}
            >
              <span className="block truncate sm:inline">
                {label}
              </span>

              <span className="ml-1 opacity-70">
                {count}
              </span>
            </button>
          ))}
        </div>

        {visibleOrders.length === 0 ? (
          <div className="rounded-[24px] border border-[#e1e7dd] bg-white px-5 py-12 text-center shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:rounded-[30px] sm:px-6 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#eef5e7] text-[#315d32]">
              <ReceiptText size={29} />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#202a20]">
              No orders found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a9287]">
              {activeTab === 'active'
                ? 'You do not have any active orders right now.'
                : activeTab === 'past'
                  ? 'Your completed or cancelled orders will appear here.'
                  : 'Once you place an order, your order details will appear here.'}
            </p>

            <button
              onClick={() => navigate('/home')}
              className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-[17px] bg-[#315d32] px-5 py-3.5 text-xs font-black text-white shadow-lg shadow-[#315d32]/20 transition hover:bg-[#274d29]"
            >
              Start Shopping
              <ChevronRight size={17} />
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {visibleOrders.map((order, index) => {
              const orderId = getOrderId(order)
              const status = getOrderStatus(order)
              const statusConfig =
                getStatusConfig(status)
              const StatusIcon = statusConfig.icon
              const items = getOrderItems(order)
              const total = getOrderTotal(order)
              const date = getOrderDate(order)
              const address = getAddress(order)
              const paymentMethod =
                getPaymentMethod(order)

              const canCancel =
                orderId &&
                !completedStatuses.includes(status)

              const canPay =
                orderId &&
                [
                  'PENDING_PAYMENT',
                  'PAYMENT_PENDING'
                ].includes(status)

              return (
                <div
                  key={
                    orderId ||
                    `order-${index}`
                  }
                  className="w-full overflow-hidden rounded-[24px] border border-[#e1e7dd] bg-white shadow-[0_18px_55px_rgba(47,70,39,0.06)] transition hover:shadow-[0_24px_65px_rgba(47,70,39,0.10)] sm:rounded-[30px]"
                >
                  <div className="border-b border-[#edf0ea] px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="max-w-full break-all text-sm font-black text-[#202a20] sm:text-base">
                            {order?.orderNumber
                              ? `Order #${order.orderNumber}`
                              : orderId
                                ? `Order #${orderId}`
                                : 'Order'}
                          </h2>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide sm:text-[9px] ${statusConfig.className}`}
                          >
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-semibold text-[#969e93] sm:text-[10px]">
                          <span>{formatDate(date)}</span>

                          {formatTime(date) && (
                            <>
                              <span>•</span>
                              <span>
                                {formatTime(date)}
                              </span>
                            </>
                          )}

                          <span>•</span>

                          <span>
                            {items.length} item
                            {items.length !== 1
                              ? 's'
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="w-full rounded-[16px] bg-[#f7f8f2] px-4 py-2.5 sm:w-auto sm:min-w-[150px] sm:text-right">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-[#969e93]">
                          Total Amount
                        </p>

                        <p className="mt-0.5 text-xl font-black text-[#315d32]">
                          ₹{total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-4 sm:px-6 sm:py-5">
                    <div className="space-y-3">
                      {items
                        .slice(0, 4)
                        .map((item, itemIndex) => {
                          const image =
                            getItemImage(item)
                          const quantity =
                            getItemQuantity(item)
                          const price =
                            getItemPrice(item)

                          return (
                            <div
                              key={
                                item?.id ||
                                item?.cartItemId ||
                                itemIndex
                              }
                              className="flex min-w-0 items-center gap-2.5 rounded-[18px] border border-[#edf0ea] bg-[#f7f8f2] p-2.5 sm:gap-3 sm:rounded-[20px] sm:p-3"
                            >
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#e1e7dd] bg-white sm:h-16 sm:w-16 sm:rounded-[16px]">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={getItemName(
                                      item
                                    )}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag
                                    size={22}
                                    className="text-[#315d32]"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 break-words text-xs font-black leading-5 text-[#202a20] sm:text-sm">
                                  {getItemName(item)}
                                </h3>

                                <p className="mt-0.5 text-[9px] font-semibold text-[#969e93] sm:mt-1 sm:text-[10px]">
                                  Qty: {quantity}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-xs font-black text-[#202a20] sm:text-sm">
                                  ₹{(
                                    price *
                                    quantity
                                  ).toFixed(2)}
                                </p>

                                {price > 0 && (
                                  <p className="mt-0.5 text-[8px] font-semibold text-[#969e93] sm:text-[9px]">
                                    ₹{price.toFixed(2)} each
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}

                      {items.length > 4 && (
                        <p className="px-1 text-[10px] font-bold text-[#8a9287]">
                          +{items.length - 4} more item
                          {items.length - 4 !== 1
                            ? 's'
                            : ''}
                        </p>
                      )}
                    </div>

                    {(address || paymentMethod) && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {address && (
                          <div className="min-w-0 rounded-[18px] border border-[#e1e7dd] bg-white p-3.5 sm:rounded-[20px] sm:p-4">
                            <div className="flex items-start gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32]">
                                <MapPin size={16} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-wide text-[#969e93]">
                                  Delivery Address
                                </p>

                                <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#202a20]">
                                  {typeof address ===
                                  'string'
                                    ? address
                                    : address?.addressLine ||
                                      address?.address ||
                                      address?.fullAddress ||
                                      address?.city ||
                                      'Address available'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod && (
                          <div className="rounded-[18px] border border-[#e1e7dd] bg-white p-3.5 sm:rounded-[20px] sm:p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32]">
                                <CreditCard size={16} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-wide text-[#969e93]">
                                  Payment Method
                                </p>

                                <p className="mt-1 break-words text-xs font-black capitalize text-[#202a20]">
                                  {String(
                                    paymentMethod
                                  ).replace(
                                    /_/g,
                                    ' '
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                      {orderId && (
                        <button
                          onClick={() =>
                            handleViewDetails(order)
                          }
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[15px] border border-[#dfe6dc] bg-white px-4 py-3 text-[11px] font-black text-[#606960] transition hover:border-[#315d32] hover:bg-[#eef5e7] hover:text-[#315d32] sm:w-auto"
                        >
                          View Details
                          <ChevronRight size={16} />
                        </button>
                      )}

                      {canPay && (
                        <button
                          onClick={() =>
                            handlePayment(orderId)
                          }
                          disabled={
                            paying === orderId
                          }
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[15px] bg-[#315d32] px-4 py-3 text-[11px] font-black text-white shadow-lg shadow-[#315d32]/15 transition hover:bg-[#274d29] disabled:opacity-60 sm:w-auto"
                        >
                          <WalletCards
                            size={16}
                            className={
                              paying === orderId
                                ? 'animate-spin'
                                : ''
                            }
                          />

                          {paying === orderId
                            ? 'Processing...'
                            : 'Pay Now'}
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() =>
                            openCancelModal(
                              orderId
                            )
                          }
                          disabled={
                            cancelling ===
                            orderId
                          }
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[15px] border border-red-100 bg-white px-4 py-3 text-[11px] font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60 sm:w-auto"
                        >
                          <Ban size={16} />
                          Cancel Order
                        </button>
                      )}

                      {items.length > 0 && (
                        <button
                          onClick={() =>
                            handleReorder(order)
                          }
                          disabled={
                            reordering ===
                            orderId
                          }
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[15px] bg-[#315d32] px-4 py-3 text-[11px] font-black text-white shadow-lg shadow-[#315d32]/15 transition hover:bg-[#274d29] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          <RotateCcw
                            size={16}
                            className={
                              reordering ===
                              orderId
                                ? 'animate-spin'
                                : ''
                            }
                          />

                          {reordering ===
                          orderId
                            ? 'Adding...'
                            : 'Reorder'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-5 rounded-[24px] border border-[#e1e7dd] bg-white p-4 shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:mt-6 sm:rounded-[30px] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#eef5e7] text-[#315d32]">
                <PackageCheck size={20} />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#202a20]">
                  Your orders are safe with us
                </h3>

                <p className="mt-0.5 text-[10px] font-semibold text-[#969e93]">
                  You can view complete order details anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#202a20]/45 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#e1e7dd] bg-white shadow-[0_30px_90px_rgba(47,70,39,0.18)] sm:max-h-[90vh] sm:rounded-[30px]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#edf0ea] bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[1.2px] text-[#969e93]">
                  Order Details
                </p>

                <h2 className="mt-1 break-all text-base font-black text-[#202a20] sm:text-lg">
                  Order #{getOrderId(selectedOrder)}
                </h2>

                <p className="text-[10px] text-[#8a9287]">
                  Complete order details
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#f7f8f2] text-[#606960] transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {loadingDetails ? (
                <div className="py-10 text-center">
                  <RefreshCw
                    size={24}
                    className="mx-auto animate-spin text-[#315d32]"
                  />
                </div>
              ) : (
                <>
                  <div className="rounded-[18px] border border-[#dfe9d8] bg-[#eef5e7] p-4">
                    <p className="text-[9px] font-black uppercase tracking-wide text-[#969e93]">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-black text-[#315d32]">
                      {getStatusConfig(
                        getOrderStatus(
                          selectedOrder
                        )
                      ).label}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {getOrderItems(
                      selectedOrder
                    ).map((item, index) => (
                      <div
                        key={
                          item?.id || index
                        }
                        className="flex min-w-0 items-center gap-2.5 rounded-[18px] border border-[#e1e7dd] bg-[#f7f8f2] p-3 sm:gap-3 sm:rounded-[20px]"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#e1e7dd] bg-white">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(
                                item
                              )}
                              alt={getItemName(
                                item
                              )}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag
                              size={22}
                              className="text-[#315d32]"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 break-words text-xs font-black leading-5 text-[#202a20] sm:text-sm">
                            {getItemName(item)}
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-[#969e93]">
                            Qty: {getItemQuantity(item)}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs font-black text-[#202a20] sm:text-sm">
                          ₹{(
                            getItemPrice(item) *
                            getItemQuantity(item)
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[20px] border border-[#e1e7dd] bg-white p-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#8a9287]">
                        Total
                      </span>

                      <span className="font-black text-[#315d32]">
                        ₹{getOrderTotal(
                          selectedOrder
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {cancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#202a20]/45 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[#e1e7dd] bg-white shadow-[0_30px_90px_rgba(47,70,39,0.18)] sm:rounded-[30px]">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf0ea] px-4 py-4 sm:px-5 sm:py-5">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[1.2px] text-[#969e93]">
                  Order Action
                </p>

                <h2 className="mt-1 text-base font-black text-[#202a20] sm:text-lg">
                  Cancel Order
                </h2>
              </div>

              <button
                onClick={() =>
                  setCancelOrderId(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#f7f8f2] text-[#606960] transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <div className="rounded-[18px] bg-red-50 p-4">
                <p className="text-xs font-bold leading-5 text-red-600">
                  Are you sure you want to cancel this order?
                </p>
              </div>

              <textarea
                value={cancelReason}
                onChange={e =>
                  setCancelReason(e.target.value)
                }
                placeholder="Enter cancellation reason"
                rows={4}
                className="mt-4 w-full resize-none rounded-[16px] border border-[#dfe6dc] bg-[#f7f8f2] px-4 py-3 text-sm text-[#202a20] outline-none transition placeholder:text-[#969e93] focus:border-[#315d32] focus:bg-white focus:ring-2 focus:ring-[#315d32]/10"
              />

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() =>
                    setCancelOrderId(null)
                  }
                  className="min-h-[44px] rounded-[15px] border border-[#dfe6dc] bg-white px-4 py-3 text-xs font-black text-[#606960] transition hover:bg-[#f7f8f2]"
                >
                  Keep Order
                </button>

                <button
                  onClick={handleCancelOrder}
                  disabled={
                    cancelling === cancelOrderId
                  }
                  className="min-h-[44px] rounded-[15px] bg-red-500 px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-500/15 transition hover:bg-red-600 disabled:opacity-60"
                >
                  {cancelling === cancelOrderId
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

export default Orders

