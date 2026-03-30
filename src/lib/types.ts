export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FoodEntry {
  id: string
  name: string
  servingSize: string
  macros: Macros
  loggedAt: string // ISO timestamp
}

export interface DailyLog {
  date: string // YYYY-MM-DD
  entries: FoodEntry[]
}

export interface Goals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const DEFAULT_GOALS: Goals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
}
