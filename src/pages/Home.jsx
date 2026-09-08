 
import React, { useEffect, useMemo, useState } from 'react'
import {
  getCategories,
  getCategory,
  getBrands,
  getProducts,
  getProductsByCategory,
  getProduct,
} from '../services/api'

const HERO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90',
    badge: 'Fresh & Healthy',
    title: 'Fresh Groceries\nDelivered to Your Door',
    subtitle: 'Quality groceries, fresh fruits, vegetables and everyday essentials delivered right to your doorstep.',
  },
  {
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1800&q=90',
    badge: 'Super Savers',
    title: 'Daily Staples\nat Lowest Prices',
    subtitle: 'Stock up your pantry with high quality grains, pulses, oils, and kitchen necessities.',
  },
  {
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1800&q=90',
    badge: 'Organic & Pure',
    title: 'Farm Fresh Organic\nFruits & Vegetables',
    subtitle: 'Handpicked directly from local farmers to ensure maximum nutrition and taste.',
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

const POPULAR_BRAND_IMAGES = [
  'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff26?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=600&q=80',
]

function Home() {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [products, setProducts] = useState([])

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [loading, setLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(false)
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

        const [
          categoriesData,
          brandsData,
          productsData,
        ] = await Promise.all([
          getCategories(),
          getBrands(),
          getProducts(),
        ])

        const categoryList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.items || []

        const brandList = Array.isArray(brandsData)
          ? brandsData
          : brandsData?.items || []

        const productList = Array.isArray(productsData)
          ? productsData
          : productsData?.items || []

        const activeCategories = categoryList.filter(
          (category) => category?.isActive !== false
        )

        const activeBrands = brandList.filter(
          (brand) => brand?.isActive !== false
        )

        const activeProducts = productList.filter(
          (product) =>
            product?.isActive !== false &&
            product?.variants?.some(
              (variant) => variant?.isActive !== false
            )
        )

        setCategories(activeCategories)
        setBrands(activeBrands)
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

  const handleCategoryClick = async (category) => {
    try {
      if (!category?.id) return

      if (category.id.startsWith('dc-')) {
        setSelectedCategory({
          ...category,
          products: [],
        })
        return
      }

      setSelectedCategory({
        ...category,
        products: [],
      })

      setCategoryLoading(true)

      const [categoryData, categoryProducts] =
        await Promise.all([
          getCategory(category.id),
          getProductsByCategory(category.id),
        ])

      const productsList = Array.isArray(categoryProducts)
        ? categoryProducts
        : categoryProducts?.items || []

      const activeCategoryProducts =
        productsList.filter(
          (product) =>
            product?.isActive !== false &&
            product?.variants?.some(
              (variant) => variant?.isActive !== false
            )
        )

      setSelectedCategory({
        ...categoryData,
        products: activeCategoryProducts,
      })
    } catch (err) {
      console.error(
        'Shop by Category API error:',
        err
      )

      setSelectedCategory((prev) => ({
        ...(prev || category),
        products: [],
        error:
          err?.message ||
          'Failed to load category products',
      }))
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleProductClick = async (product) => {
    try {
      const data = await getProduct(product.id)
      setSelectedProduct(data)
    } catch (err) {
      console.error(
        'Product detail API error:',
        err
      )
    }
  }

  const bestDeals = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const getDiscount = (product) => {
          const variants =
            product?.variants?.filter(
              (variant) =>
                variant?.isActive !== false
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dcefe2] border-t-[#16823b]" />
          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading fresh groceries...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf7] px-5">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-500">
            !
          </div>

          <h2 className="mt-4 text-lg font-black text-gray-900">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faf7] pb-20 text-[#172019]">
      <section className="w-full pt-0">
        <div className="relative w-full overflow-hidden bg-black shadow-md">
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
                  className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[500px] brightness-95"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
                    <div className="max-w-xl">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#16823b] shadow-lg backdrop-blur-md">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#16823b]" />
                        {banner.badge}
                      </div>

                      <h1 className="max-w-lg whitespace-pre-line text-2xl font-black leading-[1.18] tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                        {banner.title}
                      </h1>

                      <p className="mt-3.5 max-w-md text-xs leading-relaxed text-gray-200 drop-shadow sm:text-sm">
                        {banner.subtitle}
                      </p>

                      <button
                        type="button"
                        className="mt-6 rounded-xl bg-[#16823b] px-7 py-3.5 text-xs font-extrabold text-white shadow-xl shadow-green-900/50 transition-all hover:bg-[#116d30] active:scale-95"
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

      {brands.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-3 pt-10 sm:px-5 lg:px-8">
          <SectionHeading
            title="Popular Brands"
            subtitle="Explore your favorite trusted brands like Amul, Mother Dairy & more"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brands.slice(0, 12).map((brand, idx) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                fallbackImage={
                  POPULAR_BRAND_IMAGES[
                    idx % POPULAR_BRAND_IMAGES.length
                  ]
                }
              />
            ))}
          </div>
        </section>
      )}

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

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#f4f8f4] text-2xl shadow-sm">
                  {selectedCategory?.imageUrl ? (
                    <img
                      src={selectedCategory.imageUrl}
                      alt={selectedCategory?.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    selectedCategory?.icon || '🛒'
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {selectedCategory?.name}
                  </h3>

                  {selectedCategory?.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCategory(null)
                }
                className="rounded-full bg-gray-100 px-3 py-2 text-gray-500 transition hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-7">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-lg font-black text-gray-900">
                  Products in {selectedCategory?.name}
                </h4>

                {!categoryLoading && (
                  <span className="rounded-full bg-[#eaf7ee] px-3 py-1 text-xs font-bold text-[#16823b]">
                    {selectedCategory?.products?.length || 0}{' '}
                    Products
                  </span>
                )}
              </div>

              {categoryLoading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dcefe2] border-t-[#16823b]" />

                    <p className="mt-4 text-sm font-semibold text-gray-500">
                      Loading category products...
                    </p>
                  </div>
                </div>
              ) : selectedCategory?.error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 py-14 text-center">
                  <div className="text-4xl">⚠️</div>

                  <p className="mt-3 text-sm font-bold text-red-500">
                    {selectedCategory.error}
                  </p>
                </div>
              ) : selectedCategory?.products?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {selectedCategory.products.map(
                    (product, idx) => (
                      <ProductCard
                        key={
                          product.id || idx
                        }
                        product={product}
                        fallbackImage={
                          DUMMY_PRODUCT_IMAGES[
                            idx %
                              DUMMY_PRODUCT_IMAGES.length
                          ]
                        }
                        onClick={() =>
                          handleProductClick(
                            product
                          )
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
                  <div className="text-4xl">🛒</div>

                  <p className="mt-3 text-sm font-bold text-gray-500">
                    No products available in this category
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={
                    selectedProduct.imageUrl ||
                    DUMMY_PRODUCT_IMAGES[0]
                  }
                  alt={selectedProduct.name}
                  className="h-20 w-20 rounded-2xl bg-gray-50 object-cover p-1 shadow-sm"
                />

                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {selectedProduct.name}
                  </h3>

                  {selectedProduct.description && (
                    <p className="mt-2 text-xs leading-5 text-gray-500">
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
                className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
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
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100/50"
                    >
                      <div>
                        <p className="text-xs font-extrabold text-gray-800">
                          {variant.weight}{' '}
                          {variant.unit}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400">
                          {variant.sku}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-black text-gray-900">
                          ₹
                          {Number(
                            variant.sellingPrice || 0
                          ).toFixed(0)}
                        </p>

                        {variant.mrp && (
                          <p className="text-[10px] text-gray-400 line-through">
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
        <h2 className="text-xl font-black tracking-tight text-[#172019] sm:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[10px] text-gray-400 sm:text-xs">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          className="shrink-0 text-xs font-bold text-[#16823b] transition hover:text-[#0f632c]"
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
      className="group flex flex-col items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-100/80 text-xl transition group-hover:bg-gray-200/60">
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

      <span className="line-clamp-1 text-xs font-bold text-gray-800">
        {category?.name}
      </span>
    </button>
  )
}

function BrandCard({
  brand,
  fallbackImage,
}) {
  const brandImage =
    brand?.imageUrl || fallbackImage

  return (
    <div className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="absolute left-3 top-3 z-20">
        <span className="inline-block rounded-full bg-[#16823b] px-2.5 py-1 text-[9px] font-black tracking-wider text-white shadow-md">
          FEATURED
        </span>
      </div>

      <div className="relative h-40 w-full overflow-hidden bg-gray-50">
        <img
          src={brandImage}
          alt={brand?.name || 'Popular Brand'}
          loading="lazy"
          className="h-full w-full object-cover brightness-95 transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="line-clamp-1 text-sm font-black tracking-wide text-white drop-shadow-sm">
            {brand?.name || 'Trusted Brand'}
          </h3>

          <p className="text-[10px] font-medium text-gray-200 drop-shadow">
            Quality Assured
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-3">
        <span className="text-[10px] font-bold text-gray-400 transition-colors group-hover:text-[#16823b]">
          Explore Store
        </span>

        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f8f4] text-xs font-bold text-[#16823b] transition-all group-hover:bg-[#16823b] group-hover:text-white">
          →
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  fallbackImage,
  onClick,
}) {
  const activeVariants =
    product?.variants?.filter(
      (variant) =>
        variant?.isActive !== false
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

  const sellingPrice = Number(
    cheapest?.sellingPrice || 0
  )

  const mrp = Number(
    cheapest?.mrp || 0
  )

  const hasDiscount =
    mrp > sellingPrice

  const discountPct = hasDiscount
    ? Math.round(
        ((mrp - sellingPrice) / mrp) *
          100
      )
    : 0

  const anyAvailable =
    activeVariants.some(
      (variant) => variant?.isAvailable
    )

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/85 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
    >
      {hasDiscount && (
        <div className="absolute left-3 top-3 z-10 rounded bg-[#e76f1c] px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
          {discountPct}% OFF
        </div>
      )}

      <div className="relative mx-auto mt-2 flex h-40 w-full items-center justify-center overflow-hidden bg-white">
        <img
          src={
            product?.imageUrl ||
            fallbackImage
          }
          alt={product?.name}
          loading="lazy"
          className="h-36 w-36 object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3 flex flex-grow flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 min-h-[36px] text-xs font-semibold leading-relaxed text-gray-800">
            {product?.name}
          </h3>

          <div className="mt-1">
            <span className="text-[11px] font-medium text-gray-400">
              {cheapest?.weight}{' '}
              {cheapest?.unit}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-gray-900">
                ₹{sellingPrice.toFixed(0)}
              </span>

              {hasDiscount && (
                <span className="text-[10px] font-normal text-gray-400 line-through">
                  ₹{mrp.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {!anyAvailable ? (
            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-500">
              Out
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#16823b] bg-white text-base font-bold text-[#16823b] shadow-sm transition-all hover:bg-[#16823b] hover:text-white active:scale-95"
              aria-label="Add item"
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center">
      <div className="text-3xl text-gray-300">
        🛒
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-500">
        {text}
      </p>
    </div>
  )
}

export default Home

