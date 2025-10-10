# Quick Start Guide - Will's Exotic Snacks

## 🚀 Deploy to Cloudflare Pages (Recommended - 5 minutes)

### Option 1: GitHub + Cloudflare Dashboard (Easiest)

**Step 1: Push to GitHub**
```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/will-exotic-snacks.git
git push -u origin main
```

**Step 2: Connect to Cloudflare**
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Pages** → **Create a project** → **Connect to Git**
3. Select your repository
4. Use these settings:
   - Framework: **Next.js**
   - Build command: `npm run build`
   - Build output: `.next`

**Step 3: Add Environment Variables**
In Cloudflare Pages settings, add:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
ANTHROPIC_API_KEY=your_key
NODE_VERSION=18
```

**Step 4: Deploy**
- Click **Save and Deploy**
- Get your URL: `will-exotic-snacks.pages.dev`

### Option 2: Direct CLI Deploy

**Step 1: Login to Cloudflare**
```bash
npm run cf:login
# Or: wrangler login
```

**Step 2: Deploy**
```bash
npm run deploy:cloudflare
```

That's it! ✅

## 📦 What You Get

- **Landing Page**: Beautiful waitlist with viral sharing
- **Dashboard**: AI content generator for TikTok, YouTube, Instagram
- **Database**: Supabase with waitlist, analytics, referrals
- **AI**: Claude 3.5 Sonnet for content generation
- **Hosting**: Cloudflare's global edge network

## 🔑 Get Your API Keys

### Supabase (2 minutes)
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "will-exotic-snacks"
3. Go to SQL Editor → New query
4. Paste contents of `supabase/schema.sql`
5. Run the query
6. Get keys: Settings → API
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### Anthropic Claude (1 minute)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Copy → `ANTHROPIC_API_KEY`

## 🧪 Test Locally

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Add your API keys to .env.local

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

## 📝 Available Scripts

```bash
npm run dev                 # Start dev server
npm run build              # Build for production
npm run deploy:cloudflare  # Build & deploy to Cloudflare
npm run deploy:vercel      # Deploy to Vercel
npm run cf:login           # Login to Cloudflare
```

## 🌐 URLs After Deployment

- **Production**: `https://will-exotic-snacks.pages.dev`
- **Dashboard**: `https://will-exotic-snacks.pages.dev/dashboard`
- **Custom Domain**: Configure in Cloudflare Pages settings

## 🎯 Next Steps

1. ✅ Deploy to Cloudflare
2. ✅ Set up Supabase database
3. ✅ Add API keys
4. ✅ Test waitlist signup
5. ✅ Generate content in dashboard
6. 🚀 Launch marketing campaign!

## 📚 Documentation

- **README.md** - Full project overview
- **CLOUDFLARE_DEPLOYMENT.md** - Detailed Cloudflare guide
- **DEPLOYMENT.md** - General deployment guide
- **SETUP_SUMMARY.md** - Complete feature list

## 💰 Costs

**Free Tier (Cloudflare)**:
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- Free SSL

**Expected Costs**:
- First 1,000 users: **$0**
- 10,000 users: **~$50/month**

## 🆘 Need Help?

1. Check `CLOUDFLARE_DEPLOYMENT.md` for detailed instructions
2. Review error messages in Cloudflare Pages dashboard
3. Verify all environment variables are set correctly
4. Check Supabase database is set up with `schema.sql`

## ✨ Features Ready to Use

### Waitlist System
- ✅ Email collection
- ✅ Position tracking
- ✅ Referral codes
- ✅ Social sharing

### AI Content Generation
- ✅ TikTok scripts
- ✅ YouTube outlines
- ✅ Instagram captions
- ✅ Commercial scripts

### Analytics
- ✅ Waitlist growth
- ✅ Referral tracking
- ✅ Engagement metrics

---

**You're ready to launch!** 🎉

Deploy now and start collecting waitlist signups!
