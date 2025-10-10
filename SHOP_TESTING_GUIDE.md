# AI Snack Shop - Testing Guide

## Overview
The AI-powered imaginary snack shop is now live! This guide will help you test all features.

## Access the Shop

1. **From Homepage**:
   - Visit http://localhost:3000
   - Click the "Browse Imaginary Shop" button

2. **Direct Link**:
   - Visit http://localhost:3000/shop

## Testing Checklist

### 1. Shop Landing Page ✓

**What to Test:**
- [ ] Page loads without errors
- [ ] AI models start loading (check browser console)
- [ ] Featured products grid displays (initially shows skeleton loaders)
- [ ] Once loaded, 16 imaginary snacks appear with:
  - Emoji image
  - Name (AI-generated)
  - Description
  - Category badge
  - Price
  - Flavor profile tags
  - Add to Cart button
  - Star button

**Expected Behavior:**
- First load: Models download (~270MB total, cached after first load)
- Text model (Flan-T5-Small): ~242MB
- Embedding model (all-MiniLM-L6-v2): ~23MB
- Products generate in 3-5 seconds
- Subsequent visits: Instant loading from cache

### 2. Search with AI Autocomplete ✓

**What to Test:**
1. Type "spicy" in the search bar
2. Wait ~500ms for AI suggestions to appear
3. Suggestions should show:
   - 4 AI-generated snack names
   - Emoji for each
   - Category label
   - "AI-Generated" badge

**Expected Behavior:**
- Debounced search (400ms delay)
- Loading spinner while generating
- Dropdown appears with 4 suggestions
- Click suggestion → navigates to product page
- Keyboard navigation works (Arrow keys, Enter, Escape)

**Test Queries:**
- "chocolate"
- "Korean chips"
- "mango candy"
- "spicy noodles"
- "matcha"

### 3. Product Cards ✓

**What to Test:**
- [ ] Hover effects work
- [ ] Click card → navigates to product detail
- [ ] Click Star → toggles favorite (turns yellow)
- [ ] Click "Add to Cart" → adds 1 item
- [ ] Category filter buttons work
- [ ] "Generate More Snacks" button creates 8 new products

**Star Feature (Market Research):**
- Star count updates in header
- Starred products persist across page reloads
- Star state syncs between card and detail page

### 4. Product Detail Page ✓

**Navigation:**
- Click any product card
- URL should be `/shop/snack_[timestamp]_[random]`

**What to Test:**
- [ ] Large emoji display
- [ ] Product name and description
- [ ] Price display
- [ ] Origin badge (country/region)
- [ ] Flavor profile tags
- [ ] Quantity selector (- and + buttons)
- [ ] Add to Cart with quantity
- [ ] Star button (syncs with shop page)
- [ ] **Ingredients list** (exotic ingredients included)
- [ ] **Allergen warnings** (if applicable)
- [ ] **Nutrition facts** (6 metrics: calories, protein, carbs, fat, sodium, sugar)

**Related Products Section:**
- [ ] Shows 4 similar products (using AI embeddings)
- [ ] Products are actually similar (same category or flavor profile)
- [ ] Click related product → navigate to that product

### 5. Category Filtering ✓

**Categories to Test:**
- All Snacks (default)
- 🥔 Chips
- 🍬 Candy
- 🥤 Drinks
- 🍫 Chocolate
- 🍪 Cookies
- 🌍 International
- 🥓 Savory
- 🌶️ Spicy

**Expected Behavior:**
- Click category → filters product grid
- Active category highlighted
- Click again → shows all products
- "Generate More" respects selected category

### 6. Shopping Cart ✓

**What to Test:**
1. Add products from different pages
2. Check cart count in header
3. Add same product twice (quantity should increase)
4. Cart persists across:
   - Page navigation
   - Browser refresh
   - Close/reopen browser tab

**Cart State (Zustand + localStorage):**
- Cart items stored in browser
- Total price calculated correctly
- Remove items works (future feature)

### 7. Market Research (Starred Products) ✓

**What to Test:**
- [ ] Star multiple products
- [ ] Count updates in header
- [ ] Starred state persists in localStorage
- [ ] Starred products show across all views
- [ ] Un-star removes from favorites

**Market Research Value:**
This data helps identify:
- Most popular flavor profiles
- Trending ingredients
- Preferred price points
- Category preferences

### 8. AI Model Performance 📊

**Check Browser Console:**

```javascript
// Model loading logs
"Loading text generation model..."
"Text generation model loaded!"
"Loading embedding model..."
"Embedding model loaded!"

// Performance metrics
"Generated product in: XXXms"
"Embedding similarity in: XXms"
```

**Expected Performance:**
- **First product generation**: 500-1000ms
- **Subsequent generations**: 300-600ms
- **Search suggestions**: 400-800ms
- **Embedding similarity**: 100-200ms
- **Related products**: 200-400ms

**Browser Requirements:**
- Chrome/Edge 113+ (WebGPU support - 10x faster)
- Firefox/Safari (WebAssembly fallback - still fast)

### 9. Caching & Performance ✓

**IndexedDB Cache:**
- Products cached for 7 days
- Maximum 500 products
- LRU eviction (oldest first)

**Test Cache:**
1. Generate 20 products
2. Refresh page
3. Products load instantly from cache
4. Check DevTools → Application → IndexedDB → `v1:product:*`

**Model Cache:**
- Models cached via browser cache
- Only download once per device
- Updates automatically on version change

### 10. Edge Cases & Error Handling

**Test Scenarios:**

1. **Network Offline:**
   - First visit → models fail to load
   - Already cached → works offline!

2. **Long Search Queries:**
   - Type 50+ characters → still generates

3. **Rapid Searching:**
   - Type and delete quickly → debouncing prevents spam

4. **Empty Results:**
   - All categories should have products

5. **Browser Back/Forward:**
   - Navigation works correctly
   - State preserved

## Performance Benchmarks

### Load Times (Chrome with WebGPU)
- **First Visit**: 3-5s (model download)
- **Cached Models**: <1s
- **Generate Product**: 500ms
- **Search Autocomplete**: 600ms
- **Related Products**: 300ms

### Model Sizes
- Flan-T5-Small (quantized): 242MB
- all-MiniLM-L6-v2 (quantized): 23MB
- Total: ~270MB (one-time download)

### Browser Support
- ✅ Chrome 113+ (WebGPU)
- ✅ Edge 113+ (WebGPU)
- ⚠️ Firefox (WebAssembly only, slower)
- ⚠️ Safari (WebAssembly only, slower)

## Known Limitations

1. **CORS Headers**: Static export doesn't support custom headers, so SharedArrayBuffer features are disabled (not needed for current implementation)

2. **Model Size**: First load requires ~270MB download (cached permanently after)

3. **Generation Speed**: Without WebGPU, generation is 5-10x slower (but still usable)

4. **Static Export**: All generation happens client-side, no server costs!

## Debugging Tips

### Check Model Status
```javascript
// In browser console
localStorage.getItem('shop-storage')
// Should show cart and starred products

// Check IndexedDB
// DevTools → Application → IndexedDB
```

### Clear Cache
```javascript
// Clear all generated products
indexedDB.deleteDatabase('keyval-store')

// Clear cart and stars
localStorage.removeItem('shop-storage')

// Reload page
location.reload()
```

### Monitor Performance
```javascript
// Enable verbose logging
localStorage.setItem('DEBUG', 'transformers:*')
```

## Success Criteria ✅

The shop is working correctly if:

- ✅ Products generate and display
- ✅ Search autocomplete works
- ✅ Product details load correctly
- ✅ Related products show similar items
- ✅ Star functionality persists
- ✅ Cart tracks items correctly
- ✅ Category filtering works
- ✅ All data cached properly
- ✅ Performance is acceptable (< 1s for most operations)

## Next Steps (Future Enhancements)

1. **Image Generation**: Add Stable Diffusion WebGPU for real product images
2. **Checkout Flow**: Mock checkout process
3. **Analytics Dashboard**: View starred products analytics
4. **Social Sharing**: Share imaginary products
5. **Product Comparison**: Compare nutrition facts
6. **Filters**: Price range, allergens, dietary restrictions
7. **Sort Options**: Price, popularity, newest
8. **Search History**: Remember past searches
9. **Recommendations**: AI-powered "You might like"
10. **Export Data**: Download starred products as CSV

## Troubleshooting

### Models Not Loading
- Check browser console for errors
- Verify internet connection
- Clear browser cache and retry
- Try different browser (Chrome recommended)

### Slow Performance
- Check if WebGPU is enabled (chrome://gpu)
- Close other browser tabs
- Increase system RAM allocation
- Use Chrome for best performance

### Products Not Generating
- Check browser console for errors
- Verify Hugging Face API key (not needed for client-side)
- Clear IndexedDB cache
- Restart browser

## Reporting Issues

If you encounter bugs:

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Note the error message
4. Describe steps to reproduce
5. Include browser version
6. Create GitHub issue with details

---

**Built with:**
- Next.js 15 + React 19
- Transformers.js (Client-side AI)
- Flan-T5-Small (Text Generation)
- all-MiniLM-L6-v2 (Embeddings)
- Zustand (State Management)
- IndexedDB (Caching)
- WebGPU/WebAssembly (Acceleration)

**All AI runs in your browser - no server costs! 🎉**
