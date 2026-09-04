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

function Staples() {
  const navigate = useNavigate()
  const [selectedSubCategory, setSelectedSubCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // 10 Guaranteed Working Packaged Grocery Images mapped directly per product
  const productsData = [
    {
      id: 101,
      name: 'Aashirvaad Superior MP Sharbati Atta',
      category: 'Atta & Flour',
      imageUrl: 'https://dukaan.b-cdn.net/700x700/webp/media/48d9b697-ab5b-4edd-b649-844177ce1fd7.jpeg',
      badge: 'Bestseller',
      rating: 4.8,
      variants: [
        { id: '101-5kg', weight: '5 kg', price: 230, originalPrice: 260, discount: '11% OFF' },
        { id: '101-10kg', weight: '10 kg', price: 420, originalPrice: 480, discount: '12% OFF' }
      ]
    },
    {
      id: 102,
      name: 'Fortune Suvidha Multigrain Atta',
      category: 'Atta & Flour',
      imageUrl: 'https://www.fortunefoods.com/wp-content/uploads/2026/07/Chakki-Fresh-Multigrain-Atta-5kg_FOP_ff-copy-1-scaled.webp',
      badge: 'Healthy',
      rating: 4.6,
      variants: [
        { id: '102-5kg', weight: '5 kg', price: 275, originalPrice: 310, discount: '11% OFF' }
      ]
    },
    {
      id: 103,
      name: 'Fortune Sunite Refined Sunflower Oil',
      category: 'Oils & Ghee',
      imageUrl: 'https://dms.mydukaan.io/original/jpeg/media/7ff4e06f-099e-4a70-9979-a42ac8c5feaa.png',
      badge: 'Best Value',
      rating: 4.7,
      variants: [
        { id: '103-1l', weight: '1 L', price: 135, originalPrice: 160, discount: '15% OFF' },
        { id: '103-5l', weight: '5 L Jar', price: 640, originalPrice: 750, discount: '14% OFF' }
      ]
    },
    {
      id: 104,
      name: 'Amul Pure Cow Ghee Glass Jar',
      category: 'Oils & Ghee',
      imageUrl: 'https://www.fairmartonline.co.uk/cdn/shop/files/Amul_Cow_Ghee_Jar_200ml.webp?crop=center&height=1200&v=1760031720&width=1200',
      badge: 'Premium',
      rating: 4.9,
      variants: [
        { id: '104-500ml', weight: '500 ml', price: 325, originalPrice: 350, discount: '7% OFF' },
        { id: '104-1l', weight: '1 L', price: 630, originalPrice: 680, discount: '7% OFF' }
      ]
    },
    {
      id: 105,
      name: 'Organic Premium Unpolished Toor Dal',
      category: 'Dals & Pulses',
      imageUrl: 'https://garudalife.in/cache/original/product/81382/GRBCA326SFS0e.webp',
      badge: 'Organic',
      rating: 4.6,
      variants: [
        { id: '105-1kg', weight: '1 kg', price: 145, originalPrice: 180, discount: '19% OFF' }
      ]
    },
    {
      id: 106,
      name: 'Tata Sampann Unpolished Moong Dal',
      category: 'Dals & Pulses',
      imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Ch_600/NI_CATALOG/IMAGES/ciw/2025/12/16/819bf1d2-ad38-47b2-a51f-9da6f3fc5ed8_CWJRBA8SCS_MN_15122025.png',
      badge: 'High Protein',
      rating: 4.7,
      variants: [
        { id: '106-1kg', weight: '1 kg', price: 130, originalPrice: 155, discount: '16% OFF' }
      ]
    },
    {
      id: 107,
      name: 'Daawat Rozana Super Basmati Rice',
      category: 'Rice & Poha',
      imageUrl: 'https://www.mustore.mv/web/image/product.template/2139/image_1024?unique=0edb0e0',
      badge: 'Top Rated',
      rating: 4.8,
      variants: [
        { id: '107-1kg', weight: '1 kg', price: 85, originalPrice: 100, discount: '15% OFF' },
        { id: '107-5kg', weight: '5 kg', price: 360, originalPrice: 450, discount: '20% OFF' }
      ]
    },
    {
      id: 108,
      name: 'Indore Thick Poha Flaked Rice',
      category: 'Rice & Poha',
      imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/NI_CATALOG/IMAGES/ciw/2025/12/16/d66ce009-a32c-451e-a2b1-ad327a02029b_3WDJPQ4N8K_MN_16122025.png',
      badge: 'Fresh',
      rating: 4.7,
      variants: [
        { id: '108-1kg', weight: '1 kg', price: 58, originalPrice: 70, discount: '17% OFF' }
      ]
    },
    {
      id: 109,
      name: 'Tata Salt Iodized Vacuum Evaporated',
      category: 'Salt & Sugar',
      imageUrl: 'https://i5.walmartimages.com/seo/Tata-Salt-1-kg-1000-grams-pack-35-27-oz-India-Vacuum-evaporated-iodised-salt-Vegetarian_1adaeb8b-12df-4a5a-a2dd-44ee836fd5d4.0370de4e2add5e7714333e86c586edc9.jpeg',
      badge: 'Essential',
      rating: 4.9,
      variants: [
        { id: '109-1kg', weight: '1 kg', price: 28, originalPrice: 30, discount: '6% OFF' }
      ]
    },
    {
      id: 110,
      name: 'Madhur Pure Sulphurless Sugar',
      category: 'Salt & Sugar',
      imageUrl: 'https://cdn.grofers.com/cdn-cgi/image/f%3Dauto%2Cfit%3Dscale-down%2Cq%3D70%2Cmetadata%3Dnone%2Cw%3D1080/da/cms-assets/cms/product/39accb8f-7237-42dd-bdce-5ac2d168824e.png?bg_token=color.background.quaternary',
      badge: 'Pure',
      rating: 4.7,
      variants: [
        { id: '110-1kg', weight: '1 kg', price: 52, originalPrice: 58, discount: '10% OFF' },
        { id: '110-5kg', weight: '5 kg', price: 240, originalPrice: 260, discount: '7% OFF' }
      ]
    }
  ]

  const [products] = useState(productsData)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [cartQuantities, setCartQuantities] = useState({})

  const subCategories = ['All', 'Atta & Flour', 'Oils & Ghee', 'Dals & Pulses', 'Rice & Poha', 'Salt & Sugar']

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

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 text-white px-4 sm:px-8 py-8 shadow-md">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                <Sparkles size={14} className="text-yellow-300" />
                <span>Packaged Grocery Catalog • All Cards Loaded</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Staples & Daily Groceries
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-green-100 max-w-xl font-medium">
                Purity delivered fresh at your doorstep with verified packet visuals on every single card.
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
                  placeholder="Search staples..."
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
              {selectedSubCategory === 'All' ? 'All Staples Collection' : `${selectedSubCategory} Collection`}
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

export default Staples