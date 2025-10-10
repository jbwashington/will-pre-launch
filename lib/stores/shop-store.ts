// Zustand store for shop state management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SnackProduct, ModelLoadingState } from '../ai/types'
import { getAllCachedProducts, getCachedProduct } from '../ai/cache'

interface CartItem {
  product: SnackProduct
  quantity: number
}

interface ShopState {
  // Products
  featuredProducts: SnackProduct[]
  searchResults: SnackProduct[]
  currentProduct: SnackProduct | null

  // Cart
  cart: CartItem[]
  cartTotal: number

  // Starred products (for market research)
  starredProductIds: string[]

  // Model loading state
  modelState: ModelLoadingState

  // UI state
  isGenerating: boolean
  isSearching: boolean

  // Actions - Products
  setFeaturedProducts: (products: SnackProduct[]) => void
  setSearchResults: (products: SnackProduct[]) => void
  setCurrentProduct: (product: SnackProduct | null) => void
  addProduct: (product: SnackProduct) => void

  // Actions - Cart
  addToCart: (product: SnackProduct, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Actions - Starred products
  toggleStar: (productId: string) => void
  getStarredProducts: () => Promise<SnackProduct[]>

  // Actions - Model state
  setModelState: (state: Partial<ModelLoadingState>) => void

  // Actions - UI state
  setIsGenerating: (isGenerating: boolean) => void
  setIsSearching: (isSearching: boolean) => void

  // Actions - Utility
  incrementViewCount: (productId: string) => void
}

const calculateCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      // Initial state
      featuredProducts: [],
      searchResults: [],
      currentProduct: null,
      cart: [],
      cartTotal: 0,
      starredProductIds: [],
      modelState: {
        textModel: 'idle',
        embeddingModel: 'idle'
      },
      isGenerating: false,
      isSearching: false,

      // Product actions
      setFeaturedProducts: (products) => set({ featuredProducts: products }),

      setSearchResults: (products) => set({ searchResults: products }),

      setCurrentProduct: (product) => set({ currentProduct: product }),

      addProduct: (product) => {
        const { featuredProducts } = get()
        if (!featuredProducts.find(p => p.id === product.id)) {
          set({ featuredProducts: [...featuredProducts, product] })
        }
      },

      // Cart actions
      addToCart: (product, quantity) => {
        const { cart } = get()
        const existingItem = cart.find(item => item.product.id === product.id)

        let newCart: CartItem[]
        if (existingItem) {
          newCart = cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          newCart = [...cart, { product, quantity }]
        }

        set({ cart: newCart, cartTotal: calculateCartTotal(newCart) })
      },

      removeFromCart: (productId) => {
        const { cart } = get()
        const newCart = cart.filter(item => item.product.id !== productId)
        set({ cart: newCart, cartTotal: calculateCartTotal(newCart) })
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get()
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        const newCart = cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
        set({ cart: newCart, cartTotal: calculateCartTotal(newCart) })
      },

      clearCart: () => set({ cart: [], cartTotal: 0 }),

      // Starred products actions
      toggleStar: (productId) => {
        const { starredProductIds, featuredProducts, currentProduct } = get()

        const isStarred = starredProductIds.includes(productId)
        const newStarredIds = isStarred
          ? starredProductIds.filter(id => id !== productId)
          : [...starredProductIds, productId]

        // Update the product's starred status in featured products
        const newFeaturedProducts = featuredProducts.map(p =>
          p.id === productId ? { ...p, starred: !isStarred } : p
        )

        // Update current product if it's the one being toggled
        const newCurrentProduct = currentProduct?.id === productId
          ? { ...currentProduct, starred: !isStarred }
          : currentProduct

        set({
          starredProductIds: newStarredIds,
          featuredProducts: newFeaturedProducts,
          currentProduct: newCurrentProduct
        })
      },

      getStarredProducts: async () => {
        const { starredProductIds } = get()
        const products = await Promise.all(
          starredProductIds.map(id => getCachedProduct(id))
        )
        return products.filter((p): p is SnackProduct => p !== null)
      },

      // Model state actions
      setModelState: (state) => {
        const { modelState } = get()
        set({ modelState: { ...modelState, ...state } })
      },

      // UI state actions
      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setIsSearching: (isSearching) => set({ isSearching }),

      // Utility actions
      incrementViewCount: (productId) => {
        const { featuredProducts, currentProduct } = get()

        const newFeaturedProducts = featuredProducts.map(p =>
          p.id === productId ? { ...p, viewCount: p.viewCount + 1 } : p
        )

        const newCurrentProduct = currentProduct?.id === productId
          ? { ...currentProduct, viewCount: currentProduct.viewCount + 1 }
          : currentProduct

        set({
          featuredProducts: newFeaturedProducts,
          currentProduct: newCurrentProduct
        })
      }
    }),
    {
      name: 'shop-storage',
      partialize: (state) => ({
        // Only persist cart and starred products
        cart: state.cart,
        starredProductIds: state.starredProductIds
      })
    }
  )
)

// Selectors
export const selectCartItemCount = (state: ShopState) =>
  state.cart.reduce((count, item) => count + item.quantity, 0)

export const selectIsProductStarred = (productId: string) => (state: ShopState) =>
  state.starredProductIds.includes(productId)

export const selectCartItem = (productId: string) => (state: ShopState) =>
  state.cart.find(item => item.product.id === productId)
