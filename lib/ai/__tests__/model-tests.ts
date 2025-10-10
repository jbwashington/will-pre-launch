// Browser-based tests for AI models
// Run these in the browser console or via test page

import { generateProduct, generateProducts, isModelLoaded, preloadModel } from '../text-generator'
import { generateEmbedding, generateProductEmbedding, findSimilarProducts, searchProducts, isEmbeddingModelLoaded, preloadEmbeddingModel } from '../embeddings'
import { cacheProduct, getCachedProduct, clearProductCache, getCacheStats } from '../cache'
import type { SnackProduct } from '../types'

export interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  details?: any
}

/**
 * Test: Text generation model loads
 */
export async function testTextModelLoading(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Text Generation Model Loading',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing text model loading...')
    await preloadModel()

    if (!isModelLoaded()) {
      throw new Error('Model reported as loaded but isModelLoaded() returns false')
    }

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      loadTime: `${result.duration.toFixed(0)}ms`,
      modelLoaded: true
    }

    console.log('✅ Text model loaded successfully in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Text model loading failed:', result.error)
  }

  return result
}

/**
 * Test: Embedding model loads
 */
export async function testEmbeddingModelLoading(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Embedding Model Loading',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing embedding model loading...')
    await preloadEmbeddingModel()

    if (!isEmbeddingModelLoaded()) {
      throw new Error('Model reported as loaded but isEmbeddingModelLoaded() returns false')
    }

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      loadTime: `${result.duration.toFixed(0)}ms`,
      modelLoaded: true
    }

    console.log('✅ Embedding model loaded successfully in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Embedding model loading failed:', result.error)
  }

  return result
}

/**
 * Test: Generate a single product
 */
export async function testProductGeneration(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Single Product Generation',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing product generation...')
    const product = await generateProduct({ searchTerm: 'spicy chips' })

    // Validate product structure
    if (!product.id) throw new Error('Product missing ID')
    if (!product.name || product.name.length < 3) throw new Error('Invalid product name')
    if (!product.description || product.description.length < 10) throw new Error('Invalid product description')
    if (!product.emoji) throw new Error('Product missing emoji')
    if (!product.price || product.price < 0) throw new Error('Invalid product price')
    if (!product.category) throw new Error('Product missing category')
    if (!product.ingredients || product.ingredients.length === 0) throw new Error('Product missing ingredients')
    if (!product.nutritionFacts) throw new Error('Product missing nutrition facts')

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      generationTime: `${result.duration.toFixed(0)}ms`,
      product: {
        name: product.name,
        category: product.category,
        price: product.price,
        ingredientCount: product.ingredients.length,
        hasNutrition: !!product.nutritionFacts
      }
    }

    console.log('✅ Product generated:', product.name, 'in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Product generation failed:', result.error)
  }

  return result
}

/**
 * Test: Generate multiple products
 */
export async function testBatchProductGeneration(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Batch Product Generation (4 products)',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing batch product generation (4 products)...')
    const products = await generateProducts(4, { category: 'chips' })

    if (products.length !== 4) {
      throw new Error(`Expected 4 products, got ${products.length}`)
    }

    // Validate all products
    products.forEach((product, index) => {
      if (!product.id) throw new Error(`Product ${index} missing ID`)
      if (!product.name) throw new Error(`Product ${index} missing name`)
      if (product.category !== 'chips') throw new Error(`Product ${index} has wrong category: ${product.category}`)
    })

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      generationTime: `${result.duration.toFixed(0)}ms`,
      timePerProduct: `${(result.duration / 4).toFixed(0)}ms`,
      products: products.map(p => ({
        name: p.name,
        category: p.category,
        price: p.price
      }))
    }

    console.log('✅ Generated 4 products in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Batch generation failed:', result.error)
  }

  return result
}

/**
 * Test: Generate embedding
 */
export async function testEmbeddingGeneration(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Embedding Generation',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing embedding generation...')
    const embedding = await generateEmbedding('chocolate chip cookies')

    if (!Array.isArray(embedding)) {
      throw new Error('Embedding is not an array')
    }

    if (embedding.length !== 384) {
      throw new Error(`Expected 384-dimensional embedding, got ${embedding.length}`)
    }

    // Check if embedding contains valid numbers
    const hasInvalidNumbers = embedding.some(val => isNaN(val) || !isFinite(val))
    if (hasInvalidNumbers) {
      throw new Error('Embedding contains invalid numbers')
    }

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      generationTime: `${result.duration.toFixed(0)}ms`,
      dimensions: embedding.length,
      sample: embedding.slice(0, 5).map(v => v.toFixed(4))
    }

    console.log('✅ Generated embedding in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Embedding generation failed:', result.error)
  }

  return result
}

/**
 * Test: Product similarity search
 */
export async function testProductSimilarity(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Product Similarity Search',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing product similarity search...')

    // Generate test products
    const targetProduct = await generateProduct({ searchTerm: 'chocolate cookies' })
    const candidates = await generateProducts(10, {})

    // Find similar products
    const similar = await findSimilarProducts(targetProduct, candidates, 3)

    if (!Array.isArray(similar)) {
      throw new Error('Similar products is not an array')
    }

    if (similar.length > 3) {
      throw new Error(`Expected max 3 similar products, got ${similar.length}`)
    }

    // Verify target product is not in results
    const containsTarget = similar.some(p => p.id === targetProduct.id)
    if (containsTarget) {
      throw new Error('Target product should not be in similar products')
    }

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      searchTime: `${result.duration.toFixed(0)}ms`,
      targetProduct: targetProduct.name,
      similarProducts: similar.map(p => p.name)
    }

    console.log('✅ Found', similar.length, 'similar products in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Similarity search failed:', result.error)
  }

  return result
}

/**
 * Test: Text-based product search
 */
export async function testProductSearch(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Text-Based Product Search',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing text-based product search...')

    // Generate products with different categories
    const products = await generateProducts(15, {})

    // Search for chocolate products
    const chocolateResults = await searchProducts('chocolate candy sweet', products, 5)

    if (!Array.isArray(chocolateResults)) {
      throw new Error('Search results is not an array')
    }

    if (chocolateResults.length > 5) {
      throw new Error(`Expected max 5 results, got ${chocolateResults.length}`)
    }

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      searchTime: `${result.duration.toFixed(0)}ms`,
      query: 'chocolate candy sweet',
      resultCount: chocolateResults.length,
      results: chocolateResults.map(p => ({
        name: p.name,
        category: p.category
      }))
    }

    console.log('✅ Search completed in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Product search failed:', result.error)
  }

  return result
}

/**
 * Test: IndexedDB caching
 */
export async function testProductCaching(): Promise<TestResult> {
  const result: TestResult = {
    name: 'IndexedDB Product Caching',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Testing product caching...')

    // Clear cache first
    await clearProductCache()

    // Generate and cache a product
    const product = await generateProduct({ searchTerm: 'test product' })
    await cacheProduct(product)

    // Retrieve from cache
    const cachedProduct = await getCachedProduct(product.id)

    if (!cachedProduct) {
      throw new Error('Product not found in cache')
    }

    if (cachedProduct.id !== product.id) {
      throw new Error('Cached product ID mismatch')
    }

    if (cachedProduct.name !== product.name) {
      throw new Error('Cached product name mismatch')
    }

    // Check cache stats
    const stats = await getCacheStats()

    if (stats.productCount < 1) {
      throw new Error('Cache stats show incorrect count')
    }

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = {
      cacheTime: `${result.duration.toFixed(0)}ms`,
      cachedProductId: product.id,
      cacheStats: stats
    }

    console.log('✅ Caching works correctly in', result.duration.toFixed(0), 'ms')
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Caching test failed:', result.error)
  }

  return result
}

/**
 * Test: Performance benchmarks
 */
export async function testPerformanceBenchmarks(): Promise<TestResult> {
  const result: TestResult = {
    name: 'Performance Benchmarks',
    status: 'running'
  }

  const startTime = performance.now()

  try {
    console.log('🧪 Running performance benchmarks...')

    const benchmarks: any = {}

    // Benchmark: Single product generation
    const productStart = performance.now()
    await generateProduct({})
    benchmarks.singleProduct = `${(performance.now() - productStart).toFixed(0)}ms`

    // Benchmark: Embedding generation
    const embeddingStart = performance.now()
    await generateEmbedding('test product')
    benchmarks.embedding = `${(performance.now() - embeddingStart).toFixed(0)}ms`

    // Benchmark: Batch generation (3 products)
    const batchStart = performance.now()
    await generateProducts(3, {})
    benchmarks.batchGeneration = `${(performance.now() - batchStart).toFixed(0)}ms`
    benchmarks.batchAverage = `${((performance.now() - batchStart) / 3).toFixed(0)}ms`

    result.duration = performance.now() - startTime
    result.status = 'passed'
    result.details = benchmarks

    console.log('✅ Performance benchmarks:', benchmarks)
  } catch (error) {
    result.duration = performance.now() - startTime
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : String(error)
    console.error('❌ Performance benchmark failed:', result.error)
  }

  return result
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<TestResult[]> {
  console.log('🚀 Running all AI model tests...\n')

  const results: TestResult[] = []

  // Run tests sequentially
  results.push(await testTextModelLoading())
  results.push(await testEmbeddingModelLoading())
  results.push(await testProductGeneration())
  results.push(await testBatchProductGeneration())
  results.push(await testEmbeddingGeneration())
  results.push(await testProductSimilarity())
  results.push(await testProductSearch())
  results.push(await testProductCaching())
  results.push(await testPerformanceBenchmarks())

  // Summary
  const passed = results.filter(r => r.status === 'passed').length
  const failed = results.filter(r => r.status === 'failed').length
  const totalTime = results.reduce((sum, r) => sum + (r.duration || 0), 0)

  console.log('\n📊 Test Summary:')
  console.log(`✅ Passed: ${passed}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  console.log(`⏱️  Total time: ${totalTime.toFixed(0)}ms`)

  return results
}
