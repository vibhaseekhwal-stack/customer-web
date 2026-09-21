import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Sparkles,
  Plus,
  Minus,
  Flame,
  Check,
  Star
} from 'lucide-react'

import {
  getProducts,
  addToCart
} from '../services/api'

function Deals() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVariants, setSelectedVariants] = useState({})
  const [cartQuantities, setCartQuantities] = useState({})
  const [successToast, setSuccessToast] = useState('')

  useEffect(() => {
    const loadDealsData = async () => {
      try {
        setLoading(true)
        setError('')

        const productsData = await getProducts({
          page: 1,
          limit: 20
        })

        const productList = Array.isArray(productsData)
          ? productsData
          : productsData?.items || []

        const activeProducts = productList.filter(
          product =>
            product?.isActive !== false &&
            product?.variants?.some(
              variant => variant?.isActive !== false
            )
        )

        setProducts(activeProducts)
      } catch (err) {
        console.error('Deals API error:', err)
        setError(err?.message || 'Unable to load deals')
      } finally {
        setLoading(false)
      }
    }

    loadDealsData()
  }, [])

  const bestDeals = useMemo(() => {
    const getDiscount = product => {
      const variants =
        product?.variants?.filter(
          variant => variant?.isActive !== false
        ) || []

      if (!variants.length) return 0

      const variant = variants.reduce(
        (min, item) =>
          Number(item.sellingPrice) < Number(min.sellingPrice)
            ? item
            : min,
        variants[0]
      )

      const mrp = Number(variant?.mrp || 0)
      const selling = Number(variant?.sellingPrice || 0)

      return mrp > selling
        ? ((mrp - selling) / mrp) * 100
        : 0
    }

    return [...products]
      .sort((a, b) => getDiscount(b) - getDiscount(a))
      .slice(0, 8)
  }, [products])

  const filteredProducts = useMemo(() => {
    return bestDeals.filter(product =>
      product?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  }, [bestDeals, searchQuery])

  const handleVariantChange = (productId, index) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: index
    }))
  }

  const handleAdd = async (product, variant) => {
    if (!variant?.id) return

    try {
      await addToCart(variant.id, 1)

      setCartQuantities(prev => ({
        ...prev,
        [variant.id]: (prev[variant.id] || 0) + 1
      }))

      setSuccessToast(
        `${product?.name || 'Product'} added to cart`
      )

      setTimeout(() => {
        setSuccessToast('')
      }, 2000)
    } catch (err) {
      console.error('Add to cart error:', err)

      setSuccessToast(
        err?.message || 'Failed to add product to cart'
      )

      setTimeout(() => {
        setSuccessToast('')
      }, 2000)
    }
  }

  const handleRemove = variant => {
    if (!variant?.id) return

    setCartQuantities(prev => {
      const current = prev[variant.id] || 0

      if (current <= 1) {
        const copy = { ...prev }
        delete copy[variant.id]
        return copy
      }

      return {
        ...prev,
        [variant.id]: current - 1
      }
    })
  }

  const handleProductClick = product => {
    if (!product?.id) return
    navigate(`/product/${product.id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#315d32]/20 border-t-[#315d32] sm:h-12 sm:w-12" />

          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[#8a9287] sm:text-xs">
            Loading fresh deals...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4 sm:px-5">
        <div className="w-full max-w-md rounded-[24px] border border-[#e1e7dd] bg-white p-6 text-center shadow-[0_25px_70px_rgba(47,70,39,0.09)] sm:rounded-[30px] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-red-50 text-xl font-black text-red-500 sm:h-16 sm:w-16 sm:rounded-[20px]">
            !
          </div>

          <h2 className="mt-5 text-base font-black text-[#202a20] sm:text-lg">
            Something went wrong
          </h2>

          <p className="mt-2 break-words text-xs leading-5 text-[#8a9287] sm:text-sm">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f8f2] pb-24 sm:pb-28">

      {successToast && (
        <div className="fixed left-4 right-4 top-16 z-50 flex items-center justify-center sm:left-auto sm:right-4 sm:top-20 sm:justify-start">
          <div className="flex max-w-full items-center gap-2 rounded-[16px] border border-[#dfe9d8] bg-white px-3 py-2.5 text-[#315d32] shadow-[0_15px_45px_rgba(47,70,39,0.15)] sm:rounded-[18px] sm:px-4 sm:py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef5e7]">
              <Check size={15} />
            </div>

            <span className="truncate text-[10px] font-black sm:text-xs">
              {successToast}
            </span>
          </div>
        </div>
      )}

      <div className="bg-[#315d32] px-4 py-6 text-white shadow-[0_15px_40px_rgba(47,70,39,0.12)] sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">

            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wide backdrop-blur-md sm:mb-3 sm:px-3 sm:text-[10px]">
                <Sparkles
                  size={12}
                  className="shrink-0 text-[#b8df7d]"
                />

                <span className="truncate">
                  Limited Time • Best Prices • Mega Savings
                </span>
              </div>

              <h1 className="text-[22px] font-black leading-tight tracking-tight sm:text-3xl md:text-4xl">
                Deals & Special Discounts
              </h1>

              <p className="mt-2 max-w-xl text-[11px] font-medium leading-5 text-white/65 sm:text-xs md:text-sm">
                Grab your everyday grocery and household essentials at
                amazing discounted prices, available for a limited time.
              </p>
            </div>

            <div className="w-full shrink-0 md:w-[320px] lg:w-[350px]">
              <div className="flex h-11 w-full items-center gap-2 rounded-[15px] border border-white/15 bg-white/10 px-3.5 backdrop-blur-md transition focus-within:bg-white focus-within:text-[#202a20] sm:h-12 sm:rounded-[18px] sm:px-4">

                <Search
                  size={17}
                  className="shrink-0 text-[#b8df7d] sm:h-[18px] sm:w-[18px]"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search deals..."
                  className="min-w-0 w-full bg-transparent text-[11px] font-medium text-white outline-none placeholder:text-white/55 focus:text-[#202a20] sm:text-xs"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-[1400px] px-3 sm:mt-6 sm:px-5 md:px-6 lg:px-8">

        <div className="mb-4 mt-4 flex items-center justify-between gap-3 sm:mb-5 sm:mt-6">

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#eef5e7] sm:h-9 sm:w-9 sm:rounded-[12px]">
              <Flame
                size={16}
                className="text-[#315d32] sm:h-[17px] sm:w-[17px]"
              />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-sm font-black text-[#202a20] sm:text-base md:text-lg">
                  Best Deals
                </h2>

                <span className="shrink-0 rounded-full bg-[#eef5e7] px-2 py-0.5 text-[8px] font-black text-[#315d32] sm:px-2.5 sm:py-1 sm:text-[9px]">
                  {filteredProducts.length} items
                </span>
              </div>
            </div>
          </div>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="rounded-[24px] border border-[#e1e7dd] bg-white px-5 py-12 text-center shadow-[0_18px_55px_rgba(47,70,39,0.05)] sm:rounded-[30px] sm:px-6 sm:py-16">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef5e7] text-[#315d32] sm:h-16 sm:w-16 sm:rounded-[20px]">
              <Search size={23} />
            </div>

            <h3 className="mt-4 text-sm font-black text-[#202a20] sm:text-base">
              No deals found
            </h3>

            <p className="mt-1 text-[11px] text-[#8a9287] sm:text-xs">
              Try another product name.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-2 gap-2.5 min-[480px]:gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

            {filteredProducts.map((product, productIndex) => {

              const activeVariants =
                product?.variants?.filter(
                  variant => variant?.isActive !== false
                ) || []

              if (!activeVariants.length) {
                return null
              }

              const currentVariantIndex =
                selectedVariants[product.id] || 0

              const activeVariant =
                activeVariants[currentVariantIndex] ||
                activeVariants[0]

              const qty =
                cartQuantities[activeVariant?.id] || 0

              const sellingPrice =
                Number(activeVariant?.sellingPrice || 0)

              const mrp =
                Number(activeVariant?.mrp || 0)

              const hasDiscount =
                mrp > sellingPrice

              const discountPct =
                hasDiscount
                  ? Math.round(
                      ((mrp - sellingPrice) / mrp) * 100
                    )
                  : 0

              const anyAvailable =
                activeVariants.some(
                  variant => variant?.isAvailable
                )

              return (
                <div
                  key={product?.id || productIndex}
                  onClick={() => handleProductClick(product)}
                  className="group flex min-w-0 cursor-pointer flex-col justify-between rounded-[18px] border border-[#e1e7dd] bg-white p-2.5 shadow-[0_8px_25px_rgba(47,70,39,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#315d32]/25 hover:shadow-[0_18px_45px_rgba(47,70,39,0.09)] sm:rounded-[22px] sm:p-3 md:rounded-[24px] md:p-3.5"
                >

                  <div>

                    <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-[14px] bg-[#f7f8f2] min-[480px]:h-36 sm:h-40 sm:rounded-[17px] md:rounded-[18px]">

                      {hasDiscount && (
                        <span className="absolute left-1.5 top-1.5 z-10 rounded-full border border-[#dfe9d8] bg-white/95 px-1.5 py-0.5 text-[7px] font-black text-[#315d32] shadow-sm backdrop-blur-sm min-[480px]:left-2 min-[480px]:top-2 sm:px-2.5 sm:py-1 sm:text-[9px]">
                          {discountPct}% OFF
                        </span>
                      )}

                      <img
                        src={
                          product?.imageUrl ||
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={product?.name || 'Product'}
                        loading="lazy"
                        className="h-full w-full rounded-[14px] object-contain p-2.5 transition duration-500 group-hover:scale-105 sm:rounded-[18px] sm:p-3"
                      />

                      {hasDiscount && (
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-[#202a20]/75 px-1.5 py-1 text-[7px] font-black text-white backdrop-blur-sm sm:bottom-2.5 sm:right-2.5 sm:gap-1 sm:px-2 sm:text-[9px]">
                          <Star
                            size={8}
                            className="fill-[#b8df7d] text-[#b8df7d] sm:h-[10px] sm:w-[10px]"
                          />
                          {discountPct}% OFF
                        </div>
                      )}

                    </div>

                    <div className="mt-2.5 sm:mt-3">
                      <h3 className="line-clamp-2 min-h-[34px] text-[10px] font-black leading-4 text-[#202a20] transition group-hover:text-[#315d32] sm:min-h-[40px] sm:text-xs sm:leading-5">
                        {product?.name}
                      </h3>
                    </div>

                    {activeVariants.length > 1 && (
                      <div
                        className="mt-2 flex flex-wrap items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        {activeVariants.map((variant, index) => (
                          <button
                            key={variant?.id || index}
                            onClick={() =>
                              handleVariantChange(
                                product.id,
                                index
                              )
                            }
                            className={`max-w-full rounded-[7px] border px-1.5 py-1 text-[7px] font-black transition sm:rounded-[9px] sm:px-2 sm:py-1 sm:text-[9px] ${
                              currentVariantIndex === index
                                ? 'border-[#315d32] bg-[#eef5e7] text-[#315d32]'
                                : 'border-[#e1e7dd] bg-[#f7f8f2] text-[#606960] hover:border-[#315d32]/30 hover:text-[#315d32]'
                            }`}
                          >
                            {variant?.weight} {variant?.unit}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>

                  <div
                    className="mt-3 flex flex-col gap-2 border-t border-[#edf0ea] pt-2.5 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between sm:mt-4 sm:pt-3"
                    onClick={e => e.stopPropagation()}
                  >

                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="text-xs font-black text-[#202a20] sm:text-sm">
                          ₹{sellingPrice.toFixed(0)}
                        </span>

                        {hasDiscount && (
                          <span className="text-[7px] font-medium text-[#969e93] line-through sm:text-[9px]">
                            ₹{mrp.toFixed(0)}
                          </span>
                        )}
                      </div>

                      {hasDiscount && (
                        <span className="text-[7px] font-black text-[#315d32] sm:text-[9px]">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    {!anyAvailable ? (

                      <span className="w-fit rounded-[10px] bg-red-50 px-2.5 py-1.5 text-[8px] font-black text-red-500 sm:rounded-[13px] sm:px-3 sm:py-2 sm:text-[10px]">
                        OUT
                      </span>

                    ) : qty === 0 ? (

                      <button
                        onClick={() =>
                          handleAdd(
                            product,
                            activeVariant
                          )
                        }
                        className="w-full rounded-[10px] bg-[#315d32] px-3 py-2 text-[8px] font-black text-white shadow-md shadow-[#315d32]/15 transition hover:bg-[#274d29] active:scale-95 min-[480px]:w-auto sm:rounded-[13px] sm:px-4 sm:py-2 sm:text-[10px]"
                      >
                        ADD
                      </button>

                    ) : (

                      <div className="flex w-fit items-center gap-1 rounded-[10px] bg-[#315d32] px-1.5 py-1 text-white shadow-md shadow-[#315d32]/15 sm:gap-1.5 sm:rounded-[13px] sm:px-2 sm:py-1.5">

                        <button
                          onClick={() =>
                            handleRemove(activeVariant)
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/10 transition hover:bg-white/20 sm:h-5 sm:w-5 sm:rounded-[7px]"
                        >
                          <Minus
                            size={10}
                            strokeWidth={3}
                          />
                        </button>

                        <span className="w-4 text-center text-[10px] font-black sm:w-5 sm:text-xs">
                          {qty}
                        </span>

                        <button
                          onClick={() =>
                            handleAdd(
                              product,
                              activeVariant
                            )
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/10 transition hover:bg-white/20 sm:h-5 sm:w-5 sm:rounded-[7px]"
                        >
                          <Plus
                            size={10}
                            strokeWidth={3}
                          />
                        </button>

                      </div>

                    )}

                  </div>

                </div>
              )
            })}

          </div>

        )}

      </div>
    </div>
  )
}

export default Deals

