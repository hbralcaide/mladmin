import { useState, useEffect } from 'react'
import { marketService } from '../services/marketService'
import { MarketSection } from '../types/market'

export default function MarketSections() {
  const [sections, setSections] = useState<MarketSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      const data = await marketService.getAllSections()
      setSections(data)
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
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600">Error loading market sections: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Market Sections</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Stalls</span>
                <span className="font-medium">{section.total_stalls}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Available Stalls</span>
                <span className="font-medium">{section.available_stalls || 0}</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {/* TODO: Implement view stalls */}}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Stalls
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
