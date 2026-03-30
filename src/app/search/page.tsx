'use client'

import { useState, useRef } from 'react'
import { FoodEntry, Macros } from '@/lib/types'
import { addFoodEntry } from '@/lib/storage'
import { useRouter } from 'next/navigation'

interface FoodResult {
  name: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const MACRO_COLORS = {
  calories: '#f97316',
  protein: '#3b82f6',
  carbs: '#22c55e',
  fat: '#eab308',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<FoodResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setError(null)
    setResult(null)
    setAdded(false)

    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch')
      }

      const data: FoodResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    if (!result) return

    const entry: FoodEntry = {
      id: crypto.randomUUID(),
      name: result.name,
      servingSize: result.servingSize,
      macros: {
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      },
      loggedAt: new Date().toISOString(),
    }

    addFoodEntry(entry)
    window.dispatchEvent(new Event('macro-updated'))
    setAdded(true)

    setTimeout(() => {
      router.push('/')
    }, 800)
  }

  function handleClear() {
    setQuery('')
    setResult(null)
    setError(null)
    setAdded(false)
    inputRef.current?.focus()
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Food Search</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Search any food to get its macros
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 2 eggs scrambled, 100g chicken breast..."
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-accent transition-colors"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-brand-accent hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="bg-brand-card rounded-2xl border border-brand-border p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Fetching nutritional info...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="bg-brand-card rounded-2xl border border-brand-border overflow-hidden">
          <div className="px-4 py-4 border-b border-brand-border">
            <h2 className="text-lg font-bold text-white">{result.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{result.servingSize}</p>
          </div>

          {/* Macro Grid */}
          <div className="grid grid-cols-2 divide-x divide-y divide-brand-border">
            <MacroCell
              label="Calories"
              value={result.calories}
              unit="kcal"
              color={MACRO_COLORS.calories}
            />
            <MacroCell
              label="Protein"
              value={result.protein}
              unit="g"
              color={MACRO_COLORS.protein}
            />
            <MacroCell
              label="Carbs"
              value={result.carbs}
              unit="g"
              color={MACRO_COLORS.carbs}
            />
            <MacroCell
              label="Fat"
              value={result.fat}
              unit="g"
              color={MACRO_COLORS.fat}
            />
          </div>

          {/* Add Button */}
          <div className="p-4">
            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-brand-accent hover:bg-purple-600 text-white'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added to Log!
                </span>
              ) : (
                'Add to Daily Log'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!result && !loading && !error && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {[
              '100g chicken breast',
              '2 scrambled eggs',
              '1 cup oatmeal',
              'large banana',
              'protein shake',
              'avocado toast',
              'greek yogurt',
              'brown rice 150g',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion)
                  inputRef.current?.focus()
                }}
                className="text-xs bg-brand-card border border-brand-border text-gray-400 hover:text-white hover:border-brand-accent px-3 py-1.5 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MacroCell({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: number
  unit: string
  color: string
}) {
  return (
    <div className="p-4 text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {Math.round(value)}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {unit} {label}
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <span className="flex items-center gap-2">
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
      Searching
    </span>
  )
}
