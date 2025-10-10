/**
 * Console Test Runner
 *
 * Run tests directly in browser console for quick verification
 *
 * Usage:
 * 1. Open browser console (F12)
 * 2. Navigate to /shop
 * 3. Run: window.runAITests()
 */

import { runAllTests, type TestResult } from './model-tests'

// Attach to window for console access
declare global {
  interface Window {
    runAITests: () => Promise<TestResult[]>
    testTextModel: () => Promise<void>
    testEmbeddings: () => Promise<void>
    testProductGen: () => Promise<void>
  }
}

/**
 * Quick test: Text generation model
 */
export async function quickTestTextModel() {
  console.log('🧪 Quick Test: Text Generation Model\n')

  try {
    const { preloadModel, generateProduct, isModelLoaded } = await import('../text-generator')

    console.log('Loading model...')
    const startTime = performance.now()
    await preloadModel()
    const loadTime = performance.now() - startTime

    console.log(`✅ Model loaded in ${loadTime.toFixed(0)}ms`)
    console.log(`✅ Model status: ${isModelLoaded() ? 'Loaded' : 'Not loaded'}`)

    console.log('\nGenerating test product...')
    const genStart = performance.now()
    const product = await generateProduct({ searchTerm: 'spicy ramen chips' })
    const genTime = performance.now() - genStart

    console.log(`✅ Product generated in ${genTime.toFixed(0)}ms`)
    console.log('\nProduct Details:')
    console.log(`  Name: ${product.name}`)
    console.log(`  Category: ${product.category}`)
    console.log(`  Price: $${product.price}`)
    console.log(`  Ingredients: ${product.ingredients.slice(0, 3).join(', ')}...`)
    console.log(`  Allergens: ${product.allergens.join(', ') || 'None'}`)

    console.log('\n✅ Text generation model working correctly!')
  } catch (error) {
    console.error('❌ Text model test failed:', error)
  }
}

/**
 * Quick test: Embedding model
 */
export async function quickTestEmbeddings() {
  console.log('🧪 Quick Test: Embedding Model\n')

  try {
    const { preloadEmbeddingModel, generateEmbedding, isEmbeddingModelLoaded } = await import('../embeddings')

    console.log('Loading model...')
    const startTime = performance.now()
    await preloadEmbeddingModel()
    const loadTime = performance.now() - startTime

    console.log(`✅ Model loaded in ${loadTime.toFixed(0)}ms`)
    console.log(`✅ Model status: ${isEmbeddingModelLoaded() ? 'Loaded' : 'Not loaded'}`)

    console.log('\nGenerating embeddings...')
    const genStart = performance.now()
    const embedding = await generateEmbedding('chocolate chip cookies')
    const genTime = performance.now() - genStart

    console.log(`✅ Embedding generated in ${genTime.toFixed(0)}ms`)
    console.log(`✅ Dimensions: ${embedding.length}`)
    console.log(`✅ Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`)

    console.log('\n✅ Embedding model working correctly!')
  } catch (error) {
    console.error('❌ Embedding test failed:', error)
  }
}

/**
 * Quick test: Product generation pipeline
 */
export async function quickTestProductGeneration() {
  console.log('🧪 Quick Test: Product Generation Pipeline\n')

  try {
    const { generateProducts } = await import('../text-generator')

    console.log('Generating 3 products...')
    const startTime = performance.now()
    const products = await generateProducts(3, { category: 'chips' })
    const totalTime = performance.now() - startTime

    console.log(`✅ Generated ${products.length} products in ${totalTime.toFixed(0)}ms`)
    console.log(`✅ Average time: ${(totalTime / products.length).toFixed(0)}ms per product\n`)

    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`)
      console.log(`  ${product.emoji} ${product.name}`)
      console.log(`  $${product.price} - ${product.category}`)
      console.log(`  ${product.flavorProfile.join(', ')}`)
      console.log('')
    })

    console.log('✅ Product generation working correctly!')
  } catch (error) {
    console.error('❌ Product generation test failed:', error)
  }
}

/**
 * Attach test functions to window
 */
if (typeof window !== 'undefined') {
  window.runAITests = runAllTests
  window.testTextModel = quickTestTextModel
  window.testEmbeddings = quickTestEmbeddings
  window.testProductGen = quickTestProductGeneration

  console.log(`
🧪 AI Model Testing Commands Available:

  window.runAITests()      - Run complete test suite
  window.testTextModel()   - Quick test text generation
  window.testEmbeddings()  - Quick test embeddings
  window.testProductGen()  - Quick test product generation

Or visit /shop/test for visual test interface
  `)
}

export { runAllTests }
