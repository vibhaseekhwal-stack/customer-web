import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Search } from 'lucide-react'

import {
  getProducts,
  getCategories,
  addToCart,
} from '../services/api'

const fallbackImages = [
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=700&q=80',
]

function getVariant(product) {
  const variants = Array.isArray(product?.variants)
    ? product.variants.filter(
        (variant) => variant?.isActive !== false
      )
    : []

  if (!variants.length) return null

  return variants.reduce(
    (lowest, variant) =>
      Number(variant?.sellingPrice || 0) <
      Number(lowest?.sellingPrice || 0)
        ? variant
        : lowest,
    variants[0]
  )
}

function getPrice(product) {
  return Number(getVariant(product)?.sellingPrice || 0)
}

function getBrandName(product) {
  return (
    product?.brand?.name ||
    product?.brandName ||
    (typeof product?.brand === 'string'
      ? product.brand
      : '')
  )
}

function Categories() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedCategory, setSelectedCategory] =
    useState(null)

  const [search, setSearch] = useState('')
  const [selectedBrands, setSelectedBrands] =
    useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('relevance')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)

  const productsPerPage = 12

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            getProducts({
              page: 1,
              limit: 100,
            }),
            getCategories(),
          ])

        const productList = Array.isArray(
          productsResponse
        )
          ? productsResponse
          : productsResponse?.items || []

        const categoryList = Array.isArray(
          categoriesResponse
        )
          ? categoriesResponse
          : categoriesResponse?.items || []

        setProducts(
          productList.filter(
            (product) =>
              product?.isActive !== false &&
              getVariant(product)
          )
        )

        setCategories(
          categoryList.filter(
            (category) =>
              category?.isActive !== false
          )
        )
      } catch (err) {
        console.error(err)

        setError(
          err?.message ||
            'Unable to load categories and products'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null

    return categories.find(
      (category) =>
        String(category?.id) ===
        String(selectedCategory)
    )
  }, [categories, selectedCategory])

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return []

    return products.filter(
      (product) =>
        String(product?.categoryId) ===
          String(selectedCategory) ||
        String(product?.category?.id) ===
          String(selectedCategory)
    )
  }, [products, selectedCategory])

  const brandList = useMemo(() => {
    const brands = categoryProducts
      .map((product) => getBrandName(product))
      .filter(Boolean)

    return [...new Set(brands)]
  }, [categoryProducts])

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts]

    if (search.trim()) {
      const value = search.toLowerCase().trim()

      result = result.filter((product) => {
        const name = String(
          product?.name || ''
        ).toLowerCase()

        const brand = String(
          getBrandName(product) || ''
        ).toLowerCase()

        return (
          name.includes(value) ||
          brand.includes(value)
        )
      })
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(
          getBrandName(product)
        )
      )
    }

    if (minPrice !== '') {
      result = result.filter(
        (product) =>
          getPrice(product) >=
          Number(minPrice)
      )
    }

    if (maxPrice !== '') {
      result = result.filter(
        (product) =>
          getPrice(product) <=
          Number(maxPrice)
      )
    }

    if (sort === 'low') {
      result.sort(
        (a, b) =>
          getPrice(a) - getPrice(b)
      )
    }

    if (sort === 'high') {
      result.sort(
        (a, b) =>
          getPrice(b) - getPrice(a)
      )
    }

    if (sort === 'name') {
      result.sort((a, b) =>
        String(a?.name || '').localeCompare(
          String(b?.name || '')
        )
      )
    }

    return result
  }, [
    categoryProducts,
    search,
    selectedBrands,
    minPrice,
    maxPrice,
    sort,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage
    )
  )

  const visibleProducts =
    filteredProducts.slice(
      (page - 1) * productsPerPage,
      page * productsPerPage
    )

  const selectCategory = (category) => {
    if (!category?.id) return

    setSelectedCategory(category.id)
    setSearch('')
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setSort('relevance')
    setPage(1)
  }

  const backToCategories = () => {
    setSelectedCategory(null)
    setSearch('')
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setSort('relevance')
    setSortOpen(false)
    setPage(1)
  }

  const toggleBrand = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter(
            (item) => item !== brand
          )
        : [...current, brand]
    )

    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setSort('relevance')
    setPage(1)
  }

  if (loading) {
    return (
      <div className="flex min-h-[700px] items-center justify-center bg-[#f8faf8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce9df] border-t-[#28783f]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[700px] items-center justify-center bg-[#f8faf8] px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(30,70,40,0.08)]">
          <p className="text-sm font-semibold text-red-500">
            {error}
          </p>

          <button
            onClick={() => navigate('/home')}
            className="mt-5 rounded-xl bg-[#28783f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a38]"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <main className="min-h-[700px] bg-[#f8faf8] text-[#202720]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 md:py-9 lg:px-8 lg:py-10">
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-[#202720] sm:text-3xl">
              Shop by Category
            </h1>

            <p className="mt-1 text-sm text-[#7c857c]">
              Browse groceries and everyday essentials by category
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categories.map(
                (category, index) => (
                  <button
                    key={category?.id || index}
                    type="button"
                    onClick={() =>
                      selectCategory(category)
                    }
                    className="group overflow-hidden rounded-2xl border border-[#e2e8e2] bg-white text-left shadow-[0_4px_15px_rgba(30,60,35,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#c9dccb] hover:shadow-[0_10px_25px_rgba(30,60,35,0.1)]"
                  >
                    <div className="h-[170px] overflow-hidden bg-[#f1f5f0]">
                      {category?.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={
                            category?.name ||
                            'Category'
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">
                          🛒
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h2 className="line-clamp-1 text-sm font-bold text-[#303830] transition group-hover:text-[#28783f]">
                        {category?.name}
                      </h2>

                      <p className="mt-1 text-xs text-[#899189]">
                        Shop now
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#dce3dc] bg-white py-20 text-center">
              <p className="text-sm text-[#7b837b]">
                No categories found
              </p>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[700px] bg-[#f8faf8] text-[#202720]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 md:py-9 lg:px-8 lg:py-10">

        <button
          type="button"
          onClick={backToCategories}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#28783f] transition hover:text-[#236a38]"
        >
          <ArrowLeft size={17} />
          All Categories
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#202720] sm:text-3xl">
            {selectedCategoryData?.name ||
              'Category Products'}
          </h1>

          <p className="mt-1 text-sm text-[#7c857c]">
            Browse products from this category
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#899189]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-[#dce3dc] bg-white pl-11 pr-4 text-sm text-[#303830] outline-none transition focus:border-[#28783f] focus:ring-2 focus:ring-[#28783f]/10"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setSortOpen((value) => !value)
              }
              className="flex h-11 min-w-[150px] items-center justify-between gap-3 rounded-xl border border-[#dce3dc] bg-white px-4 text-sm font-medium text-[#3f4b40] shadow-sm transition hover:border-[#28783f]"
            >
              <span>
                {sort === 'relevance'
                  ? 'Relevance'
                  : sort === 'low'
                  ? 'Price Low'
                  : sort === 'high'
                  ? 'Price High'
                  : 'Name'}
              </span>

              <ChevronDown
                size={16}
                className={`text-[#28783f] transition-transform ${
                  sortOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-12 z-50 w-[170px] rounded-xl border border-[#dce5dc] bg-white p-1.5 shadow-[0_14px_35px_rgba(40,80,45,0.16)]">
                {[
                  {
                    value: 'relevance',
                    label: 'Relevance',
                  },
                  {
                    value: 'low',
                    label: 'Price Low',
                  },
                  {
                    value: 'high',
                    label: 'Price High',
                  },
                  {
                    value: 'name',
                    label: 'Name',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSort(option.value)
                      setPage(1)
                      setSortOpen(false)
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      sort === option.value
                        ? 'bg-[#28783f] font-semibold text-white'
                        : 'text-[#4f584f] hover:bg-[#edf5ed] hover:text-[#28783f]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[212px_minmax(0,1fr)]">

          <aside className="h-fit rounded-xl border border-[#e4e9e4] bg-white px-3.5 py-4 shadow-[0_3px_12px_rgba(30,70,40,0.05)] lg:sticky lg:top-5">

            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#202720]">
                Filters
              </h3>

              {(selectedBrands.length > 0 ||
                minPrice ||
                maxPrice ||
                search) && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-semibold text-[#28783f]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#687168]">
                Category
              </p>

              <button
                type="button"
                onClick={backToCategories}
                className="mt-2.5 flex w-full items-center rounded-lg bg-[#edf5ed] px-3 py-2 text-left text-[12px] font-semibold text-[#28783f]"
              >
                {selectedCategoryData?.name ||
                  'Selected Category'}
              </button>
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#687168]">
                Price Range
              </p>

              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(
                      e.target.value
                    )
                    setPage(1)
                  }}
                  placeholder="Min"
                  className="h-8 w-full min-w-0 rounded-md border border-[#d4ddd4] px-2 text-[12px] outline-none focus:border-[#28783f]"
                />

                <span className="text-[12px] text-[#7f887f]">
                  -
                </span>

                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(
                      e.target.value
                    )
                    setPage(1)
                  }}
                  placeholder="Max"
                  className="h-8 w-full min-w-0 rounded-md border border-[#d4ddd4] px-2 text-[12px] outline-none focus:border-[#28783f]"
                />
              </div>
            </div>

            {brandList.length > 0 && (
              <div className="mt-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#687168]">
                  Brands
                </p>

                <div className="mt-2.5 space-y-2">
                  {brandList
                    .slice(0, 10)
                    .map((brand) => (
                      <label
                        key={brand}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(
                            brand
                          )}
                          onChange={() =>
                            toggleBrand(
                              brand
                            )
                          }
                          className="h-3.5 w-3.5 accent-[#28783f]"
                        />

                        <span className="truncate text-[12px] text-[#626b62]">
                          {brand}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </aside>

          <section className="min-w-0">

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#7c857c]">
                Showing{' '}
                <span className="font-semibold text-[#303830]">
                  {filteredProducts.length}
                </span>{' '}
                products
              </p>
            </div>

            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map(
                  (product, index) => (
                    <ProductCard
                      key={
                        product?.id ||
                        index
                      }
                      product={product}
                      image={
                        product?.imageUrl ||
                        product?.image ||
                        fallbackImages[
                          index %
                            fallbackImages.length
                        ]
                      }
                      onProductClick={() =>
                        navigate(
                          `/product/${product.id}`
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#dce3dc] bg-white py-20 text-center">
                <p className="text-sm text-[#7b837b]">
                  No products found
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-9 flex items-center justify-center gap-2">

                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3dc] bg-white text-lg text-[#687268] disabled:opacity-30"
                >
                  ‹
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                )
                  .slice(0, 7)
                  .map((number) => (
                    <button
                      key={number}
                      onClick={() =>
                        setPage(number)
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                        page === number
                          ? 'bg-[#28783f] text-white'
                          : 'border border-[#dce3dc] bg-white text-[#687268] hover:bg-[#edf5ed] hover:text-[#28783f]'
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                <button
                  disabled={
                    page === totalPages
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3dc] bg-white text-lg text-[#687268] disabled:opacity-30"
                >
                  ›
                </button>

              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function ProductCard({
  product,
  image,
  onProductClick,
}) {
  const [adding, setAdding] = useState(false)

  const variant = getVariant(product)

  if (!variant) return null

  const price = Number(
    variant?.sellingPrice || 0
  )

  const mrp = Number(
    variant?.mrp || 0
  )

  const discount =
    mrp > price
      ? Math.round(
          ((mrp - price) / mrp) * 100
        )
      : 0

  const available =
    variant?.isAvailable !== false

  const brandName =
    getBrandName(product)

  const handleAdd = async (event) => {
    event.stopPropagation()

    if (!variant?.id || adding) return

    try {
      setAdding(true)

      await addToCart(
        variant.id,
        1
      )

      alert(
        `${product?.name || 'Product'} added to cart`
      )
    } catch (error) {
      console.error(error)

      alert(
        error?.message ||
          'Failed to add product to cart'
      )
    } finally {
      setAdding(false)
    }
  }

  return (
    <article
      onClick={onProductClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#e2e7e2] bg-white p-2.5 shadow-[0_3px_12px_rgba(30,60,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbdcca] hover:shadow-[0_8px_24px_rgba(30,60,35,0.09)]"
    >
      {discount > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-[#f39a00] px-2 py-1 text-[9px] font-bold text-white">
          {discount}% OFF
        </span>
      )}

      <div className="h-[190px] overflow-hidden rounded-lg bg-[#f1f3f0]">
        <img
          src={image}
          alt={
            product?.name ||
            'Product'
          }
          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="px-1 pb-1 pt-3">
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[#303830]">
          {product?.name}
        </h3>

        {brandName && (
          <p className="mt-1 text-[11px] font-semibold text-[#28783f]">
            {brandName}
          </p>
        )}

        <p className="mt-1.5 text-xs text-[#899189]">
          {variant?.weight || ''}
          {variant?.weight &&
          variant?.unit
            ? ` ${variant.unit}`
            : ''}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-[#252b25]">
            ₹{price.toFixed(2)}
          </span>

          {mrp > price && (
            <span className="text-xs text-[#9aa19a] line-through">
              ₹{mrp.toFixed(2)}
            </span>
          )}
        </div>

        {!available ? (
          <button
            disabled
            className="mt-3 h-9 w-full rounded-lg bg-[#eceeeb] text-xs font-medium text-[#999f99]"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={adding}
            className="mt-3 h-9 w-full rounded-lg bg-[#2b7b43] text-xs font-bold text-white transition hover:bg-[#236a38] disabled:opacity-50"
          >
            {adding
              ? 'Adding...'
              : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  )
}

export default Categories