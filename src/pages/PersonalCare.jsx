
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

  const subCategories = [
    'All',
    'Hair Care',
    'Skin Care',
    'Oral Care',
    'Bath & Body',
    'Shaving & Grooming'
  ]

  function handleVariantChange(productId, index) {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: index
    }))
  }

  function handleAdd(variant) {
    setCartQuantities(prev => ({
      ...prev,
      [variant.id]: (prev[variant.id] || 0) + 1
    }))

    setSuccessToast(`Added ${variant.weight} to cart!`)

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

      return {
        ...prev,
        [variant.id]: current - 1
      }
    })
  }

  const filteredProducts = products.filter(item => {
    const matchesCategory =
      selectedSubCategory === 'All' ||
      item.category === selectedSubCategory

    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f8f2] pb-24 sm:pb-28">

      {successToast && (
        <div className="fixed left-4 right-4 top-20 z-50 flex items-center justify-center sm:left-auto sm:right-4">
          <div className="flex w-fit max-w-full items-center gap-2 rounded-[18px] border border-[#dfe9d8] bg-white px-4 py-3 text-[#315d32] shadow-[0_15px_45px_rgba(47,70,39,0.15)]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef5e7]">
              <Check size={15} />
            </div>

            <span className="truncate text-xs font-black">
              {successToast}
            </span>
          </div>
        </div>
      )}

      <div className="bg-[#315d32] px-4 py-6 text-white shadow-[0_15px_40px_rgba(47,70,39,0.12)] sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-[1400px]">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">

            <div className="min-w-0 flex-1">

              <div className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-wide backdrop-blur-md sm:text-[10px]">
                <Sparkles
                  size={12}
                  className="shrink-0 text-[#b8df7d]"
                />

                <span className="truncate">
                  Fresh • Quality • Personal Essentials
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Personal Care Essentials
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs font-medium leading-5 text-white/65 sm:text-sm">
                Everyday grooming, skin, hair and personal care essentials,
                carefully selected for your daily routine.
              </p>
            </div>

            <div className="w-full lg:w-[360px] lg:shrink-0">
              <div className="flex h-12 w-full items-center gap-2 rounded-[18px] border border-white/15 bg-white/10 px-4 backdrop-blur-md transition focus-within:bg-white focus-within:text-[#202a20] sm:h-[52px]">

                <Search
                  size={18}
                  className="shrink-0 text-[#b8df7d]"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search personal care..."
                  className="min-w-0 w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-white/55 focus:text-[#202a20] sm:text-sm"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-[1400px] px-4 sm:mt-6 sm:px-6 lg:px-8">

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-none">
          {subCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`shrink-0 rounded-[13px] px-3.5 py-2.5 text-[10px] font-black transition sm:rounded-[14px] sm:px-4 sm:text-xs ${
                selectedSubCategory === cat
                  ? 'bg-[#315d32] text-white shadow-lg shadow-[#315d32]/15'
                  : 'border border-[#e1e7dd] bg-white text-[#606960] hover:border-[#315d32]/30 hover:bg-[#eef5e7] hover:text-[#315d32]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-5 mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7]">
              <Flame
                size={17}
                className="text-[#315d32]"
              />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">

                <h2 className="truncate text-sm font-black text-[#202a20] sm:text-base lg:text-lg">
                  {selectedSubCategory === 'All'
                    ? 'All Personal Care Items'
                    : `${selectedSubCategory} Collection`}
                </h2>

                <span className="shrink-0 rounded-full bg-[#eef5e7] px-2 py-1 text-[8px] font-black text-[#315d32] sm:px-2.5 sm:py-1 sm:text-[9px]">
                  {filteredProducts.length} items
                </span>

              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-[#dfe6dc] bg-white px-3 py-2.5 text-xs font-black text-[#315d32] shadow-sm transition hover:bg-[#eef5e7] sm:w-auto sm:shrink-0 sm:px-4"
          >
            <ShoppingBag size={14} />

            <span>
              Go to Cart
            </span>
          </button>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="rounded-[24px] border border-[#e1e7dd] bg-white px-5 py-12 text-center shadow-[0_18px_55px_rgba(47,70,39,0.05)] sm:rounded-[30px] sm:px-6 sm:py-16">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef5e7] text-[#315d32] sm:h-16 sm:w-16 sm:rounded-[20px]">
              <Search size={24} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20]">
              No products found
            </h3>

            <p className="mt-1 text-xs text-[#8a9287]">
              Try another product name or category.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

            {filteredProducts.map(item => {

              const currentVariantIndex =
                selectedVariants[item.id] || 0

              const activeVariant =
                item.variants[currentVariantIndex] ||
                item.variants[0]

              const qty =
                cartQuantities[activeVariant.id] || 0

              return (
                <div
                  key={item.id}
                  className="group flex min-w-0 flex-col justify-between rounded-[18px] border border-[#e1e7dd] bg-white p-2.5 shadow-[0_8px_25px_rgba(47,70,39,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#315d32]/25 hover:shadow-[0_18px_45px_rgba(47,70,39,0.09)] sm:rounded-[22px] sm:p-3.5 lg:rounded-[24px]"
                >

                  <div>

                    <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-[15px] bg-[#f7f8f2] sm:h-40 sm:rounded-[18px] lg:h-44">

                      <span className="absolute left-2 top-2 z-10 max-w-[70%] truncate rounded-full border border-[#dfe9d8] bg-white/95 px-2 py-1 text-[8px] font-black text-[#315d32] shadow-sm backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[9px]">
                        {item.badge}
                      </span>

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full rounded-[15px] object-cover transition duration-500 group-hover:scale-105 sm:rounded-[18px]"
                      />

                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-[#202a20]/75 px-1.5 py-1 text-[8px] font-black text-white backdrop-blur-sm sm:bottom-2.5 sm:right-2.5 sm:px-2 sm:text-[9px]">

                        <Star
                          size={9}
                          className="fill-[#b8df7d] text-[#b8df7d] sm:h-[10px] sm:w-[10px]"
                        />

                        {item.rating}
                      </div>

                    </div>

                    <div className="mt-2.5 sm:mt-3">

                      <h3 className="line-clamp-2 min-h-[36px] text-[10px] font-black leading-4 text-[#202a20] transition group-hover:text-[#315d32] sm:min-h-[40px] sm:text-xs sm:leading-5">
                        {item.name}
                      </h3>

                    </div>

                    {item.variants.length > 1 && (

                      <div className="mt-2 flex max-h-[50px] flex-wrap items-center gap-1 overflow-hidden sm:mt-2.5 sm:gap-1.5">

                        {item.variants.map((v, idx) => (

                          <button
                            key={v.id}
                            onClick={() =>
                              handleVariantChange(
                                item.id,
                                idx
                              )
                            }
                            className={`rounded-[8px] border px-1.5 py-1 text-[8px] font-black transition sm:rounded-[9px] sm:px-2 sm:text-[9px] ${
                              currentVariantIndex === idx
                                ? 'border-[#315d32] bg-[#eef5e7] text-[#315d32]'
                                : 'border-[#e1e7dd] bg-[#f7f8f2] text-[#606960] hover:border-[#315d32]/30 hover:text-[#315d32]'
                            }`}
                          >
                            {v.weight}
                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                  <div className="mt-3 flex items-end justify-between gap-2 border-t border-[#edf0ea] pt-2.5 sm:mt-4 sm:pt-3">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-1">

                        <span className="text-xs font-black text-[#202a20] sm:text-sm">
                          ₹{activeVariant.price}
                        </span>

                        <span className="text-[8px] font-medium text-[#969e93] line-through sm:text-[9px]">
                          ₹{activeVariant.originalPrice}
                        </span>

                      </div>

                      <span className="text-[8px] font-black text-[#315d32] sm:text-[9px]">
                        {activeVariant.discount}
                      </span>

                    </div>

                    {qty === 0 ? (

                      <button
                        onClick={() =>
                          handleAdd(activeVariant)
                        }
                        className="shrink-0 rounded-[11px] bg-[#315d32] px-3 py-2 text-[9px] font-black text-white shadow-md shadow-[#315d32]/15 transition hover:bg-[#274d29] active:scale-95 sm:rounded-[13px] sm:px-4 sm:text-[10px]"
                      >
                        ADD
                      </button>

                    ) : (

                      <div className="flex shrink-0 items-center gap-1 rounded-[11px] bg-[#315d32] px-1.5 py-1.5 text-white shadow-md shadow-[#315d32]/15 sm:gap-1.5 sm:rounded-[13px] sm:px-2">

                        <button
                          onClick={() =>
                            handleRemove(activeVariant)
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/10 transition hover:bg-white/20 sm:h-6 sm:w-6 sm:rounded-[7px]"
                        >
                          <Minus
                            size={10}
                            strokeWidth={3}
                            className="sm:h-[11px] sm:w-[11px]"
                          />
                        </button>

                        <span className="w-4 text-center text-[10px] font-black sm:w-5 sm:text-xs">
                          {qty}
                        </span>

                        <button
                          onClick={() =>
                            handleAdd(activeVariant)
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/10 transition hover:bg-white/20 sm:h-6 sm:w-6 sm:rounded-[7px]"
                        >
                          <Plus
                            size={10}
                            strokeWidth={3}
                            className="sm:h-[11px] sm:w-[11px]"
                          />
                        </button>

                      </div>

                    )}

                  </div>

                </div>
              )
            })}

          </div>

        )}

      </div>
    </div>
  )
}

export default PersonalCare

