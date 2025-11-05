# 🚀 SomniaX Agent Marketplace MVP

> AI Agent Marketplace on Somnia Blockchain with X402 Micropayments

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Somnia](https://img.shields.io/badge/Somnia-Testnet-blue)](https://somnia.network/)
[![Privy](https://img.shields.io/badge/Auth-Privy-purple)](https://privy.io/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Routes](#-api-routes)
- [Project Structure](#-project-structure)
- [Payment System](#-payment-system)
- [Development](#-development)
- [Deployment](#-deployment)
- [Security](#-security)

---

## ✨ Features

- 🤖 **AI-Powered Chat** - GPT-4o integration via AIML API
- 💰 **X402 Micropayments** - Pay-per-use with native STT tokens
- 🔐 **Wallet Authentication** - Privy-powered wallet connection
- 📊 **Blockchain Verification** - Real-time transaction verification via Shannon Explorer
- 💬 **Message Credit System** - Per-wallet message tracking (0.1 STT = 30 messages)
- 🔄 **Automatic Top-ups** - Cumulative message purchases
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS
- 🌐 **Multi-wallet Support** - Per-user payment tracking

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React

### Blockchain
- **Network**: Somnia Testnet (Chain ID: 50312)
- **Web3 Library**: Viem
- **Auth**: Privy
- **RPC**: https://dream-rpc.somnia.network
- **Explorer**: Shannon Explorer

### Backend
- **AI**: AIML API (GPT-4o)
- **API Routes**: Next.js API Routes
- **Validation**: Query filtering & spam detection

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- NPM/PNPM/Yarn/Bun
- Wallet with STT tokens (Somnia testnet)

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd somniax-agent-marketplace-mvp
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file with:

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Payment Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=your_wallet_address

# AIML API (GPT-4o)
AIML_API_KEY=your_aiml_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Authentication**: Privy (Web3 wallet auth)
- **Database**: Supabase (PostgreSQL)
- **AI**: AIML API (GPT-4o)
- **Blockchain**: Somnia Testnet
- **Payments**: Viem + X402 Protocol

### Key Components

  messagesPerBundle: 30,
}
```

✅ **Payment wallet already configured** - All payments will go to `0xE867...8637`

---

## 🔌 API Routes

### 1. `/api/chat/ai` (Main AI Chat)

**Method**: POST  
**Auth**: None (client-side payment check)  
**Rate Limit**: Per-wallet message limits

**Request**:
```json
{
  "message": "What AI agents are available?"
}
```

**Response**:
```json
{
  "success": true,
  "response": "AI assistant response..."
}
```

**Features**:
- ✅ Query validation (length, spam detection)
- ✅ GPT-4o integration
- ✅ System context about SomniaX
- ✅ Error handling

**Security**:
- Minimum query length: 3 characters
- Maximum query length: 1000 characters
- Spam pattern detection
- No payment validation (handled client-side)

---

### 2. `/api/chat/route` (Legacy/Example)

**Method**: POST  
**Auth**: X-PAYMENT header (demo)  
**Status**: Not actively used

**Request Headers**:
```
X-PAYMENT: {"hash": "0x...", "from": "0x...", "to": "0x...", "amount": "0.1"}
```

**Response (402 if no payment)**:
```json
{
  "error": "X-PAYMENT header is required",
  "paymentRequirements": {
    "scheme": "exact",
    "maxAmountRequired": "0.1",
    "payTo": "0x...",
    ...
  }
}
```

**Note**: This route demonstrates X402 protocol but isn't used by the frontend.

---

## 📁 Project Structure

```
somniax-agent-marketplace-mvp/
├── src/
│   ├── app/
│   │   ├── agents/          # Agent directory & detail pages
│   │   ├── chat/            # AI chat interface
│   │   ├── submit/          # Agent registration
│   │   └── api/
│   │       ├── chat/        # AI chat endpoint
│   │       ├── validate-agent/  # Agent validation
│   │       └── agents/delete/   # Delete agent
│   ├── components/
│   │   └── ui/              # Shadcn UI components
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client & API
│   │   └── aiml-client.ts   # AIML API client
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md                # This file
```

### Why Supabase?

**Supabase is used for:**

1. **Agent Storage** - All registered agents stored in PostgreSQL database
2. **Unique IDs** - Auto-generated UUIDs for each agent
3. **URL Generation** - Slug-based URLs (`/agents/tweet-writer-pro`)
4. **Real-time Data** - Instant updates across all users
5. **Security** - Row Level Security (RLS) policies
6. **Search & Filter** - Fast queries by category, creator, etc.

**Key Commands:**

```bash
# List all agents
SELECT * FROM agents;

# Get agent by slug
SELECT * FROM agents WHERE slug = 'tweet-writer-pro';

# Check agent creator
SELECT creator_wallet FROM agents WHERE id = 'uuid';

# Delete agent
DELETE FROM agents WHERE id = 'uuid' AND creator_wallet = '0x...';

# Count agents by category
SELECT category, COUNT(*) FROM agents GROUP BY category;
```

**Database Features:**
- ✅ Automatic UUID generation
- ✅ Unique slug constraint
- ✅ Indexed queries (slug, category, creator)
- ✅ Row Level Security enabled
- ✅ Auto-updating timestamps
- ✅ Server-side validation

---

## 💾 Database Schema (Supabase)

### Agents Table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Auto-generated unique ID
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                      -- For URL: /agents/{slug}
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_query DECIMAL(10,6) NOT NULL,
  payment_wallet TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_creator_wallet ON agents(creator_wallet);
```

**Why These Fields?**
- `id` - Unique identifier (UUID auto-generated by Supabase)
- `slug` - URL-friendly name for agent page (`/agents/tweet-writer-pro`)
- `creator_wallet` - For delete verification and ownership
- `payment_wallet` - Where users pay when using the agent
- Timestamps - Track when agent was created/updated

---

## 💰 Payment System

### How It Works

```
1. User connects wallet (Privy)
   ↓
2. System scans blockchain (Shannon Explorer API)
   ↓
3. Counts all 0.1 STT payments to recipient
   ↓
4. Calculates: payments × 30 = total messages
   ↓
5. Subtracts used messages = remaining
   ↓
6. User pays 0.1 STT → Get 30 messages
   ↓
7. STT tokens transferred to recipient wallet
   ↓
8. Message count updates automatically
```

### Payment Flow Diagram

```
┌─────────────┐
│ Connect     │
│ Wallet      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Scan        │
│ Blockchain  │ ← Shannon Explorer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Verify      │
│ Past        │
│ Payments    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Show        │
│ Message     │
│ Balance     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ User        │
│ Chats       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Messages    │
│ Remaining?  │
└──────┬──────┘
       │
    No │
       ▼
┌─────────────┐
│ Pay 0.1 STT │
│ Get 30 Msgs │
└─────────────┘
```

### Key Features

- ✅ **Wallet-specific**: Each wallet has independent message limits
- ✅ **Cumulative**: Top-ups add to existing balance (not replace)
- ✅ **Blockchain-verified**: All payments verified on Shannon Explorer
- ✅ **Transaction proof**: All transaction hashes stored
- ✅ **Auto-sync**: Balances sync when wallet reconnects
- ✅ **LocalStorage backup**: Fast initial load, then blockchain verification

### Payment Details

| Parameter | Value |
|-----------|-------|
| **Price** | 0.1 STT |
| **Messages** | 30 queries |
| **Network** | Somnia Testnet |
| **Chain ID** | 50312 |
| **Token** | Native STT |
| **Gas Fee** | ~0.0001 STT |

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Build
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

### File Watching

Next.js automatically reloads when you edit:
- ✅ Pages (`src/app/**/page.tsx`)
- ✅ Components (`src/components/**`)
- ✅ API Routes (`src/app/api/**`)
- ✅ Styles (Tailwind classes)

### Environment Setup

**Development**:
```bash
NODE_ENV=development
```

**Production**:
```bash
NODE_ENV=production
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo

3. **Set Environment Variables**
   - Add all `.env.local` variables in Vercel dashboard

4. **Deploy!**
   - Automatic deployments on every push

### Manual Deployment

```bash
# Build
npm run build

# Start
npm run start

# Or use PM2
pm2 start npm --name "somniax" -- start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔒 Security

### API Security

#### `/api/chat/ai`
- ✅ Query validation (length, spam)
- ✅ No direct payment verification (client-side)
- ⚠️ **Public endpoint** - relies on client-side message tracking

#### Recommendations for Production:

1. **Add API authentication**
```typescript
// Verify wallet signature
const signature = request.headers.get("x-signature")
const address = verifySignature(signature, message)
```

2. **Rate limiting**
```typescript
import { Ratelimit } from "@upstash/ratelimit"
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
})
```

3. **Backend message tracking**
```typescript
// Store in database instead of localStorage
await db.decrementMessageCount(walletAddress)
```

### Current Security Model

```
Client-Side:
├─ Wallet connection (Privy - ✅ Secure)
├─ Message count tracking (localStorage - ⚠️ Can be manipulated)
└─ Payment processing (Viem - ✅ Secure)

Server-Side:
├─ Query validation (✅ Active)
├─ Spam detection (✅ Active)
└─ Payment verification (❌ Not implemented - relies on client)
```

### Recommended Upgrades

1. **Server-side message tracking**
   - Use PostgreSQL/MongoDB to track message usage
   - Verify wallet ownership on each API call

2. **API key system**
   - Generate API keys per wallet
   - Track usage server-side

3. **Webhook verification**
   - Set up webhooks from Shannon Explorer
   - Verify payments server-side

---

## 📊 Message Economics

### Pricing

| Messages | Price (STT) | Cost per Message |
|----------|-------------|------------------|
| 30       | 0.1         | 0.0033 STT       |
| 60       | 0.2         | 0.0033 STT       |
| 90       | 0.3         | 0.0033 STT       |
| 300      | 1.0         | 0.0033 STT       |

### Example Scenarios

**Scenario 1: New User**
```
- Connect wallet → 0 messages
- Pay 0.1 STT → 30 messages
- Use 10 queries → 20 remaining
- Disconnect → 20 saved for next time
```

**Scenario 2: Returning User**
```
- Connect wallet → 20 messages (from before)
- Use 15 queries → 5 remaining
- Top up 0.1 STT → 35 messages total
- Use 10 queries → 25 remaining
```

**Scenario 3: Power User**
```
- Pay 1.0 STT → 300 messages
- Use 150 queries → 150 remaining
- Disconnect for 1 week → Still 150 when return
```

---

## 🐛 Troubleshooting

### Issue: Payments not working

**Check**:
1. Is `NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS` set?
2. Is recipient address valid (not `0x0000...`)?
3. Does user have STT tokens?
4. Is wallet on Somnia Testnet (Chain ID: 50312)?

**Fix**:
```typescript
// src/lib/x402-config.ts
recipientAddress: "0xYourRealWalletAddress" // Not 0x0000...
```

### Issue: Messages not updating

**Check console for**:
```
🔍 SCANNING BLOCKCHAIN...
✅ Found X valid payments
```

**Fix**:
- Check Shannon Explorer for your wallet
- Verify transactions went through
- Clear localStorage and reconnect

### Issue: AI not responding

**Check**:
1. Is `AIML_API_KEY` set in `.env.local`?
2. Check API quota on AIML dashboard
3. Check console for errors

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📞 Support

- **Issues**: [GitHub Issues](your-repo/issues)
- **Docs**: This README
- **Somnia**: [somnia.network](https://somnia.network)
- **Privy**: [privy.io](https://privy.io)

---

## 🎯 Roadmap

- [ ] Server-side message tracking
- [ ] API authentication system
- [ ] Agent submission review flow
- [ ] Agent ratings & reviews
- [ ] Agent categories & search
- [ ] Mainnet deployment
- [ ] Token staking rewards

---

**Built with ❤️ on Somnia Blockchain**

**Powered by:** Next.js • Privy • Viem • AIML • Somnia • X402
