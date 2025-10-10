"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ShoppingBag, Star, TrendingUp, Loader2 } from 'lucide-react'
import { SearchBar } from '@/components/shop/search-bar'
import { ProductCard, ProductCardSkeleton } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { useShopStore } from '@/lib/stores/shop-store'
// Use HuggingFace generator as fallback for compatibility
import { generateProducts, preloadModel } from '@/lib/ai/huggingface-generator'
// import { preloadEmbeddingModel } from '@/lib/ai/embeddings'
import { getAllCachedProducts, getCachedProduct } from '@/lib/ai/cache'
import type { SnackProduct } from '@/lib/ai/types'

export default function ShopPage() {
  const {
    featuredProducts,
    setFeaturedProducts,
    starredProductIds,
    cart,
    setModelState
  } = useShopStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Initialize shop on mount
  useEffect(() => {
    async function initializeShop() {
      try {
        setIsInitializing(true)

        // Check if we have cached products
        const cachedIds = await getAllCachedProducts()

        if (cachedIds.length >= 12) {
          // Load from cache
          console.log('Loading products from cache...')
          const products = await Promise.all(
            cachedIds.slice(0, 20).map(id => getCachedProduct(id))
          )
          const validProducts = products.filter((p): p is SnackProduct => p !== null)
          setFeaturedProducts(validProducts)
        } else {
          // Generate initial products
          console.log('Generating initial products...')

          // Preload models
          setModelState({ textModel: 'loading' })
          await preloadModel()
          setModelState({ textModel: 'loaded' })

          // Generate 16 featured products
          const newProducts = await generateProducts(16)
          setFeaturedProducts(newProducts)
        }

        // Embedding model disabled for now (compatibility issues)
        // setModelState({ embeddingModel: 'loading' })
        // preloadEmbeddingModel().then(() => {
        //   setModelState({ embeddingModel: 'loaded' })
        // })
      } catch (error) {
        console.error('Failed to initialize shop:', error)
        setModelState({ textModel: 'error' })
      } finally {
        setIsInitializing(false)
      }
    }

    initializeShop()
  }, [setFeaturedProducts, setModelState])

  // Generate more products
  const handleGenerateMore = async () => {
    setIsGenerating(true)
    try {
      const newProducts = await generateProducts(8, {
        category: selectedCategory as any
      })
      setFeaturedProducts([...featuredProducts, ...newProducts])
    } catch (error) {
      console.error('Failed to generate products:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Filter products by category
  const displayedProducts = selectedCategory
    ? featuredProducts.filter(p => p.category === selectedCategory)
    : featuredProducts

  const categories = [
    { id: 'chips', name: 'Chips', emoji: '🥔' },
    { id: 'candy', name: 'Candy', emoji: '🍬' },
    { id: 'drinks', name: 'Drinks', emoji: '🥤' },
    { id: 'chocolate', name: 'Chocolate', emoji: '🍫' },
    { id: 'cookies', name: 'Cookies', emoji: '🍪' },
    { id: 'international', name: 'International', emoji: '🌍' },
    { id: 'savory', name: 'Savory', emoji: '🥓' },
    { id: 'spicy', name: 'Spicy', emoji: '🌶️' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Will's Exotic Snacks</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">AI Snack Lab</div>
              </div>
            </a>

            <div className="flex items-center gap-4">
              <a
                href="/shop/test"
                className="text-sm px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
              >
                Run Tests
              </a>

              <a
                href="#starred"
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">{starredProductIds.length}</span>
              </a>

              <a
                href="#cart"
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium">{cart.length}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">AI-Powered Snack Discovery</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                Imagine Your Perfect Snack
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Search for any snack you can dream of, and our AI will create it for you.
              Star your favorites to help us build our real product lineup!
            </p>

            <SearchBar />
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full whitespace-nowrap"
              >
                All Snacks
              </Button>

              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                  className="rounded-full whitespace-nowrap"
                >
                  <span className="mr-2">{category.emoji}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-orange-600">
                {featuredProducts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Imaginary Snacks
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-yellow-600">
                {starredProductIds.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Starred Favorites
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-green-600">{cart.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Cart</div>
            </div>
          </motion.div>

          {/* Products Grid */}
          {isInitializing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {displayedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Generate More Button */}
              <div className="text-center">
                <Button
                  onClick={handleGenerateMore}
                  disabled={isGenerating}
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Imagining More Snacks...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      Generate More Snacks
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Help Us Build the Future</h2>
          <p className="text-xl opacity-90 mb-6">
            Every snack you star helps us understand what exotic flavors NYC wants.
            <br />
            Your imagination powers our real product lineup!
          </p>
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-6 h-6" />
            <span className="font-medium">
              {starredProductIds.length} snacks starred by the community
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
