# Deployment Guide

## Quick Start Deployment

### 1. Supabase Setup (Database)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and name your project "will-exotic-snacks"

2. **Run Database Migration**

   Option A: Using Supabase CLI
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref YOUR_PROJECT_REF

   # Push schema to database
   supabase db push
   ```

   Option B: Manual SQL execution
   - Go to SQL Editor in Supabase Dashboard
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the SQL

3. **Get API Keys**
   - Go to Project Settings > API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Anthropic API Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy the key → `ANTHROPIC_API_KEY`

### 3. Vercel Deployment

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ANTHROPIC_API_KEY production

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

6. Click "Deploy"

### 4. Post-Deployment

1. **Test the Waitlist**
   - Visit your deployed URL
   - Join the waitlist with a test email
   - Check Supabase database to verify entry

2. **Test Content Generation**
   - Visit `/dashboard`
   - Generate content for each platform
   - Verify content appears in database

3. **Test Referrals**
   - Join waitlist and get referral code
   - Share referral link
   - Join with a different email using referral link
   - Verify referral tracking in database

### 5. Custom Domain (Optional)

1. In Vercel Dashboard:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. Update environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL production
   # Enter: https://yourdomain.com
   ```

## Environment Variables Summary

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard > Settings > API |
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |
| `NEXT_PUBLIC_APP_URL` | Your app URL | Your Vercel deployment URL |

## Troubleshooting

### Build Fails

1. Check all environment variables are set correctly
2. Ensure all dependencies are installed:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Supabase Connection Issues

1. Verify API keys in environment variables
2. Check RLS policies are enabled:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'waitlist';
   ```

### Content Generation Fails

1. Verify `ANTHROPIC_API_KEY` is set
2. Check API key has credits
3. Check Vercel function logs for errors

## Monitoring

### Vercel Analytics
- Go to your project in Vercel
- Click "Analytics" to see traffic and performance

### Supabase Monitoring
- Database: Monitor query performance
- Auth: Track authentication events
- Logs: View real-time database logs

## Next Steps

1. **Set up monitoring alerts** in Vercel and Supabase
2. **Configure custom domain** for professional branding
3. **Set up email notifications** for new waitlist signups
4. **Create social media accounts** and link referral tracking
5. **Launch marketing campaigns** using AI-generated content

## Support

For deployment issues:
- Check Vercel deployment logs
- Check Supabase logs
- Review Next.js build output
- Consult README.md for detailed documentation
