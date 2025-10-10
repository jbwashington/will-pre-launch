// Text generation service for creating snack products
// Uses Transformers.js in the browser

import type { SnackProduct, GenerateProductParams } from './types'
import { getCachedProduct, cacheProduct } from './cache'

// Model singleton
let textGenerator: any = null
let isLoading = false
let transformers: any = null

// Dynamically import Transformers.js (client-side only)
async function loadTransformers() {
  if (transformers) return transformers

  if (typeof window === 'undefined') {
    throw new Error('Transformers.js can only be used in the browser')
  }

  try {
    const module = await import('@xenova/transformers')

    // Handle both default and named exports
    transformers = module.default || module

    // Safely configure Transformers.js if env exists
    if (transformers?.env) {
      transformers.env.allowLocalModels = false
      if (transformers.env.backends?.onnx?.wasm) {
        transformers.env.backends.onnx.wasm.proxy = false
      }
    }

    return transformers
  } catch (error) {
    console.error('Failed to load Transformers.js:', error)
    throw new Error(`Failed to load Transformers.js: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

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
 * Initialize the text generation model
 */
async function initTextGenerator() {
  if (textGenerator) return textGenerator

  if (isLoading) {
    // Wait for loading to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return textGenerator
  }

  try {
    isLoading = true
    console.log('Loading text generation model...')

    // Load Transformers.js dynamically
    const transformersModule = await loadTransformers()

    if (!transformersModule) {
      throw new Error('Failed to load Transformers.js module')
    }

    // Extract pipeline function
    const pipeline = transformersModule.pipeline || transformersModule.default?.pipeline

    if (!pipeline) {
      throw new Error('Pipeline function not found in Transformers.js module')
    }

    // Use Flan-T5 Small for fast, structured generation
    textGenerator = await pipeline(
      'text2text-generation',
      'Xenova/flan-t5-small',
      {
        quantized: true, // Use quantized version for faster loading
      }
    )

    console.log('Text generation model loaded!')
    return textGenerator
  } catch (error) {
    console.error('Failed to initialize text generator:', error)
    throw error
  } finally {
    isLoading = false
  }
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
 * Generate a fallback snack name using templates (no AI)
 */
function generateFallbackName(params: GenerateProductParams): string {
  const category = params.category || 'chips'
  const searchTerm = params.searchTerm || ''

  const prefixes = ['Exotic', 'Supreme', 'Legendary', 'Ultimate', 'Divine', 'Cosmic', 'Mystical', 'Imperial']
  const suffixes = ['Crunch', 'Delight', 'Fusion', 'Blast', 'Sensation', 'Wave', 'Dream', 'Paradise']
  const adjectives = ['Spicy', 'Sweet', 'Tangy', 'Savory', 'Zesty', 'Bold', 'Wild', 'Premium']

  if (searchTerm) {
    // Use search term as the main part
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${prefix} ${searchTerm} ${suffix}`
  } else {
    // Generate random name based on category
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${adjective} ${prefix} ${category} ${suffix}`
  }
}

/**
 * Generate a snack name using AI (with fallback)
 */
async function generateSnackName(params: GenerateProductParams): Promise<string> {
  try {
    const generator = await initTextGenerator()

    const category = params.category || 'chips'
    const searchTerm = params.searchTerm || ''

    const prompt = searchTerm
      ? `Create a creative ${category} snack name inspired by: ${searchTerm}. Make it exotic and unique. Name only:`
      : `Create a creative exotic ${category} snack name. Make it unique and interesting. Name only:`

    const result = await generator(prompt, {
      max_new_tokens: 20,
      temperature: 0.9,
      do_sample: true
    })

    // Extract and clean the generated name
    let name = result[0].generated_text.trim()

    // Remove common AI artifacts
    name = name.replace(/^(Name:|Snack name:|Answer:)/i, '').trim()
    name = name.split('\n')[0].trim() // Take only first line
    name = name.replace(/['"]/g, '') // Remove quotes

    // Fallback to template if generation failed
    if (!name || name.length < 3 || name.length > 60) {
      return generateFallbackName(params)
    }

    return name
  } catch (error) {
    console.warn('AI name generation failed, using fallback:', error)
    return generateFallbackName(params)
  }
}

/**
 * Generate a fallback description (no AI)
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
 * Generate a snack description using AI (with fallback)
 */
async function generateDescription(name: string, category: string): Promise<string> {
  try {
    const generator = await initTextGenerator()

    const prompt = `Describe this exotic snack in 1-2 sentences: ${name}. Make it sound delicious and unique.`

    const result = await generator(prompt, {
      max_new_tokens: 60,
      temperature: 0.8
    })

    let description = result[0].generated_text.trim()

    // Clean up the description
    description = description.replace(/^(Description:|Answer:)/i, '').trim()

    // Fallback if generation failed
    if (!description || description.length < 10) {
      return generateFallbackDescription(name, category)
    }

    return description
  } catch (error) {
    console.warn('AI description generation failed, using fallback:', error)
    return generateFallbackDescription(name, category)
  }
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
    'Yuzu Extract',
    'Matcha Powder',
    'Black Garlic',
    'Truffle Oil',
    'Saffron',
    'Lychee',
    'Dragon Fruit',
    'Ube',
    'Miso',
    'Gochugaru',
    'Tahini',
    'Sumac',
    'Za\'atar',
    'Cardamom'
  ]

  const base = baseIngredients[category] || baseIngredients.chips

  // Add 1-2 exotic ingredients
  const numExotic = Math.random() > 0.5 ? 2 : 1
  const exotic = [...exoticIngredients]
    .sort(() => Math.random() - 0.5)
    .slice(0, numExotic)

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

  // Add "May contain" warnings
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
  // Random category if not provided
  const categories: SnackProduct['category'][] = [
    'chips', 'candy', 'drinks', 'chocolate', 'cookies', 'international', 'savory', 'spicy'
  ]
  const category = params.category || categories[Math.floor(Math.random() * categories.length)]

  // Generate product details
  const name = await generateSnackName(params)
  const description = await generateDescription(name, category)
  const ingredients = generateIngredients(category)
  const allergens = generateAllergens(ingredients)

  // Determine flavor profile
  const flavorProfiles: SnackProduct['flavorProfile'] = []
  if (['candy', 'chocolate', 'cookies'].includes(category)) flavorProfiles.push('sweet')
  if (['chips', 'savory'].includes(category)) flavorProfiles.push('savory')
  if (category === 'spicy') flavorProfiles.push('spicy', 'savory')
  if (Math.random() > 0.7) flavorProfiles.push('tangy')
  if (Math.random() > 0.8) flavorProfiles.push('umami')

  // Random origin
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

  // Cache the product
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
  // Generate in batches to avoid overloading
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
 * Get model loading status
 */
export function isModelLoaded(): boolean {
  return textGenerator !== null
}

/**
 * Pre-load the model
 */
export async function preloadModel(): Promise<void> {
  await initTextGenerator()
}
