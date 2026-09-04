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

function Deals() {
  const navigate = useNavigate()
  const [selectedSubCategory, setSelectedSubCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [successToast, setSuccessToast] = useState('')

  // 10 Hot Deals & Discounted Products matching the exact Staples page styling & theme
  const productsData = [
    {
      id: 301,
      name: 'Aashirvaad Superior MP Sharbati Atta',
      category: 'Atta & Flour',
      imageUrl: 'https://dukaan.b-cdn.net/700x700/webp/media/48d9b697-ab5b-4edd-b649-844177ce1fd7.jpeg',
      badge: 'Super Saver',
      rating: 4.8,
      variants: [
        { id: '301-5kg', weight: '5 kg', price: 210, originalPrice: 260, discount: '19% OFF' },
        { id: '301-10kg', weight: '10 kg', price: 399, originalPrice: 480, discount: '17% OFF' }
      ]
    },
    {
      id: 302,
      name: 'Fortune Sunite Refined Sunflower Oil',
      category: 'Oils & Ghee',
      imageUrl: 'https://dms.mydukaan.io/original/jpeg/media/7ff4e06f-099e-4a70-9979-a42ac8c5feaa.png',
      badge: 'Mega Deal',
      rating: 4.7,
      variants: [
        { id: '302-1l', weight: '1 L', price: 119, originalPrice: 160, discount: '25% OFF' },
        { id: '302-5l', weight: '5 L Jar', price: 599, originalPrice: 750, discount: '20% OFF' }
      ]
    },
    {
      id: 303,
      name: 'Amul Pure Cow Ghee Glass Jar',
      category: 'Oils & Ghee',
      imageUrl: 'https://www.fairmartonline.co.uk/cdn/shop/files/Amul_Cow_Ghee_Jar_200ml.webp?crop=center&height=1200&v=1760031720&width=1200',
      badge: 'Limited Offer',
      rating: 4.9,
      variants: [
        { id: '303-500ml', weight: '500 ml', price: 299, originalPrice: 350, discount: '15% OFF' },
        { id: '303-1l', weight: '1 L', price: 579, originalPrice: 680, discount: '15% OFF' }
      ]
    },
    {
      id: 304,
      name: 'Organic Premium Unpolished Toor Dal',
      category: 'Dals & Pulses',
      imageUrl: 'https://garudalife.in/cache/original/product/81382/GRBCA326SFS0e.webp',
      badge: 'Flash Deal',
      rating: 4.6,
      variants: [
        { id: '304-1kg', weight: '1 kg', price: 129, originalPrice: 180, discount: '28% OFF' }
      ]
    },
    {
      id: 305,
      name: 'Tata Sampann Unpolished Moong Dal',
      category: 'Dals & Pulses',
      imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Ch_600/NI_CATALOG/IMAGES/ciw/2025/12/16/819bf1d2-ad38-47b2-a51f-9da6f3fc5ed8_CWJRBA8SCS_MN_15122025.png',
      badge: 'Best Value',
      rating: 4.7,
      variants: [
        { id: '305-1kg', weight: '1 kg', price: 109, originalPrice: 155, discount: '30% OFF' }
      ]
    },
    {
      id: 306,
      name: 'Daawat Rozana Super Basmati Rice',
      category: 'Rice & Poha',
      imageUrl: 'https://www.mustore.mv/web/image/product.template/2139/image_1024?unique=0edb0e0',
      badge: 'Combo Offer',
      rating: 4.8,
      variants: [
        { id: '306-1kg', weight: '1 kg', price: 75, originalPrice: 100, discount: '25% OFF' },
        { id: '306-5kg', weight: '5 kg', price: 320, originalPrice: 450, discount: '29% OFF' }
      ]
    },
    {
      id: 307,
      name: 'Indore Thick Poha Flaked Rice',
      category: 'Rice & Poha',
      imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/NI_CATALOG/IMAGES/ciw/2025/12/16/d66ce009-a32c-451e-a2b1-ad327a02029b_3WDJPQ4N8K_MN_16122025.png',
      badge: 'Special Price',
      rating: 4.7,
      variants: [
        { id: '307-1kg', weight: '1 kg', price: 45, originalPrice: 70, discount: '35% OFF' }
      ]
    },
    {
      id: 308,
      name: 'Tata Salt Iodized Vacuum Evaporated',
      category: 'Salt & Sugar',
      imageUrl: 'https://i5.walmartimages.com/seo/Tata-Salt-1-kg-1000-grams-pack-35-27-oz-India-Vacuum-evaporated-iodised-salt-Vegetarian_1adaeb8b-12df-4a5a-a2dd-44ee836fd5d4.0370de4e2add5e7714333e86c586edc9.jpeg',
      badge: 'Discount',
      rating: 4.9,
      variants: [
        { id: '308-1kg', weight: '1 kg', price: 22, originalPrice: 30, discount: '26% OFF' }
      ]
    },
    {
      id: 309,
      name: 'Madhur Pure Sulphurless Sugar',
      category: 'Salt & Sugar',
      imageUrl: ' https://cdn.grofers.com/cdn-cgi/image/f%3Dauto%2Cfit%3Dscale-down%2Cq%3D70%2Cmetadata%3Dnone%2Cw%3D1080/da/cms-assets/cms/product/39accb8f-7237-42dd-bdce-5ac2d168824e.png?bg_token=color.background.quaternary',
      badge: 'Price Slash',
      rating: 4.7,
      variants: [
        { id: '309-1kg', weight: '1 kg', price: 44, originalPrice: 58, discount: '24% OFF' },
        { id: '309-5kg', weight: '5 kg', price: 199, originalPrice: 260, discount: '23% OFF' }
      ]
    },
    {
      id: 310,
      name: 'Dove Hair Fall Rescue Shampoo',
      category: 'Personal Care',
      imageUrl: 'https://i5.walmartimages.com/asr/2a489592-433b-4c94-b84e-5795b8f86b9a.72465c004236bea9ec74e2efa1296c11.jpeg',
      badge: 'Hot Deal',
      rating: 4.8,
      variants: [
        { id: '310-340ml', weight: '340 ml', price: 269, originalPrice: 365, discount: '26% OFF' }
      ]
    }
  ]

  const [products] = useState(productsData)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [cartQuantities, setCartQuantities] = useState({})

  const subCategories = ['All', 'Atta & Flour', 'Oils & Ghee', 'Dals & Pulses', 'Rice & Poha', 'Salt & Sugar', 'Personal Care']

  function handleVariantChange(productId, index) {
    setSelectedVariants(prev => ({ ...prev, [productId]: index }))
  }

  function handleAdd(variant) {
    setCartQuantities(prev => ({
      ...prev,
      [variant.id]: (prev[variant.id] || 0) + 1
    }))
    setSuccessToast(`Added deal item (${variant.weight}) to cart!`)
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

      {/* Hero Header matching Staples & Personal Care exact theme */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 text-white px-4 sm:px-8 py-8 shadow-md">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
                <Sparkles size={14} className="text-yellow-300" />
                <span>Limited Period Super Discounts & Offers</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Deals & Special Discounts
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-green-100 max-w-xl font-medium">
                Grab top quality household essentials and groceries at unbeatable marked-down prices.
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
                  placeholder="Search deals..."
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
              {selectedSubCategory === 'All' ? 'All Mega Deals' : `${selectedSubCategory} Deals`}
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

export default Deals