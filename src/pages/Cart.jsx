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
  CheckCircle2,
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
      <div className="min-h-screen bg-[#f7f8f2] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-xl bg-white" />

          <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
            <div className="rounded-[30px] border border-[#e1e7dd] bg-white p-6 shadow-[0_20px_60px_rgba(47,70,39,0.07)]">
              <div className="space-y-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4">
                    <div className="h-28 w-28 animate-pulse rounded-[22px] bg-[#eef5e7]" />
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eef5e7]" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[#eef5e7]" />
                      <div className="h-9 w-28 animate-pulse rounded-xl bg-[#eef5e7]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[430px] animate-pulse rounded-[30px] bg-white shadow-[0_20px_60px_rgba(47,70,39,0.07)]" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-[#e1e7dd] bg-white p-9 text-center shadow-[0_25px_70px_rgba(47,70,39,0.09)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 text-red-500">
            <Trash2 size={28} />
          </div>

          <h2 className="mt-6 text-xl font-black text-[#202a20]">
            Unable to load cart
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8a9287]">
            {error}
          </p>

          <button
            onClick={loadCart}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#315d32] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#315d32]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#274d29]"
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
  const finalTotal =
    grandTotal + (items.length > 0 ? deliveryFee : 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8f2] px-4 py-8">
        <div className="mx-auto flex min-h-[78vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[36px] border border-[#e1e7dd] bg-white px-6 py-16 text-center shadow-[0_30px_90px_rgba(47,70,39,0.09)] sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-[#eef5e7] text-[#315d32]">
              <ShoppingBag size={42} strokeWidth={1.6} />
            </div>

            <div className="mx-auto mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#dfe9d8] bg-[#f5f8f1] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[1.5px] text-[#315d32]">
              <Sparkles size={12} />
              Fresh picks await
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-[#202a20] sm:text-4xl">
              Your Cart is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8a9287]">
              Your basket is waiting for something fresh. Explore our
              collection and discover products you'll love.
            </p>

            <button
              onClick={() => navigate('/home')}
              className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-[#315d32] px-7 py-4 text-sm font-black text-white shadow-lg shadow-[#315d32]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#274d29] active:scale-95"
            >
              <ShoppingBasket size={18} />
              Start Shopping
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-[#81907b] transition hover:text-[#315d32]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-[#e1e7dd] bg-white shadow-sm transition group-hover:border-[#cbd9c4] group-hover:bg-[#eef5e7]">
              <ArrowLeft size={15} />
            </span>
            Continue Shopping
          </button>

          <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dfe8d9] bg-[#eef5e7] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[1.5px] text-[#315d32]">
                <ShoppingBag size={12} />
                Your Basket
              </div>

              <h1 className="text-3xl font-black tracking-[-1px] text-[#202a20] sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm text-[#8a9287]">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for
                checkout
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-[20px] border border-[#e1e7dd] bg-white px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef5e7] text-[#315d32]">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-xs font-black text-[#202a20]">
                  Secure Shopping
                </p>

                <p className="mt-0.5 text-[10px] text-[#969e93]">
                  Safe & protected checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_390px]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-[30px] border border-[#e1e7dd] bg-white shadow-[0_18px_55px_rgba(47,70,39,0.06)]">
              <div className="flex items-center justify-between border-b border-[#edf0ea] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-base font-black text-[#202a20]">
                    Cart Items
                  </h2>

                  <p className="mt-1 text-xs text-[#969e93]">
                    Review your selected products
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef5e7] text-[#315d32]">
                  <ShoppingBag size={18} />
                </div>
              </div>

              <div className="divide-y divide-[#edf0ea]">
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
                      className="group p-4 transition duration-200 hover:bg-[#fbfcf9] sm:p-6"
                    >
                      <div className="flex gap-4 sm:gap-5">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[20px] border border-[#e3e9df] bg-[#f7f9f4] sm:h-28 sm:w-28">
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-contain p-2.5 transition duration-300 group-hover:scale-105"
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
                              <h3 className="line-clamp-2 text-sm font-black leading-5 text-[#202a20] sm:text-base">
                                {name}
                              </h3>

                              {unit && (
                                <span className="mt-2 inline-flex rounded-lg border border-[#e1e8dc] bg-[#f5f8f1] px-2.5 py-1 text-[10px] font-bold text-[#606960]">
                                  {unit}
                                </span>
                              )}

                              <p className="mt-2 text-xs font-semibold text-[#969e93]">
                                ₹{price.toFixed(2)} / unit
                              </p>
                            </div>

                            <p className="shrink-0 text-base font-black text-[#315d32] sm:text-lg">
                              ₹{(price * quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center overflow-hidden rounded-[13px] border border-[#dfe6dc] bg-white shadow-sm">
                              <button
                                type="button"
                                disabled={
                                  updatingId === itemId || quantity <= 1
                                }
                                onClick={() =>
                                  handleQuantity(itemId, quantity - 1)
                                }
                                className="flex h-9 w-9 items-center justify-center text-[#606960] transition hover:bg-[#eef5e7] hover:text-[#315d32] disabled:cursor-not-allowed disabled:opacity-35"
                              >
                                <Minus size={15} />
                              </button>

                              <div className="flex h-9 min-w-10 items-center justify-center border-x border-[#dfe6dc] px-2 text-sm font-black text-[#202a20]">
                                {updatingId === itemId ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#315d32]/20 border-t-[#315d32]" />
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
                                className="flex h-9 w-9 items-center justify-center text-[#606960] transition hover:bg-[#eef5e7] hover:text-[#315d32] disabled:cursor-not-allowed disabled:opacity-35"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={updatingId === itemId}
                              onClick={() => handleQuantity(itemId, 0)}
                              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-[#969e93] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
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
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[#e1e7dd] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#eef5e7] text-[#315d32]">
                  <Truck size={18} />
                </div>

                <h3 className="text-xs font-black text-[#202a20]">
                  Fast Delivery
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-[#969e93]">
                  Fresh groceries delivered to your door.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e1e7dd] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#eef5e7] text-[#315d32]">
                  <PackageCheck size={18} />
                </div>

                <h3 className="text-xs font-black text-[#202a20]">
                  Quality Products
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-[#969e93]">
                  Carefully selected fresh groceries.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e1e7dd] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#eef5e7] text-[#315d32]">
                  <LockKeyhole size={18} />
                </div>

                <h3 className="text-xs font-black text-[#202a20]">
                  Safe & Secure
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-[#969e93]">
                  Your shopping experience stays protected.
                </p>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-5">
            <div className="overflow-hidden rounded-[30px] border border-[#e1e7dd] bg-white shadow-[0_20px_60px_rgba(47,70,39,0.09)]">
              <div className="bg-[#315d32] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#b8df7d]">
                      Checkout
                    </p>

                    <h2 className="text-lg font-black text-white">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-xs text-white/60">
                      Price details for your order
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/10 bg-white/10 text-white">
                    <ShoppingBag size={19} />
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 sm:px-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#8a9287]">
                      Subtotal
                    </span>

                    <span className="font-black text-[#202a20]">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#8a9287]">
                      Delivery Fee
                    </span>

                    {deliveryFee === 0 ? (
                      <span className="rounded-full bg-[#eef5e7] px-2.5 py-1 text-[10px] font-black text-[#315d32]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-black text-[#202a20]">
                        ₹{deliveryFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {deliveryFee > 0 && grandTotal < 500 && (
                  <div className="mt-5 rounded-[18px] border border-[#dfe9d8] bg-[#f3f7ee] p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Truck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#315d32]"
                      />

                      <p className="text-[11px] font-bold leading-4 text-[#315d32]">
                        Add ₹{(500 - grandTotal).toFixed(2)} more to unlock
                        free delivery.
                      </p>
                    </div>
                  </div>
                )}

                {deliveryFee === 0 && grandTotal >= 500 && (
                  <div className="mt-5 rounded-[18px] border border-[#dfe9d8] bg-[#f3f7ee] p-3.5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="text-[#315d32]"
                      />

                      <p className="text-[11px] font-black text-[#315d32]">
                        You unlocked FREE delivery!
                      </p>
                    </div>
                  </div>
                )}

                <div className="my-6 border-t border-dashed border-[#d8dfd4]" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#969e93]">
                      Total Amount
                    </p>

                    <p className="mt-1 text-sm font-black text-[#202a20]">
                      Inclusive of delivery
                    </p>
                  </div>

                  <span className="text-2xl font-black tracking-tight text-[#315d32]">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2.5 rounded-[17px] border border-[#e1e7dd] bg-[#fafbf8] px-3.5 py-3">
                  <Tag
                    size={16}
                    className="shrink-0 text-[#315d32]"
                  />

                  <span className="text-[11px] font-bold leading-4 text-[#8a9287]">
                    Coupons and offers are available at checkout
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="group mt-5 flex w-full items-center justify-between rounded-[18px] bg-[#315d32] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#315d32]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#274d29] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <LockKeyhole size={17} />
                    Proceed to Checkout
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                    <ChevronRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[1.4px] text-[#969e93]">
                  <ShieldCheck
                    size={14}
                    className="text-[#315d32]"
                  />
                  Secure & Protected Checkout
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#dfe6dc] bg-white py-3.5 text-sm font-bold text-[#606960] shadow-sm transition hover:border-[#315d32]/30 hover:bg-[#eef5e7] hover:text-[#315d32]"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Cart