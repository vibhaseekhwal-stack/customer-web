import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../services/api'

const STATUS = {
  IN_STOCK: 'In Stock',
  OUT_OF_STOCK: 'Out of Stock',
  LOW_STOCK: 'Only a few left — order soon',
}

function Product() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Original product.js uses ?id=
  const productId = searchParams.get('id')

  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!productId) {
      navigate('/')
      return
    }

    loadProduct()
  }, [productId])

  async function loadProduct() {
    try {
      setLoading(true)
      setError('')

      const data = await apiFetch(`/products/${productId}`)

      setProduct(data)

      const activeVariants = (data.variants || []).filter(
        (variant) => variant.isActive
      )

      const firstAvailable =
        activeVariants.find((variant) => variant.isAvailable) ||
        activeVariants[0]

      setSelectedVariant(firstAvailable || null)
      setQuantity(1)
    } catch (err) {
      setError(err.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  function selectVariant(variant) {
    setSelectedVariant(variant)
    setQuantity(1)
    setAdded(false)
  }

  function decrement() {
    setQuantity((current) => Math.max(1, current - 1))
  }

  function increment() {
    setQuantity((current) => current + 1)
  }

  async function handleAddToCart() {
    if (!selectedVariant?.isAvailable || adding) {
      return
    }

    try {
      setAdding(true)
      setAdded(false)

      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
        }),
      })

      setAdded(true)

      setTimeout(() => {
        navigate('/cart')
      }, 500)
    } catch (err) {
      alert(err.message || 'Failed to add item to cart')
      setAdding(false)
    }
  }

  function getCategoryStyle(slug) {
    /*
     * Original product.js uses getCategoryStyle().
     *
     * If this helper already exists in your project, replace this
     * function with your existing import/helper.
     */
    const styles = {
      fruits: {
        icon: 'nutrition',
        fg: '#4d7c0f',
        tint: '#ecfccb',
      },
      vegetables: {
        icon: 'eco',
        fg: '#15803d',
        tint: '#dcfce7',
      },
      dairy: {
        icon: 'local_drink',
        fg: '#2563eb',
        tint: '#dbeafe',
      },
      beverages: {
        icon: 'local_cafe',
        fg: '#92400e',
        tint: '#fef3c7',
      },
    }

    return (
      styles[slug] || {
        icon: 'shopping_basket',
        fg: '#15803d',
        tint: '#dcfce7',
      }
    )
  }

  function resolveImageUrl(url) {
    if (!url) return ''

    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:')
    ) {
      return url
    }

    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8f4]">
        <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="-ml-2 flex h-12 w-12 items-center justify-center"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>

          <h1 className="font-display text-xl font-bold text-green-700">
            Product
          </h1>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6">
          <div className="py-20 text-center text-gray-500">
            Loading...
          </div>
        </main>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="text-center">
          <p className="mb-4 text-red-500">
            {error || 'Product not found'}
          </p>

          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const activeVariants = (product.variants || []).filter(
    (variant) => variant.isActive
  )

  const style = getCategoryStyle(product.category?.slug)

  const imageUrl = product.imageUrl
    ? resolveImageUrl(product.imageUrl)
    : null

  const mrp = Number(selectedVariant?.mrp || 0)
  const sellingPrice = Number(
    selectedVariant?.sellingPrice || 0
  )

  const hasDiscount = mrp > sellingPrice

  let stockText = STATUS.IN_STOCK
  let stockClass = 'text-green-700'

  if (!selectedVariant?.isAvailable) {
    stockText = STATUS.OUT_OF_STOCK
    stockClass = 'text-red-600'
  } else if (selectedVariant?.isLowStock) {
    stockText = STATUS.LOW_STOCK
    stockClass = 'text-orange-600'
  }

  return (
    <div className="min-h-screen bg-[#f7f8f4] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center bg-[#faf9f5] px-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-12 w-12 items-center justify-center"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <h1 className="font-display text-xl font-bold text-green-700">
          Product
        </h1>
      </header>

      {/* Product Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Product Image */}
        <div
          className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl"
          style={{
            background: imageUrl
              ? '#f0f2ec'
              : style.tint,
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="material-symbols-outlined text-[140px]"
              style={{
                color: style.fg,
                fontVariationSettings:
                  "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48",
              }}
            >
              {style.icon}
            </span>
          )}
        </div>

        {/* Brand / Category */}
        <p className="text-sm text-gray-500">
          {product.brand?.name ||
            product.category?.name ||
            ''}
        </p>

        {/* Product Name */}
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          {product.name}
        </h2>

        {/* Description */}
        {product.description && (
          <p className="mb-6 text-sm leading-6 text-gray-500">
            {product.description}
          </p>
        )}

        {/* Pack Size */}
        <h3 className="mb-2 mt-6 text-sm font-bold text-gray-500">
          Pack Size
        </h3>

        <div className="mb-6 flex flex-wrap gap-2">
          {activeVariants.map((variant) => {
            const isSelected =
              variant.id === selectedVariant?.id

            return (
              <button
                key={variant.id}
                onClick={() => selectVariant(variant)}
                className={
                  isSelected
                    ? 'rounded-full border-2 border-green-700 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700'
                    : `rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-500 ${
                        variant.isAvailable
                          ? ''
                          : 'opacity-50'
                      }`
                }
              >
                {variant.weight}
                {variant.unit}
              </button>
            )
          })}
        </div>

        {/* Price Block */}
        <div className="space-y-1 rounded-xl bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{sellingPrice.toFixed(2)}
            </span>

            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{mrp.toFixed(2)}
              </span>
            )}
          </div>

          <span
            className={`text-sm font-semibold ${stockClass}`}
          >
            {stockText}
          </span>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-[#faf9f5] p-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* Quantity */}
          <div className="flex items-center overflow-hidden rounded-lg border border-green-700">
            <button
              onClick={decrement}
              disabled={quantity <= 1 || adding}
              className="flex h-11 w-11 items-center justify-center text-green-700 disabled:opacity-40"
            >
              <span className="material-symbols-outlined">
                remove
              </span>
            </button>

            <span className="w-8 text-center text-sm font-bold">
              {quantity}
            </span>

            <button
              onClick={increment}
              disabled={adding}
              className="flex h-11 w-11 items-center justify-center text-green-700 disabled:opacity-40"
            >
              <span className="material-symbols-outlined">
                add
              </span>
            </button>
          </div>

          {/* Add To Cart */}
          <button
            onClick={handleAddToCart}
            disabled={
              !selectedVariant?.isAvailable ||
              adding
            }
            className="h-11 flex-1 rounded-lg bg-green-700 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {!selectedVariant?.isAvailable
              ? 'Out of Stock'
              : adding
                ? added
                  ? 'Added ✓'
                  : 'Adding...'
                : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Product