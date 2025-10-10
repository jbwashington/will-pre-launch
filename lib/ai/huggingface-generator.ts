// Alternative text generation using HuggingFace Inference API
// This is a fallback when Transformers.js has compatibility issues

import { HfInference } from '@huggingface/inference'
import type { SnackProduct, GenerateProductParams } from './types'
import { cacheProduct } from './cache'

// Initialize HuggingFace client (works with free tier)
const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY)

// Emoji collections for different categories
const EMOJI_MAP = {
  chips: ['🥔', '🍟', '🥨', '🥖', '🌽', '🧀'],
  candy: ['🍬', '🍭', '🍫', '🍰', '🧁', '🍮'],
  drinks: ['🥤', '🧃', '🧋', '🍹', '🥛', '🧊'],
  chocolate: ['🍫', '🍪', '🍩', '🧇', '🥮', '🍯'],
  cookies: ['🍪', '🥠', '🧈', '🥐', '🥯', '🍞'],
  international: ['🌮', '🍜', '🍙', '🍱', '🥟', '🍡'],
  savory: ['🥓', '🍖', '🥩', '🦴', '🍗', '🧆'],
  spicy: ['🌶️', '🔥', '💥', '🥵', '🌋', '⚡']
}

/**
 * Generate a random product ID
 */
function generateId(): string {
  return `snack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get random emoji for category
 */
function getRandomEmoji(category: SnackProduct['category']): string {
  const emojis = EMOJI_MAP[category] || EMOJI_MAP.chips
  return emojis[Math.floor(Math.random() * emojis.length)]
}

/**
 * Generate a realistic price based on category
 */
function generatePrice(category: SnackProduct['category']): number {
  const priceRanges = {
    chips: [2, 6],
    candy: [1.5, 4],
    drinks: [3, 8],
    chocolate: [3, 9],
    cookies: [3, 7],
    international: [4, 12],
    savory: [4, 10],
    spicy: [3, 9]
  }

  const [min, max] = priceRanges[category] || [2, 8]
  return Number((Math.random() * (max - min) + min).toFixed(2))
}

/**
 * Generate nutrition facts based on category
 */
function generateNutrition(category: SnackProduct['category']): SnackProduct['nutritionFacts'] {
  const baseNutrition = {
    chips: { calories: 150, protein: 2, carbs: 15, fat: 9, sodium: 180, sugar: 1 },
    candy: { calories: 120, protein: 0, carbs: 28, fat: 2, sodium: 20, sugar: 22 },
    drinks: { calories: 140, protein: 0, carbs: 36, fat: 0, sodium: 50, sugar: 35 },
    chocolate: { calories: 200, protein: 3, carbs: 24, fat: 11, sodium: 30, sugar: 20 },
    cookies: { calories: 180, protein: 2, carbs: 26, fat: 8, sodium: 120, sugar: 14 },
    international: { calories: 160, protein: 4, carbs: 20, fat: 7, sodium: 200, sugar: 6 },
    savory: { calories: 170, protein: 5, carbs: 18, fat: 9, sodium: 250, sugar: 3 },
    spicy: { calories: 155, protein: 3, carbs: 17, fat: 8, sodium: 220, sugar: 4 }
  }

  const base = baseNutrition[category] || baseNutrition.chips

  // Add slight randomness (±20%)
  return {
    calories: Math.round(base.calories * (0.8 + Math.random() * 0.4)),
    protein: Math.round(base.protein * (0.8 + Math.random() * 0.4)),
    carbs: Math.round(base.carbs * (0.8 + Math.random() * 0.4)),
    fat: Math.round(base.fat * (0.8 + Math.random() * 0.4)),
    sodium: Math.round(base.sodium * (0.8 + Math.random() * 0.4)),
    sugar: Math.round(base.sugar * (0.8 + Math.random() * 0.4))
  }
}

/**
 * Generate a fallback snack name using templates
 */
function generateFallbackName(params: GenerateProductParams): string {
  const category = params.category || 'chips'
  const searchTerm = params.searchTerm || ''

  const prefixes = ['Exotic', 'Supreme', 'Legendary', 'Ultimate', 'Divine', 'Cosmic', 'Mystical', 'Imperial']
  const suffixes = ['Crunch', 'Delight', 'Fusion', 'Blast', 'Sensation', 'Wave', 'Dream', 'Paradise']
  const adjectives = ['Spicy', 'Sweet', 'Tangy', 'Savory', 'Zesty', 'Bold', 'Wild', 'Premium']

  if (searchTerm) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${prefix} ${searchTerm} ${suffix}`
  } else {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${adjective} ${prefix} ${category} ${suffix}`
  }
}

/**
 * Generate a snack name using HuggingFace (FREE model)
 */
async function generateSnackName(params: GenerateProductParams): Promise<string> {
  const category = params.category || 'chips'
  const searchTerm = params.searchTerm || ''

  const prompt = searchTerm
    ? `Generate a creative exotic ${category} snack name inspired by ${searchTerm}:`
    : `Generate a creative exotic ${category} snack name:`

  const response = await hf.textGeneration({
    model: 'google/flan-t5-large', // FREE model
    inputs: prompt,
    parameters: {
      max_new_tokens: 30,
      temperature: 0.9,
      return_full_text: false
    }
  })

  let name = response.generated_text.trim()

  // Clean the name
  name = name.replace(/^(Name:|Snack name:|Answer:)/i, '').trim()
  name = name.split('\n')[0].trim()
  name = name.replace(/['"]/g, '')

  // Capitalize first letter of each word
  name = name.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')

  return name
}

/**
 * Generate a fallback description
 */
function generateFallbackDescription(name: string, category: string): string {
  const templates = [
    `Experience the unique blend of exotic flavors in every bite of ${name}. A ${category} snack like no other.`,
    `${name} brings together the perfect combination of taste and texture. An unforgettable ${category} experience.`,
    `Discover the extraordinary with ${name}. This ${category} snack will transport your taste buds to new heights.`,
    `${name} is a masterpiece of flavor. Each bite delivers a unique ${category} experience you won't forget.`,
    `Indulge in the exotic taste of ${name}. A premium ${category} snack crafted for adventurous palates.`
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

/**
 * Generate a snack description using HuggingFace (FREE model)
 */
async function generateDescription(name: string, category: string): Promise<string> {
  const prompt = `Describe this delicious exotic ${category} snack called "${name}" in one appealing sentence:`

  const response = await hf.textGeneration({
    model: 'google/flan-t5-large', // FREE model
    inputs: prompt,
    parameters: {
      max_new_tokens: 80,
      temperature: 0.8,
      return_full_text: false
    }
  })

  let description = response.generated_text.trim()
  description = description.replace(/^(Description:|Answer:)/i, '').trim()

  // Ensure it ends with a period
  if (!description.endsWith('.')) {
    description += '.'
  }

  // Capitalize first letter
  description = description.charAt(0).toUpperCase() + description.slice(1)

  return description
}

/**
 * Generate ingredients list
 */
function generateIngredients(category: SnackProduct['category']): string[] {
  const baseIngredients = {
    chips: ['Potatoes', 'Vegetable Oil', 'Sea Salt'],
    candy: ['Sugar', 'Corn Syrup', 'Natural Flavors'],
    drinks: ['Carbonated Water', 'Cane Sugar', 'Natural Flavors'],
    chocolate: ['Cocoa', 'Sugar', 'Milk', 'Cocoa Butter'],
    cookies: ['Wheat Flour', 'Sugar', 'Butter', 'Eggs'],
    international: ['Rice', 'Seaweed', 'Soy Sauce', 'Sesame Oil'],
    savory: ['Wheat', 'Cheese', 'Yeast', 'Salt'],
    spicy: ['Chili Peppers', 'Paprika', 'Garlic', 'Onion']
  }

  const exoticIngredients = [
    'Yuzu Extract', 'Matcha Powder', 'Black Garlic', 'Truffle Oil',
    'Saffron', 'Lychee', 'Dragon Fruit', 'Ube', 'Miso', 'Gochugaru',
    'Tahini', 'Sumac', 'Za\'atar', 'Cardamom'
  ]

  const base = baseIngredients[category] || baseIngredients.chips
  const numExotic = Math.random() > 0.5 ? 2 : 1
  const exotic = [...exoticIngredients].sort(() => Math.random() - 0.5).slice(0, numExotic)

  return [...base, ...exotic]
}

/**
 * Generate allergen list based on ingredients
 */
function generateAllergens(ingredients: string[]): string[] {
  const allergenMap: Record<string, string> = {
    'Milk': 'Dairy',
    'Butter': 'Dairy',
    'Cheese': 'Dairy',
    'Wheat': 'Gluten',
    'Wheat Flour': 'Gluten',
    'Eggs': 'Eggs',
    'Peanuts': 'Peanuts',
    'Soy Sauce': 'Soy',
    'Sesame Oil': 'Sesame',
    'Tahini': 'Sesame'
  }

  const allergens = new Set<string>()

  ingredients.forEach(ingredient => {
    const allergen = allergenMap[ingredient]
    if (allergen) allergens.add(allergen)
  })

  if (Math.random() > 0.7) {
    allergens.add('Tree Nuts')
  }

  return Array.from(allergens)
}

/**
 * Generate a complete snack product
 */
export async function generateProduct(
  params: GenerateProductParams = {}
): Promise<SnackProduct> {
  const categories: SnackProduct['category'][] = [
    'chips', 'candy', 'drinks', 'chocolate', 'cookies', 'international', 'savory', 'spicy'
  ]
  const category = params.category || categories[Math.floor(Math.random() * categories.length)]

  const name = await generateSnackName(params)
  const description = await generateDescription(name, category)
  const ingredients = generateIngredients(category)
  const allergens = generateAllergens(ingredients)

  const flavorProfiles: SnackProduct['flavorProfile'] = []
  if (['candy', 'chocolate', 'cookies'].includes(category)) flavorProfiles.push('sweet')
  if (['chips', 'savory'].includes(category)) flavorProfiles.push('savory')
  if (category === 'spicy') flavorProfiles.push('spicy', 'savory')
  if (Math.random() > 0.7) flavorProfiles.push('tangy')
  if (Math.random() > 0.8) flavorProfiles.push('umami')

  const origins = [
    'Japan', 'Korea', 'Thailand', 'Mexico', 'Italy', 'France',
    'India', 'Morocco', 'Peru', 'Brazil', 'Turkey', 'Spain'
  ]
  const origin = origins[Math.floor(Math.random() * origins.length)]

  const product: SnackProduct = {
    id: generateId(),
    name,
    description,
    price: generatePrice(category),
    emoji: getRandomEmoji(category),
    ingredients,
    allergens,
    category,
    origin,
    flavorProfile: flavorProfiles,
    nutritionFacts: generateNutrition(category),
    starred: false,
    generatedAt: Date.now(),
    viewCount: 0
  }

  await cacheProduct(product)
  return product
}

/**
 * Generate multiple products in parallel
 */
export async function generateProducts(
  count: number,
  params: GenerateProductParams = {}
): Promise<SnackProduct[]> {
  const batchSize = 3
  const products: SnackProduct[] = []

  for (let i = 0; i < count; i += batchSize) {
    const batchCount = Math.min(batchSize, count - i)
    const batch = await Promise.all(
      Array.from({ length: batchCount }, () => generateProduct(params))
    )
    products.push(...batch)
  }

  return products
}

/**
 * Preload function (no-op for HuggingFace - always ready)
 */
export async function preloadModel(): Promise<void> {
  console.log('HuggingFace API ready (no model loading required)')
}

/**
 * Check if model is loaded (always true for API-based approach)
 */
export function isModelLoaded(): boolean {
  return true
}
