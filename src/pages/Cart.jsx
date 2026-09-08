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
  Sparkles,
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
      <div className="min-h-screen bg-[#f6faf7] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-xl bg-white" />
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-[28px] border border-[#e8eee9] bg-white p-6 shadow-sm">
              <div className="space-y-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4">
                    <div className="h-24 w-24 animate-pulse rounded-2xl bg-[#f1f5f2]" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#f1f5f2]" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[#f1f5f2]" />
                      <div className="h-9 w-28 animate-pulse rounded-xl bg-[#f1f5f2]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-80 animate-pulse rounded-[28px] bg-white shadow-sm" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#f6faf7] px-4">
        <div className="w-full max-w-md rounded-[30px] border border-[#e8eee9] bg-white p-8 text-center shadow-[0_20px_60px_rgba(24,74,42,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trash2 size={28} />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#172019]">
            Unable to load cart
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>

          <button
            onClick={loadCart}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16823b] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#116d30]"
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
  const itemCount = Number(cart?.itemCount || items.length || 0)
  const deliveryFee = grandTotal >= 500 ? 0 : 40
  const finalTotal = grandTotal + (items.length > 0 ? deliveryFee : 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6faf7] px-4 py-8">
        <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-[#e4ece6] bg-white px-6 py-14 text-center shadow-[0_20px_70px_rgba(24,74,42,0.07)] sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-[#eef8f0] text-[#16823b]">
              <ShoppingBag size={42} strokeWidth={1.7} />
            </div>

            <div className="mx-auto mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#eef8f0] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#16823b]">
              <Sparkles size={12} />
              Fresh picks await
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-[#172019] sm:text-4xl">
              Your Cart is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Your cart is waiting for some fresh groceries. Explore our
              collection and add your favourite products.
            </p>

            <button
              onClick={() => navigate('/home')}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#16823b] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-[#16823b]/20 transition hover:bg-[#116d30] active:scale-95"
            >
              <ShoppingBasket size={18} />
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6faf7] pb-14">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7">
          <button
            onClick={() => navigate('/home')}
            className="group mb-4 inline-flex items-center gap-2 text-xs font-bold text-gray-500 transition hover:text-[#16823b]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm transition group-hover:bg-[#eef8f0]">
              <ArrowLeft size={15} />
            </span>
            Continue Shopping
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#eaf7ed] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#16823b]">
                <ShoppingBag size={12} />
                Your Basket
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#172019] sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-1.5 text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} selected for
                checkout
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-2xl border border-[#e2ebe4] bg-white px-4 py-3 shadow-sm sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef8f0] text-[#16823b]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-[#172019]">
                  Secure Shopping
                </p>
                <p className="text-[10px] text-gray-400">
                  Safe & protected checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_390px]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[30px] border border-[#e5ece7] bg-white shadow-[0_12px_40px_rgba(24,74,42,0.05)]">
              <div className="flex items-center justify-between border-b border-[#edf1ee] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-base font-black text-[#172019]">
                    Cart Items
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Review your selected products
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f0] text-[#16823b]">
                  <ShoppingBag size={18} />
                </div>
              </div>

              <div className="divide-y divide-[#edf1ee]">
                {items.map((item) => {
                  const product = item.product || item
                  const itemId = item.id || item.cartItemId
                  const quantity = Number(item.quantity || 1)

                  const price = Number(
                    item.price ??
                      item.sellingPrice ??
                      product.price ??
                      product.sellingPrice ??
                      0
                  )

                  const apiImage =
                    item.image ||
                    item.imageUrl ||
                    product.image ||
                    product.imageUrl ||
                    product.thumbnail ||
                    product.productImage

                  const name =
                    item.name ||
                    item.productName ||
                    product.name ||
                    product.productName ||
                    'Amul Taaza Toned Milk'

                  const unit =
                    item.unit ||
                    item.weight ||
                    product.unit ||
                    product.weight ||
                    product.quantityUnit ||
                    '1 L'

                  const image = apiImage || AMUL_MILK_IMAGE

                  return (
                    <div
                      key={itemId}
                      className="p-4 transition hover:bg-[#fbfdfb] sm:p-5"
                    >
                      <div className="flex gap-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#edf1ee] bg-[#f5f8f5] sm:h-28 sm:w-28">
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-contain p-2.5"
                            onError={(e) => {
                              if (e.currentTarget.src !== AMUL_MILK_IMAGE) {
                                e.currentTarget.src = AMUL_MILK_IMAGE
                              }
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-sm font-black leading-5 text-[#172019] sm:text-base">
                                {name}
                              </h3>

                              {unit && (
                                <span className="mt-2 inline-flex rounded-lg bg-[#f3f7f4] px-2.5 py-1 text-[10px] font-bold text-gray-500">
                                  {unit}
                                </span>
                              )}

                              <p className="mt-2 text-xs font-semibold text-gray-400">
                                ₹{price.toFixed(2)} / unit
                              </p>
                            </div>

                            <p className="shrink-0 text-base font-black text-[#16823b] sm:text-lg">
                              ₹{(price * quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#e1e8e3] bg-white">
                              <button
                                type="button"
                                disabled={
                                  updatingId === itemId || quantity <= 1
                                }
                                onClick={() =>
                                  handleQuantity(itemId, quantity - 1)
                                }
                                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-[#eef8f0] hover:text-[#16823b] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={15} />
                              </button>

                              <div className="flex h-9 min-w-10 items-center justify-center border-x border-[#e1e8e3] px-2 text-sm font-black text-[#172019]">
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
                                  handleQuantity(itemId, quantity + 1)
                                }
                                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-[#eef8f0] hover:text-[#16823b] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={updatingId === itemId}
                              onClick={() => handleQuantity(itemId, 0)}
                              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                            >
                              <Trash2 size={15} />
                              <span className="hidden sm:inline">Remove</span>
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
              <div className="rounded-[24px] border border-[#e5ece7] bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f0] text-[#16823b]">
                  <Truck size={18} />
                </div>
                <h3 className="text-xs font-black text-[#172019]">
                  Fast Delivery
                </h3>
                <p className="mt-1 text-[11px] leading-4 text-gray-400">
                  Fresh groceries delivered to your door.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e5ece7] bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f0] text-[#16823b]">
                  <PackageCheck size={18} />
                </div>
                <h3 className="text-xs font-black text-[#172019]">
                  Quality Products
                </h3>
                <p className="mt-1 text-[11px] leading-4 text-gray-400">
                  Carefully selected fresh groceries.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e5ece7] bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f0] text-[#16823b]">
                  <LockKeyhole size={18} />
                </div>
                <h3 className="text-xs font-black text-[#172019]">
                  Safe & Secure
                </h3>
                <p className="mt-1 text-[11px] leading-4 text-gray-400">
                  Your shopping experience stays protected.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-5 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-[#e5ece7] bg-white shadow-[0_16px_50px_rgba(24,74,42,0.08)]">
              <div className="bg-[#172019] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Order Summary
                    </h2>
                    <p className="mt-1 text-xs text-white/50">
                      Price details for your order
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-5 py-6 sm:px-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-500">Subtotal</span>
                  <span className="font-black text-[#172019]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-500">
                    Delivery Fee
                  </span>

                  {deliveryFee === 0 ? (
                    <span className="rounded-full bg-[#eaf7ed] px-2.5 py-1 text-[10px] font-black text-[#16823b]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-black text-[#172019]">
                      ₹{deliveryFee.toFixed(2)}
                    </span>
                  )}
                </div>

                {deliveryFee > 0 && grandTotal < 500 && (
                  <div className="rounded-2xl bg-[#eef8f0] p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Truck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#16823b]"
                      />
                      <p className="text-[11px] font-bold leading-4 text-[#16823b]">
                        Add ₹{(500 - grandTotal).toFixed(2)} more to unlock
                        free delivery.
                      </p>
                    </div>
                  </div>
                )}

                {deliveryFee === 0 && grandTotal >= 500 && (
                  <div className="rounded-2xl bg-[#eef8f0] p-3.5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-[#16823b]" />
                      <p className="text-[11px] font-black text-[#16823b]">
                        You unlocked FREE delivery!
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#172019]">
                      Total
                    </span>
                    <span className="text-2xl font-black text-[#16823b]">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-2xl border border-[#e8eee9] bg-[#f8faf8] px-3.5 py-3">
                  <Tag size={16} className="shrink-0 text-[#16823b]" />
                  <span className="text-[11px] font-bold leading-4 text-gray-500">
                    Coupons and offers are available at checkout
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

                <div className="flex items-center justify-center gap-2 pt-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <ShieldCheck size={14} className="text-[#16823b]" />
                  Secure & Protected Checkout
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e1e8e3] bg-white py-3.5 text-sm font-bold text-gray-600 shadow-sm transition hover:border-[#16823b]/30 hover:bg-[#eef8f0] hover:text-[#16823b]"
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