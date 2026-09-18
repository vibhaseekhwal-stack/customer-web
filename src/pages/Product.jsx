import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Heart,
  Check,
  ChevronDown,
  Star,
  Clock3,
  Leaf,
  PackageCheck,
} from 'lucide-react'

import {
  getProduct,
  addToCart,
} from '../services/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=90'

function getImageUrl(value) {
  if (!value || typeof value !== 'string') {
    return fallbackImage
  }

  return value
}

function getProductImages(product) {
  const images = []

  if (product?.imageUrl) {
    images.push(getImageUrl(product.imageUrl))
  }

  if (Array.isArray(product?.images)) {
    product.images.forEach((image) => {
      if (image && !images.includes(image)) {
        images.push(getImageUrl(image))
      }
    })
  }

  if (Array.isArray(product?.variants)) {
    product.variants.forEach((variant) => {
      if (variant?.imageUrl) {
        const image = getImageUrl(variant.imageUrl)

        if (!images.includes(image)) {
          images.push(image)
        }
      }

      if (Array.isArray(variant?.images)) {
        variant.images.forEach((image) => {
          const imageUrl = getImageUrl(image)

          if (!images.includes(imageUrl)) {
            images.push(imageUrl)
          }
        })
      }
    })
  }

  return images.length > 0 ? images : [fallbackImage]
}

function getActiveVariants(product) {
  return Array.isArray(product?.variants)
    ? product.variants.filter(
        (variant) => variant?.isActive !== false
      )
    : []
}

function getDiscount(mrp, price) {
  const mrpValue = Number(mrp || 0)
  const priceValue = Number(price || 0)

  if (
    mrpValue <= 0 ||
    priceValue <= 0 ||
    mrpValue <= priceValue
  ) {
    return 0
  }

  return Math.round(
    ((mrpValue - priceValue) / mrpValue) * 100
  )
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

function Product() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVariantId, setSelectedVariantId] =
    useState('')
  const [selectedImage, setSelectedImage] =
    useState('')
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError('')

        const data = await getProduct(id)
        const productData = data?.data || data

        setProduct(productData)

        const variants =
          getActiveVariants(productData)

        if (variants.length > 0) {
          setSelectedVariantId(variants[0].id)

          const firstVariantImage =
            variants[0]?.imageUrl ||
            variants[0]?.images?.[0]

          const firstImage =
            firstVariantImage ||
            productData?.imageUrl ||
            productData?.images?.[0] ||
            fallbackImage

          setSelectedImage(
            getImageUrl(firstImage)
          )
        } else {
          setSelectedImage(
            getImageUrl(
              productData?.imageUrl ||
                productData?.images?.[0]
            )
          )
        }
      } catch (err) {
        console.error('Product detail API error:', err)

        setError(
          err?.message ||
            'Unable to load product'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const variants = useMemo(
    () => getActiveVariants(product),
    [product]
  )

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (variant) =>
          String(variant.id) ===
          String(selectedVariantId)
      ) ||
      variants[0] ||
      null
    )
  }, [variants, selectedVariantId])

  const productImages = useMemo(
    () => getProductImages(product),
    [product]
  )

  const price = Number(
    selectedVariant?.sellingPrice || 0
  )

  const mrp = Number(
    selectedVariant?.mrp || 0
  )

  const discount = getDiscount(mrp, price)

  const available =
    selectedVariant?.isAvailable !== false

  const totalPrice = price * quantity

  const savings =
    mrp > price
      ? (mrp - price) * quantity
      : 0

  const brandName = getBrandName(product)

  useEffect(() => {
    if (!product) return

    document.title = `${product.name || 'Product'} | VegGo`

    const description =
      product.description ||
      `Buy ${product.name || 'product'} online from VegGo.`

    let meta = document.querySelector(
      'meta[name="description"]'
    )

    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(
        'name',
        'description'
      )
      document.head.appendChild(meta)
    }

    meta.setAttribute(
      'content',
      description
    )
  }, [product])

  const handleVariantChange = (variant) => {
    setSelectedVariantId(variant.id)
    setQuantity(1)

    const variantImage =
      variant?.imageUrl ||
      variant?.images?.[0]

    if (variantImage) {
      setSelectedImage(
        getImageUrl(variantImage)
      )
    }
  }

  const handleAddToCart = async () => {
    if (
      !selectedVariant?.id ||
      adding ||
      !available
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
      console.error(
        'Add to cart error:',
        err
      )

      alert(
        err?.message ||
          'Failed to add product to cart'
      )
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf8]">
        <div className="flex min-h-[75vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#dce9df] border-t-[#28783f]" />
            <p className="text-sm font-semibold text-[#7b857b]">
              Loading product...
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf8] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-500">
            !
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#202720]">
            Product not found
          </h2>

          <p className="mt-2 text-sm text-[#7c857c]">
            {error ||
              'Unable to load product details.'}
          </p>

          <button
            onClick={() => navigate('/home')}
            className="mt-6 rounded-xl bg-[#28783f] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#236a38]"
          >
            Back to Home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8faf8] text-[#202720]">

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-12 pt-4 sm:px-6 lg:px-8">

        <div className="mb-5 flex items-center gap-2 text-xs text-[#778077]">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 font-medium transition hover:text-[#28783f]"
          >
            <ArrowLeft size={14} />
            Home
          </button>

          <span>/</span>

          <button
            onClick={() => {
              if (product?.category?.id) {
                navigate(
                  `/category/${product.category.id}`
                )
              } else {
                navigate('/categories')
              }
            }}
            className="transition hover:text-[#28783f]"
          >
            {product?.category?.name ||
              'Groceries'}
          </button>

          <span>/</span>

          <span className="max-w-[220px] truncate text-[#9aa19a]">
            {product.name}
          </span>
        </div>

        <section className="grid overflow-hidden rounded-2xl border border-[#e4e9e4] bg-white shadow-[0_4px_18px_rgba(25,70,35,0.05)] lg:grid-cols-[52%_48%]">

          <div className="relative border-b border-[#e8ece8] bg-white p-4 sm:p-7 lg:border-b-0 lg:border-r lg:p-9">

            <button
              type="button"
              onClick={() =>
                setWishlist(
                  (current) => !current
                )
              }
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e6e0] bg-white shadow-sm transition hover:scale-105"
            >
              <Heart
                size={19}
                className={
                  wishlist
                    ? 'fill-red-500 text-red-500'
                    : 'text-[#687268]'
                }
              />
            </button>

            {discount > 0 && (
              <span className="absolute left-5 top-5 z-20 rounded-md bg-[#f39a00] px-3 py-1.5 text-[11px] font-bold text-white">
                {discount}% OFF
              </span>
            )}

            <div className="flex min-h-[390px] items-center justify-center rounded-2xl bg-[#f7f9f6] p-8 sm:min-h-[510px] lg:min-h-[570px]">
              <img
                src={
                  selectedImage ||
                  productImages[0]
                }
                alt={product.name}
                className="max-h-[500px] w-full object-contain transition duration-500 hover:scale-[1.025]"
              />
            </div>

            {productImages.length > 0 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {productImages.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white transition ${
                        selectedImage === image
                          ? 'border-[#28783f] ring-2 ring-[#28783f]/15'
                          : 'border-[#e1e7e1] hover:border-[#b9cdbb]'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-8 lg:p-10 xl:p-12">

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#edf7ef] px-3 py-1 text-[11px] font-bold text-[#28783f]">
                  {product?.category?.name ||
                    'Fresh Grocery'}
                </span>

                {available && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#28783f]">
                    <Check size={13} />
                    In Stock
                  </span>
                )}
              </div>

              <h1 className="mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-[#202720] sm:text-3xl lg:text-[38px]">
                {product.name}
              </h1>

              {brandName && (
                <p className="mt-2 text-sm font-semibold text-[#28783f]">
                  {brandName}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">

                <div className="flex items-center gap-1 rounded-md bg-[#28783f] px-2.5 py-1.5 text-xs font-bold text-white">
                  4.5
                  <Star
                    size={12}
                    className="fill-white"
                  />
                </div>

                <span className="text-xs text-[#8a928a]">
                  Product quality rating
                </span>

                <span className="h-1 w-1 rounded-full bg-[#cbd1cb]" />

                <span className="text-xs text-[#8a928a]">
                  Fresh & verified
                </span>
              </div>

              {product?.description && (
                <p className="mt-5 max-w-2xl text-sm leading-6 text-[#697269]">
                  {product.description}
                </p>
              )}
            </div>

            <div className="my-7 h-px bg-[#e8ece8]" />

            {variants.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#303830]">
                    Select Unit
                  </h2>

                  <span className="text-xs text-[#8b938b]">
                    {variants.length} option
                    {variants.length > 1
                      ? 's'
                      : ''}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {variants.map(
                    (variant) => {
                      const variantPrice =
                        Number(
                          variant?.sellingPrice ||
                            0
                        )

                      const variantMrp =
                        Number(
                          variant?.mrp || 0
                        )

                      const variantDiscount =
                        getDiscount(
                          variantMrp,
                          variantPrice
                        )

                      const active =
                        String(
                          selectedVariant?.id
                        ) ===
                        String(
                          variant.id
                        )

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() =>
                            handleVariantChange(
                              variant
                            )
                          }
                          className={`relative rounded-xl border px-4 py-3 text-left transition ${
                            active
                              ? 'border-[#28783f] bg-[#f2faf3] shadow-sm'
                              : 'border-[#dce2dc] bg-white hover:border-[#28783f]'
                          }`}
                        >
                          {active && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#28783f] text-white">
                              <Check
                                size={12}
                              />
                            </span>
                          )}

                          {variantDiscount >
                            0 && (
                            <span className="mb-1 inline-block rounded bg-[#eaf3ff] px-1.5 py-0.5 text-[8px] font-bold text-[#3675c5]">
                              {
                                variantDiscount
                              }% OFF
                            </span>
                          )}

                          <p className="text-sm font-bold text-[#303830]">
                            {variant.weight}{' '}
                            {variant.unit}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-[#202720]">
                              ₹
                              {variantPrice.toFixed(
                                0
                              )}
                            </span>

                            {variantMrp >
                              variantPrice && (
                              <span className="text-[10px] text-[#999f99] line-through">
                                ₹
                                {variantMrp.toFixed(
                                  0
                                )}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    }
                  )}
                </div>
              </div>
            )}

            <div className="my-7 h-px bg-[#e8ece8]" />

            <div>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-bold tracking-tight text-[#202720]">
                  ₹{price.toFixed(0)}
                </span>

                {mrp > price && (
                  <span className="pb-1 text-lg text-[#9ba29b] line-through">
                    ₹{mrp.toFixed(0)}
                  </span>
                )}

                {discount > 0 && (
                  <span className="mb-1 rounded-md bg-[#e9f7ed] px-2.5 py-1 text-xs font-bold text-[#28783f]">
                    Save ₹
                    {(mrp - price).toFixed(
                      0
                    )}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-xs text-[#899189]">
                Inclusive of all taxes
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-[#e3e9e3] bg-[#fbfcfb] p-4">
              <div className="grid gap-4 sm:grid-cols-3">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ed]">
                    <Truck
                      size={18}
                      className="text-[#28783f]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#303830]">
                      Fast Delivery
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#899189]">
                      Doorstep delivery
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ed]">
                    <Leaf
                      size={18}
                      className="text-[#28783f]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#303830]">
                      Fresh Products
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#899189]">
                      Quality checked
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ed]">
                    <ShieldCheck
                      size={18}
                      className="text-[#28783f]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#303830]">
                      Secure Shopping
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#899189]">
                      Safe & simple
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-7">
              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="flex h-12 w-full items-center justify-between overflow-hidden rounded-xl border border-[#dce3dc] bg-white sm:w-[145px]">
                  <button
                    type="button"
                    disabled={
                      quantity === 1
                    }
                    onClick={() =>
                      setQuantity(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    className="flex h-full w-12 items-center justify-center text-[#596259] transition hover:bg-[#f3f6f3] disabled:opacity-40"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="text-sm font-bold text-[#303830]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (current) =>
                          current + 1
                      )
                    }
                    className="flex h-full w-12 items-center justify-center text-[#596259] transition hover:bg-[#f3f6f3]"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    adding ||
                    !available
                  }
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#16823b] px-6 text-sm font-bold text-white shadow-[0_7px_18px_rgba(22,130,59,0.18)] transition hover:bg-[#116b30] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#b8c0b8]"
                >
                  <ShoppingCart
                    size={18}
                  />

                  {!available
                    ? 'Out of Stock'
                    : adding
                    ? 'Adding...'
                    : added
                    ? 'Added to Cart ✓'
                    : 'Add to Cart'}
                </button>

              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-[#899189]">
                  Total:
                  <span className="ml-1 font-bold text-[#303830]">
                    ₹
                    {totalPrice.toFixed(
                      0
                    )}
                  </span>
                </p>

                {savings > 0 && (
                  <p className="text-xs font-bold text-[#28783f]">
                    You save ₹
                    {savings.toFixed(
                      0
                    )}
                  </p>
                )}
              </div>
            </div>

          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="flex items-center gap-4 rounded-xl border border-[#e3e9e3] bg-white p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf6ed]">
              <Clock3
                size={20}
                className="text-[#28783f]"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#303830]">
                Quick Delivery
              </h3>

              <p className="mt-1 text-xs text-[#899189]">
                Get your order delivered conveniently.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[#e3e9e3] bg-white p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf6ed]">
              <PackageCheck
                size={20}
                className="text-[#28783f]"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#303830]">
                Quality Assured
              </h3>

              <p className="mt-1 text-xs text-[#899189]">
                Carefully listed and verified products.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[#e3e9e3] bg-white p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf6ed]">
              <ShieldCheck
                size={20}
                className="text-[#28783f]"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#303830]">
                Secure Shopping
              </h3>

              <p className="mt-1 text-xs text-[#899189]">
                Simple and secure shopping experience.
              </p>
            </div>
          </div>

        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e3e9e3] bg-white">

          <div className="border-b border-[#e8ece8] px-5 py-5 sm:px-7">
            <h2 className="text-xl font-bold text-[#202720]">
              Product Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2">

            <div className="border-b border-[#e8ece8] px-5 py-5 sm:px-7 md:border-r">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#899189]">
                Product Name
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#303830]">
                {product.name}
              </p>
            </div>

            <div className="border-b border-[#e8ece8] px-5 py-5 sm:px-7">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#899189]">
                Brand
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#303830]">
                {brandName || 'VegGo'}
              </p>
            </div>

            <div className="border-b border-[#e8ece8] px-5 py-5 sm:px-7 md:border-r">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#899189]">
                Category
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#303830]">
                {product?.category?.name ||
                  'Groceries'}
              </p>
            </div>

            <div className="border-b border-[#e8ece8] px-5 py-5 sm:px-7">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#899189]">
                Selected Unit
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#303830]">
                {selectedVariant?.weight || ''}{' '}
                {selectedVariant?.unit || ''}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-7 md:border-r">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#899189]">
                SKU
              </p>

              <p className="mt-1.5 text-sm font-semibold text-[#303830]">
                {selectedVariant?.sku ||
                  'N/A'}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-7">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#899189]">
                Availability
              </p>

              <p
                className={`mt-1.5 text-sm font-bold ${
                  available
                    ? 'text-[#28783f]'
                    : 'text-red-500'
                }`}
              >
                {available
                  ? 'In Stock'
                  : 'Out of Stock'}
              </p>
            </div>

          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#e3e9e3] bg-white p-5 sm:p-7">

          <h2 className="text-xl font-bold text-[#202720]">
            About this product
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-7 text-[#697269]">
            {product.description ||
              `Buy ${product.name} online from VegGo. Get quality products delivered conveniently to your doorstep.`}
          </p>

        </section>

        <section className="mt-5 rounded-2xl border border-[#e3e9e3] bg-white p-5 sm:p-7">

          <h2 className="text-xl font-bold text-[#202720]">
            Key Features
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {[
              [
                'Quality Product',
                'Carefully selected products for everyday shopping.',
              ],
              [
                'Fresh Products',
                'Products listed with available stock and pricing.',
              ],
              [
                'Multiple Units',
                'Choose the pack size that suits your needs.',
              ],
              [
                'Doorstep Delivery',
                'Order online and receive products conveniently.',
              ],
            ].map(
              ([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl bg-[#f7faf7] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e3f3e6]">
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="text-[#28783f]"
                      />
                    </span>

                    <div>
                      <p className="text-sm font-bold text-[#303830]">
                        {title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#899189]">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}

          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#e3e9e3] bg-white p-5 sm:p-7">

          <h2 className="text-xl font-bold text-[#202720]">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 divide-y divide-[#e8ece8] border-y border-[#e8ece8]">

            {[
              {
                question: `What is ${product.name}?`,
                answer:
                  product.description ||
                  `${product.name} is available for online purchase through VegGo.`,
              },
              {
                question:
                  'What unit sizes are available?',
                answer:
                  variants.length > 0
                    ? variants
                        .map(
                          (variant) =>
                            `${variant.weight} ${variant.unit}`
                        )
                        .join(', ')
                    : 'Unit information is currently unavailable.',
              },
              {
                question:
                  'Is this product currently available?',
                answer: available
                  ? 'Yes, the selected product unit is currently available.'
                  : 'The selected product unit is currently out of stock.',
              },
              {
                question:
                  'How can I order this product?',
                answer:
                  'Select your preferred unit and quantity, then tap Add to Cart.',
              },
            ].map(
              (faq, index) => (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        openFaq === index
                          ? null
                          : index
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-[#303830]">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-[#28783f] transition-transform ${
                        openFaq === index
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
                  </button>

                  {openFaq === index && (
                    <p className="pb-5 pr-8 text-sm leading-6 text-[#737c73]">
                      {faq.answer}
                    </p>
                  )}
                </div>
              )
            )}

          </div>
        </section>

      </div>
    </main>
  )
}

export default Product