import { DailyLog, FoodEntry, Goals, DEFAULT_GOALS } from './types'

const GOALS_KEY = 'macro_tracker_goals'
const LOG_KEY_PREFIX = 'macro_tracker_log_'
const RECENT_KEY = 'macro_tracker_recent'

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getGoals(): Goals {
  if (typeof window === 'undefined') return DEFAULT_GOALS
  try {
    const stored = localStorage.getItem(GOALS_KEY)
    return stored ? { ...DEFAULT_GOALS, ...JSON.parse(stored) } : DEFAULT_GOALS
  } catch {
    return DEFAULT_GOALS
  }
}

export function saveGoals(goals: Goals): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

export function getDailyLog(date: string): DailyLog {
  if (typeof window === 'undefined') return { date, entries: [] }
  try {
    const stored = localStorage.getItem(LOG_KEY_PREFIX + date)
    return stored ? JSON.parse(stored) : { date, entries: [] }
  } catch {
    return { date, entries: [] }
  }
}

export function addFoodEntry(entry: FoodEntry): void {
  const date = getTodayKey()
  const log = getDailyLog(date)
  log.entries.push(entry)
  localStorage.setItem(LOG_KEY_PREFIX + date, JSON.stringify(log))
  addToRecent(entry)
}

export function removeFoodEntry(entryId: string): void {
  const date = getTodayKey()
  const log = getDailyLog(date)
  log.entries = log.entries.filter((e) => e.id !== entryId)
  localStorage.setItem(LOG_KEY_PREFIX + date, JSON.stringify(log))
}

export function getRecentFoods(): FoodEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addToRecent(entry: FoodEntry): void {
  const recent = getRecentFoods()
  // Remove duplicate by name (case-insensitive)
  const filtered = recent.filter(
    (e) => e.name.toLowerCase() !== entry.name.toLowerCase()
  )
  // Keep latest 8
  const updated = [entry, ...filtered].slice(0, 8)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}
