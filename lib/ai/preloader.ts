// Smart AI model preloader
// Loads models intelligently based on user behavior

'use client'

let isPreloading = false
let preloadPromise: Promise<void> | null = null

/**
 * Preload AI model in background (non-blocking)
 * Safe to call multiple times - will only preload once
 */
export async function preloadModelInBackground(): Promise<void> {
  if (isPreloading || preloadPromise) return preloadPromise || Promise.resolve()

  isPreloading = true

  preloadPromise = (async () => {
    try {
      // Use requestIdleCallback to preload during browser idle time
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        await new Promise<void>(resolve => {
          window.requestIdleCallback(() => resolve(), { timeout: 2000 })
        })
      } else {
        // Fallback: wait a bit before starting download
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // Dynamic import to avoid loading on landing page bundle
      const { preloadModel } = await import('./browser-generator')

      console.log('🤖 Starting background AI model preload...')
      await preloadModel()
      console.log('✅ AI model preloaded and ready!')

    } catch (error) {
      console.warn('Background model preload failed:', error)
    } finally {
      isPreloading = false
    }
  })()

  return preloadPromise
}

/**
 * Check if model is already loaded
 */
export async function isModelReady(): Promise<boolean> {
  try {
    const { isModelLoaded } = await import('./browser-generator')
    return isModelLoaded()
  } catch {
    return false
  }
}

/**
 * Preload on user interaction (hover, focus, etc.)
 */
export function preloadOnInteraction(element: HTMLElement | null) {
  if (!element || typeof window === 'undefined') return

  const startPreload = () => {
    preloadModelInBackground()
    // Remove listeners after first trigger
    element.removeEventListener('mouseenter', startPreload)
    element.removeEventListener('touchstart', startPreload)
    element.removeEventListener('focus', startPreload)
  }

  element.addEventListener('mouseenter', startPreload, { once: true, passive: true })
  element.addEventListener('touchstart', startPreload, { once: true, passive: true })
  element.addEventListener('focus', startPreload, { once: true, passive: true })
}
