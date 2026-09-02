import React, { useEffect, useState } from 'react'
import { getCategories, getProducts } from '../services/api'

function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ])

        setCategories(categoriesData)
        setProducts(productsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-center text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-2xl font-bold text-green-700">
            CD Shopping Hub
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Categories
            </h2>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="min-w-[120px] rounded-xl bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md"
                >
                  <p className="font-semibold text-gray-800">
                    {category.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Products
            </h2>

            <span className="text-sm text-gray-500">
              {products.length} Products
            </span>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => {
                const variant = product.variants?.find(
                  (item) => item.isActive
                )

                return (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-44 items-center justify-center bg-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          No Image
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-2 min-h-[48px] font-semibold text-gray-900">
                        {product.name}
                      </h3>

                      {variant ? (
                        <div className="mt-3">
                          <p className="text-lg font-bold text-green-700">
                            ₹{variant.sellingPrice}
                          </p>

                          {variant.mrp &&
                            Number(variant.mrp) >
                              Number(variant.sellingPrice) && (
                              <p className="text-sm text-gray-400 line-through">
                                ₹{variant.mrp}
                              </p>
                            )}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-red-500">
                          Out of stock
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Home