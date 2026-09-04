import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Sparkles,
  Plus,
  Minus,
  Flame,
  Check,
  ShoppingBag,
  Star
} from 'lucide-react'

function PersonalCare() {
  const navigate = useNavigate()
  const [selectedSubCategory, setSelectedSubCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // 10 Personal Care Products matching the exact style & color theme of Staples page
  const productsData = [
    {
      id: 201,
      name: 'Dove Hair Fall Rescue Shampoo',
      category: 'Hair Care',
      imageUrl: 'https://i5.walmartimages.com/asr/2a489592-433b-4c94-b84e-5795b8f86b9a.72465c004236bea9ec74e2efa1296c11.jpeg',
      badge: 'Bestseller',
      rating: 4.8,
      variants: [
        { id: '201-180ml', weight: '180 ml', price: 175, originalPrice: 195, discount: '10% OFF' },
        { id: '201-340ml', weight: '340 ml', price: 310, originalPrice: 365, discount: '15% OFF' }
      ]
    },
    {
      id: 202,
      name: 'L-Oreal Paris Total Repair 5 Shampoo',
      category: 'Hair Care',
      imageUrl: 'https://images.apollo247.in/pub/media/catalog/product/l/o/lor0267_1_.jpg',
      badge: 'Popular',
      rating: 4.7,
      variants: [
        { id: '202-360ml', weight: '360 ml', price: 340, originalPrice: 380, discount: '10% OFF' }
      ]
    },
    {
      id: 203,
      name: 'Ponds Super Light Gel Moisturizer',
      category: 'Skin Care',
      imageUrl: 'https://newassets.apollo247.com/pub/media/catalog/product/p/o/pon0263_2.jpg',
      badge: 'Top Rated',
      rating: 4.9,
      variants: [
        { id: '203-100ml', weight: '100 ml', price: 160, originalPrice: 199, discount: '20% OFF' },
        { id: '203-200ml', weight: '200 ml', price: 299, originalPrice: 375, discount: '20% OFF' }
      ]
    },
    {
      id: 204,
      name: 'Mamaearth Ubtan Face Wash with Turmeric',
      category: 'Skin Care',
      imageUrl: 'https://sugari.lk/cdn/shop/files/mamaearthubtanfw.jpg?v=1694083536&width=1445',
      badge: 'Natural',
      rating: 4.6,
      variants: [
        { id: '204-100ml', weight: '100 ml', price: 195, originalPrice: 259, discount: '25% OFF' }
      ]
    },
    {
      id: 205,
      name: 'Colgate MaxFresh Red Gel Toothpaste',
      category: 'Oral Care',
      imageUrl: 'https://cdn.osudpotro.com/medicine/COLGATE-MAXFRESH-80-GM-1611640226741.webp',
      badge: 'Essential',
      rating: 4.8,
      variants: [
        { id: '205-150g', weight: '150 g', price: 99, originalPrice: 112, discount: '12% OFF' }
      ]
    },
    {
      id: 206,
      name: 'Sensodyne Fresh Gel Toothpaste',
      category: 'Oral Care',
      imageUrl: 'https://cdn.dmart.in/images/products/SEP140000713xx0SEP25vvG150g_7_B.jpg',
      badge: 'Recommended',
      rating: 4.9,
      variants: [
        { id: '206-140g', weight: '140 g', price: 175, originalPrice: 190, discount: '8% OFF' }
      ]
    },
    {
      id: 207,
      name: 'Nivea Fresh Powerfruit Deodorant Roll On',
      category: 'Bath & Body',
      imageUrl: 'https://ecombe.nahdionline.com/media/catalog/product/1/0/100907363_a9eb0b8d03ad022aa_39645.png',
      badge: 'Fresh',
      rating: 4.7,
      variants: [
        { id: '207-50ml', weight: '50 ml', price: 185, originalPrice: 215, discount: '15% OFF' }
      ]
    },
    {
      id: 208,
      name: 'Lux Velvet Glow Soap Bar Pack of 4',
      category: 'Bath & Body',
      imageUrl: 'https://www.bbassets.com/media/uploads/p/xl/40285702_1-lux-velvet-glow-soap-with-jasmine-vitamin-e.jpg',
      badge: 'Value Pack',
      rating: 4.6,
      variants: [
        { id: '208-400g', weight: '4 x 100 g', price: 130, originalPrice: 160, discount: '18% OFF' }
      ]
    },
    {
      id: 209,
      name: 'Gillette Mach3 Sensitive Razor Blade',
      category: 'Shaving & Grooming',
      imageUrl: 'https://images.migrosone.com/macrocenter/product/34151312/34151312-e66bf1-1650x1650.jpg',
      badge: 'Smooth',
      rating: 4.9,
      variants: [
        { id: '209-1pc', weight: '1 Razor', price: 220, originalPrice: 245, discount: '10% OFF' }
      ]
    },
    {
      id: 210,
      name: 'Beardo Activated Charcoal Peel Off Mask',
      category: 'Shaving & Grooming',
      imageUrl: 'https://cdn.shopify.com/s/files/1/1857/6931/products/mnIikp0kny.jpg?v=1627007858',
      badge: 'Grooming',
      rating: 4.5,
      variants: [
        { id: '210-100g', weight: '100 g', price: 245, originalPrice: 350, discount: '30% OFF' }
      ]
    }
  ]

  const [products] = useState(productsData)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [cartQuantities, setCartQuantities] = useState({})

  const subCategories = ['All', 'Hair Care', 'Skin Care', 'Oral Care', 'Bath & Body', 'Shaving & Grooming']

  function handleVariantChange(productId, index) {
    setSelectedVariants(prev => ({ ...prev, [productId]: index }))
  }

  function handleAdd(variant) {
    setCartQuantities(prev => ({
      ...prev,
      [variant.id]: (prev[variant.id] || 0) + 1
    }))
    setSuccessToast(`Added variant (${variant.weight}) to cart!`)
    setTimeout(() => setSuccessToast(''), 2000)
  }

  function handleRemove(variant) {
    setCartQuantities(prev => {
      const current = prev[variant.id] || 0
      if (current <= 1) {
        const copy = { ...prev }
        delete copy[variant.id]
        return copy
      }
      return { ...prev, [variant.id]: current - 1 }
    })
  }

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedSubCategory === 'All' || item.category === selectedSubCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#f4f7f4] pb-28 relative">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl animate-bounce">
          <Check size={18} className="text-emerald-300" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Hero Header matching Staples exact theme */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 text-white px-4 sm:px-8 py-8 shadow-md">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                <Sparkles size={14} className="text-yellow-300" />
                <span>100% Genuine & Dermatologically Tested</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Personal Care Essentials
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-green-100 max-w-xl font-medium">
                Pamper yourself with top global and local grooming, skin, and hair care products.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-[350px]">
              <div className="flex h-12 w-full items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 backdrop-blur-md focus-within:bg-white focus-within:text-gray-900 transition">
                <Search size={18} className="text-green-200 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search personal care..."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-green-200 outline-none font-medium focus:text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {subCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                selectedSubCategory === cat
                  ? 'bg-[#16823b] text-white shadow-green-900/20'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Header Info */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <h2 className="font-display text-base sm:text-lg font-bold text-gray-900">
              {selectedSubCategory === 'All' ? 'All Personal Care Items' : `${selectedSubCategory} Collection`}
            </h2>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
              {filteredProducts.length} items
            </span>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-white border border-green-200 px-3 py-2 rounded-xl shadow-xs hover:bg-green-50 transition"
          >
            <ShoppingBag size={14} />
            <span>Go to Cart</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((item) => {
            const currentVariantIndex = selectedVariants[item.id] || 0
            const activeVariant = item.variants[currentVariantIndex] || item.variants[0]
            const qty = cartQuantities[activeVariant.id] || 0

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl bg-white p-3.5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] border border-gray-100 transition hover:shadow-lg hover:border-green-200"
              >
                <div>
                  {/* Image View with Guaranteed Render */}
                  <div className="relative flex h-36 w-full items-center justify-center rounded-xl bg-gray-50 overflow-hidden">
                    <span className="absolute left-2 top-2 z-10 rounded-lg bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold text-green-700 shadow-xs">
                      {item.badge}
                    </span>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute right-2 bottom-2 bg-black/60 backdrop-blur-xs text-white rounded-md px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" /> {item.rating}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mt-2.5">
                    <h3 className="font-display text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-green-700 transition">
                      {item.name}
                    </h3>
                  </div>

                  {/* Variant Selection Tabs */}
                  {item.variants.length > 1 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {item.variants.map((v, idx) => (
                        <button
                          key={v.id}
                          onClick={() => handleVariantChange(item.id, idx)}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition border ${
                            currentVariantIndex === idx
                              ? 'bg-emerald-50 border-green-700 text-green-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {v.weight}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Add Controls */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-display text-sm font-black text-gray-900">
                        ₹{activeVariant.price}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through font-medium">
                        ₹{activeVariant.originalPrice}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-green-700">
                      {activeVariant.discount}
                    </span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAdd(activeVariant)}
                      className="rounded-xl bg-[#16823b] px-3.5 py-1.5 text-xs font-black text-white transition hover:bg-[#116d30] shadow-sm active:scale-95"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#16823b] px-2 py-1 text-white shadow-sm">
                      <button
                        onClick={() => handleRemove(activeVariant)}
                        className="flex h-4 w-4 items-center justify-center rounded bg-emerald-800 text-[10px] font-bold hover:bg-emerald-900"
                      >
                        <Minus size={10} strokeWidth={3} />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{qty}</span>
                      <button
                        onClick={() => handleAdd(activeVariant)}
                        className="flex h-4 w-4 items-center justify-center rounded bg-emerald-800 text-[10px] font-bold hover:bg-emerald-900"
                      >
                        <Plus size={10} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PersonalCare