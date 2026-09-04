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
  Sparkles,
  ShoppingBasket,
  RotateCcw
} from 'lucide-react'

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
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f4f7f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
          <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f4f7f4] px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4">
            <Trash2 size={24} />
          </div>
          <p className="mb-4 text-xs font-bold text-red-500">{error}</p>
          <button
            onClick={loadCart}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-700 py-3 text-xs font-extrabold text-white shadow-md shadow-green-900/20 transition hover:bg-green-800"
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const grandTotal = Number(cart?.grandTotal || 0)
  const deliveryFee = grandTotal > 500 ? 0 : 40
  const finalTotal = grandTotal + (items.length > 0 ? deliveryFee : 0)

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#f4f7f4] flex flex-col justify-between">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-50 text-green-700 mb-6 shadow-inner">
            <ShoppingBag size={44} strokeWidth={1.8} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium max-w-xs mx-auto">
            Explore our fresh groceries, staples, and personal care items to fill your cart.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#16823b] px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#116d30] active:scale-95"
          >
            <Sparkles size={16} />
            <span>Start Shopping Now</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-32">
      
      {/* Top Header Banner matching App Theme */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 text-white px-4 sm:px-8 py-6 shadow-md">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md transition hover:bg-white/20 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight">My Shopping Cart</h1>
              <p className="text-[11px] text-green-100 font-medium">{items.length} items in your basket</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md">
            <ShieldCheck size={16} className="text-emerald-300" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">Review Items</h2>
            
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const product = item.product
                const variant = item.variant
                const quantity = Number(item.quantity || 0)
                const price = Number(variant?.sellingPrice || 0)
                const isUpdating = updatingId === item.id

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 group">
                    
                    {/* Product Image */}
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                      {product?.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name || 'Product'}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <ShoppingBasket size={24} className="text-green-700" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-xs sm:text-sm text-gray-900 group-hover:text-green-700 transition">
                        {product?.name || 'Product'}
                      </h3>

                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {variant?.weight} {variant?.unit}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-display text-sm font-black text-gray-900">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>

                      {!item.isAvailable && (
                        <p className="mt-1 text-[10px] font-bold text-red-500">
                          No longer available
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex shrink-0 flex-col items-end gap-2.5">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleQuantity(item.id, 0)}
                        className="text-gray-400 transition hover:text-red-500 disabled:opacity-50 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex items-center overflow-hidden rounded-xl bg-emerald-50 border border-green-700/30 text-green-800">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuantity(item.id, quantity - 1)}
                          className="px-2 py-1 transition hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>

                        <span className="w-6 text-center text-xs font-black">
                          {quantity}
                        </span>

                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuantity(item.id, quantity + 1)}
                          className="px-2 py-1 transition hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Bill Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-display text-sm font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Bill Details</span>
              <Sparkles size={14} className="text-yellow-500" />
            </h2>

            <div className="space-y-2.5 text-xs font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="font-bold text-gray-900">₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-green-700">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-[10px] text-gray-400 italic">
                  Add ₹{(500 - grandTotal).toFixed(0)} more for FREE delivery.
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-xs font-black uppercase text-gray-900">Grand Total</span>
              <span className="text-base font-black text-green-700">₹{finalTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 flex h-12 w-full items-center justify-between rounded-xl bg-[#16823b] px-5 text-xs font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-[#116d30] active:scale-95 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Safe & Fast Delivery</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                Your products are carefully packed and delivered straight to your doorstep fresh.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Cart