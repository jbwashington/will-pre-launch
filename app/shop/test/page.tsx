"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, CheckCircle, XCircle, Loader2, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { runAllTests, type TestResult } from '@/lib/ai/__tests__/model-tests'

export default function AITestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const handleRunTests = async () => {
    setIsRunning(true)
    setResults([])
    setCurrentTest(null)

    try {
      // Run all tests and update UI as they complete
      const testResults: TestResult[] = []

      // We'll run them one by one to show progress
      const tests = [
        'Text Generation Model Loading',
        'Embedding Model Loading',
        'Single Product Generation',
        'Batch Product Generation',
        'Embedding Generation',
        'Product Similarity Search',
        'Text-Based Product Search',
        'IndexedDB Product Caching',
        'Performance Benchmarks'
      ]

      for (const testName of tests) {
        setCurrentTest(testName)
        await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UI update
      }

      // Run all tests
      const allResults = await runAllTests()
      setResults(allResults)
    } catch (error) {
      console.error('Test suite failed:', error)
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
    }
  }

  const passedCount = results.filter(r => r.status === 'passed').length
  const failedCount = results.filter(r => r.status === 'failed').length
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/shop'}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Shop
              </Button>

              <div>
                <h1 className="text-xl font-bold">AI Model Tests</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Verify Transformers.js models are working
                </p>
              </div>
            </div>

            <Button
              onClick={handleRunTests}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Test Indicator */}
        {isRunning && currentTest && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <div>
                <p className="font-medium">Running test...</p>
                <p className="text-sm opacity-90">{currentTest}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Stats */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Tests
              </p>
              <p className="text-3xl font-bold">{results.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Passed
              </p>
              <p className="text-3xl font-bold text-green-600">
                {passedCount}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-200 dark:border-red-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Failed
              </p>
              <p className="text-3xl font-bold text-red-600">
                {failedCount}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Time
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {(totalDuration / 1000).toFixed(1)}s
              </p>
            </div>
          </motion.div>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {results.length === 0 && !isRunning && (
            <div className="text-center py-16">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Ready to Test</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click "Run All Tests" to verify AI models are working correctly
              </p>
              <div className="max-w-md mx-auto text-left bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  What This Tests
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Text generation model loads and works</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Embedding model loads and generates vectors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Product generation creates valid data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Search and similarity functions work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>IndexedDB caching persists data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Performance meets benchmarks</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-white dark:bg-gray-800 rounded-2xl p-6 border-2
                ${
                  result.status === 'passed'
                    ? 'border-green-200 dark:border-green-700'
                    : result.status === 'failed'
                    ? 'border-red-200 dark:border-red-700'
                    : 'border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Test Name */}
                  <div className="flex items-center gap-3 mb-2">
                    {result.status === 'passed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : result.status === 'failed' ? (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-6 h-6 text-gray-400 flex-shrink-0 animate-spin" />
                    )}

                    <h3 className="text-lg font-bold">{result.name}</h3>
                  </div>

                  {/* Duration */}
                  {result.duration !== undefined && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{result.duration.toFixed(0)}ms</span>
                    </div>
                  )}

                  {/* Error Message */}
                  {result.error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-3">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                        Error:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {result.error}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  {result.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600">
                        View Details
                      </summary>
                      <div className="mt-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Browser Info */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold mb-4">Browser Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
              <p className="font-mono text-xs mt-1 break-all">
                {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Hardware Concurrency:</span>
              <p className="font-mono text-xs mt-1">
                {typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 'N/A'} cores
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Memory (approx):</span>
              <p className="font-mono text-xs mt-1">
                {typeof navigator !== 'undefined' && 'deviceMemory' in navigator
                  ? `${(navigator as any).deviceMemory} GB`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Platform:</span>
              <p className="font-mono text-xs mt-1">
                {typeof navigator !== 'undefined' ? navigator.platform : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold mb-3">💡 Testing Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>First run will be slow</strong> - Models need to download (~265MB). Subsequent runs will be much faster.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Chrome/Edge recommended</strong> - WebGPU acceleration provides 10x better performance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Check browser console</strong> - Detailed logs available in DevTools (F12).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Expected times</strong> - Product generation: 400-600ms, Embedding: 100-200ms (with WebGPU).
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
