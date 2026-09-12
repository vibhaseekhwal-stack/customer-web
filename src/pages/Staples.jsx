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

  const productsData = [
    {
      id: 101,
      name: 'Aashirvaad Superior MP Sharbati Atta',
      category: 'Atta & Flour',
      imageUrl:
        'https://dukaan.b-cdn.net/700x700/webp/media/48d9b697-ab5b-4edd-b649-844177ce1fd7.jpeg',
      badge: 'Bestseller',
      rating: 4.8,
      variants: [
        {
          id: '101-5kg',
          weight: '5 kg',
          price: 230,
          originalPrice: 260,
          discount: '11% OFF'
        },
        {
          id: '101-10kg',
          weight: '10 kg',
          price: 420,
          originalPrice: 480,
          discount: '12% OFF'
        }
      ]
    },
    {
      id: 102,
      name: 'Fortune Suvidha Multigrain Atta',
      category: 'Atta & Flour',
      imageUrl:
        'https://www.fortunefoods.com/wp-content/uploads/2026/07/Chakki-Fresh-Multigrain-Atta-5kg_FOP_ff-copy-1-scaled.webp',
      badge: 'Healthy',
      rating: 4.6,
      variants: [
        {
          id: '102-5kg',
          weight: '5 kg',
          price: 275,
          originalPrice: 310,
          discount: '11% OFF'
        }
      ]
    },
    {
      id: 103,
      name: 'Fortune Sunite Refined Sunflower Oil',
      category: 'Oils & Ghee',
      imageUrl:
        'https://dms.mydukaan.io/original/jpeg/media/7ff4e06f-099e-4a70-9979-a42ac8c5feaa.png',
      badge: 'Best Value',
      rating: 4.7,
      variants: [
        {
          id: '103-1l',
          weight: '1 L',
          price: 135,
          originalPrice: 160,
          discount: '15% OFF'
        },
        {
          id: '103-5l',
          weight: '5 L Jar',
          price: 640,
          originalPrice: 750,
          discount: '14% OFF'
        }
      ]
    },
    {
      id: 104,
      name: 'Amul Pure Cow Ghee Glass Jar',
      category: 'Oils & Ghee',
      imageUrl:
        'https://www.fairmartonline.co.uk/cdn/shop/files/Amul_Cow_Ghee_Jar_200ml.webp?crop=center&height=1200&v=1760031720&width=1200',
      badge: 'Premium',
      rating: 4.9,
      variants: [
        {
          id: '104-500ml',
          weight: '500 ml',
          price: 325,
          originalPrice: 350,
          discount: '7% OFF'
        },
        {
          id: '104-1l',
          weight: '1 L',
          price: 630,
          originalPrice: 680,
          discount: '7% OFF'
        }
      ]
    },
    {
      id: 105,
      name: 'Organic Premium Unpolished Toor Dal',
      category: 'Dals & Pulses',
      imageUrl:
        'https://garudalife.in/cache/original/product/81382/GRBCA326SFS0e.webp',
      badge: 'Organic',
      rating: 4.6,
      variants: [
        {
          id: '105-1kg',
          weight: '1 kg',
          price: 145,
          originalPrice: 180,
          discount: '19% OFF'
        }
      ]
    },
    {
      id: 106,
      name: 'Tata Sampann Unpolished Moong Dal',
      category: 'Dals & Pulses',
      imageUrl:
        'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Ch_600/NI_CATALOG/IMAGES/ciw/2025/12/16/819bf1d2-ad38-47b2-a51f-9da6f3fc5ed8_CWJRBA8SCS_MN_15122025.png',
      badge: 'High Protein',
      rating: 4.7,
      variants: [
        {
          id: '106-1kg',
          weight: '1 kg',
          price: 130,
          originalPrice: 155,
          discount: '16% OFF'
        }
      ]
    },
    {
      id: 107,
      name: 'Daawat Rozana Super Basmati Rice',
      category: 'Rice & Poha',
      imageUrl:
        'https://www.mustore.mv/web/image/product.template/2139/image_1024?unique=0edb0e0',
      badge: 'Top Rated',
      rating: 4.8,
      variants: [
        {
          id: '107-1kg',
          weight: '1 kg',
          price: 85,
          originalPrice: 100,
          discount: '15% OFF'
        },
        {
          id: '107-5kg',
          weight: '5 kg',
          price: 360,
          originalPrice: 450,
          discount: '20% OFF'
        }
      ]
    },
    {
      id: 108,
      name: 'Indore Thick Poha Flaked Rice',
      category: 'Rice & Poha',
      imageUrl:
        'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/NI_CATALOG/IMAGES/ciw/2025/12/16/d66ce009-a32c-451e-a2b1-ad327a02029b_3WDJPQ4N8K_MN_16122025.png',
      badge: 'Fresh',
      rating: 4.7,
      variants: [
        {
          id: '108-1kg',
          weight: '1 kg',
          price: 58,
          originalPrice: 70,
          discount: '17% OFF'
        }
      ]
    },
    {
      id: 109,
      name: 'Tata Salt Iodized Vacuum Evaporated',
      category: 'Salt & Sugar',
      imageUrl:
        'https://i5.walmartimages.com/seo/Tata-Salt-1-kg-1000-grams-pack-35-27-oz-India-Vacuum-evaporated-iodised-salt-Vegetarian_1adaeb8b-12df-4a5a-a2dd-44ee836fd5d4.0370de4e2add5e7714333e86c586edc9.jpeg',
      badge: 'Essential',
      rating: 4.9,
      variants: [
        {
          id: '109-1kg',
          weight: '1 kg',
          price: 28,
          originalPrice: 30,
          discount: '6% OFF'
        }
      ]
    },
    {
      id: 110,
      name: 'Madhur Pure Sulphurless Sugar',
      category: 'Salt & Sugar',
      imageUrl:
        'https://cdn.grofers.com/cdn-cgi/image/f%3Dauto%2Cfit%3Dscale-down%2Cq%3D70%2Cmetadata%3Dnone%2Cw%3D1080/da/cms-assets/cms/product/39accb8f-7237-42dd-bdce-5ac2d168824e.png?bg_token=color.background.quaternary',
      badge: 'Pure',
      rating: 4.7,
      variants: [
        {
          id: '110-1kg',
          weight: '1 kg',
          price: 52,
          originalPrice: 58,
          discount: '10% OFF'
        },
        {
          id: '110-5kg',
          weight: '5 kg',
          price: 240,
          originalPrice: 260,
          discount: '7% OFF'
        }
      ]
    }
  ]

  const [products] = useState(productsData)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [cartQuantities, setCartQuantities] = useState({})

  const subCategories = [
    'All',
    'Atta & Flour',
    'Oils & Ghee',
    'Dals & Pulses',
    'Rice & Poha',
    'Salt & Sugar'
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
                <span>Fresh • Quality • Everyday Essentials</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                Staples & Daily Groceries
              </h1>

              <p className="mt-1.5 max-w-xl text-xs font-medium leading-5 text-white/65 sm:text-sm">
                Everything you need for your everyday kitchen,
                packed with quality and delivered fresh.
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
                  placeholder="Search staples..."
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
                    ? 'All Staples Collection'
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

export default Staples