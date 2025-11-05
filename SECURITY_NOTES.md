# 🔒 Security Notes - API Exposure

## ⚠️ Exposed API Endpoints

### 1. `/api/chat/ai` - **PUBLIC** ⚠️

**Status**: Currently exposed without authentication  
**Risk**: Medium  
**Used by**: Frontend chat interface

#### Current Implementation:
```typescript
// No authentication
// No server-side payment verification
// Relies on client-side message tracking
```

#### What It Does:
- Accepts any POST request with a message
- Validates query (length, spam patterns)
- Calls AIML GPT-4o API
- Returns AI response

#### Security Measures in Place:
✅ Query validation (min 3 chars, max 1000 chars)  
✅ Spam pattern detection  
✅ Error handling  
❌ **No API authentication**  
❌ **No rate limiting**  
❌ **No payment verification**  

#### Risks:
- Anyone can call this API directly
- Bypasses client-side payment system
- Could rack up AIML API costs
- No usage limits per wallet/IP

---

### 2. `/api/chat/route` - **LEGACY** ℹ️

**Status**: Not actively used  
**Risk**: Low  
**Purpose**: X402 protocol demonstration

#### Current Implementation:
```typescript
// Checks for X-PAYMENT header
// Returns 402 if missing
// Demo verification only
```

This route demonstrates the X402 micropayment protocol but is **not used** by the frontend.

---

## 🚨 Critical Security Issues

### Issue 1: API Can Be Called Directly

**Problem**:
```bash
# Anyone can do this without paying:
curl -X POST http://your-domain.com/api/chat/ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Impact**: 
- Free AI responses
- AIML API costs
- System abuse

---

### Issue 2: Client-Side Payment Tracking

**Problem**:
```javascript
// User can manipulate localStorage:
localStorage.setItem('somniax_message_count_0x...', '9999')
```

**Impact**:
- Unlimited messages without paying
- Revenue loss

---

### Issue 3: No Rate Limiting

**Problem**:
- No limits on API calls
- Could be DDoS'd
- AIML API quota exhaustion

---

## ✅ Recommended Fixes

### Priority 1: Add API Authentication

```typescript
// src/app/api/chat/ai/route.ts
export async function POST(request: NextRequest) {
  // Verify wallet signature
  const signature = request.headers.get('x-signature')
  const message = request.headers.get('x-message')
  const address = verifySignature(signature, message)
  
  if (!address) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }
  
  // Check message balance from database
  const messageCount = await db.getMessageCount(address)
  if (messageCount <= 0) {
    return NextResponse.json(
      { error: 'No messages remaining' },
      { status: 402 }
    )
  }
  
  // Process request...
  await db.decrementMessageCount(address)
  
  // Continue...
}
```

---

### Priority 2: Server-Side Message Tracking

**Current (Vulnerable)**:
```typescript
// localStorage - can be manipulated
localStorage.setItem('somniax_message_count_0x...', count)
```

**Recommended (Secure)**:
```typescript
// Database - server-controlled
await db.messages.update({
  where: { walletAddress },
  data: { count: { decrement: 1 } }
})
```

**Setup Database**:
```sql
CREATE TABLE message_balances (
  wallet_address VARCHAR(42) PRIMARY KEY,
  message_count INTEGER DEFAULT 0,
  last_payment_hash VARCHAR(66),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet ON message_balances(wallet_address);
```

---

### Priority 3: Add Rate Limiting

```typescript
// Install @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1"
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    )
  }
  
  // Continue...
}
```

---

### Priority 4: API Key System

```typescript
// Generate API key per wallet
const apiKey = crypto.randomBytes(32).toString('hex')
await db.apiKeys.create({
  data: {
    key: apiKey,
    walletAddress: address,
    createdAt: new Date()
  }
})

// Verify on each request
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const keyData = await db.apiKeys.findUnique({ where: { key: apiKey } })
  
  if (!keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  
  // Continue...
}
```

---

## 🛡️ Security Checklist

### Immediate Actions:
- [ ] Add API authentication (wallet signature verification)
- [ ] Implement rate limiting (IP-based + wallet-based)
- [ ] Move message tracking to server-side database
- [ ] Add API logging for monitoring

### Short-term:
- [ ] Set up API key system
- [ ] Add webhook verification for payments
- [ ] Implement request signing
- [ ] Add CORS restrictions

### Long-term:
- [ ] Set up monitoring & alerts
- [ ] Implement API analytics
- [ ] Add fraud detection
- [ ] Regular security audits

---

## 🔍 Monitoring Recommendations

### Set Up Alerts For:
- Unusual API call patterns
- High AIML API usage
- Failed authentication attempts
- Rate limit hits
- Payment verification failures

### Log Everything:
```typescript
console.log({
  timestamp: new Date(),
  endpoint: '/api/chat/ai',
  walletAddress: address,
  messageCount: remaining,
  ip: request.ip,
  userAgent: request.headers.get('user-agent')
})
```

---

## 📊 Current Security Posture

| Layer | Status | Risk Level |
|-------|--------|------------|
| API Authentication | ❌ None | 🔴 High |
| Rate Limiting | ❌ None | 🔴 High |
| Message Tracking | ⚠️ Client-side | 🟡 Medium |
| Payment Verification | ⚠️ Client-side | 🟡 Medium |
| Query Validation | ✅ Active | 🟢 Low |
| Spam Detection | ✅ Active | 🟢 Low |
| HTTPS | ✅ Vercel | 🟢 Low |
| Environment Vars | ✅ Secure | 🟢 Low |

**Overall Risk**: 🔴 **HIGH** - Immediate action required

---

## 🎯 Quick Wins (1-2 days)

1. **Add simple API key check**
   ```typescript
   const apiKey = request.headers.get('x-api-key')
   if (apiKey !== process.env.INTERNAL_API_KEY) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

2. **Add IP-based rate limiting**
   ```typescript
   const ipCounts = new Map()
   const ip = request.ip
   const count = ipCounts.get(ip) || 0
   if (count > 10) return { error: 'Rate limit' }
   ipCounts.set(ip, count + 1)
   ```

3. **Log all API calls**
   ```typescript
   console.log('[API]', new Date(), request.ip, request.url)
   ```

---

## 🚀 Production-Ready Checklist

Before going to mainnet:

- [ ] Server-side authentication implemented
- [ ] Database for message tracking
- [ ] Rate limiting active
- [ ] API monitoring set up
- [ ] Webhook verification for payments
- [ ] CORS properly configured
- [ ] Error logging system
- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Load testing passed

---

## 📞 If You Get Hacked

1. **Immediately**:
   - Rotate all API keys
   - Block suspicious IPs
   - Check AIML API usage

2. **Within 1 hour**:
   - Review logs
   - Identify attack vector
   - Deploy hotfix

3. **Within 24 hours**:
   - Post-mortem analysis
   - Implement preventive measures
   - Update security protocols

---

**⚠️ RECOMMENDATION: Implement Priority 1-3 fixes BEFORE mainnet deployment!**
