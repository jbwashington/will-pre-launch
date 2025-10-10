# Cloudflare Pages Deployment Guide

## Prerequisites

- Cloudflare account (free tier works!)
- Wrangler CLI (already installed ✅)
- GitHub/GitLab repository (optional for automatic deployments)

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

This is the easiest method with automatic builds and deployments.

### Step 1: Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/will-exotic-snacks.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access your repository
6. Select the `will-exotic-snacks` repository

### Step 3: Configure Build Settings

Set these build configurations:

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (leave empty)
- **Environment variables** (add these):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
NODE_VERSION=18
```

### Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will build and deploy your app
3. You'll get a URL like: `will-exotic-snacks.pages.dev`

### Step 5: Set Up Custom Domain (Optional)

1. In your Pages project, click **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `willssnacks.com`)
4. Follow the DNS configuration instructions

## Option 2: Deploy via CLI (Manual)

### Step 1: Authenticate Wrangler

**Method A: Browser OAuth**
```bash
wrangler login
# Follow the browser prompt to authorize
```

**Method B: API Token** (for CI/CD)
```bash
# Create API token at: https://dash.cloudflare.com/profile/api-tokens
# Click "Create Token" -> "Edit Cloudflare Workers" template
# Or use "Custom Token" with these permissions:
# - Account: Cloudflare Pages (Edit)
# - Zone: DNS (Edit)

# Set the token
export CLOUDFLARE_API_TOKEN=your_token_here

# Or add to .env.local (don't commit!)
echo "CLOUDFLARE_API_TOKEN=your_token" >> .env.local
```

### Step 2: Create Cloudflare Pages Project

```bash
# First time setup
wrangler pages project create will-exotic-snacks
# Choose "Create a new Pages project"
# Select production branch: main
```

### Step 3: Deploy

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=will-exotic-snacks
```

### Step 4: Set Environment Variables

```bash
# Set environment variables for production
wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL --project-name=will-exotic-snacks
wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --project-name=will-exotic-snacks
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name=will-exotic-snacks
wrangler pages secret put ANTHROPIC_API_KEY --project-name=will-exotic-snacks

# Or set via dashboard:
# Go to Pages project > Settings > Environment variables
```

## Option 3: Continuous Deployment (Best for Production)

### Step 1: Connect Git Repository

Follow Option 1 (Cloudflare Dashboard method)

### Step 2: Automatic Deployments

Every time you push to your `main` branch:
- Cloudflare automatically builds your app
- Runs tests (if configured)
- Deploys to production
- Provides preview deployments for pull requests

### Preview Deployments

Every PR gets its own preview URL:
- Test changes before merging
- Share with team members
- Automatic cleanup when PR is closed

## Next.js on Cloudflare Notes

### Supported Features ✅

- Server-Side Rendering (SSR)
- API Routes
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Image Optimization
- Middleware
- Edge Runtime

### Current Limitations

- Some Node.js APIs may not work (use Edge Runtime compatible packages)
- File uploads need to use FormData
- Database connections should use connection pooling

### Performance Benefits

- **Edge Network**: Deploy to 300+ cities worldwide
- **Fast Cold Starts**: 0ms cold starts
- **Free SSL**: Automatic HTTPS
- **DDoS Protection**: Built-in security
- **Unlimited Bandwidth**: No bandwidth charges

## Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard > Settings > API |
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |
| `NODE_VERSION` | Node.js version | Set to `18` |

## Monitoring and Analytics

### Cloudflare Web Analytics (Free)

1. Go to your Pages project
2. Click **Analytics**
3. View metrics:
   - Page views
   - Unique visitors
   - Performance metrics
   - Geographic distribution

### Real User Monitoring

Cloudflare automatically provides:
- Core Web Vitals
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

## Troubleshooting

### Build Fails

**Issue**: Build timeout
```bash
# Solution: Increase build timeout in wrangler.toml
[build]
command = "npm run build"
timeout = "15m"
```

**Issue**: Missing environment variables
```bash
# Check variables are set:
wrangler pages deployment list --project-name=will-exotic-snacks
```

### Runtime Errors

**Issue**: Module not found
```bash
# Check package.json has all dependencies
npm install
```

**Issue**: API routes not working
```bash
# Ensure API routes are in app/api/ directory
# Check they export proper HTTP methods (GET, POST, etc.)
```

### Performance Issues

**Issue**: Slow initial load
```bash
# Enable ISR for static pages
# Check bundle size with:
npm run build
# Look for large chunks
```

## Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Environment variables configured in Cloudflare
- [ ] Build succeeds locally
- [ ] Supabase database schema deployed
- [ ] API keys are valid and have proper permissions
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Test all features on production URL

## Quick Deploy Commands

```bash
# Full deployment workflow
npm run build                    # Build locally to test
git add .                        # Stage changes
git commit -m "Deploy update"    # Commit
git push origin main             # Push to trigger deployment

# Or direct deploy (if using CLI)
npm run build && wrangler pages deploy .next --project-name=will-exotic-snacks
```

## Costs

### Free Tier Includes:
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 100 custom domains
- Free SSL certificates

### Paid Tier ($20/month):
- Everything in Free
- Advanced DDoS protection
- Priority support
- Analytics retention

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Community](https://community.cloudflare.com/)

## Next Steps After Deployment

1. **Verify Deployment**
   - Visit your Pages URL
   - Test waitlist signup
   - Generate content in dashboard
   - Check analytics

2. **Set Up Monitoring**
   - Enable Web Analytics
   - Set up uptime monitoring
   - Configure error alerts

3. **Optimize Performance**
   - Enable caching rules
   - Configure cache TTLs
   - Set up preview deployments

4. **Launch Marketing**
   - Share your deployment URL
   - Start generating social content
   - Begin collecting waitlist signups

---

**Your site is now live on Cloudflare's global edge network!** 🚀
