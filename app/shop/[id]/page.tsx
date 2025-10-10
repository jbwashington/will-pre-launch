"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Sparkles,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard, ProductCardSkeleton } from '@/components/shop/product-card'
import { useShopStore, selectIsProductStarred } from '@/lib/stores/shop-store'
import { getCachedProduct } from '@/lib/ai/cache'
import { findSimilarProducts } from '@/lib/ai/embeddings'
import type { SnackProduct } from '@/lib/ai/types'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<SnackProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<SnackProduct[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)

  const isStarred = useShopStore(selectIsProductStarred(productId))
  const {
    toggleStar,
    addToCart,
    incrementViewCount,
    featuredProducts
  } = useShopStore()

  // Load product
  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      try {
        const cached = await getCachedProduct(productId)
        if (cached) {
          setProduct(cached)
          incrementViewCount(productId)
        } else {
          // Product not found, redirect to shop
          router.push('/shop')
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        router.push('/shop')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId, incrementViewCount, router])

  // Load related products
  useEffect(() => {
    async function loadRelated() {
      if (!product || featuredProducts.length === 0) return

      setIsLoadingRelated(true)
      try {
        const similar = await findSimilarProducts(product, featuredProducts, 4)
        setRelatedProducts(similar)
      } catch (error) {
        console.error('Failed to load related products:', error)
      } finally {
        setIsLoadingRelated(false)
      }
    }

    loadRelated()
  }, [product, featuredProducts])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      // Show success feedback
      alert(`Added ${quantity} ${product.name} to cart!`)
    }
  }

  const formattedPrice = product
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(product.price)
    : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/shop')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Image & Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-3xl flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
              <span className="text-[12rem]">{product.emoji}</span>

              {/* AI Badge */}
              <div className="absolute top-4 left-4 px-3 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Generated
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 right-4 px-3 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm font-medium capitalize">
                {product.category}
              </div>
            </div>

            {/* Flavor Profile Tags */}
            <div className="flex flex-wrap gap-2">
              {product.flavorProfile.map(flavor => (
                <span
                  key={flavor}
                  className="px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium capitalize"
                >
                  {flavor}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title & Star */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-extrabold">{product.name}</h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleStar(product.id)}
                  className="rounded-full"
                >
                  <Star
                    className={`w-6 h-6 ${
                      isStarred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="text-2xl">{product.emoji}</span>
                Origin: {product.origin}
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {product.description}
            </p>

            {/* Price */}
            <div className="text-5xl font-extrabold text-orange-600">
              {formattedPrice}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-2xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-lg py-6"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart - {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(product.price * quantity)}
            </Button>

            {/* Allergen Warning */}
            {product.allergens.length > 0 && (
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Allergen Information
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Contains: {product.allergens.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-500" />
                Ingredients
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {product.ingredients.join(', ')}
              </p>
            </div>

            {/* Nutrition Facts */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-500" />
                Nutrition Facts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Calories
                  </p>
                  <p className="text-xl font-bold">
                    {product.nutritionFacts.calories}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protein
                  </p>
                  <p className="text-xl font-bold">
                    {product.nutritionFacts.protein}g
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                  <p className="text-xl font-bold">
                    {product.nutritionFacts.carbs}g
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                  <p className="text-xl font-bold">
                    {product.nutritionFacts.fat}g
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sodium
                  </p>
                  <p className="text-xl font-bold">
                    {product.nutritionFacts.sodium}mg
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sugar</p>
                  <p className="text-xl font-bold">
                    {product.nutritionFacts.sugar}g
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-6">You Might Also Like</h2>

          {isLoadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-center"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">This Snack is Imaginary!</h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            All products are AI-generated. Star your favorites to help us decide
            which exotic snacks to bring to NYC for real!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
