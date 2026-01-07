# 🚀 SomniaX Agent Marketplace

> AI Agent Marketplace on Somnia Blockchain with X402 Micropayments

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Somnia](https://img.shields.io/badge/Somnia-Testnet-blue)](https://somnia.network/)
[![Privy](https://img.shields.io/badge/Auth-Privy-purple)](https://privy.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Payment System](#-payment-system)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

SomniaX is a decentralized AI agent marketplace built on the Somnia blockchain. Users can deploy, discover, and interact with AI agents while paying only for successful interactions through X402 micropayments.

**Key Features:**
- 🤖 Deploy custom AI agents powered by GPT-4o
- 💰 Pay-per-use with native STT tokens (0.1 STT = 30 messages)
- 🔐 Wallet-based authentication via Privy
- 📊 Real-time blockchain transaction verification
- 🌐 Responsive web interface with modern UI

---

## ✨ Features

### Core Functionality
- **AI-Powered Chat**: Integrated GPT-4o via AIML API
- **Agent Marketplace**: Browse and deploy custom AI agents
- **Micropayments**: X402 protocol for seamless STT payments
- **Wallet Integration**: Privy-powered Web3 authentication
- **Blockchain Verification**: Real-time transaction validation via Shannon Explorer

### User Experience
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Message Credits**: Per-wallet credit tracking (30 messages per 0.1 STT)
- **Agent Categories**: Organized marketplace with filtering
- **Real-time Updates**: Live agent listings and chat responses

### Developer Tools
- **Agent Registration**: Submit custom agents with metadata
- **API Endpoints**: RESTful APIs for chat and agent management
- **Database Integration**: Supabase PostgreSQL with real-time features
- **Type Safety**: Full TypeScript implementation

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Blockchain & Web3
- **Network**: Somnia Testnet (Chain ID: 50312)
- **RPC**: https://dream-rpc.somnia.network
- **Explorer**: Shannon Explorer
- **Web3 Library**: Viem 2.38.6 + Wagmi 2.19.2
- **Auth**: Privy 3.5.1
- **Payments**: X402 Protocol

### Backend & Data
- **AI Engine**: AIML API (GPT-4o)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **API Routes**: Next.js API Routes
- **Validation**: Zod schemas

### Development & Deployment
- **Build Tool**: Turbopack (Next.js)
- **Linting**: ESLint 9
- **Deployment**: Vercel
- **Package Manager**: npm/pnpm/bun

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git
- Wallet with STT tokens (Somnia testnet)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd somniax
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

4. **Configure Environment Variables**
```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Payment Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=your_wallet_address

# AIML API (GPT-4o)
AIML_API_KEY=your_aiml_api_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy authentication app ID | Yes |
| `NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS` | Wallet address for payments | Yes |
| `AIML_API_KEY` | AIML API key for GPT-4o | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

### Network Configuration

The application is configured for Somnia Testnet:
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network
- **Explorer**: Shannon Explorer
- **Native Token**: STT

---

## 📡 API Reference

### Chat API

#### `POST /api/chat/ai`
Main AI chat endpoint with GPT-4o integration.

**Request:**
```json
{
  "message": "What AI agents are available?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI assistant response with agent information..."
}
```

**Features:**
- Query validation (3-1000 characters)
- Spam detection
- GPT-4o integration
- System context about SomniaX

### Agent Management

#### `GET /api/agents`
Retrieve all registered agents.

#### `POST /api/agents`
Register a new agent (requires authentication).

#### `DELETE /api/agents/delete`
Delete an agent (owner only).

### Validation & Generation

#### `POST /api/validate-agent`
Validate agent data before registration.

#### `POST /api/generate-agent-info`
Generate agent metadata using AI.

---

## 📁 Project Structure

```
somniax/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── agents/            # Agent marketplace pages
│   │   ├── chat/              # AI chat interface
│   │   ├── submit/            # Agent registration
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   ├── lib/                  # Utilities & clients
│   │   ├── supabase.ts       # Database client
│   │   ├── aiml-client.ts    # AI API client
│   │   └── x402-config.ts    # Payment config
│   ├── hooks/               # Custom React hooks
│   └── providers/           # Context providers
├── public/                  # Static assets
├── scripts/                 # Utility scripts
│   └── cleanup-agents.ts    # Database cleanup
├── .env.local              # Environment variables
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind config
└── next.config.ts          # Next.js config
```

---

## 💰 Payment System

### How It Works

1. **Wallet Connection**: User connects via Privy
2. **Blockchain Scan**: System verifies past STT payments
3. **Credit Calculation**: 0.1 STT = 30 messages
4. **Usage Tracking**: Client-side credit management
5. **Auto Top-up**: Seamless payment for additional credits

### Payment Details

| Metric | Value |
|--------|-------|
| **Token** | STT (Somnia Testnet) |
| **Price** | 0.1 STT |
| **Messages** | 30 queries |
| **Network** | Somnia Testnet |
| **Gas Fee** | ~0.0001 STT |

### X402 Protocol

The application uses the X402 micropayment protocol for:
- **Exact Payments**: Pay exactly what's needed
- **No Overpayment**: Precise token amounts
- **Instant Verification**: Blockchain-confirmed transactions
- **Multi-wallet Support**: Per-wallet credit tracking

---

## 🗄️ Database Schema

### Agents Table

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_query DECIMAL(10,6) NOT NULL,
  payment_wallet TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  status TEXT DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_creator_wallet ON agents(creator_wallet);
```

### Key Features

- **UUID Primary Keys**: Auto-generated unique identifiers
- **Slug-based URLs**: SEO-friendly agent pages
- **Row Level Security**: Creator-only modifications
- **Real-time Updates**: Live marketplace updates
- **Category Filtering**: Efficient agent discovery

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot reloading
2. **Code Quality**: Run `npm run lint` before commits
3. **Database Changes**: Use Drizzle for schema migrations
4. **Testing**: Manual testing with local wallet connections

### Key Components

- **PrivyProvider**: Web3 authentication wrapper
- **PaymentModal**: STT payment interface
- **ConnectWallet**: Wallet connection component
- **Agent Cards**: Marketplace agent listings
- **Chat Interface**: Real-time AI conversations

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import GitHub repo to Vercel
   - Set build command: `npm run build`
   - Set output directory: `.next`

2. **Environment Variables**
   - Add all required env vars in Vercel dashboard

3. **Domain Configuration**
   - Custom domain (optional)
   - SSL certificate (automatic)

### Manual Deployment

```bash
# Build
npm run build

# Start
npm run start

# Or with PM2
pm2 start npm --name somniax -- start
```

### Docker Support

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

### Current Security Model

- **Client-side Payments**: Credits tracked in localStorage
- **Wallet Verification**: Privy authentication
- **Query Validation**: Length and spam checks
- **API Rate Limiting**: Basic validation (upgrade recommended)

### Security Considerations

#### API Endpoints
- `/api/chat/ai`: Public endpoint (client-side payment validation)
- `/api/agents`: CRUD operations with wallet verification
- `/api/validate-agent`: Input sanitization

#### Recommendations
1. **Server-side Message Tracking**: Move credit tracking to database
2. **API Authentication**: Add wallet signature verification
3. **Rate Limiting**: Implement per-wallet/IP limits
4. **Webhook Verification**: Server-side payment confirmation

### Known Limitations
- Message credits stored client-side (can be manipulated)
- No server-side payment verification
- Public AI chat endpoint

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### Pull Request Process
1. Update documentation for API changes
2. Add tests for new features
3. Ensure all checks pass
4. Request review from maintainers

---

## 📊 Roadmap

### Phase 1 (Current)
- ✅ AI agent marketplace
- ✅ X402 micropayments
- ✅ Wallet authentication
- ✅ Basic chat interface

### Phase 2 (Upcoming)
- 🔄 Server-side message tracking
- 🔄 Agent ratings and reviews
- 🔄 Advanced agent categories
- 🔄 Mainnet deployment

### Phase 3 (Future)
- 🤖 Agent-to-agent communication
- 📈 Analytics dashboard
- 🎯 Agent performance metrics
- 🌐 Multi-chain support

---

## 🐛 Troubleshooting

### Common Issues

**Payments not working:**
- Verify `NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS` is set
- Check wallet has STT tokens
- Ensure connected to Somnia Testnet (Chain ID: 50312)

**AI not responding:**
- Confirm `AIML_API_KEY` is valid
- Check AIML API quota
- Verify network connectivity

**Database connection:**
- Validate Supabase credentials
- Check Row Level Security policies
- Verify database schema

### Debug Tools
- Browser DevTools for client-side debugging
- Vercel logs for deployment issues
- Supabase dashboard for database queries
- Shannon Explorer for transaction verification

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: This README
- **Issues**: [GitHub Issues](<repository-issues>)
- **Somnia Network**: [somnia.network](https://somnia.network)
- **Privy Auth**: [privy.io](https://privy.io)
- **Supabase**: [supabase.com](https://supabase.com)

---

**Built with ❤️ on Somnia Blockchain**

**Powered by:** Next.js • React • TypeScript • Privy • Viem • Supabase • AIML
