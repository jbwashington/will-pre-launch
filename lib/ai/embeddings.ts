// Embedding service for search and similarity
// Uses Transformers.js sentence embeddings

import type { SnackProduct } from './types'
import { getCachedEmbedding, cacheEmbedding } from './cache'

// Model singleton
let embeddingModel: any = null
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

/**
 * Initialize the embedding model
 */
async function initEmbeddingModel() {
  if (embeddingModel) return embeddingModel

  if (isLoading) {
    // Wait for loading to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return embeddingModel
  }

  try {
    isLoading = true
    console.log('Loading embedding model...')

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

    // Use all-MiniLM-L6-v2 for fast, quality embeddings
    embeddingModel = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        quantized: true,
      }
    )

    console.log('Embedding model loaded!')
    return embeddingModel
  } catch (error) {
    console.error('Failed to initialize embedding model:', error)
    throw error
  } finally {
    isLoading = false
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Generate embedding for a text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cached = await getCachedEmbedding(text)
  if (cached) return cached

  const model = await initEmbeddingModel()

  // Generate embedding
  const result = await model(text, {
    pooling: 'mean',
    normalize: true
  })

  // Convert to regular array
  const embedding = Array.from(result.data as Float32Array)

  // Cache the embedding
  await cacheEmbedding(text, embedding)

  return embedding
}

/**
 * Generate embedding for a product (combines name, description, category)
 */
export async function generateProductEmbedding(product: SnackProduct): Promise<number[]> {
  const text = `${product.name} ${product.description} ${product.category} ${product.origin}`
  return generateEmbedding(text)
}

/**
 * Find similar products based on embedding similarity
 */
export async function findSimilarProducts(
  targetProduct: SnackProduct,
  candidates: SnackProduct[],
  topK: number = 5
): Promise<SnackProduct[]> {
  // Generate embedding for target if not already present
  if (!targetProduct.embedding) {
    targetProduct.embedding = await generateProductEmbedding(targetProduct)
  }

  // Generate embeddings for candidates if needed
  const candidatesWithEmbeddings = await Promise.all(
    candidates.map(async product => {
      if (!product.embedding) {
        product.embedding = await generateProductEmbedding(product)
      }
      return product
    })
  )

  // Calculate similarities
  const similarities = candidatesWithEmbeddings.map(candidate => ({
    product: candidate,
    similarity: cosineSimilarity(targetProduct.embedding!, candidate.embedding!)
  }))

  // Sort by similarity (highest first) and exclude the target product
  similarities.sort((a, b) => b.similarity - a.similarity)

  return similarities
    .filter(({ product }) => product.id !== targetProduct.id)
    .slice(0, topK)
    .map(({ product }) => product)
}

/**
 * Search products by query text
 */
export async function searchProducts(
  query: string,
  products: SnackProduct[],
  topK: number = 10
): Promise<SnackProduct[]> {
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)

  // Generate embeddings for products if needed
  const productsWithEmbeddings = await Promise.all(
    products.map(async product => {
      if (!product.embedding) {
        product.embedding = await generateProductEmbedding(product)
      }
      return product
    })
  )

  // Calculate similarities
  const similarities = productsWithEmbeddings.map(product => ({
    product,
    similarity: cosineSimilarity(queryEmbedding, product.embedding!)
  }))

  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity)

  return similarities
    .slice(0, topK)
    .map(({ product }) => product)
}

/**
 * Get model loading status
 */
export function isEmbeddingModelLoaded(): boolean {
  return embeddingModel !== null
}

/**
 * Pre-load the embedding model
 */
export async function preloadEmbeddingModel(): Promise<void> {
  await initEmbeddingModel()
}
