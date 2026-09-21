
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getCategories,
} from '../services/api'

function Categories() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadCategories = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getCategories()

        const categoryList = Array.isArray(response)
          ? response
          : response?.items || response?.data || []

        if (!mounted) return

        setCategories(
          categoryList.filter(
            (category) =>
              category?.isActive !== false
          )
        )
      } catch (err) {
        console.error(err)

        if (!mounted) return

        setError(
          err?.message ||
            'Unable to load categories'
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      mounted = false
    }
  }, [])

  const openCategory = (category) => {
    if (!category?.id) return

    navigate(`/category/${category.id}`)
  }

  if (loading) {
    return (
      <main className="min-h-[700px] bg-[#f8faf8]">
        <div className="flex min-h-[700px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce9df] border-t-[#28783f]" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[700px] bg-[#f8faf8] px-4">
        <div className="mx-auto flex min-h-[700px] w-full max-w-[1400px] items-center justify-center">
          <div className="rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(30,70,40,0.08)]">
            <p className="text-sm font-semibold text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="mt-5 rounded-xl bg-[#28783f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a38]"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[700px] bg-[#f8faf8] text-[#202720]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 md:py-9 lg:px-8 lg:py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-[#202720] sm:text-3xl">
            Shop by Category
          </h1>

          <p className="mt-1 text-sm text-[#7c857c]">
            Browse groceries and everyday essentials by category
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((category, index) => (
              <button
                key={category?.id || index}
                type="button"
                onClick={() =>
                  openCategory(category)
                }
                className="group overflow-hidden rounded-2xl border border-[#e2e8e2] bg-white text-left shadow-[0_4px_15px_rgba(30,60,35,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#c9dccb] hover:shadow-[0_10px_25px_rgba(30,60,35,0.1)]"
              >
                <div className="h-[170px] overflow-hidden bg-[#f1f5f0]">
                  {category?.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={
                        category?.name ||
                        'Category'
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🛒
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="line-clamp-1 text-sm font-bold text-[#303830] transition group-hover:text-[#28783f]">
                    {category?.name}
                  </h2>

                  <p className="mt-1 text-xs text-[#899189]">
                    Shop now
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#dce3dc] bg-white py-20 text-center">
            <p className="text-sm text-[#7b837b]">
              No categories found
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Categories


