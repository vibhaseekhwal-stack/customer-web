import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getOrders,
  addToCart,
  getCart,
} from '../services/api'

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting Payment',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function Orders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reorderingId, setReorderingId] = useState(null)
  const [activeTab, setActiveTab] = useState('ACTIVE')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')

      const [ordersData, cartData] = await Promise.all([
        getOrders(),
        getCart(),
      ])

      setOrders(ordersData || [])
      setCartCount(cartData?.itemCount || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function getStatusClasses(status) {
    if (status === 'PENDING_PAYMENT' || status === 'CANCELLED') {
      return 'bg-red-100 text-red-700'
    }
    if (status === 'OUT_FOR_DELIVERY' || status === 'READY') {
      return 'bg-orange-100 text-orange-700'
    }
    if (
      status === 'CONFIRMED' ||
      status === 'PACKED' ||
      status === 'DELIVERED' ||
      status === 'COMPLETED'
    ) {
      return 'bg-green-100 text-green-700'
    }
    return 'bg-gray-100 text-gray-600'
  }

  function isOrderActive(status) {
    return !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(status)
  }

  const filteredOrders = orders.filter((order) => {
    const active = isOrderActive(order.status)
    return activeTab === 'ACTIVE' ? active : !active
  })

  async function handleReorder(order) {
    setReorderingId(order.id)

    let succeeded = 0
    const failed = []

    for (const item of order.items || []) {
      try {
        await addToCart(
          item.variantId,
          item.quantity
        )
        succeeded += 1
      } catch {
        failed.push(item.productName)
      }
    }

    try {
      const updatedCart = await getCart()
      setCartCount(updatedCart?.itemCount || 0)
    } catch {}

    setReorderingId(null)

    if (failed.length > 0) {
      window.alert(
        `Added ${succeeded} item(s) to your cart. Could not add: ${failed.join(
          ', '
        )} — they may no longer be available.`
      )
    }

    if (succeeded > 0) {
      navigate('/cart')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={loadOrders}
            className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-24">
      <header className="sticky top-0 z-50 bg-[#faf9f5] px-4 shadow-sm">
        <div className="flex h-14 items-center">
          <h1 className="font-display text-xl font-bold text-green-700">
            Order History
          </h1>
        </div>

        {/* Tabs: Active / Past */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 pb-3 text-center font-semibold transition relative ${
              activeTab === 'ACTIVE' ? 'text-green-800' : 'text-gray-400'
            }`}
          >
            Active
            {activeTab === 'ACTIVE' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-800 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('PAST')}
            className={`flex-1 pb-3 text-center font-semibold transition relative ${
              activeTab === 'PAST' ? 'text-green-800' : 'text-gray-400'
            }`}
          >
            Past
            {activeTab === 'PAST' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-800 rounded-t-full" />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-gray-400">
              receipt_long
            </span>
            <p className="mt-2 text-sm text-gray-500">
              No {activeTab.toLowerCase()} orders found.
            </p>
            {activeTab === 'ACTIVE' && (
              <button
                onClick={() => navigate('/')}
                className="mt-4 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isReordering = reorderingId === order.id
            const items = order.items || []
            const maxVisibleThumbnails = 3
            const visibleItems = items.slice(0, maxVisibleThumbnails)
            const extraCount = items.length - maxVisibleThumbnails

            return (
              <article
                key={order.id}
                className="space-y-4 rounded-2xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]"
              >
                {/* Top Row: Order ID & Price / Status */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900">
                      #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      , {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-lg font-bold text-gray-900">
                      ₹{Number(order.total).toFixed(0)}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getStatusClasses(
                          order.status
                        )}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Previews */}
                <div className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-1">
                  {visibleItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 p-1 border border-gray-100 overflow-hidden"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-gray-400 text-xl">
                          inventory_2
                        </span>
                      )}
                    </div>
                  ))}

                  {extraCount > 0 && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600 border border-gray-100">
                      +{extraCount}
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" />

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() =>
                      navigate(`/order-detail?orderId=${order.id}`)
                    }
                    className="text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    Track Order
                  </button>

                  {order.status !== 'CANCELLED' && (
                    <button
                      disabled={isReordering}
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 rounded-xl bg-green-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-900 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">
                        refresh
                      </span>
                      {isReordering ? 'Adding...' : 'Reorder'}
                    </button>
                  )}
                </div>
              </article>
            )
          })
        )}
      </main>

     
    </div>
  )
}

export default Orders