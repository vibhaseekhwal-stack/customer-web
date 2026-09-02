import React, { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../services/api'

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ])

        // Same as old HTML/JS:
        // categoriesCache = categories.filter((c) => c.isActive)
        const activeCategories = (categoriesData || []).filter(
          (category) => category.isActive
        )

        // Old API response was:
        // productResult.items
        const productList = productsData?.items || productsData || []

        // Same as old HTML/JS:
        // p.isActive && p.variants.some((v) => v.isActive)
        const activeProducts = productList.filter(
          (product) =>
            product.isActive &&
            product.variants?.some((variant) => variant.isActive)
        )

        setCategories(activeCategories)
        setProducts(activeProducts)
      } catch (err) {
        console.error('Home API error:', err)

        setError(
          err?.message || 'Unable to load products'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-body-sm text-ink-soft">
          Loading…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <p className="text-center text-body-sm text-error">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest shadow-sm">
        <div className="mx-auto max-w-2xl">

          <div className="flex h-12 items-center justify-between px-4">
            <h1 className="font-display text-[20px] font-bold text-primary">
              CD Shopping Hub
            </h1>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft"
            >
              Logout
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-2">
            <div className="flex h-10 items-center rounded-full bg-surface-container px-4">
              <input
                type="text"
                placeholder="Search for atta, rice, milk…"
                className="w-full bg-transparent px-2 text-[14px] text-ink outline-none placeholder:text-ink-soft"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto px-4 pb-3">
            <button
              type="button"
              className="flex shrink-0 flex-col items-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f3ed] text-[12px] font-bold text-primary">
                All
              </div>

              <span className="mt-1 text-[10px] font-bold text-primary">
                All
              </span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="flex w-16 shrink-0 flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-[11px] font-semibold text-ink-soft">
                  {category.name?.slice(0, 2)}
                </div>

                <span className="mt-1 line-clamp-2 text-center text-[10px] leading-tight text-ink-soft">
                  {category.name}
                </span>
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="w-full">
        <div className="mx-auto max-w-2xl px-4 py-4">

          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) =>
                product.categoryId === category.id
            )

            if (categoryProducts.length === 0) {
              return null
            }

            return (
              <section
                key={category.id}
                className="mb-6"
              >
                {/* Section Header */}
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-display text-[16px] font-bold text-ink">
                    {category.name}
                  </h2>

                  {categoryProducts.length > 8 && (
                    <button
                      type="button"
                      className="text-[12px] font-bold text-primary"
                    >
                      see all ›
                    </button>
                  )}
                </div>

                {/* Products */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categoryProducts
                    .slice(0, 8)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                </div>
              </section>
            )
          })}

          {products.length === 0 && (
            <p className="py-10 text-center text-body-sm text-ink-soft">
              No products found.
            </p>
          )}

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 z-50 w-full border-t border-outline-variant bg-surface-container-lowest shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">

          <button
            type="button"
            className="rounded-full bg-primary-container px-4 py-1 text-white"
          >
            <span className="block text-[11px] font-bold">
              Home
            </span>
          </button>

          <button
            type="button"
            className="px-4 py-1 text-[11px] text-ink-soft"
          >
            Cart
          </button>

          <button
            type="button"
            className="px-4 py-1 text-[11px] text-ink-soft"
          >
            Orders
          </button>

          <button
            type="button"
            className="px-4 py-1 text-[11px] text-ink-soft"
          >
            Account
          </button>

        </div>
      </nav>

    </div>
  )
}

/* Product Card */
function ProductCard({ product }) {
  const activeVariants =
    product.variants?.filter(
      (variant) => variant.isActive
    ) || []

  if (activeVariants.length === 0) {
    return null
  }

  // Same as old code:
  // cheapest active variant
  const cheapest = activeVariants.reduce(
    (min, variant) =>
      Number(variant.sellingPrice) <
      Number(min.sellingPrice)
        ? variant
        : min,
    activeVariants[0]
  )

  const hasDiscount =
    Number(cheapest.mrp) >
    Number(cheapest.sellingPrice)

  const discountPct = hasDiscount
    ? Math.round(
        (1 -
          Number(cheapest.sellingPrice) /
            Number(cheapest.mrp)) *
          100
      )
    : 0

  const anyAvailable = activeVariants.some(
    (variant) => variant.isAvailable
  )

  return (
    <div className="w-[118px] shrink-0 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest">

      {/* Image */}
      <div className="relative aspect-square bg-surface-container">

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-ink-soft">
            No Image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white">
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-[88px] flex-col p-1">

        <p className="line-clamp-2 h-[30px] text-[12px] font-semibold leading-tight text-ink">
          {product.name}
        </p>

        <p className="text-[10px] text-ink-soft">
          {cheapest.weight}
          {cheapest.unit}
        </p>

        <div className="mt-auto flex items-end justify-between gap-1 pt-1">

          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold text-ink">
              ₹{Number(
                cheapest.sellingPrice
              ).toFixed(0)}
            </span>

            {hasDiscount && (
              <span className="text-[9px] text-ink-soft line-through">
                ₹{Number(
                  cheapest.mrp
                ).toFixed(0)}
              </span>
            )}
          </div>

          {!anyAvailable ? (
            <span className="text-[9px] font-bold text-accent">
              Out
            </span>
          ) : (
            <button
              type="button"
              className="rounded border border-primary px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              ADD
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default Home