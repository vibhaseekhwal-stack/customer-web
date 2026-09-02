import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateCartItem } from '../services/api'

function Cart() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    try {
      setLoading(true)
      setError('')

      const data = await getCart()
      setCart(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleQuantity(itemId, quantity) {
    try {
      setUpdatingId(itemId)

      await updateCartItem(itemId, quantity)

      const updatedCart = await getCart()
      setCart(updatedCart)
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>

          <button
            onClick={loadCart}
            className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const grandTotal = Number(cart?.grandTotal || 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8f4]">
        <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
          <button
            onClick={() => navigate('/')}
            className="-ml-2 flex h-12 w-12 items-center justify-center"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>

          <h1 className="font-display text-xl font-bold text-green-700">
            Cart
          </h1>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-20">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] text-gray-400">
              shopping_cart
            </span>

            <p className="mt-2 text-gray-500">
              Your cart is empty.
            </p>

            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Start Shopping
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-36">
      <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="-ml-2 flex h-12 w-12 items-center justify-center"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <h1 className="font-display text-xl font-bold text-green-700">
          Cart
        </h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product
            const variant = item.variant
            const quantity = Number(item.quantity || 0)
            const price = Number(variant?.sellingPrice || 0)
            const isUpdating = updatingId === item.id

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f0f2ec]">
                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name || 'Product'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[32px] text-green-700">
                      shopping_basket
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900">
                    {product?.name || 'Product'}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {variant?.weight}
                    {variant?.unit}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-700">
                    ₹{price.toFixed(2)}
                  </p>

                  {!item.isAvailable && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      No longer available
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    disabled={isUpdating}
                    onClick={() => handleQuantity(item.id, 0)}
                    className="text-gray-500 transition hover:text-red-500 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>

                  <div className="flex items-center overflow-hidden rounded-lg border border-green-700">
                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        handleQuantity(item.id, quantity - 1)
                      }
                      className="px-2 py-1 text-green-700 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        remove
                      </span>
                    </button>

                    <span className="w-6 text-center text-sm font-bold">
                      {quantity}
                    </span>

                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        handleQuantity(item.id, quantity + 1)
                      }
                      className="px-2 py-1 text-green-700 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <section className="rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <h2 className="mb-2 font-display text-xl font-bold text-gray-900">
            Bill Summary
          </h2>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Item Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          <p className="mt-2 text-sm italic text-gray-500">
            Delivery fee (if any) is calculated at checkout,
            based on delivery or pickup.
          </p>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 z-40 w-full bg-[#faf9f5]/95 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => navigate('/checkout')}
            className="flex h-[52px] w-full items-center justify-between rounded-xl bg-green-700 px-4 font-semibold text-white transition hover:bg-green-800"
          >
            <span>₹{grandTotal.toFixed(2)}</span>

            <span className="flex items-center gap-1">
              Proceed to Checkout

              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart