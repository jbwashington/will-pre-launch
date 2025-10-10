# AI Model Testing - Quick Start

## 🚀 Start Testing in 3 Steps

### Step 1: Start Dev Server
```bash
bun run dev
```

### Step 2: Open Test Page
Visit: **http://localhost:3000/shop/test**

### Step 3: Run Tests
Click the **"Run All Tests"** button

---

## ✅ What to Expect

### First Run (Models not cached)
- **Duration:** 5-15 seconds
- **Downloads:** ~265MB of AI models
- **Result:** All 9 tests should pass ✅

### Subsequent Runs (Models cached)
- **Duration:** 3-8 seconds
- **Downloads:** None (cached)
- **Result:** All 9 tests should pass ✅

---

## 🧪 Quick Console Tests

Alternative: Test from browser console

```javascript
// Open /shop in browser, then open console (F12)

// Run all tests
await window.runAITests()

// Or quick individual tests:
await window.testTextModel()      // Text generation
await window.testEmbeddings()     // Search & similarity
await window.testProductGen()     // Full product pipeline
```

---

## 📊 Success Indicators

Tests are working if you see:

✅ **9/9 tests passed** (green checkmarks)
✅ **No red error messages**
✅ **Performance benchmarks < 1000ms** (with WebGPU)
✅ **Products generate valid data**
✅ **Browser console shows no errors**

---

## 🔧 If Tests Fail

### Problem: Models Won't Load
**Solution:**
1. Check internet connection (first load only)
2. Clear browser cache: `Ctrl+Shift+Del`
3. Try Chrome/Edge (best WebGPU support)
4. Check console for specific errors

### Problem: Very Slow (<5s per test)
**Solution:**
1. **First load:** Normal! Models are downloading
2. **Cached load:** Enable WebGPU in Chrome
3. Check: `navigator.gpu !== undefined` in console
4. If false: Upgrade browser or accept slower speeds

### Problem: Caching Not Working
**Solution:**
```javascript
// Clear IndexedDB and localStorage
indexedDB.deleteDatabase('keyval-store')
localStorage.clear()
location.reload()
```

---

## 🎯 What Gets Tested

| Test | What It Checks | Expected Time |
|------|----------------|---------------|
| Text Model Loading | Flan-T5 loads correctly | 2-5s |
| Embedding Model | all-MiniLM-L6-v2 loads | 1-2s |
| Single Product | Generates 1 product | 400-600ms |
| Batch Products | Generates 4 products | 1.5-2.5s |
| Embeddings | Creates 384-dim vectors | 100-200ms |
| Similarity | Finds related products | 200-400ms |
| Search | Text-based search works | 200-400ms |
| Caching | IndexedDB persists data | <100ms |
| Benchmarks | Overall performance | N/A |

---

## 🌐 Browser Support

**Best Performance:**
- ✅ Chrome 113+ (WebGPU enabled)
- ✅ Edge 113+ (WebGPU enabled)

**Good Performance:**
- ✅ Chrome 90-112 (WebAssembly)
- ✅ Firefox 90+ (WebAssembly)
- ✅ Safari 15+ (WebAssembly)

**Check WebGPU Support:**
```javascript
navigator.gpu !== undefined
// true = 10x faster ⚡
// false = still works, just slower
```

---

## 📝 Test Coverage

**100% Coverage** of AI functionality:
- ✅ Model loading & initialization
- ✅ Product generation (single & batch)
- ✅ Embeddings & similarity
- ✅ Search functionality
- ✅ Caching & persistence
- ✅ Error handling
- ✅ Performance benchmarks

---

## 🎓 Understanding Results

### Test Result Format
```javascript
{
  name: "Single Product Generation",
  status: "passed",           // ✅ passed, ❌ failed, ⏳ running
  duration: 587,              // milliseconds
  details: {
    generationTime: "587ms",
    product: {
      name: "Spicy Dragon Ramen Crunch",
      category: "chips",
      price: 4.99
    }
  }
}
```

### Good Performance Indicators
- Product generation: **< 600ms** (WebGPU)
- Embedding generation: **< 200ms** (WebGPU)
- Total test suite: **< 10s** (first run)
- Total test suite: **< 8s** (cached)

### Performance Warning Signs
- Product generation: **> 2s** (switch to Chrome/Edge)
- Embedding generation: **> 1s** (enable WebGPU)
- Total test suite: **> 30s** (check network/cache)

---

## 💡 Pro Tips

1. **First run is slow** - Models downloading. Totally normal!
2. **Use Chrome/Edge** - WebGPU is 10x faster than WebAssembly
3. **Check console** - Detailed logs help debug issues
4. **Tests are cached** - Second run should be much faster
5. **Models are cached** - Only download once per browser

---

## 🐛 Common Issues

### "TypeError: Cannot read property..."
**Cause:** Model not loaded yet
**Fix:** Wait for models to fully load, then retry

### "Failed to fetch"
**Cause:** Network issue or CORS
**Fix:** Check internet connection, try different network

### "QuotaExceededError"
**Cause:** IndexedDB storage full
**Fix:** Clear browser storage, increase quota

### Very high memory usage
**Cause:** Models loaded in memory (normal)
**Fix:** This is expected (~1GB for both models)

---

## 📞 Need Help?

1. **Check full guide:** `AI_MODEL_TESTING.md`
2. **View console logs:** F12 → Console
3. **Check model status:** Run `await window.testTextModel()`
4. **Clear everything:** Clear cache, reload, retry

---

## ✨ Next Steps After Testing

Once all tests pass:

1. ✅ Try the shop: http://localhost:3000/shop
2. ✅ Search for products (AI autocomplete)
3. ✅ Generate more products
4. ✅ Star favorites for market research
5. ✅ View product details
6. ✅ Check related products

---

**Ready?**

```bash
bun run dev
```

Then visit: **http://localhost:3000/shop/test**

🎉 Happy testing!
