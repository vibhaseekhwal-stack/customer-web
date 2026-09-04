import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateCartItem } from '../services/api'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBasket,
  RotateCcw,
  Truck,
  Tag,
  LockKeyhole,
  PackageCheck,
} from 'lucide-react'

const AMUL_MILK_IMAGE =
  'https://budgetbee.net/cdn/shop/files/01_59377a35-05e8-4dad-a9e1-6b06c9e53dbf.jpg?v=1748852580'

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
    if (quantity < 0) return

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
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7faf7] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#16823b]/20 border-t-[#16823b]" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Loading your cart...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7faf7] px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trash2 size={28} />
          </div>

          <h2 className="text-lg font-black text-[#172019]">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={loadCart}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16823b] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#116d30] active:scale-[0.98]"
          >
            <RotateCcw size={17} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const grandTotal = Number(cart?.grandTotal || 0)

  const deliveryFee = grandTotal >= 500 ? 0 : 40
  const finalTotal =
    grandTotal + (items.length > 0 ? deliveryFee : 0)

  if (items.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#f7faf7] px-4">
        <div className="w-full max-w-xl py-16 text-center">
          <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#16823b]/10 bg-[#f4f8f4] text-[#16823b]">
            <ShoppingBag size={45} strokeWidth={1.7} />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-[#172019] sm:text-3xl">
            Your Cart is Empty
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
            Looks like you haven't added anything yet. Explore our fresh
            groceries and add your favourites to the cart.
          </p>

          <button
            onClick={() => navigate('/home')}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#16823b] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#16823b]/20 transition hover:bg-[#116d30] active:scale-95"
          >
            <ShoppingBasket size={18} />
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] pb-12">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate('/home')}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-[#16823b]"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </button>

            <h1 className="text-2xl font-black tracking-tight text-[#172019] sm:text-3xl">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-[#16823b]/10 bg-white px-4 py-3 shadow-sm sm:flex">
            <ShieldCheck size={19} className="text-[#16823b]" />

            <span className="text-xs font-bold text-gray-600">
              Secure Shopping
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

          <div className="space-y-4">

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-base font-black text-[#172019]">
                    Cart Items
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Review your selected products
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <ShoppingBag size={18} />
                </div>
              </div>

              <div className="divide-y divide-gray-100">

                {items.map((item) => {
                  const product = item.product || item
                  const itemId = item.id || item.cartItemId

                  const quantity = Number(item.quantity || 1)

                  const price = Number(
                    item.price ??
                    product.price ??
                    product.sellingPrice ??
                    0
                  )

                  const apiImage =
                    product.image ||
                    product.imageUrl ||
                    product.thumbnail ||
                    product.productImage

                  const name =
                    product.name ||
                    product.productName ||
                    'Amul Taaza Toned Milk'

                  const unit =
                    product.unit ||
                    product.weight ||
                    product.quantityUnit ||
                    '1 L'

                  const image = apiImage || AMUL_MILK_IMAGE

                  return (
                    <div
                      key={itemId}
                      className="p-4 transition hover:bg-[#f7faf7]/70 sm:p-5"
                    >
                      <div className="flex gap-4">

                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-[#f4f8f4] sm:h-28 sm:w-28">

                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-contain p-2"
                            onError={(e) => {
                              if (
                                e.currentTarget.src !== AMUL_MILK_IMAGE
                              ) {
                                e.currentTarget.src = AMUL_MILK_IMAGE
                              }
                            }}
                          />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-sm font-extrabold text-[#172019] sm:text-base">
                                {name}
                              </h3>

                              {unit && (
                                <p className="mt-1 text-xs font-medium text-gray-400">
                                  {unit}
                                </p>
                              )}

                              <p className="mt-2 text-xs font-semibold text-gray-400">
                                ₹{price.toFixed(2)} per unit
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-black text-[#172019] sm:text-base">
                              ₹{(price * quantity).toFixed(2)}
                            </p>

                          </div>

                          <div className="mt-4 flex items-center justify-between">

                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">

                              <button
                                type="button"
                                disabled={
                                  updatingId === itemId ||
                                  quantity <= 1
                                }
                                onClick={() =>
                                  handleQuantity(
                                    itemId,
                                    quantity - 1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-[#f4f8f4] hover:text-[#16823b] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={15} />
                              </button>

                              <div className="flex h-9 min-w-10 items-center justify-center border-x border-gray-200 px-2 text-sm font-black text-[#172019]">
                                {updatingId === itemId ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#16823b]/20 border-t-[#16823b]" />
                                ) : (
                                  quantity
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={updatingId === itemId}
                                onClick={() =>
                                  handleQuantity(
                                    itemId,
                                    quantity + 1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-[#f4f8f4] hover:text-[#16823b] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus size={15} />
                              </button>

                            </div>

                            <button
                              type="button"
                              disabled={updatingId === itemId}
                              onClick={() =>
                                handleQuantity(itemId, 0)
                              }
                              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 transition hover:text-red-500 disabled:opacity-40"
                            >
                              <Trash2 size={15} />

                              <span className="hidden sm:inline">
                                Remove
                              </span>
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <Truck size={18} />
                </div>

                <h3 className="text-xs font-black text-[#172019]">
                  Fast Delivery
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-gray-400">
                  Fresh products delivered to your door.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <PackageCheck size={18} />
                </div>

                <h3 className="text-xs font-black text-[#172019]">
                  Quality Products
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-gray-400">
                  Carefully selected fresh groceries.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f8f4] text-[#16823b]">
                  <LockKeyhole size={18} />
                </div>

                <h3 className="text-xs font-black text-[#172019]">
                  Safe & Secure
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-gray-400">
                  Your shopping experience stays secure.
                </p>
              </div>

            </div>
          </div>

          <div className="lg:sticky lg:top-5 lg:self-start">

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-black text-[#172019]">
                  Order Summary
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Price details for your order
                </p>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-[#172019]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-500">
                    Delivery Fee
                  </span>

                  {deliveryFee === 0 ? (
                    <span className="font-black text-[#16823b]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-[#172019]">
                      ₹{deliveryFee.toFixed(2)}
                    </span>
                  )}
                </div>

                {deliveryFee > 0 && grandTotal < 500 && (
                  <div className="rounded-2xl bg-[#f4f8f4] p-3">
                    <div className="flex items-start gap-2">
                      <Truck
                        size={15}
                        className="mt-0.5 shrink-0 text-[#16823b]"
                      />

                      <p className="text-[11px] font-semibold leading-4 text-[#16823b]">
                        Add ₹{(500 - grandTotal).toFixed(2)} more to get
                        free delivery.
                      </p>
                    </div>
                  </div>
                )}

                {deliveryFee === 0 && grandTotal >= 500 && (
                  <div className="rounded-2xl bg-[#f4f8f4] p-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={15}
                        className="text-[#16823b]"
                      />

                      <p className="text-[11px] font-black text-[#16823b]">
                        You unlocked FREE delivery!
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4">

                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#172019]">
                      Total
                    </span>

                    <span className="text-xl font-black text-[#16823b]">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-[#f7faf7] px-3 py-3">
                  <Tag size={16} className="text-[#16823b]" />

                  <span className="text-xs font-semibold text-gray-500">
                    Coupons and offers available at checkout
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="group flex w-full items-center justify-between rounded-2xl bg-[#16823b] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#16823b]/20 transition hover:bg-[#116d30] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <LockKeyhole size={17} />
                    Proceed to Checkout
                  </span>

                  <ChevronRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  <ShieldCheck
                    size={14}
                    className="text-[#16823b]"
                  />
                  Secure & protected checkout
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-600 transition hover:border-[#16823b]/30 hover:bg-[#f4f8f4] hover:text-[#16823b]"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart