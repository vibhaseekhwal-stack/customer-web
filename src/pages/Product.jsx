import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Heart,
  Star,
  Leaf,
} from 'lucide-react'
import {
  getProduct,
  getProducts,
  addToCart,
} from '../services/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85'

const getImage = (value) =>
  typeof value === 'string' && value.trim()
    ? value
    : fallbackImage

const getDiscount = (mrp, price) => {
  const oldPrice = Number(mrp || 0)
  const currentPrice = Number(price || 0)

  if (!oldPrice || !currentPrice || oldPrice <= currentPrice) {
    return 0
  }

  return Math.round(
    ((oldPrice - currentPrice) / oldPrice) * 100
  )
}

const getVariants = (product) =>
  Array.isArray(product?.variants)
    ? product.variants.filter(
        (variant) => variant?.isActive !== false
      )
    : []

const getProductImage = (product, variant) =>
  getImage(
    variant?.imageUrl ||
      variant?.images?.[0] ||
      product?.imageUrl ||
      product?.images?.[0]
  )

function ProductCard({ product, onOpen, onAdd }) {
  const variants = getVariants(product)
  const variant = variants[0]

  const price = Number(
    variant?.sellingPrice ||
      product?.sellingPrice ||
      product?.price ||
      0
  )

  const mrp = Number(
    variant?.mrp ||
      product?.mrp ||
      0
  )

  const discount = getDiscount(mrp, price)

  const image = getProductImage(
    product,
    variant
  )

  const unit =
    variant?.weight && variant?.unit
      ? `${variant.weight} ${variant.unit}`
      : product?.unit || ''

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e4e9e4] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(20,60,30,0.08)] sm:rounded-2xl">
      <div
        className="relative cursor-pointer"
        onClick={() => onOpen(product)}
      >
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-[#f4a000] px-1.5 py-1 text-[8px] font-bold text-white sm:left-3 sm:top-3 sm:text-[10px]">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
          }}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#16823b] shadow-sm sm:right-3 sm:top-3 sm:h-8 sm:w-8"
        >
          <Heart
            size={14}
            className="sm:h-4 sm:w-4"
          />
        </button>

        <div className="flex h-[145px] items-center justify-center bg-[#fafcf9] p-3 sm:h-[190px] sm:p-5 lg:h-[205px] xl:h-[220px]">
          <img
            src={image}
            alt={product?.name || 'Product'}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5 lg:p-4">
        <p className="line-clamp-1 text-[9px] font-semibold text-[#16823b] sm:text-[10px] lg:text-[11px]">
          {product?.brand?.name ||
            product?.brandName ||
            (typeof product?.brand === 'string'
              ? product.brand
              : 'VegGo')}
        </p>

        <button
          type="button"
          onClick={() => onOpen(product)}
          className="mt-1 text-left"
        >
          <h3 className="line-clamp-2 min-h-[32px] text-[11px] font-bold leading-4 text-[#202720] sm:min-h-[40px] sm:text-sm sm:leading-5 lg:text-[15px]">
            {product?.name}
          </h3>
        </button>

        {unit && (
          <p className="mt-1 text-[9px] text-[#858d85] sm:text-xs">
            {unit}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
          <span className="text-sm font-bold text-[#202720] sm:text-base">
            ₹{price.toFixed(0)}
          </span>

          {mrp > price && (
            <span className="text-[9px] text-[#9ba29b] line-through sm:text-xs">
              ₹{mrp.toFixed(0)}
            </span>
          )}

          {discount > 0 && (
            <span className="rounded bg-[#e9f7ed] px-1 py-0.5 text-[7px] font-bold text-[#16823b] sm:text-[9px]">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAdd(product)
          }}
          className="mt-auto flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#16823b] pt-0.5 text-[10px] font-bold text-white transition hover:bg-[#116b30] sm:mt-3 sm:h-10 sm:text-xs lg:h-11"
        >
          <ShoppingCart
            size={13}
            className="sm:h-4 sm:w-4"
          />
          Add to Cart
        </button>
      </div>
    </article>
  )
}

function Product() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedVariantId, setSelectedVariantId] =
    useState('')

  const [selectedImage, setSelectedImage] =
    useState(fallbackImage)

  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [wishlist, setWishlist] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getProduct(id)
        const data = response?.data || response

        setProduct(data)

        const variants = getVariants(data)

        if (variants.length > 0) {
          setSelectedVariantId(
            variants[0]?.id
          )

          setSelectedImage(
            getProductImage(
              data,
              variants[0]
            )
          )
        } else {
          setSelectedImage(
            getProductImage(data)
          )
        }
      } catch (err) {
        setError(
          err?.message ||
            'Unable to load product'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        setRelatedLoading(true)

        const response = await getProducts()
        const data = response?.data || response

        const products = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : []

        const filteredProducts = products
          .filter(
            (item) =>
              String(item?.id) !==
              String(id)
          )
          .slice(0, 15)

        setRelatedProducts(
          filteredProducts
        )
      } catch (err) {
        setRelatedProducts([])
      } finally {
        setRelatedLoading(false)
      }
    }

    if (id) {
      loadRelatedProducts()
    }
  }, [id])

  const variants = useMemo(
    () => getVariants(product),
    [product]
  )

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          String(variant?.id) ===
          String(selectedVariantId)
      ) ||
      variants[0] ||
      null,
    [variants, selectedVariantId]
  )

  const price = Number(
    selectedVariant?.sellingPrice ||
      product?.sellingPrice ||
      product?.price ||
      0
  )

  const mrp = Number(
    selectedVariant?.mrp ||
      product?.mrp ||
      0
  )

  const discount = getDiscount(
    mrp,
    price
  )

  const totalPrice =
    price * quantity

  const handleAddToCart = async () => {
    if (
      !selectedVariant?.id ||
      adding
    ) {
      return
    }

    try {
      setAdding(true)

      await addToCart(
        selectedVariant.id,
        quantity
      )

      setAdded(true)

      setTimeout(() => {
        setAdded(false)
      }, 1800)
    } catch (err) {
      alert(
        err?.message ||
          'Failed to add product'
      )
    } finally {
      setAdding(false)
    }
  }

  const handleRelatedAdd = async (
    relatedProduct
  ) => {
    const variants =
      getVariants(relatedProduct)

    const variant = variants[0]

    if (!variant?.id) {
      navigate(
        `/product/${relatedProduct.id}`
      )
      return
    }

    try {
      await addToCart(
        variant.id,
        1
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenProduct = (
    relatedProduct
  ) => {
    navigate(
      `/product/${relatedProduct.id}`
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f7]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#dce9df] border-t-[#16823b] sm:h-10 sm:w-10" />
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-lg font-bold sm:text-xl">
            Product not found
          </h2>

          <p className="mt-2 text-xs text-[#737c73] sm:text-sm">
            {error ||
              'Unable to load product.'}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/categories')
            }
            className="mt-5 rounded-xl bg-[#16823b] px-5 py-3 text-xs font-bold text-white sm:text-sm"
          >
            Browse Products
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f8f7]">
      <div className="mx-auto w-full max-w-[1440px] px-2.5 py-2.5 sm:px-5 sm:py-5 lg:px-8 lg:py-7 xl:px-10">
        <section className="overflow-hidden rounded-xl border border-[#e3e8e3] bg-white sm:rounded-2xl lg:rounded-3xl">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-[#e7ebe7] p-2.5 sm:p-6 md:p-7 lg:border-b-0 lg:border-r lg:p-8 xl:p-10">
              <div className="relative flex h-[270px] items-center justify-center rounded-xl bg-[#fafcf9] sm:h-[400px] md:h-[440px] lg:h-[510px] xl:h-[560px]">
                {discount > 0 && (
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-[#f4a000] px-2 py-1 text-[9px] font-bold text-white sm:left-4 sm:top-4 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                    {discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setWishlist(
                      !wishlist
                    )
                  }
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm sm:right-4 sm:top-4 sm:h-9 sm:w-9"
                >
                  <Heart
                    size={16}
                    className={
                      wishlist
                        ? 'fill-red-500 text-red-500'
                        : 'text-[#16823b]'
                    }
                  />
                </button>

                <img
                  src={selectedImage}
                  alt={
                    product?.name ||
                    'Product'
                  }
                  className="h-full w-full object-contain p-6 sm:p-9 md:p-10 lg:p-12"
                />
              </div>
            </div>

            <div className="p-4 sm:p-7 md:p-8 lg:p-9 xl:p-11">
              <span className="inline-flex rounded-md bg-[#edf7ef] px-2 py-1 text-[9px] font-bold text-[#16823b] sm:px-2.5 sm:text-[11px]">
                {product?.category?.name ||
                  'Grocery'}
              </span>

              <h1 className="mt-3 text-xl font-bold leading-tight text-[#202720] sm:mt-4 sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[36px]">
                {product?.name}
              </h1>

              <div className="mt-2.5 flex items-center gap-2 sm:mt-3">
                <span className="flex items-center gap-1 rounded-md bg-[#16823b] px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
                  4.5
                  <Star
                    size={10}
                    className="fill-white sm:h-[11px] sm:w-[11px]"
                  />
                </span>

                <span className="text-[10px] text-[#858d85] sm:text-xs">
                  Product rating
                </span>
              </div>

              {product?.description && (
                <p className="mt-3 max-w-2xl text-xs leading-5 text-[#687168] sm:mt-4 sm:text-sm sm:leading-6">
                  {product.description}
                </p>
              )}

              <div className="my-4 h-px bg-[#edf0ed] sm:my-6" />

              {variants.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#303830] sm:text-sm">
                    Select Unit
                  </h3>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                    {variants.map(
                      (variant) => {
                        const active =
                          String(
                            selectedVariant?.id
                          ) ===
                          String(
                            variant?.id
                          )

                        return (
                          <button
                            key={
                              variant?.id
                            }
                            type="button"
                            onClick={() => {
                              setSelectedVariantId(
                                variant?.id
                              )

                              setSelectedImage(
                                getProductImage(
                                  product,
                                  variant
                                )
                              )
                            }}
                            className={`min-h-[68px] rounded-xl border px-2.5 py-2 text-left transition sm:min-h-[76px] sm:px-3.5 sm:py-3 ${
                              active
                                ? 'border-[#16823b] bg-[#f1faf3]'
                                : 'border-[#dfe4df] bg-white'
                            }`}
                          >
                            <p className="text-xs font-bold sm:text-sm">
                              {
                                variant?.weight
                              }{' '}
                              {
                                variant?.unit
                              }
                            </p>

                            <p className="mt-1 text-xs font-bold text-[#202720] sm:text-sm">
                              ₹
                              {Number(
                                variant?.sellingPrice ||
                                  0
                              ).toFixed(0)}
                            </p>
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-end gap-2 sm:mt-6 sm:gap-3">
                <span className="text-2xl font-bold text-[#202720] sm:text-3xl">
                  ₹{price.toFixed(0)}
                </span>

                {mrp > price && (
                  <span className="pb-0.5 text-xs text-[#999f99] line-through sm:pb-1 sm:text-sm">
                    ₹{mrp.toFixed(0)}
                  </span>
                )}

                {discount > 0 && (
                  <span className="rounded-md bg-[#e9f7ed] px-1.5 py-0.5 text-[8px] font-bold text-[#16823b] sm:text-[9px]">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1.5 sm:mt-5 sm:gap-3">
                <div className="flex min-h-[55px] items-center gap-1.5 rounded-lg bg-[#f7faf7] px-2 py-2 sm:min-h-[65px] sm:gap-2 sm:rounded-xl sm:p-3">
                  <Truck
                    size={15}
                    className="shrink-0 text-[#16823b] sm:h-[17px] sm:w-[17px]"
                  />

                  <span className="text-[8px] font-semibold leading-3 sm:text-xs sm:leading-4">
                    Fast Delivery
                  </span>
                </div>

                <div className="flex min-h-[55px] items-center gap-1.5 rounded-lg bg-[#f7faf7] px-2 py-2 sm:min-h-[65px] sm:gap-2 sm:rounded-xl sm:p-3">
                  <Leaf
                    size={15}
                    className="shrink-0 text-[#16823b] sm:h-[17px] sm:w-[17px]"
                  />

                  <span className="text-[8px] font-semibold leading-3 sm:text-xs sm:leading-4">
                    Fresh Products
                  </span>
                </div>

                <div className="flex min-h-[55px] items-center gap-1.5 rounded-lg bg-[#f7faf7] px-2 py-2 sm:min-h-[65px] sm:gap-2 sm:rounded-xl sm:p-3">
                  <ShieldCheck
                    size={15}
                    className="shrink-0 text-[#16823b] sm:h-[17px] sm:w-[17px]"
                  />

                  <span className="text-[8px] font-semibold leading-3 sm:text-xs sm:leading-4">
                    Secure
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex h-11 w-full items-center justify-between rounded-xl border border-[#dce3dc] sm:h-12 sm:w-[140px]">
                  <button
                    type="button"
                    disabled={
                      quantity <= 1
                    }
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    className="flex h-full w-11 items-center justify-center disabled:opacity-40"
                  >
                    <Minus
                      size={15}
                    />
                  </button>

                  <span className="text-sm font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        quantity + 1
                      )
                    }
                    className="flex h-full w-11 items-center justify-center"
                  >
                    <Plus
                      size={15}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={adding}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#16823b] text-xs font-bold text-white transition hover:bg-[#116b30] disabled:bg-[#aeb8af] sm:h-12 sm:text-sm"
                >
                  <ShoppingCart
                    size={16}
                  />

                  {adding
                    ? 'Adding...'
                    : added
                    ? 'Added to Cart ✓'
                    : 'Add to Cart'}
                </button>
              </div>

              <p className="mt-2 text-right text-[10px] text-[#858d85] sm:text-xs">
                Total ₹
                {totalPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-[#e3e8e3] bg-white p-3 sm:mt-6 sm:rounded-2xl sm:p-6 lg:p-7 xl:p-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#202720] sm:text-xl md:text-2xl">
                Related Products
              </h2>

              <p className="mt-0.5 text-[10px] text-[#7b847b] sm:mt-1 sm:text-sm">
                More products you may like
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/categories'
                )
              }
              className="shrink-0 text-xs font-bold text-[#16823b] sm:text-sm"
            >
              View All
            </button>
          </div>

          {relatedLoading ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-[280px] animate-pulse rounded-xl bg-[#f0f3f0] sm:h-[340px]"
                />
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map(
                (item) => (
                  <ProductCard
                    key={item?.id}
                    product={item}
                    onOpen={
                      handleOpenProduct
                    }
                    onAdd={
                      handleRelatedAdd
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="py-10 text-center sm:py-14">
              <p className="text-xs text-[#858d85] sm:text-sm">
                No related products found.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Product