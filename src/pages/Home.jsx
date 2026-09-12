import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getCategories,
  getProducts,
  getProduct,
  addToCart,
} from '../services/api'

const HERO_BANNERS = [
  {
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90',
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
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1800&q=90',
    badge: 'Organic & Pure',
    title: 'Farm Fresh Organic\nFruits & Vegetables',
    subtitle:
      'Handpicked directly from local farmers to ensure maximum nutrition and taste.',
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
  const [selectedProduct, setSelectedProduct] = useState(null)
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
            getProducts(),
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

  const handleProductClick = async (product) => {
    try {
      const data = await getProduct(product.id)
      setSelectedProduct(data)
    } catch (err) {
      console.error('Product detail API error:', err)
    }
  }

  const bestDeals = useMemo(() => {
    return [...products]
      .sort((a, b) => {
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

        return getDiscount(b) - getDiscount(a)
      })
      .slice(0, 12)
  }, [products])

  const displayCategories =
    categories.length > 0
      ? categories
      : DUMMY_CATEGORIES

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#315d32]/20 border-t-[#315d32]" />

          <p className="text-xs font-bold uppercase tracking-wider text-[#8a9287]">
            Loading fresh groceries...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-5">
        <div className="w-full max-w-md rounded-[30px] border border-[#e1e7dd] bg-white p-8 text-center shadow-[0_25px_70px_rgba(47,70,39,0.09)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 text-xl font-black text-red-500">
            !
          </div>

          <h2 className="mt-5 text-lg font-black text-[#202a20]">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-[#8a9287]">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8f2] pb-20 text-[#202a20]">
      <section className="w-full pt-0">
        <div className="relative w-full overflow-hidden bg-[#202a20] shadow-[0_15px_45px_rgba(47,70,39,0.12)]">
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
                  className="h-[340px] w-full object-cover brightness-[0.82] sm:h-[420px] lg:h-[500px]"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#202a20]/90 via-[#202a20]/60 to-[#202a20]/15" />

                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
                    <div className="max-w-xl">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#315d32] shadow-lg">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#315d32]" />

                        {banner.badge}
                      </div>

                      <h1 className="max-w-lg whitespace-pre-line text-2xl font-black leading-[1.18] tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                        {banner.title}
                      </h1>

                      <p className="mt-3.5 max-w-md text-xs leading-relaxed text-white/75 drop-shadow sm:text-sm">
                        {banner.subtitle}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate('/products')
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

          <div className="absolute bottom-5 right-8 z-10 flex gap-2">
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
      </section>

      <section className="mx-auto max-w-[1400px] px-3 pt-10 sm:px-5 lg:px-8">
        <SectionHeading title="Shop by Category" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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

      <section className="mx-auto max-w-[1400px] px-3 pt-10 sm:px-5 lg:px-8">
        <SectionHeading
          title="Best Deals"
          action="View All"
        />

        {bestDeals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
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

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202a20]/45 p-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[30px] border border-[#e1e7dd] bg-white p-6 shadow-[0_30px_90px_rgba(47,70,39,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={
                    selectedProduct.imageUrl ||
                    DUMMY_PRODUCT_IMAGES[0]
                  }
                  alt={selectedProduct.name}
                  className="h-20 w-20 rounded-[20px] bg-[#f7f8f2] object-cover p-1 shadow-sm"
                />

                <div>
                  <h3 className="text-lg font-black text-[#202a20]">
                    {selectedProduct.name}
                  </h3>

                  {selectedProduct.description && (
                    <p className="mt-2 text-xs leading-5 text-[#8a9287]">
                      {selectedProduct.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProduct(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#f7f8f2] text-[#606960] transition hover:bg-red-50 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {selectedProduct.variants?.length > 0 && (
              <div className="mt-6 space-y-2">
                {selectedProduct.variants.map(
                  (variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between rounded-[20px] border border-[#e1e7dd] bg-[#f7f8f2] p-4 transition hover:border-[#315d32]/30 hover:bg-[#eef5e7]"
                    >
                      <div>
                        <p className="text-xs font-black text-[#202a20]">
                          {variant.weight}{' '}
                          {variant.unit}
                        </p>

                        <p className="mt-1 text-[10px] text-[#969e93]">
                          {variant.sku}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-black text-[#315d32]">
                          ₹
                          {Number(
                            variant.sellingPrice || 0
                          ).toFixed(0)}
                        </p>

                        {variant.mrp && (
                          <p className="text-[10px] text-[#969e93] line-through">
                            ₹
                            {Number(
                              variant.mrp
                            ).toFixed(0)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function SectionHeading({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-[#202a20] sm:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[10px] text-[#969e93] sm:text-xs">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          className="shrink-0 rounded-full bg-[#eef5e7] px-3 py-1.5 text-xs font-black text-[#315d32] transition hover:bg-[#315d32] hover:text-white"
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
      className="group flex min-h-[150px] flex-col items-center justify-between rounded-[24px] border border-[#e1e7dd] bg-white p-5 text-center shadow-[0_8px_25px_rgba(47,70,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#315d32]/30 hover:shadow-[0_15px_35px_rgba(47,70,39,0.09)]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] bg-[#eef5e7] text-2xl transition group-hover:bg-[#e3efd9]">
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

      <span className="line-clamp-1 text-xs font-black text-[#202a20] transition group-hover:text-[#315d32]">
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
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[24px] border border-[#e1e7dd] bg-white p-3.5 shadow-[0_8px_25px_rgba(47,70,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#315d32]/30 hover:shadow-[0_16px_35px_rgba(47,70,39,0.1)]"
    >
      {hasDiscount && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-[#315d32] px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-sm">
          {discountPct}% OFF
        </div>
      )}

      <div className="relative mx-auto mt-2 flex h-40 w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#f7f8f2]">
        <img
          src={
            product?.imageUrl || fallbackImage
          }
          alt={product?.name}
          loading="lazy"
          className="h-36 w-36 object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3 flex flex-grow flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 min-h-[36px] text-xs font-black leading-relaxed text-[#202a20]">
            {product?.name}
          </h3>

          <div className="mt-1">
            <span className="text-[11px] font-medium text-[#969e93]">
              {cheapest?.weight}{' '}
              {cheapest?.unit}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-[#315d32]">
                ₹{sellingPrice.toFixed(0)}
              </span>

              {hasDiscount && (
                <span className="text-[10px] font-normal text-[#969e93] line-through">
                  ₹{mrp.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {!anyAvailable ? (
            <span className="rounded-[10px] bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-500">
              Out
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="flex h-9 w-9 items-center justify-center rounded-[12px] border-2 border-[#315d32] bg-white text-lg font-black text-[#315d32] shadow-sm transition-all hover:bg-[#315d32] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="rounded-[24px] border border-dashed border-[#d8dfd4] bg-white py-14 text-center shadow-sm">
      <div className="text-3xl text-[#d0d8ce]">
        🛒
      </div>

      <p className="mt-3 text-sm font-semibold text-[#8a9287]">
        {text}
      </p>
    </div>
  )
}

export default Home