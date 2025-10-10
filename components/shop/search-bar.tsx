"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
// Use browser-based Transformers.js (100% free, client-side)
import { generateProduct } from '@/lib/ai/browser-generator'
import { useShopStore } from '@/lib/stores/shop-store'
import type { SnackProduct } from '@/lib/ai/types'

interface SearchSuggestion {
  id: string
  name: string
  emoji: string
  category: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  const { setSearchResults, setIsSearching } = useShopStore()

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate suggestions when user types
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't generate for empty or very short queries
    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Debounce the generation
    debounceTimerRef.current = setTimeout(async () => {
      setIsGenerating(true)
      setIsSearching(true)

      try {
        // Generate 4 product suggestions
        const products = await Promise.all([
          generateProduct({ searchTerm: query }),
          generateProduct({ searchTerm: query }),
          generateProduct({ searchTerm: query }),
          generateProduct({ searchTerm: query })
        ])

        const newSuggestions: SearchSuggestion[] = products.map(p => ({
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          category: p.category
        }))

        setSuggestions(newSuggestions)
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Failed to generate suggestions:', error)
      } finally {
        setIsGenerating(false)
        setIsSearching(false)
      }
    }, 400) // 400ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, setIsSearching])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex].id)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = async (productId: string) => {
    // Find the full product (it's already cached from generation)
    const { getCachedProduct } = await import('@/lib/ai/cache')
    const product = await getCachedProduct(productId)

    if (product) {
      // Navigate to product page
      window.location.href = `/shop/${productId}`
    }

    setShowSuggestions(false)
    setQuery('')
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <Input
          type="text"
          placeholder="Search for exotic snacks... (AI will imagine them!)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className="pl-12 pr-12 py-6 text-lg rounded-2xl border-2 border-gray-200 focus:border-orange-500 transition-colors"
        />

        {isGenerating && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          </div>
        )}

        {!isGenerating && query.length > 0 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              AI-Generated Suggestions
            </div>

            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-colors text-left
                  ${
                    index === selectedIndex
                      ? 'bg-orange-50 dark:bg-orange-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-3xl">{suggestion.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {suggestion.category}
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              ✨ All products are imagined by AI - help us build the perfect snack lineup!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
