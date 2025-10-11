// Browser-based AI generation using Transformers.js
// This runs ONLY in the browser using Web Workers

'use client'

import type { SnackProduct, GenerateProductParams } from './types'
import { cacheProduct } from './cache'

// Lazy load Transformers.js only when needed
let transformersPromise: Promise<any> | null = null

async function loadTransformers() {
  if (transformersPromise) return transformersPromise

  transformersPromise = (async () => {
    if (typeof window === 'undefined') {
      throw new Error('Transformers.js requires browser environment')
    }

    const module = await import('@xenova/transformers')

    // Handle both default and named exports
    const transformers = module.default || module

    // Safely configure Transformers.js if env exists
    if (transformers?.env) {
      transformers.env.allowLocalModels = false
      transformers.env.useBrowserCache = true
      if (transformers.env.backends?.onnx?.wasm) {
        transformers.env.backends.onnx.wasm.proxy = false
      }
    }

    // Extract pipeline function
    const pipeline = transformers.pipeline || transformers.default?.pipeline

    if (!pipeline) {
      throw new Error('Pipeline function not found in Transformers.js module')
    }

    return { pipeline, env: transformers.env }
  })()

  return transformersPromise
}

// Model singletons
let textGenerator: any = null
let isLoading = false

// Emoji collections
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

async function initTextGenerator() {
  if (textGenerator) return textGenerator

  if (isLoading) {
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return textGenerator
  }

  try {
    isLoading = true
    console.log('🤖 Loading browser-based AI model...')

    const transformersModule = await loadTransformers()

    if (!transformersModule) {
      throw new Error('Failed to load Transformers.js module')
    }

    // Extract pipeline function
    const pipeline = transformersModule.pipeline

    if (!pipeline) {
      throw new Error('Pipeline function not found in Transformers.js module')
    }

    // Use smaller model for faster loading
    textGenerator = await pipeline(
      'text2text-generation',
      'Xenova/flan-t5-small',
      { quantized: true }
    )

    console.log('✅ AI model loaded successfully!')
    return textGenerator
  } catch (error) {
    console.error('Failed to initialize text generator:', error)
    throw error
  } finally {
    isLoading = false
  }
}

function generateId(): string {
  return `snack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getRandomEmoji(category: SnackProduct['category']): string {
  const emojis = EMOJI_MAP[category] || EMOJI_MAP.chips
  return emojis[Math.floor(Math.random() * emojis.length)]
}

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

  return {
    calories: Math.round(base.calories * (0.8 + Math.random() * 0.4)),
    protein: Math.round(base.protein * (0.8 + Math.random() * 0.4)),
    carbs: Math.round(base.carbs * (0.8 + Math.random() * 0.4)),
    fat: Math.round(base.fat * (0.8 + Math.random() * 0.4)),
    sodium: Math.round(base.sodium * (0.8 + Math.random() * 0.4)),
    sugar: Math.round(base.sugar * (0.8 + Math.random() * 0.4))
  }
}

function generateFallbackName(params: GenerateProductParams): string {
  const category = params.category || 'chips'
  const searchTerm = params.searchTerm || ''

  const prefixes = ['Exotic', 'Supreme', 'Legendary', 'Ultimate', 'Divine', 'Cosmic', 'Mystical', 'Imperial', 'Royal', 'Premium']
  const middles = ['Fusion', 'Blend', 'Mix', 'Delight', 'Sensation', 'Wave', 'Dream', 'Paradise', 'Experience', 'Journey']
  const adjectives = ['Spicy', 'Sweet', 'Tangy', 'Savory', 'Zesty', 'Bold', 'Wild', 'Premium', 'Artisan', 'Gourmet']

  if (searchTerm) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const middle = middles[Math.floor(Math.random() * middles.length)]
    return `${prefix} ${searchTerm} ${middle}`
  } else {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const middle = middles[Math.floor(Math.random() * middles.length)]
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
    return `${adjective} ${prefix} ${categoryName} ${middle}`
  }
}

async function generateSnackName(params: GenerateProductParams): Promise<string> {
  try {
    const generator = await initTextGenerator()

    const category = params.category || 'chips'
    const searchTerm = params.searchTerm || ''

    const prompt = searchTerm
      ? `Create an exotic ${category} snack name with ${searchTerm}:`
      : `Create an exotic ${category} snack name:`

    const result = await generator(prompt, {
      max_new_tokens: 20,
      temperature: 0.9,
      do_sample: true
    })

    let name = result[0].generated_text.trim()

    // Clean up
    name = name.replace(/^(Name:|Snack name:|Answer:)/i, '').trim()
    name = name.split('\n')[0].trim()
    name = name.replace(/['"]/g, '')

    // Capitalize
    name = name.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')

    return name || generateFallbackName(params)
  } catch (error) {
    console.warn('AI name generation failed, using template-based generation:', error)
    return generateFallbackName(params)
  }
}

function generateFallbackDescription(name: string, category: string): string {
  const templates = [
    `Experience the unique blend of exotic flavors in every bite of ${name}. A ${category} snack like no other.`,
    `${name} brings together the perfect combination of taste and texture. An unforgettable ${category} experience.`,
    `Discover the extraordinary with ${name}. This ${category} snack will transport your taste buds to new heights.`,
    `${name} is a masterpiece of flavor engineering. Each bite delivers a unique ${category} experience you won't forget.`,
    `Indulge in the exotic taste of ${name}. A premium ${category} snack crafted for adventurous palates.`,
    `${name} combines traditional ${category} craftsmanship with bold, exotic ingredients for an unparalleled taste journey.`,
    `Get ready for a flavor explosion with ${name}. This ${category} snack pushes the boundaries of taste.`,
    `${name} is where culinary artistry meets ${category} perfection. Prepare for an extraordinary taste adventure.`
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

async function generateDescription(name: string, category: string): Promise<string> {
  try {
    const generator = await initTextGenerator()

    const prompt = `Describe this ${category} snack "${name}":`

    const result = await generator(prompt, {
      max_new_tokens: 50,
      temperature: 0.8
    })

    let description = result[0].generated_text.trim()
    description = description.replace(/^(Description:|Answer:)/i, '').trim()

    if (!description.endsWith('.')) {
      description += '.'
    }

    description = description.charAt(0).toUpperCase() + description.slice(1)

    return description || generateFallbackDescription(name, category)
  } catch (error) {
    console.warn('AI description generation failed, using template-based generation:', error)
    return generateFallbackDescription(name, category)
  }
}

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

export async function preloadModel(): Promise<void> {
  await initTextGenerator()
}

export function isModelLoaded(): boolean {
  return textGenerator !== null
}
