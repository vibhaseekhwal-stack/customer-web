import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateCartItem } from '../services/api'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
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
      <div className="min-h-screen bg-[#f7f8f2] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-8 w-40 animate-pulse rounded-xl bg-white sm:mb-8 sm:w-48" />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="rounded-[24px] border border-[#e1e7dd] bg-white p-4 shadow-[0_20px_60px_rgba(47,70,39,0.07)] sm:rounded-[30px] sm:p-6">
              <div className="space-y-5 sm:space-y-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3 sm:gap-4">
                    <div className="h-20 w-20 shrink-0 animate-pulse rounded-[18px] bg-[#eef5e7] sm:h-28 sm:w-28 sm:rounded-[22px]" />
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eef5e7]" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[#eef5e7]" />
                      <div className="h-9 w-28 animate-pulse rounded-xl bg-[#eef5e7]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[400px] animate-pulse rounded-[24px] bg-white shadow-[0_20px_60px_rgba(47,70,39,0.07)] sm:rounded-[30px]" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#e1e7dd] bg-white p-7 text-center shadow-[0_25px_70px_rgba(47,70,39,0.09)] sm:rounded-[32px] sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 text-red-500">
            <Trash2 size={28} />
          </div>

          <h2 className="mt-6 text-xl font-black text-[#202a20]">
            Unable to load cart
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8a9287]">{error}</p>

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
  const finalTotal = grandTotal + (items.length > 0 ? deliveryFee : 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8f2] px-3 py-5 sm:px-5 sm:py-8">
        <div className="mx-auto flex min-h-[78vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#e1e7dd] bg-white px-5 py-12 text-center shadow-[0_30px_90px_rgba(47,70,39,0.09)] sm:rounded-[36px] sm:px-12 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#eef5e7] text-[#315d32] sm:h-24 sm:w-24 sm:rounded-[30px]">
              <ShoppingBag size={38} strokeWidth={1.6} className="sm:h-[42px] sm:w-[42px]" />
            </div>

            <div className="mx-auto mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#dfe9d8] bg-[#f5f8f1] px-3 py-1.5 text-[9px] font-black uppercase tracking-[1.3px] text-[#315d32] sm:px-3.5 sm:text-[10px] sm:tracking-[1.5px]">
              <Sparkles size={12} />
              Fresh picks await
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-tight text-[#202a20] sm:text-4xl">
              Your Cart is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8a9287]">
              Your basket is waiting for something fresh. Explore our
              collection and discover products you'll love.
            </p>

            <button
              onClick={() => navigate('/home')}
              className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-[#315d32] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#315d32]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#274d29] active:scale-95 sm:px-7"
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
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8f2] pb-10 sm:pb-14 lg:pb-16">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#dfe8d9] bg-[#eef5e7] px-3 py-1.5 text-[9px] font-black uppercase tracking-[1.3px] text-[#315d32] sm:mb-3 sm:px-3.5 sm:text-[10px] sm:tracking-[1.5px]">
                <ShoppingBag size={12} />
                Your Basket
              </div>

              <h1 className="text-[27px] font-black tracking-[-0.8px] text-[#202a20] sm:text-3xl lg:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-1.5 text-xs text-[#8a9287] sm:mt-2 sm:text-sm">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for
                checkout
              </p>
            </div>

            <div className="flex w-full items-center gap-3 rounded-[18px] border border-[#e1e7dd] bg-white px-3.5 py-3 shadow-sm sm:w-fit sm:rounded-[20px] sm:px-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10 sm:rounded-[14px]">
                <ShieldCheck size={18} />
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

        <div className="grid grid-cols-1 items-start gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-4 sm:space-y-5">
            <section className="overflow-hidden rounded-[24px] border border-[#e1e7dd] bg-white shadow-[0_18px_55px_rgba(47,70,39,0.06)] sm:rounded-[30px]">
              <div className="flex items-center justify-between border-b border-[#edf0ea] px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#202a20] sm:text-base">
                    Cart Items
                  </h2>

                  <p className="mt-1 text-[11px] text-[#969e93] sm:text-xs">
                    Review your selected products
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10 sm:rounded-[14px]">
                  <ShoppingBag size={17} />
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
                      <div className="flex min-w-0 gap-3 sm:gap-5">
                        <div className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-[17px] border border-[#e3e9df] bg-[#f7f9f4] sm:h-28 sm:w-28 sm:rounded-[20px]">
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-2.5"
                            onError={(e) => {
                              if (e.currentTarget.src !== AMUL_MILK_IMAGE) {
                                e.currentTarget.src = AMUL_MILK_IMAGE
                              }
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-[13px] font-black leading-5 text-[#202a20] sm:text-base">
                                {name}
                              </h3>

                              {unit && (
                                <span className="mt-1.5 inline-flex max-w-full rounded-lg border border-[#e1e8dc] bg-[#f5f8f1] px-2 py-1 text-[9px] font-bold text-[#606960] sm:mt-2 sm:px-2.5 sm:text-[10px]">
                                  {unit}
                                </span>
                              )}

                              <p className="mt-1.5 text-[10px] font-semibold text-[#969e93] sm:mt-2 sm:text-xs">
                                ₹{price.toFixed(2)} / unit
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-black text-[#315d32] sm:text-lg">
                              ₹{(price * quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:mt-4">
                            <div className="inline-flex items-center overflow-hidden rounded-[12px] border border-[#dfe6dc] bg-white shadow-sm">
                              <button
                                type="button"
                                disabled={
                                  updatingId === itemId || quantity <= 1
                                }
                                onClick={() =>
                                  handleQuantity(itemId, quantity - 1)
                                }
                                className="flex h-8 w-8 items-center justify-center text-[#606960] transition hover:bg-[#eef5e7] hover:text-[#315d32] disabled:cursor-not-allowed disabled:opacity-35 sm:h-9 sm:w-9"
                              >
                                <Minus size={14} />
                              </button>

                              <div className="flex h-8 min-w-9 items-center justify-center border-x border-[#dfe6dc] px-1.5 text-xs font-black text-[#202a20] sm:h-9 sm:min-w-10 sm:px-2 sm:text-sm">
                                {updatingId === itemId ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#315d32]/20 border-t-[#315d32] sm:h-4 sm:w-4" />
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
                                className="flex h-8 w-8 items-center justify-center text-[#606960] transition hover:bg-[#eef5e7] hover:text-[#315d32] disabled:cursor-not-allowed disabled:opacity-35 sm:h-9 sm:w-9"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={updatingId === itemId}
                              onClick={() => handleQuantity(itemId, 0)}
                              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold text-[#969e93] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40 sm:px-2.5 sm:text-xs"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
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
              <div className="rounded-[20px] border border-[#e1e7dd] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-[24px]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10 sm:rounded-[13px]">
                  <Truck size={17} />
                </div>

                <h3 className="text-xs font-black text-[#202a20]">
                  Fast Delivery
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-[#969e93] sm:text-[11px]">
                  Fresh groceries delivered to your door.
                </p>
              </div>

              <div className="rounded-[20px] border border-[#e1e7dd] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-[24px]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10 sm:rounded-[13px]">
                  <PackageCheck size={17} />
                </div>

                <h3 className="text-xs font-black text-[#202a20]">
                  Quality Products
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-[#969e93] sm:text-[11px]">
                  Carefully selected fresh groceries.
                </p>
              </div>

              <div className="rounded-[20px] border border-[#e1e7dd] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-[24px]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#eef5e7] text-[#315d32] sm:h-10 sm:w-10 sm:rounded-[13px]">
                  <LockKeyhole size={17} />
                </div>

                <h3 className="text-xs font-black text-[#202a20]">
                  Safe & Secure
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-[#969e93] sm:text-[11px]">
                  Your shopping experience stays protected.
                </p>
              </div>
            </div>
          </div>

          <aside className="w-full lg:sticky lg:top-5">
            <div className="overflow-hidden rounded-[24px] border border-[#e1e7dd] bg-white shadow-[0_20px_60px_rgba(47,70,39,0.09)] sm:rounded-[30px]">
              <div className="bg-[#315d32] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[1.3px] text-[#b8df7d] sm:text-[10px] sm:tracking-[1.5px]">
                      Checkout
                    </p>

                    <h2 className="text-base font-black text-white sm:text-lg">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-[10px] text-white/60 sm:text-xs">
                      Price details for your order
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-white/10 bg-white/10 text-white sm:h-11 sm:w-11 sm:rounded-[15px]">
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="space-y-3.5 sm:space-y-4">
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
                  <div className="mt-4 rounded-[16px] border border-[#dfe9d8] bg-[#f3f7ee] p-3 sm:mt-5 sm:rounded-[18px] sm:p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Truck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#315d32]"
                      />

                      <p className="text-[10px] font-bold leading-4 text-[#315d32] sm:text-[11px]">
                        Add ₹{(500 - grandTotal).toFixed(2)} more to unlock
                        free delivery.
                      </p>
                    </div>
                  </div>
                )}

                {deliveryFee === 0 && grandTotal >= 500 && (
                  <div className="mt-4 rounded-[16px] border border-[#dfe9d8] bg-[#f3f7ee] p-3 sm:mt-5 sm:rounded-[18px] sm:p-3.5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#315d32]" />

                      <p className="text-[10px] font-black text-[#315d32] sm:text-[11px]">
                        You unlocked FREE delivery!
                      </p>
                    </div>
                  </div>
                )}

                <div className="my-5 border-t border-dashed border-[#d8dfd4] sm:my-6" />

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[1.1px] text-[#969e93] sm:text-[10px] sm:tracking-[1.2px]">
                      Total Amount
                    </p>

                    <p className="mt-1 text-xs font-black text-[#202a20] sm:text-sm">
                      Inclusive of delivery
                    </p>
                  </div>

                  <span className="text-xl font-black tracking-tight text-[#315d32] sm:text-2xl">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2.5 rounded-[15px] border border-[#e1e7dd] bg-[#fafbf8] px-3 py-2.5 sm:mt-5 sm:rounded-[17px] sm:px-3.5 sm:py-3">
                  <Tag size={15} className="shrink-0 text-[#315d32]" />

                  <span className="text-[10px] font-bold leading-4 text-[#8a9287] sm:text-[11px]">
                    Coupons and offers are available at checkout
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="group mt-4 flex w-full items-center justify-between rounded-[17px] bg-[#315d32] px-4 py-3.5 text-xs font-black text-white shadow-lg shadow-[#315d32]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#274d29] active:scale-[0.98] sm:mt-5 sm:rounded-[18px] sm:px-5 sm:py-4 sm:text-sm"
                >
                  <span className="flex items-center gap-2">
                    <LockKeyhole size={16} />
                    Proceed to Checkout
                  </span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 sm:h-8 sm:w-8">
                    <ChevronRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[1.2px] text-[#969e93] sm:mt-5 sm:text-[9px] sm:tracking-[1.4px]">
                  <ShieldCheck size={13} className="text-[#315d32]" />
                  Secure & Protected Checkout
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Cart

