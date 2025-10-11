"use client"

import { motion } from 'framer-motion'
import { Star, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopStore, selectIsProductStarred } from '@/lib/stores/shop-store'
import type { SnackProduct } from '@/lib/ai/types'

interface ProductCardProps {
  product: SnackProduct
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isStarred = useShopStore(selectIsProductStarred(product.id))
  const { toggleStar, addToCart } = useShopStore()

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStar(product.id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col cursor-pointer">
          {/* Star Button - Top Right */}
          <button
            onClick={handleStarClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:scale-110 transition-transform"
            aria-label={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={`w-5 h-5 ${
                isStarred
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            />
          </button>

          {/* AI Badge - Top Left */}
          <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI
          </div>

          {/* Product Image (Emoji) */}
          <div className="relative aspect-square bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-8xl">{product.emoji}</span>

            {/* Category Badge */}
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-medium capitalize">
              {product.category}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Name */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>

            {/* Origin & Flavor Profile */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                🌍 {product.origin}
              </span>
              {product.flavorProfile.slice(0, 2).map(flavor => (
                <span
                  key={flavor}
                  className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 capitalize"
                >
                  {flavor}
                </span>
              ))}
            </div>

            {/* Price & Add to Cart */}
            <div className="flex items-center justify-between gap-2 mt-auto">
              <span className="text-2xl font-bold text-orange-600">
                {formattedPrice}
              </span>

              <Button
                onClick={handleAddToCart}
                size="sm"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Allergen Warning (if applicable) */}
            {product.allergens.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Contains: {product.allergens.slice(0, 2).join(', ')}
                {product.allergens.length > 2 && '...'}
              </div>
            )}
          </div>
        </div>
    </motion.div>
  )
}

// Skeleton loader for when products are generating
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 h-full"
    >
      {/* Emoji placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 animate-pulse flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-gray-400 animate-pulse" />
      </div>

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}
