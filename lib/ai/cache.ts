// IndexedDB cache for generated products and embeddings
import { get, set, del, keys, clear } from 'idb-keyval'
import type { SnackProduct } from './types'

const CACHE_VERSION = 'v1'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE_SIZE = 500 // Maximum number of cached products

interface CachedProduct extends SnackProduct {
  cachedAt: number
}

// Cache key generators
const productKey = (id: string) => `${CACHE_VERSION}:product:${id}`
const embeddingKey = (text: string) => `${CACHE_VERSION}:embedding:${text}`
const allProductsKey = () => `${CACHE_VERSION}:products:all`

/**
 * Cache a generated product
 */
export async function cacheProduct(product: SnackProduct): Promise<void> {
  const cached: CachedProduct = {
    ...product,
    cachedAt: Date.now()
  }
  await set(productKey(product.id), cached)

  // Also add to all products list
  const allProducts = await getAllCachedProducts()
  allProducts.push(product.id)
  await set(allProductsKey(), allProducts)

  // Enforce cache size limit
  await enforceMaxCacheSize()
}

/**
 * Get a cached product by ID
 */
export async function getCachedProduct(id: string): Promise<SnackProduct | null> {
  const cached = await get<CachedProduct>(productKey(id))

  if (!cached) return null

  // Check if cache is still valid
  if (Date.now() - cached.cachedAt > CACHE_DURATION) {
    await del(productKey(id))
    return null
  }

  return cached
}

/**
 * Get all cached product IDs
 */
export async function getAllCachedProducts(): Promise<string[]> {
  const ids = await get<string[]>(allProductsKey())
  return ids || []
}

/**
 * Cache an embedding
 */
export async function cacheEmbedding(text: string, embedding: number[]): Promise<void> {
  await set(embeddingKey(text), {
    embedding,
    cachedAt: Date.now()
  })
}

/**
 * Get a cached embedding
 */
export async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const cached = await get<{ embedding: number[], cachedAt: number }>(embeddingKey(text))

  if (!cached) return null

  // Check if cache is still valid
  if (Date.now() - cached.cachedAt > CACHE_DURATION) {
    await del(embeddingKey(text))
    return null
  }

  return cached.embedding
}

/**
 * Clear all cached products
 */
export async function clearProductCache(): Promise<void> {
  const productIds = await getAllCachedProducts()

  // Delete all products
  await Promise.all(productIds.map(id => del(productKey(id))))

  // Clear the all products list
  await del(allProductsKey())
}

/**
 * Enforce maximum cache size by removing oldest entries
 */
async function enforceMaxCacheSize(): Promise<void> {
  const productIds = await getAllCachedProducts()

  if (productIds.length <= MAX_CACHE_SIZE) return

  // Get all products with their cache times
  const products = await Promise.all(
    productIds.map(async id => {
      const product = await get<CachedProduct>(productKey(id))
      return { id, cachedAt: product?.cachedAt || 0 }
    })
  )

  // Sort by cache time (oldest first)
  products.sort((a, b) => a.cachedAt - b.cachedAt)

  // Remove oldest entries
  const toRemove = products.slice(0, productIds.length - MAX_CACHE_SIZE)
  await Promise.all(toRemove.map(({ id }) => del(productKey(id))))

  // Update all products list
  const remaining = productIds.filter(id => !toRemove.find(r => r.id === id))
  await set(allProductsKey(), remaining)
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  productCount: number
  oldestCacheDate: Date | null
  newestCacheDate: Date | null
}> {
  const productIds = await getAllCachedProducts()

  if (productIds.length === 0) {
    return {
      productCount: 0,
      oldestCacheDate: null,
      newestCacheDate: null
    }
  }

  const products = await Promise.all(
    productIds.map(id => get<CachedProduct>(productKey(id)))
  )

  const cacheTimes = products
    .filter((p): p is CachedProduct => p !== undefined)
    .map(p => p.cachedAt)

  return {
    productCount: productIds.length,
    oldestCacheDate: new Date(Math.min(...cacheTimes)),
    newestCacheDate: new Date(Math.max(...cacheTimes))
  }
}
