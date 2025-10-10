"use client"

import { useEffect } from 'react'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize console test commands
  useEffect(() => {
    // Dynamically import console runner to make test commands available
    import('@/lib/ai/__tests__/console-runner').catch(err => {
      console.warn('Failed to load console test commands:', err)
    })
  }, [])

  return <>{children}</>
}
