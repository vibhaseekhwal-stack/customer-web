import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

import {
  getCategories,
  getCategory,
  getProductsByCategory,
  addToCart,
} from '../services/api'

const fallbackImages = [
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80',
]

const categoryIcons = ['▦', '♧', '◉', '♜', '▣', '♢', '▤']

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

function Category() {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('relevance')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])

  const productsPerPage = 8

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          categoryResponse,
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          getCategory(categoryId),
          getProductsByCategory(categoryId),
          getCategories(),
        ])

        const categoryValue =
          categoryResponse?.data || categoryResponse

        const productValue =
          productsResponse?.data ||
          productsResponse?.items ||
          productsResponse ||
          []

        const categoriesValue =
          categoriesResponse?.data ||
          categoriesResponse?.items ||
          categoriesResponse ||
          []

        setCategory(categoryValue)

        setProducts(
          Array.isArray(productValue)
            ? productValue.filter(
                (product) =>
                  product?.isActive !== false &&
                  getVariant(product)
              )
            : []
        )

        setCategories(
          Array.isArray(categoriesValue)
            ? categoriesValue.filter(
                (item) => item?.isActive !== false
              )
            : []
        )
      } catch (err) {
        console.error(err)
        setError(
          err?.message || 'Unable to load products'
        )
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      loadCategory()
    }
  }, [categoryId])

  const brandList = useMemo(() => {
    const names = products
      .map((product) => getBrandName(product))
      .filter(Boolean)

    return [...new Set(names)]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (minPrice !== '') {
      result = result.filter(
        (product) =>
          getPrice(product) >= Number(minPrice)
      )
    }

    if (maxPrice !== '') {
      result = result.filter(
        (product) =>
          getPrice(product) <= Number(maxPrice)
      )
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(getBrandName(product))
      )
    }

    if (sort === 'low') {
      result.sort(
        (a, b) => getPrice(a) - getPrice(b)
      )
    }

    if (sort === 'high') {
      result.sort(
        (a, b) => getPrice(b) - getPrice(a)
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
    products,
    minPrice,
    maxPrice,
    selectedBrands,
    sort,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / productsPerPage
    )
  )

  const visibleProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  )

  const toggleBrand = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand]
    )

    setPage(1)
  }

  const changeCategory = (id) => {
    setPage(1)
    setSortOpen(false)
    navigate(`/category/${id}`)
  }

  const selectedSortLabel =
    sort === 'relevance'
      ? 'Relevance'
      : sort === 'low'
      ? 'Price Low'
      : sort === 'high'
      ? 'Price High'
      : 'Name'

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

  return (
    <main className="min-h-[700px] bg-[#f8faf8] text-[#202720]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 md:py-9 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[212px_minmax(0,1fr)]">

          <aside className="h-fit w-full rounded-xl border border-[#e4e9e4] bg-white px-3.5 py-4 shadow-[0_3px_12px_rgba(30,70,40,0.05)] lg:sticky lg:top-5">

            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#202720]">
                Filters
              </h3>

              {(minPrice ||
                maxPrice ||
                selectedBrands.length > 0) && (
                <button
                  onClick={() => {
                    setMinPrice('')
                    setMaxPrice('')
                    setSelectedBrands([])
                    setPage(1)
                  }}
                  className="text-[10px] font-semibold text-[#28783f] transition hover:text-[#1f6233]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#687168]">
                Price Range
              </p>

              <div className="mt-2 flex items-center gap-1.5">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Min"
                  className="h-8 w-full min-w-0 rounded-md border border-[#d4ddd4] bg-white px-2 text-[12px] text-[#303830] outline-none transition placeholder:text-[#9ba29b] focus:border-[#28783f] focus:ring-1 focus:ring-[#28783f]/10"
                />

                <span className="text-[12px] text-[#7f887f]">
                  -
                </span>

                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Max"
                  className="h-8 w-full min-w-0 rounded-md border border-[#d4ddd4] bg-white px-2 text-[12px] text-[#303830] outline-none transition placeholder:text-[#9ba29b] focus:border-[#28783f] focus:ring-1 focus:ring-[#28783f]/10"
                />
              </div>

              <div className="relative mt-3 h-[5px] rounded-full bg-[#dce3dc]">
                <div className="absolute left-0 top-0 h-full w-[58%] rounded-full bg-[#28783f]" />

                <div className="absolute left-[55%] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-[#28783f] bg-white shadow-sm" />
              </div>
            </div>

            {brandList.length > 0 && (
              <div className="mt-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#687168]">
                  Brands
                </p>

                <div className="mt-2.5 space-y-2">
                  {brandList.slice(0, 6).map((brand) => (
                    <label
                      key={brand}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-[#cbd5cc] accent-[#28783f]"
                      />

                      <span className="truncate text-[12px] leading-4 text-[#626b62]">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="min-w-0">
            <div className="rounded-xl border border-[#e4eae4] bg-white p-5 shadow-[0_4px_18px_rgba(30,70,40,0.04)] sm:p-6 lg:p-7">

              <div>
                <p className="text-sm font-semibold text-[#566056]">
                  Shop by Category
                </p>

                <div className="mt-4 flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.slice(0, 8).map((item, index) => {
                    const active =
                      String(item?.id) ===
                      String(categoryId)

                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          changeCategory(item.id)
                        }
                        className="group flex min-w-[72px] flex-col items-center"
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg transition-all ${
                            active
                              ? 'bg-[#28783f] text-white shadow-[0_6px_16px_rgba(40,120,63,0.25)]'
                              : 'bg-[#edf2ed] text-[#687268] group-hover:bg-[#e1ebe2] group-hover:text-[#28783f]'
                          }`}
                        >
                          {categoryIcons[
                            index % categoryIcons.length
                          ]}
                        </span>

                        <span
                          className={`mt-2 max-w-[80px] truncate text-xs ${
                            active
                              ? 'font-bold text-[#28783f]'
                              : 'text-[#687268]'
                          }`}
                        >
                          {item?.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 border-b border-[#e4e9e4] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#202720] sm:text-3xl">
                    {category?.name || 'Groceries'}
                  </h1>

                  <p className="mt-1 text-sm text-[#7c857c]">
                    Showing {filteredProducts.length} products
                  </p>
                </div>

                <div className="relative flex items-center gap-2">
                  <span className="text-sm text-[#737c73]">
                    Sort by:
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setSortOpen((value) => !value)
                      }
                      className={`flex h-10 min-w-[130px] items-center justify-between gap-3 rounded-lg border bg-white px-3.5 text-sm font-medium text-[#3f4b40] shadow-sm outline-none transition-all ${
                        sortOpen
                          ? 'border-[#28783f] ring-2 ring-[#28783f]/10'
                          : 'border-[#b8cdb9] hover:border-[#28783f]'
                      }`}
                    >
                      <span>{selectedSortLabel}</span>

                      <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className={`text-[#28783f] transition-transform duration-200 ${
                          sortOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {sortOpen && (
                      <div className="absolute right-0 top-[46px] z-50 w-[165px] overflow-hidden rounded-xl border border-[#dce5dc] bg-white p-1.5 shadow-[0_14px_35px_rgba(40,80,45,0.16)]">
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
              </div>

              {visibleProducts.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((product, index) => (
                    <ProductCard
                      key={product?.id || index}
                      product={product}
                      image={
                        product?.imageUrl ||
                        product?.image ||
                        fallbackImages[
                          index % fallbackImages.length
                        ]
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-[#dce3dc] bg-[#fbfcfb] py-20 text-center">
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
                        Math.max(1, current - 1)
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3dc] bg-white text-lg text-[#687268] transition hover:bg-[#edf5ed] hover:text-[#28783f] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .slice(0, 5)
                    .map((number) => (
                      <button
                        key={number}
                        onClick={() => setPage(number)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                          page === number
                            ? 'bg-[#28783f] text-white shadow-sm'
                            : 'border border-[#dce3dc] bg-white text-[#687268] hover:bg-[#edf5ed] hover:text-[#28783f]'
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3dc] bg-white text-lg text-[#687268] transition hover:bg-[#edf5ed] hover:text-[#28783f] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function ProductCard({ product, image }) {
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

  const brandName = getBrandName(product)

  const handleAdd = async (event) => {
    event.stopPropagation()

    if (!variant?.id || adding) return

    try {
      setAdding(true)
      await addToCart(variant.id, 1)
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#e2e7e2] bg-white p-2.5 shadow-[0_3px_12px_rgba(30,60,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cbdcca] hover:shadow-[0_8px_24px_rgba(30,60,35,0.09)]">

      {discount > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-[#f39a00] px-2 py-1 text-[9px] font-bold text-white shadow-sm">
          {discount}% OFF
        </span>
      )}

      <div className="h-[170px] overflow-hidden rounded-lg bg-[#f1f3f0]">
        <img
          src={image}
          alt={product?.name || 'Product'}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
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
          {variant?.weight && variant?.unit
            ? ` ${variant.unit}`
            : ''}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-[#252b25]">
            ${price.toFixed(2)}
          </span>

          {mrp > price && (
            <span className="text-xs text-[#9aa19a] line-through">
              ${mrp.toFixed(2)}
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
            className="mt-3 h-9 w-full rounded-lg bg-[#2b7b43] text-xs font-bold text-white transition hover:bg-[#236a38] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  )
}

export default Category