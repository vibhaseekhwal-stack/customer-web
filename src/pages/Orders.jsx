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
  ArrowLeft,
  ReceiptText,
  MapPin,
  CreditCard,
  RefreshCw,
  ShoppingBasket
} from 'lucide-react'
import { getOrders, addToCart, getCart } from '../services/api'

function Orders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const [ordersData, cartData] = await Promise.all([
        getOrders(),
        getCart()
      ])

      const orderList =
        Array.isArray(ordersData)
          ? ordersData
          : Array.isArray(ordersData?.data)
            ? ordersData.data
            : Array.isArray(ordersData?.data?.content)
              ? ordersData.data.content
              : Array.isArray(ordersData?.content)
                ? ordersData.content
                : Array.isArray(ordersData?.orders)
                  ? ordersData.orders
                  : Array.isArray(ordersData?.data?.orders)
                    ? ordersData.data.orders
                    : []

      setOrders(orderList)
      setCart(cartData)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
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

  const getOrderId = (order) =>
    order?.id ||
    order?.orderId ||
    order?._id

  const getOrderStatus = (order) =>
    String(
      order?.status ||
      order?.orderStatus ||
      order?.order_state ||
      ''
    ).toUpperCase()

  const getOrderItems = (order) =>
    Array.isArray(order?.items)
      ? order.items
      : Array.isArray(order?.orderItems)
        ? order.orderItems
        : Array.isArray(order?.products)
          ? order.products
          : []

  const getItemName = (item) =>
    item?.productName ||
    item?.name ||
    item?.product?.name ||
    item?.variantName ||
    item?.variant?.name ||
    'Product'

  const getItemImage = (item) =>
    item?.image ||
    item?.imageUrl ||
    item?.productImage ||
    item?.product?.image ||
    item?.product?.imageUrl ||
    item?.variant?.image ||
    ''

  const getItemQuantity = (item) =>
    Number(
      item?.quantity ||
      item?.qty ||
      1
    )

  const getItemPrice = (item) =>
    Number(
      item?.price ||
      item?.unitPrice ||
      item?.sellingPrice ||
      item?.product?.price ||
      item?.variant?.price ||
      0
    )

  const getOrderTotal = (order) => {
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
      (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
      0
    )
  }

  const getOrderDate = (order) =>
    order?.createdAt ||
    order?.orderDate ||
    order?.created_at ||
    order?.date

  const formatDate = (date) => {
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

  const formatTime = (date) => {
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

  const getStatusConfig = (status) => {
    if (
      ['DELIVERED', 'COMPLETED', 'SUCCESS', 'FULFILLED'].includes(status)
    ) {
      return {
        label: 'Delivered',
        icon: CheckCircle2,
        className: 'bg-green-50 text-green-700 border-green-200'
      }
    }

    if (
      ['CANCELLED', 'CANCELED', 'REJECTED'].includes(status)
    ) {
      return {
        label: 'Cancelled',
        icon: XCircle,
        className: 'bg-red-50 text-red-600 border-red-200'
      }
    }

    if (
      ['SHIPPED', 'OUT_FOR_DELIVERY', 'DISPATCHED'].includes(status)
    ) {
      return {
        label: 'On the way',
        icon: Truck,
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    }

    if (
      ['CONFIRMED', 'ACCEPTED', 'PROCESSING', 'PREPARING'].includes(status)
    ) {
      return {
        label: 'Processing',
        icon: PackageCheck,
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    }

    return {
      label: status
        ? status
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
        : 'Pending',
      icon: Clock3,
      className: 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const activeOrders = useMemo(() => {
    return orders.filter(order => {
      const status = getOrderStatus(order)

      return ![
        'DELIVERED',
        'COMPLETED',
        'SUCCESS',
        'FULFILLED',
        'CANCELLED',
        'CANCELED',
        'REJECTED'
      ].includes(status)
    })
  }, [orders])

  const pastOrders = useMemo(() => {
    return orders.filter(order => {
      const status = getOrderStatus(order)

      return [
        'DELIVERED',
        'COMPLETED',
        'SUCCESS',
        'FULFILLED',
        'CANCELLED',
        'CANCELED',
        'REJECTED'
      ].includes(status)
    })
  }, [orders])

  const visibleOrders =
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'past'
        ? pastOrders
        : orders

  const handleReorder = async (order) => {
    const orderId = getOrderId(order)
    const items = getOrderItems(order)

    if (!items.length) return

    try {
      setReordering(orderId)

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
        err?.response?.data?.message ||
        err?.message ||
        'Unable to reorder this order.'
      )
    } finally {
      setReordering(null)
    }
  }

  const cartCount = Array.isArray(cart?.items)
    ? cart.items.reduce(
        (sum, item) => sum + Number(item?.quantity || 0),
        0
      )
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#16823b]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="mb-7">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="space-y-5">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="mt-5 h-20 rounded-xl bg-gray-100" />
                <div className="mt-4 h-10 rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#16823b]"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16823b] text-white shadow-sm">
                  <ShoppingBag size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#172019] sm:text-3xl">
                    My Orders
                  </h1>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Track and manage your orders
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce8de] bg-white px-4 py-2.5 text-sm font-semibold text-[#172019] shadow-sm transition hover:border-[#16823b] hover:text-[#16823b]"
            >
              <ShoppingBasket size={18} />
              Cart
              {cartCount > 0 && (
                <span className="rounded-full bg-[#16823b] px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={loadOrders}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-red-700 shadow-sm"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 rounded-2xl border border-[#dce8de] bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
              activeTab === 'all'
                ? 'bg-[#16823b] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#f4f8f4]'
            }`}
          >
            All Orders
            <span className="ml-1.5 opacity-80">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
              activeTab === 'active'
                ? 'bg-[#16823b] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#f4f8f4]'
            }`}
          >
            Active
            <span className="ml-1.5 opacity-80">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
              activeTab === 'past'
                ? 'bg-[#16823b] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#f4f8f4]'
            }`}
          >
            Past
            <span className="ml-1.5 opacity-80">
              {pastOrders.length}
            </span>
          </button>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#dce8de] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f8f4] text-[#16823b]">
              <ReceiptText size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#172019]">
              No orders found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {activeTab === 'active'
                ? 'You do not have any active orders right now.'
                : activeTab === 'past'
                  ? 'Your completed or cancelled orders will appear here.'
                  : 'Once you place an order, your order details will appear here.'}
            </p>

            <button
              onClick={() => navigate('/home')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16823b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#116d30]"
            >
              Start Shopping
              <ChevronRight size={17} />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {visibleOrders.map((order, index) => {
              const orderId = getOrderId(order)
              const status = getOrderStatus(order)
              const statusConfig = getStatusConfig(status)
              const StatusIcon = statusConfig.icon
              const items = getOrderItems(order)
              const total = getOrderTotal(order)
              const date = getOrderDate(order)

              const address =
                order?.address ||
                order?.deliveryAddress ||
                order?.shippingAddress

              const paymentMethod =
                order?.paymentMethod ||
                order?.payment?.method

              return (
                <div
                  key={orderId || `order-${index}`}
                  className="overflow-hidden rounded-2xl border border-[#dce8de] bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-[#172019]">
                            {orderId ? `Order #${orderId}` : 'Order'}
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                          >
                            <StatusIcon size={13} />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>
                            {formatDate(date)}
                          </span>

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
                            {items.length} item{items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">
                          Total Amount
                        </p>

                        <p className="mt-0.5 text-xl font-bold text-[#16823b]">
                          ₹{total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6">
                    <div className="space-y-3">
                      {items.slice(0, 4).map((item, itemIndex) => {
                        const image = getItemImage(item)
                        const quantity = getItemQuantity(item)
                        const price = getItemPrice(item)

                        return (
                          <div
                            key={item?.id || item?.cartItemId || itemIndex}
                            className="flex items-center gap-3 rounded-xl bg-[#f7faf7] p-3"
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                              {image ? (
                                <img
                                  src={image}
                                  alt={getItemName(item)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ShoppingBag
                                  size={24}
                                  className="text-[#16823b]"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold text-[#172019]">
                                {getItemName(item)}
                              </h3>

                              <p className="mt-1 text-xs text-gray-500">
                                Qty: {quantity}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-[#172019]">
                                ₹{(price * quantity).toFixed(2)}
                              </p>

                              {price > 0 && (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  ₹{price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {items.length > 4 && (
                        <p className="px-1 text-xs font-medium text-gray-500">
                          +{items.length - 4} more item{items.length - 4 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {(address || paymentMethod) && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {address && (
                          <div className="rounded-xl border border-gray-100 bg-white p-3">
                            <div className="flex items-start gap-2.5">
                              <MapPin
                                size={17}
                                className="mt-0.5 shrink-0 text-[#16823b]"
                              />

                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-500">
                                  Delivery Address
                                </p>

                                <p className="mt-1 text-sm text-[#172019]">
                                  {typeof address === 'string'
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
                          <div className="rounded-xl border border-gray-100 bg-white p-3">
                            <div className="flex items-center gap-2.5">
                              <CreditCard
                                size={17}
                                className="text-[#16823b]"
                              />

                              <div>
                                <p className="text-xs font-semibold text-gray-500">
                                  Payment Method
                                </p>

                                <p className="mt-1 text-sm font-medium capitalize text-[#172019]">
                                  {String(paymentMethod).replace(/_/g, ' ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      {orderId && (
                        <button
                          onClick={() => navigate(`/orders/${orderId}`)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce8de] bg-white px-4 py-2.5 text-sm font-semibold text-[#172019] transition hover:border-[#16823b] hover:text-[#16823b]"
                        >
                          View Details
                          <ChevronRight size={17} />
                        </button>
                      )}

                      {items.length > 0 && (
                        <button
                          onClick={() => handleReorder(order)}
                          disabled={reordering === orderId}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16823b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#116d30] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RotateCcw
                            size={17}
                            className={
                              reordering === orderId
                                ? 'animate-spin'
                                : ''
                            }
                          />
                          {reordering === orderId
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
          <div className="mt-6 rounded-2xl border border-[#dce8de] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                <PackageCheck size={20} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#172019]">
                  Your orders are safe with us
                </h3>

                <p className="mt-0.5 text-xs text-gray-500">
                  You can view complete order details anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders