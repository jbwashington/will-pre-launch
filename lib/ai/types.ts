// AI-generated snack product types

export interface NutritionFacts {
  calories: number
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  sodium: number // mg
  sugar: number // grams
}

export interface SnackProduct {
  id: string
  name: string
  description: string
  price: number
  emoji: string // Visual representation
  ingredients: string[]
  allergens: string[]
  category: 'chips' | 'candy' | 'drinks' | 'chocolate' | 'cookies' | 'international' | 'savory' | 'spicy'
  origin: string // Country/region inspiration
  flavorProfile: ('sweet' | 'savory' | 'spicy' | 'sour' | 'umami' | 'tangy')[]
  nutritionFacts: NutritionFacts
  starred: boolean
  embedding?: number[] // For similarity search
  generatedAt: number
  viewCount: number
}

export interface GenerateProductParams {
  searchTerm?: string
  category?: SnackProduct['category']
  includeEmbedding?: boolean
}

export interface ModelLoadingState {
  textModel: 'idle' | 'loading' | 'loaded' | 'error'
  embeddingModel: 'idle' | 'loading' | 'loaded' | 'error'
}

export interface SearchSuggestion {
  id: string
  name: string
  category: string
  emoji: string
}
