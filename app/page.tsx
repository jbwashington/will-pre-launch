"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, MapPin, Store, Lightbulb, Heart } from "lucide-react"
import { SearchBar } from "@/components/shop/search-bar"
import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card"
import { preloadModelInBackground } from "@/lib/ai/preloader"
import { generateProducts, isModelLoaded } from "@/lib/ai/browser-generator"
import { getAllCachedProducts, getCachedProduct } from "@/lib/ai/cache"
import { useShopStore } from "@/lib/stores/shop-store"
import type { SnackProduct } from "@/lib/ai/types"

export default function Home() {
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const { featuredProducts, setFeaturedProducts } = useShopStore()

  // Preload AI model and generate initial products
  useEffect(() => {
    async function initialize() {
      try {
        // Start preloading AI model in background
        preloadModelInBackground()

        // Check for cached products first
        const cachedIds = await getAllCachedProducts()

        if (cachedIds.length >= 8) {
          // Load from cache for instant display
          const products = await Promise.all(
            cachedIds.slice(0, 12).map(id => getCachedProduct(id))
          )
          const validProducts = products.filter((p): p is SnackProduct => p !== null)
          setFeaturedProducts(validProducts)
          setIsLoadingProducts(false)
        } else {
          // Generate initial products
          const newProducts = await generateProducts(12)
          setFeaturedProducts(newProducts)
          setIsLoadingProducts(false)
        }
      } catch (error) {
        console.error('Failed to initialize products:', error)
        setIsLoadingProducts(false)
      }
    }

    initialize()
  }, [setFeaturedProducts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-2 px-4 text-sm font-medium">
        <Sparkles className="inline w-4 h-4 mr-2" />
        AI-Powered Snack Discovery • Help Us Build the Perfect Store!
      </div>

      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Will's Exotic Snacks</h1>
                <p className="text-xs text-gray-500">NYC's Premier Snack Shop</p>
              </div>
            </div>

            {/* Visit Store CTA */}
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Visit Our Store
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                Discover Exotic Snacks
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Imagine your perfect snack with AI, then find it at our NYC store.
              Your searches help us stock what you want!
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-6">
              <SearchBar />
            </div>

            {/* AI Info Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
              <Lightbulb className="w-4 h-4" />
              <span>All products are AI-imagined • Help us decide what to stock!</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Trending Discoveries</h3>
            <p className="text-sm text-gray-500">AI-Generated • Help Us Stock These!</p>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {featuredProducts.slice(0, 12).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Store Location CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Store className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Visit Will's Exotic Snacks in NYC
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Browse AI-imagined snacks online, find real exotic treats in-store.
              Your searches help us stock what YOU want!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                <MapPin className="mr-2 w-5 h-5" />
                Get Directions
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-orange-600"
              >
                <Heart className="mr-2 w-5 h-5" />
                Save Favorites
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From AI imagination to real store shelves
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: <Sparkles className="w-8 h-8" />,
                title: "Imagine with AI",
                description: "Search for snacks you dream about. Our AI generates creative possibilities."
              },
              {
                step: "2",
                icon: <Heart className="w-8 h-8" />,
                title: "Vote & Share",
                description: "Star your favorites, share with friends. Popular items get prioritized."
              },
              {
                step: "3",
                icon: <Store className="w-8 h-8" />,
                title: "Find In-Store",
                description: "Visit our NYC location to discover real exotic snacks inspired by your searches!"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold mb-4">
                  {item.step}
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
