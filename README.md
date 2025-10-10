# Will's Exotic Snacks - Pre-Launch Waitlist

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude-3.5_Sonnet-purple)](https://anthropic.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2-orange)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A viral waitlist landing page for Will's Exotic Snacks, NYC's hottest exotic snack delivery service. Built with Next.js 15, Supabase, and Claude AI for automated content generation.

![Will's Exotic Snacks](https://img.shields.io/badge/Status-Ready_to_Launch-brightgreen)

## Features

- 🎯 **Viral Waitlist System** - Referral tracking with position tracking
- 🤖 **AI-Powered Content Generation** - Generate TikTok, YouTube, Instagram, and commercial content using Claude AI
- 📊 **Analytics Dashboard** - Track signups, referrals, and engagement
- 🎨 **Beautiful UI** - Animated landing page with Framer Motion
- 🚀 **Viral Sharing** - Built-in social sharing for Twitter, Facebook, and WhatsApp
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🌙 **Dark Mode Support** - Automatic dark mode detection

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Deployment**: Vercel
- **Analytics**: Custom analytics with Supabase

## Getting Started

### Prerequisites

- Bun 1.0+ (or Node.js 18+)
- Supabase account
- Anthropic API key
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jbwashington/will-pre-launch.git
cd will-pre-launch
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials.

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database migration:
```bash
# Install Supabase CLI if you haven't
bun install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

3. Get your API keys from Project Settings > API and add them to `.env.local`

### Development

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
bun install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard or via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
```

4. Deploy to production:
```bash
vercel --prod
```

## Content Generation Dashboard

Access the content generation dashboard at `/dashboard` to:

- Generate viral social media content for TikTok, YouTube, Instagram
- Create commercial scripts
- View content history
- Track analytics and waitlist growth

The AI is optimized for:
- NYC local references
- Trending keywords integration
- Platform-specific best practices
- Authentic brand voice

## Features in Detail

### Waitlist System

- Email collection with optional name, phone, and ZIP code
- Automatic position assignment
- Unique referral codes for each user
- Referral tracking (who referred whom)
- Real-time position updates

### Viral Sharing

- Pre-filled social share messages
- One-click sharing to Twitter, Facebook, WhatsApp
- Copy-to-clipboard referral links
- Gamification with position display

### Analytics

- Track all user interactions
- Monitor referral performance
- Content generation metrics
- Waitlist growth over time

## API Routes

- `POST /api/generate-content` - Generate AI content
- `GET /api/generate-content` - Fetch content history
- `POST /api/analytics` - Track events
- `GET /api/analytics` - Fetch analytics

## Database Schema

See `supabase/schema.sql` for the complete schema including:
- `waitlist` - User waitlist entries
- `analytics_events` - Event tracking
- `generated_content` - AI-generated content storage

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

For questions or support, contact [your-email@example.com]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Anthropic Claude](https://anthropic.com/)
- Database by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
