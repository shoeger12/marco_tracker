'use client'

import { useEffect, useState } from 'react'
import { Goals, DEFAULT_GOALS } from '@/lib/types'
import { getGoals, saveGoals } from '@/lib/storage'

const MACRO_COLORS = {
  calories: '#f97316',
  protein: '#3b82f6',
  carbs: '#22c55e',
  fat: '#eab308',
}

const MACRO_LABELS = {
  calories: { label: 'Calories', unit: 'kcal', min: 500, max: 10000, step: 50 },
  protein: { label: 'Protein', unit: 'g', min: 10, max: 500, step: 5 },
  carbs: { label: 'Carbohydrates', unit: 'g', min: 10, max: 800, step: 5 },
  fat: { label: 'Fat', unit: 'g', min: 5, max: 300, step: 5 },
}

type MacroKey = keyof Goals

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGoals(getGoals())
  }, [])

  function handleChange(key: MacroKey, value: string) {
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      setGoals((prev) => ({ ...prev, [key]: num }))
    }
    setSaved(false)
  }

  function handleSave() {
    saveGoals(goals)
    window.dispatchEvent(new Event('macro-updated'))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setGoals(DEFAULT_GOALS)
    setSaved(false)
  }

  // Estimated calorie check
  const estimatedCals = goals.protein * 4 + goals.carbs * 4 + goals.fat * 9
  const calsDiff = Math.abs(estimatedCals - goals.calories)
  const showCalWarning = calsDiff > 150

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Daily Goals</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Set your daily macro targets
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {(Object.keys(MACRO_LABELS) as MacroKey[]).map((key) => {
          const meta = MACRO_LABELS[key]
          const color = MACRO_COLORS[key]
          const value = goals[key]

          return (
            <div
              key={key}
              className="bg-brand-card border border-brand-border rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-white text-sm">
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={value}
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-20 bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  <span className="text-gray-400 text-sm w-8">{meta.unit}</span>
                </div>
              </div>

              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={meta.min}
                  max={meta.max}
                  step={meta.step}
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={
                    {
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - meta.min) / (meta.max - meta.min)) * 100}%, #2e2e3e ${((value - meta.min) / (meta.max - meta.min)) * 100}%, #2e2e3e 100%)`,
                      '--thumb-color': color,
                    } as React.CSSProperties
                  }
                />
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">{meta.min}</span>
                <span className="text-[10px] text-gray-600">{meta.max}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Macro-calorie check */}
      {showCalWarning && (
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 mb-4 text-yellow-400 text-xs">
          <strong>Note:</strong> Estimated calories from macros (~{Math.round(estimatedCals)} kcal) differ from your calorie goal by {Math.round(calsDiff)} kcal. Consider adjusting for consistency.
        </div>
      )}

      {/* Summary */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-4 mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Summary
        </h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          {(Object.keys(MACRO_LABELS) as MacroKey[]).map((key) => (
            <div key={key}>
              <div
                className="text-xl font-bold"
                style={{ color: MACRO_COLORS[key] }}
              >
                {goals[key]}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {MACRO_LABELS[key].unit}
              </div>
              <div className="text-[10px] text-gray-600 capitalize">
                {key}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={handleReset}
          className="flex-1 py-3 rounded-xl border border-brand-border text-gray-400 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
        >
          Reset Defaults
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-brand-accent hover:bg-purple-600 text-white'
          }`}
        >
          {saved ? (
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
              Saved!
            </span>
          ) : (
            'Save Goals'
          )}
        </button>
      </div>

      {/* Slider thumb styles */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--thumb-color, #7c3aed);
          cursor: pointer;
          border: 2px solid #0f0f14;
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--thumb-color, #7c3aed);
          cursor: pointer;
          border: 2px solid #0f0f14;
        }
      `}</style>
    </div>
  )
}
