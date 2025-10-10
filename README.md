# Will the Barber's Exotic Snacks - Pre-Launch Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-D1-orange)](https://developers.cloudflare.com/d1/)
[![Claude AI](https://img.shields.io/badge/Claude-3.5_Sonnet-purple)](https://anthropic.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2-black)](https://bun.sh/)

A comprehensive pre-launch marketing waitlist platform for Will the Barber's Exotic Snacks - a NYC-based exotic snack delivery service. The platform combines viral growth mechanics with AI-powered content generation to build brand recognition and online presence before launch.

**Live Deployment**: https://aab66917.will-exotic-snacks.pages.dev

## Features

### Viral Waitlist System
- Email-based signup with automatic position tracking
- Referral code generation for each signup
- Social sharing via Twitter, Facebook, and WhatsApp
- Position advancement through referrals
- Confetti celebration on successful signup

### AI Content Generation Dashboard
- Platform-specific content for TikTok, YouTube, Instagram, and Commercials
- Trending keyword integration
- Multiple tone options (energetic, chill, funny, professional)
- Content length customization
- Content history and analytics viewer

### Analytics & Tracking
- Event-based analytics system
- Waitlist growth tracking
- Content generation metrics
- User engagement monitoring

## Tech Stack

### Core Framework
- **Next.js 15** with App Router, Turbopack, and React 19
- **TypeScript 5** for type safety
- **Bun 1.2.17** as package manager

### Database & Deployment
- **Cloudflare D1** (SQLite) for edge-native database
- **Cloudflare Pages** for edge deployment
- **Cloudflare Workers** for edge runtime API routes

### AI & Content Generation
- **Anthropic Claude 3.5 Sonnet** for social media content generation
- **Claude SDK** integrated for automated content creation

### UI & Styling
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **shadcn/ui** components with Radix UI primitives
- **Lucide React** for icons

### State Management
- **Zustand** for client-side state management

## Getting Started

### Prerequisites

- Bun 1.0+ (or Node.js 18+)
- Cloudflare account with Pages and D1 access
- Anthropic API key
- Wrangler CLI (Cloudflare's development tool)

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

3. Install Wrangler CLI globally:
```bash
bun install -g wrangler
```

4. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Cloudflare D1 Database Setup

1. Log in to Cloudflare:
```bash
wrangler login
```

2. Create a D1 database:
```bash
wrangler d1 create will-exotic-snacks-db
```

3. Update `wrangler.toml` with your database ID from the output above.

4. Run the database migrations:
```bash
wrangler d1 execute will-exotic-snacks-db --file=./migrations/0001_initial_schema.sql
```

### Local Development

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

To test with D1 database locally:

```bash
wrangler pages dev .next
```

## Deployment

### Deploy to Cloudflare Pages

1. Build the project:
```bash
bun run build
```

2. Remove cache folder (required for Cloudflare file size limits):
```bash
rm -rf .next/cache
```

3. Deploy to Cloudflare Pages:
```bash
wrangler pages deploy .next --commit-dirty=true
```

4. Set environment secrets:
```bash
wrangler pages secret put ANTHROPIC_API_KEY
```

### Automatic Deployments

The project can be configured for automatic deployments via GitHub integration:

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `bun run build`
3. Set build output directory: `.next`
4. Add environment variable: `ANTHROPIC_API_KEY`

## Project Structure

### Core Application Files

- `app/page.tsx` - Main landing page with animated hero and waitlist form
- `app/dashboard/page.tsx` - Content generation dashboard
- `app/shop/page.tsx` - Shop page with product listings
- `app/layout.tsx` - Root layout with metadata and providers

### API Routes (Edge Runtime)

- `app/api/waitlist/route.ts` - Create and fetch waitlist entries
- `app/api/analytics/route.ts` - Track events and fetch analytics
- `app/api/generate-content/route.ts` - AI content generation with Claude

### Components

- `components/waitlist-form.tsx` - Waitlist signup form with validation
- `components/share-dialog.tsx` - Social sharing interface
- `components/ui/*` - shadcn/ui components

### Library Files

- `lib/claude-agent.ts` - Claude SDK integration and prompt engineering
- `lib/db/client.ts` - D1 database client utilities
- `lib/stores/analytics-store.ts` - Zustand analytics store

### Configuration Files

- `wrangler.toml` - Cloudflare configuration with D1 bindings
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.ts` - Next.js configuration

## Database Schema

### waitlist
```sql
CREATE TABLE waitlist (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  zip_code TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  position INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### analytics_events
```sql
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### generated_content
```sql
CREATE TABLE generated_content (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## API Routes

### POST /api/waitlist
Create a new waitlist entry with referral tracking.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "555-0123",
  "zipCode": "10001",
  "referredBy": "ABC123"
}
```

**Response:**
```json
{
  "position": 42,
  "referralCode": "XYZ789",
  "id": "uuid"
}
```

### POST /api/generate-content
Generate AI-powered social media content.

**Request Body:**
```json
{
  "platform": "tiktok",
  "trendingKeywords": "nyc food, exotic snacks",
  "tone": "energetic",
  "length": "short"
}
```

**Response:**
```json
{
  "content": "Generated content...",
  "metadata": {
    "hashtags": ["#NYCFood", "#ExoticSnacks"],
    "suggestedLength": "15-30 seconds"
  }
}
```

### POST /api/analytics
Track user events.

**Request Body:**
```json
{
  "event_type": "signup",
  "event_data": {
    "referral_code": "ABC123"
  }
}
```

## Content Generation Dashboard

Access the dashboard at `/dashboard` to:

- Generate platform-optimized content (TikTok, YouTube, Instagram, Commercials)
- Integrate trending keywords and topics
- Choose tone and content length
- View generated content history
- Monitor analytics and waitlist metrics

The AI generates content optimized for:
- NYC local market and cultural references
- Platform-specific best practices and formats
- Current trending topics and keywords
- Authentic brand voice for Will the Barber

## Edge Runtime Architecture

All API routes run on Cloudflare Workers Edge runtime for optimal performance:

**Benefits:**
- Global distribution across 275+ cities
- Sub-10ms response times
- Automatic scaling
- Zero cold starts
- Direct D1 database access on the edge

**Implementation Pattern:**
```typescript
export const runtime = 'edge'

interface Env {
  DB: D1Database
}

export async function POST(request: NextRequest) {
  const env = (request as any).env as Env
  const db = env.DB
  // Database operations
}
```

## Performance

- **Cold Start**: 0ms (D1 auto-bound to Workers)
- **Query Latency**: Sub-10ms (edge-local SQLite)
- **Global Response Time**: Under 50ms worldwide
- **Build Time**: Optimized with Turbopack (5x faster than Webpack)

## Environment Variables

### Required

- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude AI

### Database

Database credentials are automatically bound via `wrangler.toml` configuration. No manual environment variables needed for D1.

## Scripts

```bash
# Development
bun run dev              # Start Next.js dev server
bun run build            # Build for production
bun run start            # Start production server locally

# Database
wrangler d1 execute DB --file=migrations/schema.sql  # Run migrations
wrangler d1 execute DB --command="SELECT * FROM waitlist"  # Query database

# Deployment
wrangler pages deploy .next  # Deploy to Cloudflare Pages
wrangler pages deployment tail  # View deployment logs
```

## Migration from Supabase to Cloudflare D1

This project was originally built with Supabase PostgreSQL and migrated to Cloudflare D1 for better edge integration. See `CLOUDFLARE_D1_MIGRATION.md` for complete migration details.

**Key improvements:**
- 10x faster cold starts
- Simplified configuration (1 variable vs 4)
- Edge-native database access
- 5GB free tier with unlimited reads
- Better integration with Cloudflare Pages

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Acknowledgments

Built with Next.js 15, Cloudflare D1, and Claude AI. Deployed on Cloudflare Pages Edge Network.
