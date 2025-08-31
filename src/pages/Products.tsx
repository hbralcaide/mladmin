import { useState, useEffect } from 'react'
import { marketService } from '../services/marketService'
import { Product, ProductCategory } from '../types/market'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      searchProducts()
    }
  }, [searchQuery])

  const loadCategories = async () => {
    try {
      const data = await marketService.getAllCategories()
      setCategories(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async () => {
    try {
      setLoading(true)
      const data = await marketService.searchProducts(searchQuery)
      setProducts(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-600">Error: {error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.description}</p>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base Price</span>
                <span className="font-medium">₱{product.base_price}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Unit</span>
                <span className="font-medium">{product.unit_of_measurement}</span>
              </div>
            </div>

            {product.variations && product.variations.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900">Variations</h4>
                <div className="mt-2 space-y-2">
                  {product.variations.map((variation) => (
                    <div key={variation.id} className="flex justify-between text-sm">
                      <span className="text-gray-500">{variation.name}</span>
                      <span className="font-medium">₱{variation.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={() => {/* TODO: Implement view details/edit */}}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
