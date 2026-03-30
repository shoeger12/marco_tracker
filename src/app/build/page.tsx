'use client'

import { useState, useRef } from 'react'
import { FoodEntry } from '@/lib/types'
import { addFoodEntry } from '@/lib/storage'
import { useRouter } from 'next/navigation'

const MACRO_COLORS = {
  calories: '#f97316',
  protein: '#3b82f6',
  carbs: '#22c55e',
  fat: '#eab308',
}

interface IngredientBreakdown {
  ingredient: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface BuildResult {
  name: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fat: number
  breakdown: IngredientBreakdown[]
}

export default function BuildPage() {
  const [foodName, setFoodName] = useState('')
  const [ingredients, setIngredients] = useState<string[]>(['', ''])
  const [result, setResult] = useState<BuildResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const router = useRouter()
  const lastInputRef = useRef<HTMLInputElement>(null)

  function updateIngredient(index: number, value: string) {
    setIngredients((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
    setResult(null)
    setAdded(false)
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, ''])
    setTimeout(() => lastInputRef.current?.focus(), 50)
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
    setResult(null)
  }

  const filledIngredients = ingredients.filter((i) => i.trim())

  async function handleCalculate() {
    if (!foodName.trim() || filledIngredients.length === 0) return

    setLoading(true)
    setError(null)
    setResult(null)
    setAdded(false)
    setShowBreakdown(false)

    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: foodName.trim(), ingredients: filledIngredients }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to calculate')
      }

      const data: BuildResult = await res.json()
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
    setTimeout(() => router.push('/'), 800)
  }

  function handleReset() {
    setFoodName('')
    setIngredients(['', ''])
    setResult(null)
    setError(null)
    setAdded(false)
    setShowBreakdown(false)
  }

  const canCalculate = foodName.trim().length > 0 && filledIngredients.length > 0

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Build a Food</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Combine ingredients to calculate total macros
        </p>
      </div>

      {/* Food Name */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Food Name
        </label>
        <input
          type="text"
          value={foodName}
          onChange={(e) => { setFoodName(e.target.value); setResult(null) }}
          placeholder="e.g. Egg Sandwich, Protein Bowl..."
          className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-accent transition-colors"
        />
      </div>

      {/* Ingredients */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Ingredients
        </label>

        <div className="flex flex-col gap-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-gray-600 text-xs w-5 text-right flex-shrink-0">
                {index + 1}.
              </span>
              <input
                ref={index === ingredients.length - 1 ? lastInputRef : undefined}
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addIngredientRow()
                  }
                }}
                placeholder={
                  index === 0
                    ? 'e.g. 2 pieces of toast'
                    : index === 1
                    ? 'e.g. 2 eggs'
                    : 'e.g. 1 tbsp butter'
                }
                className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-accent transition-colors"
              />
              {ingredients.length > 1 && (
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Remove ingredient"
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
          ))}
        </div>

        <button
          onClick={addIngredientRow}
          className="mt-3 flex items-center gap-1.5 text-brand-accentLight text-sm hover:text-purple-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add ingredient
        </button>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={loading || !canCalculate}
        className="w-full py-3 rounded-xl bg-brand-accent hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mb-4"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            Calculating...
          </span>
        ) : (
          'Calculate Macros'
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden mb-4">
          {/* Header */}
          <div className="px-4 py-4 border-b border-brand-border">
            <h2 className="text-lg font-bold text-white">{result.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{result.servingSize}</p>
          </div>

          {/* Total Macros */}
          <div className="grid grid-cols-2 divide-x divide-y divide-brand-border">
            <MacroCell label="Calories" value={result.calories} unit="kcal" color={MACRO_COLORS.calories} />
            <MacroCell label="Protein" value={result.protein} unit="g" color={MACRO_COLORS.protein} />
            <MacroCell label="Carbs" value={result.carbs} unit="g" color={MACRO_COLORS.carbs} />
            <MacroCell label="Fat" value={result.fat} unit="g" color={MACRO_COLORS.fat} />
          </div>

          {/* Breakdown Toggle */}
          {result.breakdown && result.breakdown.length > 0 && (
            <div className="border-t border-brand-border">
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
              >
                <span>Per-ingredient breakdown</span>
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
                  className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showBreakdown && (
                <div className="border-t border-brand-border divide-y divide-brand-border">
                  {result.breakdown.map((item, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="text-sm text-white font-medium mb-1">
                        {item.ingredient}
                      </div>
                      <div className="flex gap-3">
                        <span className="text-xs" style={{ color: MACRO_COLORS.calories }}>
                          {Math.round(item.calories)} kcal
                        </span>
                        <span className="text-xs" style={{ color: MACRO_COLORS.protein }}>
                          P: {Math.round(item.protein)}g
                        </span>
                        <span className="text-xs" style={{ color: MACRO_COLORS.carbs }}>
                          C: {Math.round(item.carbs)}g
                        </span>
                        <span className="text-xs" style={{ color: MACRO_COLORS.fat }}>
                          F: {Math.round(item.fat)}g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex gap-3 border-t border-brand-border">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl border border-brand-border text-gray-400 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleAdd}
              disabled={added}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-brand-accent hover:bg-purple-600 text-white'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added!
                </span>
              ) : (
                'Add to Log'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MacroCell({ label, value, unit, color }: {
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
