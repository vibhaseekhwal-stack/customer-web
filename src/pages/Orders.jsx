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
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">
            {error}
          </p>

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
      <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
        <h1 className="font-display text-xl font-bold text-green-700">
          Order History
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[48px] text-gray-400">
              receipt_long
            </span>

            <p className="mt-2 text-sm text-gray-500">
              No orders yet.
            </p>

            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const itemCount = (order.items || []).reduce(
              (sum, item) =>
                sum + Number(item.quantity || 0),
              0
            )

            const itemsSummary = (order.items || [])
              .map((item) => item.productName)
              .join(', ')

            const isReordering =
              reorderingId === order.id

            return (
              <article
                key={order.id}
                className="space-y-3 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {STATUS_LABELS[order.status] ||
                      order.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {itemCount} item
                  {itemCount === 1 ? '' : 's'} ·{' '}
                  {itemsSummary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="font-display text-xl font-bold text-green-700">
                    ₹{Number(order.total).toFixed(2)}
                  </span>

                  <div className="flex gap-2">
                    {order.status !== 'CANCELLED' && (
                      <button
                        disabled={isReordering}
                        onClick={() =>
                          handleReorder(order)
                        }
                        className="rounded-lg border border-green-700 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isReordering
                          ? 'Adding...'
                          : 'Reorder'}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        navigate(
                          `/order-detail?orderId=${order.id}`
                        )
                      }
                      className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-800"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-gray-200 bg-[#faf9f5] px-4 py-2 shadow-[0px_-4px_12px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center px-4 py-1 text-gray-500"
        >
          <span className="material-symbols-outlined">
            home
          </span>

          <span className="text-[10px]">
            Home
          </span>
        </button>

        <button
          onClick={() => navigate('/cart')}
          className="relative flex flex-col items-center justify-center px-4 py-1 text-gray-500"
        >
          <span className="material-symbols-outlined">
            shopping_cart
          </span>

          <span className="text-[10px]">
            Cart
          </span>

          {cartCount > 0 && (
            <span className="absolute right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center justify-center rounded-full bg-green-700 px-4 py-1 text-white"
        >
          <span className="material-symbols-outlined">
            receipt_long
          </span>

          <span className="text-[10px]">
            Orders
          </span>
        </button>

        <button
          onClick={() => navigate('/account')}
          className="flex flex-col items-center justify-center px-4 py-1 text-gray-500"
        >
          <span className="material-symbols-outlined">
            person
          </span>

          <span className="text-[10px]">
            Account
          </span>
        </button>
      </nav>
    </div>
  )
}

export default Orders