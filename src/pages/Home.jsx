
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getCategories,
  getProducts,
  addToCart,
} from '../services/api'

const HERO_BANNERS = [
  {
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1800&q=90',
    badge: 'Fresh & Healthy',
    title: 'Fresh Groceries\nDelivered to Your Door',
    subtitle:
      'Quality groceries, fresh fruits, vegetables and everyday essentials delivered right to your doorstep.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1800&q=90',
    badge: 'Super Savers',
    title: 'Daily Staples\nat Lowest Prices',
    subtitle:
      'Stock up your pantry with high quality grains, pulses, oils, and kitchen necessities.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90',
    badge: 'Everyday Essentials',
    title: 'Daily Staples\nStocked & Ready',
    subtitle:
      'Premium quality grains, pulses, oils, flour and kitchen essentials — always in stock.',
  },
]

const DUMMY_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=600&q=80',
]

const DUMMY_CATEGORIES = [
  { id: 'dc-1', name: 'Groceries', icon: '🛒' },
  { id: 'dc-2', name: 'Fruits & Veg', icon: '🍎' },
  { id: 'dc-3', name: 'Dairy', icon: '🥛' },
  { id: 'dc-4', name: 'Snacks', icon: '🥐' },
  { id: 'dc-5', name: 'Cold Drinks', icon: '🧃' },
  { id: 'dc-6', name: 'Bakery', icon: '🍞' },
]

function Home() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % HERO_BANNERS.length
      )
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError('')

        const [categoriesData, productsData] =
          await Promise.all([
            getCategories(),
            getProducts({
              page: 1,
              limit: 20,
            }),
          ])

        const categoryList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.items || []

        const productList = Array.isArray(productsData)
          ? productsData
          : productsData?.items || []

        const activeCategories = categoryList.filter(
          (category) => category?.isActive !== false
        )

        const activeProducts = productList.filter(
          (product) =>
            product?.isActive !== false &&
            product?.variants?.some(
              (variant) => variant?.isActive !== false
            )
        )

        setCategories(activeCategories)
        setProducts(activeProducts)
      } catch (err) {
        console.error('Home API error:', err)
        setError(
          err?.message || 'Unable to load home data'
        )
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  const handleCategoryClick = (category) => {
    if (!category?.id) return
    navigate(`/category/${category.id}`)
  }

  const handleProductClick = (product) => {
    if (!product?.id) return
    navigate(`/product/${product.id}`)
  }

  const bestDeals = useMemo(() => {
    const getDiscount = (product) => {
      const variants =
        product?.variants?.filter(
          (variant) => variant?.isActive !== false
        ) || []

      if (!variants.length) return 0

      const variant = variants.reduce(
        (min, item) =>
          Number(item.sellingPrice) <
          Number(min.sellingPrice)
            ? item
            : min,
        variants[0]
      )

      const mrp = Number(variant?.mrp || 0)
      const selling = Number(
        variant?.sellingPrice || 0
      )

      return mrp > selling
        ? ((mrp - selling) / mrp) * 100
        : 0
    }

    return [...products]
      .sort(
        (a, b) =>
          getDiscount(b) - getDiscount(a)
      )
      .slice(0, 8)
  }, [products])

  const displayCategories =
    categories.length > 0
      ? categories.slice(0, 6)
      : DUMMY_CATEGORIES

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#315d32]/20 border-t-[#315d32] sm:h-12 sm:w-12" />
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[#8a9287] sm:text-xs">
            Loading fresh groceries...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4">
        <div className="w-full max-w-md rounded-[26px] border border-[#e1e7dd] bg-white p-6 text-center shadow-[0_25px_70px_rgba(47,70,39,0.09)] sm:rounded-[30px] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-red-50 text-xl font-black text-red-500 sm:h-16 sm:w-16 sm:rounded-[20px]">
            !
          </div>

          <h2 className="mt-5 text-base font-black text-[#202a20] sm:text-lg">
            Something went wrong
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-[#8a9287] sm:text-sm">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8f2] pb-16 text-[#202a20] sm:pb-20">
      <section className="w-full">
        <div className="hidden overflow-hidden bg-[#202a20] shadow-[0_15px_45px_rgba(47,70,39,0.12)] sm:block">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {HERO_BANNERS.map((banner, index) => (
              <div
                key={index}
                className="relative min-w-full flex-shrink-0"
              >
                <img
                  src={banner.image}
                  alt="Fresh groceries banner"
                  className="h-[330px] w-full object-cover brightness-[0.82] md:h-[410px] lg:h-[500px]"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#202a20]/90 via-[#202a20]/60 to-[#202a20]/15" />

                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16">
                    <div className="max-w-xl">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#315d32] shadow-lg md:text-[10px]">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#315d32]" />
                        {banner.badge}
                      </div>

                      <h1 className="max-w-lg whitespace-pre-line text-3xl font-black leading-[1.18] tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                        {banner.title}
                      </h1>

                      <p className="mt-3 max-w-md text-xs leading-relaxed text-white/75 drop-shadow md:text-sm">
                        {banner.subtitle}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate('/category/all')
                        }
                        className="mt-6 rounded-[16px] bg-[#315d32] px-7 py-3.5 text-xs font-black text-white shadow-xl shadow-black/20 transition-all hover:bg-[#274d29] active:scale-95"
                      >
                        Shop Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 right-6 z-10 flex gap-2 md:right-8">
            {HERO_BANNERS.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#17351f] sm:hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {HERO_BANNERS.map((banner, index) => (
              <div
                key={index}
                className="relative min-w-full flex-shrink-0"
              >
                <img
                  src={banner.image}
                  alt="Fresh groceries"
                  className="h-[245px] w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#17351f] via-[#17351f]/65 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 px-4 pb-7">
                  <div className="mb-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-[#315d32]">
                    {banner.badge}
                  </div>

                  <h1 className="max-w-[310px] whitespace-pre-line text-[25px] font-black leading-[1.08] tracking-tight text-white">
                    {banner.title}
                  </h1>

                  <p className="mt-2 max-w-[300px] text-[10px] leading-relaxed text-white/75">
                    {banner.subtitle}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/category/all')
                    }
                    className="mt-4 rounded-[12px] bg-white px-5 py-2.5 text-[10px] font-black text-[#315d32] shadow-lg active:scale-95"
                  >
                    Shop Now →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
            {HERO_BANNERS.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-3 pt-7 sm:px-5 sm:pt-9 lg:px-8 lg:pt-10">
        <SectionHeading
          title="Shop by Category"
          action="View All"
          onAction={() => navigate('/categories')}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {displayCategories.map((category, idx) => (
            <CategoryCard
              key={category.id || idx}
              category={category}
              fallbackImage={
                DUMMY_PRODUCT_IMAGES[
                  idx % DUMMY_PRODUCT_IMAGES.length
                ]
              }
              onClick={() =>
                handleCategoryClick(category)
              }
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-3 pt-8 sm:px-5 sm:pt-10 lg:px-8">
        <SectionHeading title="Best Deals" />

        {bestDeals.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-4">
            {bestDeals.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                fallbackImage={
                  DUMMY_PRODUCT_IMAGES[
                    idx % DUMMY_PRODUCT_IMAGES.length
                  ]
                }
                onClick={() =>
                  handleProductClick(product)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState text="No products available" />
        )}
      </section>
    </main>
  )
}

function SectionHeading({
  title,
  subtitle,
  action,
  onAction,
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
      <div className="min-w-0">
        <h2 className="text-lg font-black tracking-tight text-[#202a20] sm:text-xl md:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[9px] text-[#969e93] sm:text-xs">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-full bg-[#eef5e7] px-3.5 py-2 text-[10px] font-black text-[#315d32] transition-all hover:bg-[#315d32] hover:text-white active:scale-95 sm:px-4 sm:text-xs"
        >
          {action}
        </button>
      )}
    </div>
  )
}

function CategoryCard({
  category,
  fallbackImage,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[135px] flex-col items-center justify-between rounded-[20px] border border-[#e1e7dd] bg-white p-3.5 text-center shadow-[0_6px_20px_rgba(47,70,39,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#315d32]/30 hover:shadow-[0_15px_35px_rgba(47,70,39,0.09)] sm:min-h-[150px] sm:rounded-[24px] sm:p-5"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[17px] bg-[#eef5e7] text-xl transition group-hover:bg-[#e3efd9] sm:mb-4 sm:h-16 sm:w-16 sm:rounded-[20px] sm:text-2xl">
        {category?.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          category?.icon || '🛒'
        )}
      </div>

      <span className="line-clamp-2 text-[10px] font-black leading-tight text-[#202a20] transition group-hover:text-[#315d32] sm:text-xs">
        {category?.name}
      </span>
    </button>
  )
}

function ProductCard({
  product,
  fallbackImage,
  onClick,
}) {
  const [adding, setAdding] = useState(false)

  const activeVariants =
    product?.variants?.filter(
      (variant) => variant?.isActive !== false
    ) || []

  if (!activeVariants.length) {
    return null
  }

  const cheapest = activeVariants.reduce(
    (min, variant) =>
      Number(variant.sellingPrice) <
      Number(min.sellingPrice)
        ? variant
        : min,
    activeVariants[0]
  )

  const handleAddToCart = async (e) => {
    e.stopPropagation()

    if (!cheapest?.id || adding) return

    try {
      setAdding(true)
      await addToCart(cheapest.id, 1)

      alert(
        `${product?.name || 'Product'} added to cart`
      )
    } catch (error) {
      console.error('Add to cart error:', error)

      alert(
        error?.message ||
          'Failed to add product to cart'
      )
    } finally {
      setAdding(false)
    }
  }

  const sellingPrice = Number(
    cheapest?.sellingPrice || 0
  )

  const mrp = Number(cheapest?.mrp || 0)
  const hasDiscount = mrp > sellingPrice

  const discountPct = hasDiscount
    ? Math.round(
        ((mrp - sellingPrice) / mrp) * 100
      )
    : 0

  const anyAvailable = activeVariants.some(
    (variant) => variant?.isAvailable
  )

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[18px] border border-[#e1e7dd] bg-white p-2.5 shadow-[0_6px_20px_rgba(47,70,39,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#315d32]/30 hover:shadow-[0_16px_35px_rgba(47,70,39,0.1)] sm:rounded-[24px] sm:p-3.5"
    >
      {hasDiscount && (
        <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#315d32] px-2 py-1 text-[8px] font-black uppercase text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[9px]">
          {discountPct}% OFF
        </div>
      )}

      <div className="relative mx-auto mt-1.5 flex h-[125px] w-full items-center justify-center overflow-hidden rounded-[15px] bg-[#f7f8f2] sm:mt-2 sm:h-40 sm:rounded-[18px]">
        <img
          src={
            product?.imageUrl || fallbackImage
          }
          alt={product?.name}
          loading="lazy"
          className="h-28 w-28 object-contain transition duration-300 group-hover:scale-105 sm:h-36 sm:w-36"
        />
      </div>

      <div className="mt-2.5 flex flex-grow flex-col justify-between sm:mt-3">
        <div>
          <h3 className="line-clamp-2 min-h-[32px] text-[10px] font-black leading-relaxed text-[#202a20] sm:min-h-[36px] sm:text-xs">
            {product?.name}
          </h3>

          <div className="mt-1">
            <span className="text-[9px] font-medium text-[#969e93] sm:text-[11px]">
              {cheapest?.weight} {cheapest?.unit}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs font-black text-[#315d32] sm:text-sm">
                ₹{sellingPrice.toFixed(0)}
              </span>

              {hasDiscount && (
                <span className="text-[8px] font-normal text-[#969e93] line-through sm:text-[10px]">
                  ₹{mrp.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {!anyAvailable ? (
            <span className="shrink-0 rounded-[9px] bg-red-50 px-2 py-1 text-[8px] font-black text-red-500 sm:rounded-[10px] sm:px-2.5 sm:text-[10px]">
              Out
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 border-[#315d32] bg-white text-base font-black text-[#315d32] shadow-sm transition-all hover:bg-[#315d32] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9 sm:rounded-[12px] sm:text-lg"
              aria-label="Add item"
            >
              {adding ? '...' : '+'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#d8dfd4] bg-white py-12 text-center shadow-sm sm:rounded-[24px] sm:py-14">
      <div className="text-3xl text-[#d0d8ce]">
        🛒
      </div>

      <p className="mt-3 text-xs font-semibold text-[#8a9287] sm:text-sm">
        {text}
      </p>
    </div>
  )
}

export default Home

