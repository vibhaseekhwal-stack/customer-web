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
    <div className="relative min-h-screen bg-[#f7f8f2] pb-28">

      {successToast && (
        <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-[18px] border border-[#dfe9d8] bg-white px-4 py-3 text-[#315d32] shadow-[0_15px_45px_rgba(47,70,39,0.15)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef5e7]">
            <Check size={15} />
          </div>

          <span className="text-xs font-black">
            {successToast}
          </span>
        </div>
      )}

      <div className="bg-[#315d32] px-4 py-8 text-white shadow-[0_15px_40px_rgba(47,70,39,0.12)] sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md">
                <Sparkles
                  size={13}
                  className="text-[#b8df7d]"
                />

                <span>
                  Fresh • Quality • Personal Essentials
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                Personal Care Essentials
              </h1>

              <p className="mt-1.5 max-w-xl text-xs font-medium leading-5 text-white/65 sm:text-sm">
                Everyday grooming, skin, hair and personal care essentials,
                carefully selected for your daily routine.
              </p>
            </div>

            <div className="w-full md:w-[350px]">
              <div className="flex h-12 w-full items-center gap-2 rounded-[18px] border border-white/15 bg-white/10 px-4 backdrop-blur-md transition focus-within:bg-white focus-within:text-[#202a20]">

                <Search
                  size={18}
                  className="shrink-0 text-[#b8df7d]"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search personal care..."
                  className="w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-white/55 focus:text-[#202a20]"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1400px] px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {subCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`shrink-0 rounded-[14px] px-4 py-2.5 text-xs font-black transition ${
                selectedSubCategory === cat
                  ? 'bg-[#315d32] text-white shadow-lg shadow-[#315d32]/15'
                  : 'border border-[#e1e7dd] bg-white text-[#606960] hover:border-[#315d32]/30 hover:bg-[#eef5e7] hover:text-[#315d32]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-5 mt-6 flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eef5e7]">
              <Flame
                size={17}
                className="text-[#315d32]"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">

                <h2 className="truncate text-base font-black text-[#202a20] sm:text-lg">
                  {selectedSubCategory === 'All'
                    ? 'All Personal Care Items'
                    : `${selectedSubCategory} Collection`}
                </h2>

                <span className="shrink-0 rounded-full bg-[#eef5e7] px-2.5 py-1 text-[9px] font-black text-[#315d32]">
                  {filteredProducts.length} items
                </span>

              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="flex shrink-0 items-center gap-1.5 rounded-[14px] border border-[#dfe6dc] bg-white px-3 py-2 text-xs font-black text-[#315d32] shadow-sm transition hover:bg-[#eef5e7]"
          >
            <ShoppingBag size={14} />

            <span className="hidden sm:inline">
              Go to Cart
            </span>
          </button>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="rounded-[30px] border border-[#e1e7dd] bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(47,70,39,0.05)]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#eef5e7] text-[#315d32]">
              <Search size={25} />
            </div>

            <h3 className="mt-4 text-base font-black text-[#202a20]">
              No products found
            </h3>

            <p className="mt-1 text-xs text-[#8a9287]">
              Try another product name or category.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

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
                  className="group flex flex-col justify-between rounded-[24px] border border-[#e1e7dd] bg-white p-3.5 shadow-[0_10px_35px_rgba(47,70,39,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#315d32]/25 hover:shadow-[0_18px_45px_rgba(47,70,39,0.09)]"
                >

                  <div>

                    <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#f7f8f2]">

                      <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-[#dfe9d8] bg-white/95 px-2.5 py-1 text-[9px] font-black text-[#315d32] shadow-sm backdrop-blur-sm">
                        {item.badge}
                      </span>

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full rounded-[18px] object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[#202a20]/75 px-2 py-1 text-[9px] font-black text-white backdrop-blur-sm">

                        <Star
                          size={10}
                          className="fill-[#b8df7d] text-[#b8df7d]"
                        />

                        {item.rating}
                      </div>

                    </div>

                    <div className="mt-3">

                      <h3 className="line-clamp-2 text-xs font-black leading-5 text-[#202a20] transition group-hover:text-[#315d32]">
                        {item.name}
                      </h3>

                    </div>

                    {item.variants.length > 1 && (

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">

                        {item.variants.map((v, idx) => (

                          <button
                            key={v.id}
                            onClick={() =>
                              handleVariantChange(
                                item.id,
                                idx
                              )
                            }
                            className={`rounded-[9px] border px-2 py-1 text-[9px] font-black transition ${
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

                  <div className="mt-4 flex items-center justify-between border-t border-[#edf0ea] pt-3">

                    <div>

                      <div className="flex items-center gap-1.5">

                        <span className="text-sm font-black text-[#202a20]">
                          ₹{activeVariant.price}
                        </span>

                        <span className="text-[9px] font-medium text-[#969e93] line-through">
                          ₹{activeVariant.originalPrice}
                        </span>

                      </div>

                      <span className="text-[9px] font-black text-[#315d32]">
                        {activeVariant.discount}
                      </span>

                    </div>

                    {qty === 0 ? (

                      <button
                        onClick={() =>
                          handleAdd(activeVariant)
                        }
                        className="rounded-[13px] bg-[#315d32] px-4 py-2 text-[10px] font-black text-white shadow-md shadow-[#315d32]/15 transition hover:bg-[#274d29] active:scale-95"
                      >
                        ADD
                      </button>

                    ) : (

                      <div className="flex items-center gap-1.5 rounded-[13px] bg-[#315d32] px-2 py-1.5 text-white shadow-md shadow-[#315d32]/15">

                        <button
                          onClick={() =>
                            handleRemove(activeVariant)
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-[7px] bg-white/10 transition hover:bg-white/20"
                        >
                          <Minus
                            size={11}
                            strokeWidth={3}
                          />
                        </button>

                        <span className="w-5 text-center text-xs font-black">
                          {qty}
                        </span>

                        <button
                          onClick={() =>
                            handleAdd(activeVariant)
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-[7px] bg-white/10 transition hover:bg-white/20"
                        >
                          <Plus
                            size={11}
                            strokeWidth={3}
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