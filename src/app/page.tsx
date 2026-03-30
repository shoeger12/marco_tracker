'use client'

import { useEffect, useState, useCallback } from 'react'
import { FoodEntry, Goals, Macros, DEFAULT_GOALS } from '@/lib/types'
import {
  getDailyLog,
  getGoals,
  removeFoodEntry,
  getTodayKey,
  getRecentFoods,
  addFoodEntry,
} from '@/lib/storage'
import RingChart from '@/components/RingChart'
import Link from 'next/link'

const MACRO_COLORS = {
  calories: '#f97316',
  protein: '#3b82f6',
  carbs: '#22c55e',
  fat: '#eab308',
}

function sumMacros(entries: FoodEntry[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.macros.calories,
      protein: acc.protein + e.macros.protein,
      carbs: acc.carbs + e.macros.carbs,
      fat: acc.fat + e.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function HomePage() {
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [recentFoods, setRecentFoods] = useState<FoodEntry[]>([])
  const [addingRecent, setAddingRecent] = useState<string | null>(null)

  const reload = useCallback(() => {
    const today = getTodayKey()
    setEntries(getDailyLog(today).entries)
    setGoals(getGoals())
    setRecentFoods(getRecentFoods())
  }, [])

  useEffect(() => {
    reload()
    const handler = () => reload()
    window.addEventListener('storage', handler)
    window.addEventListener('macro-updated', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('macro-updated', handler)
    }
  }, [reload])

  const totals = sumMacros(entries)

  function handleRemove(id: string) {
    removeFoodEntry(id)
    reload()
  }

  function handleAddRecent(food: FoodEntry) {
    setAddingRecent(food.id)
    const newEntry: FoodEntry = {
      ...food,
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
    }
    addFoodEntry(newEntry)
    reload()
    setTimeout(() => setAddingRecent(null), 600)
  }

  const today = getTodayKey()

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Daily Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">{formatDate(today)}</p>
      </div>

      {/* Ring Charts */}
      <div className="bg-brand-card rounded-2xl p-5 mb-4 border border-brand-border">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Today&apos;s Progress
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <RingChart
            label="Calories"
            current={totals.calories}
            goal={goals.calories}
            unit="kcal"
            color={MACRO_COLORS.calories}
          />
          <RingChart
            label="Protein"
            current={totals.protein}
            goal={goals.protein}
            unit="g"
            color={MACRO_COLORS.protein}
          />
          <RingChart
            label="Carbs"
            current={totals.carbs}
            goal={goals.carbs}
            unit="g"
            color={MACRO_COLORS.carbs}
          />
          <RingChart
            label="Fat"
            current={totals.fat}
            goal={goals.fat}
            unit="g"
            color={MACRO_COLORS.fat}
          />
        </div>
      </div>

      {/* Macro Summary Bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(['calories', 'protein', 'carbs', 'fat'] as const).map((macro) => (
          <div
            key={macro}
            className="bg-brand-card rounded-xl p-3 border border-brand-border text-center"
          >
            <div
              className="text-lg font-bold"
              style={{ color: MACRO_COLORS[macro] }}
            >
              {Math.round(totals[macro])}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5 capitalize">
              {macro === 'calories' ? 'kcal' : 'g'}
            </div>
          </div>
        ))}
      </div>

      {/* Food Log */}
      <div className="bg-brand-card rounded-2xl border border-brand-border mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Food Log
          </h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-brand-accentLight text-xs font-medium hover:text-purple-300 transition-colors"
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
            Add Food
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            No foods logged today.
            <br />
            <Link
              href="/search"
              className="text-brand-accentLight mt-2 inline-block hover:underline"
            >
              Search for a food to get started
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {entries.map((entry) => (
              <li key={entry.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm truncate">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {entry.servingSize} &middot; {formatTime(entry.loggedAt)}
                  </span>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs" style={{ color: MACRO_COLORS.calories }}>
                      {Math.round(entry.macros.calories)} kcal
                    </span>
                    <span className="text-xs" style={{ color: MACRO_COLORS.protein }}>
                      P: {Math.round(entry.macros.protein)}g
                    </span>
                    <span className="text-xs" style={{ color: MACRO_COLORS.carbs }}>
                      C: {Math.round(entry.macros.carbs)}g
                    </span>
                    <span className="text-xs" style={{ color: MACRO_COLORS.fat }}>
                      F: {Math.round(entry.macros.fat)}g
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors mt-0.5 flex-shrink-0"
                  aria-label="Remove entry"
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recently Logged */}
      {recentFoods.length > 0 && (
        <div className="bg-brand-card rounded-2xl border border-brand-border mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Recently Logged
            </h2>
          </div>
          <ul className="divide-y divide-brand-border">
            {recentFoods.map((food) => (
              <li
                key={food.id}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    {food.name}
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    <span
                      className="text-xs"
                      style={{ color: MACRO_COLORS.calories }}
                    >
                      {Math.round(food.macros.calories)} kcal
                    </span>
                    <span className="text-xs text-gray-500">
                      P:{Math.round(food.macros.protein)}g &middot; C:
                      {Math.round(food.macros.carbs)}g &middot; F:
                      {Math.round(food.macros.fat)}g
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddRecent(food)}
                  disabled={addingRecent === food.id}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent hover:bg-purple-600 flex items-center justify-center transition-colors disabled:opacity-50"
                  aria-label={`Add ${food.name}`}
                >
                  {addingRecent === food.id ? (
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
                      className="text-white"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
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
                      className="text-white"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
