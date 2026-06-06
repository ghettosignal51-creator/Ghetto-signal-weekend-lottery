# 💰 Monetization Plan: Quick Odds Uganda

## Executive Summary
Transform the current Phaser game into a fully functional real-money lottery platform for Uganda with user accounts, wallet system, secure transactions, and compliance infrastructure.

---

## Phase 1: Core Backend Infrastructure (Weeks 1-4)

### 1.1 User Management & Authentication

**Technology**: Node.js + Express + PostgreSQL + JWT

```javascript
// User Model
{
  id: UUID,
  phone: "+256701234567",           // Primary ID in Uganda
  email: "user@example.com",
  password_hash: bcrypt(),
  username: "lucky_player_123",
  kyc_verified: boolean,
  kyc_data: {
    national_id: "CM123456789",
    full_name: "John Doe",
    date_of_birth: "1990-01-15",
    verified_at: timestamp
  },
  wallet_balance: 50000,            // UGX
  total_wagered: 0,
  total_winnings: 0,
  created_at: timestamp,
  last_login: timestamp
}
```

**Features**:
- ✅ Phone number + OTP verification (for Uganda)
- ✅ Email backup registration
- ✅ Password hashing with bcrypt
- ✅ JWT token-based auth (refresh + access tokens)
- ✅ Session management with Redis

**API Endpoints**:
```
POST   /auth/register           # Phone/email signup
POST   /auth/verify-otp         # Verify 6-digit OTP
POST   /auth/login              # Phone + password
POST   /auth/refresh            # Get new JWT
GET    /auth/me                 # Get current user
POST   /auth/logout             # Invalidate token
```

---

### 1.2 Wallet & Balance System

**Technology**: PostgreSQL + Redis Cache

```javascript
// Wallet Model
{
  id: UUID,
  user_id: UUID,
  balance: 50000,               // UGX (Uganda Shilling)
  pending_withdrawals: 0,
  locked_in_active_bets: 0,
  available_balance: function() {
    return balance - pending_withdrawals - locked_in_active_bets
  },
  created_at: timestamp,
  updated_at: timestamp
}

// Transaction Log
{
  id: UUID,
  user_id: UUID,
  type: "deposit" | "withdrawal" | "wager" | "winnings" | "refund",
  amount: 5000,
  before_balance: 50000,
  after_balance: 55000,
  status: "completed" | "pending" | "failed",
  reference_id: "TXN123456",
  metadata: {
    game_id: "GAME_ABC123",      # For wagers/winnings
    payment_method: "m_pesa",
    mobile_money_ref: "ABC123DEF456"
  },
  created_at: timestamp
}
```

**APIs**:
```
GET    /wallet/balance           # Get current balance
GET    /wallet/transactions      # Get transaction history (paginated)
POST   /wallet/deposit           # Initiate deposit
POST   /wallet/withdraw          # Initiate withdrawal
```

---

### 1.3 Payment Integration: M-Pesa & Other Mobile Money

**Technology**: M-Pesa Daraja API + Stripe (for international)

#### **M-Pesa STK Push** (Recommended for Uganda)
```javascript
// M-Pesa Transaction Flow
POST /payments/deposit/mpesa
{
  phone: "+256701234567",
  amount: 50000,
  reference: "DEP_USER123_12345"
}

// Webhook: M-Pesa confirms payment
POST /webhooks/mpesa/callback
{
  ResultCode: 0,
  TransactionDesc: "STK Push Successful",
  Amount: 50000,
  PhoneNumber: "256701234567"
}
// → Update wallet balance
// → Create transaction record
```

#### **Stripe for International Backup** (Credit Card)
```javascript
// One-time payment
POST /payments/deposit/stripe
{
  amount: 50000,
  currency: "UGX",
  source: "tok_visa"  // Stripe token
}
```

**Implementation Files**:
- `src/services/mpesa.js` - M-Pesa Daraja integration
- `src/services/stripe.js` - Stripe integration
- `src/webhooks/mpesa.js` - M-Pesa callback handler
- `src/controllers/payments.js` - Payment APIs

---

### 1.4 Game Session & Betting Engine

**Technology**: WebSocket + Node.js + PostgreSQL

```javascript
// Game Session Model
{
  id: UUID,
  user_id: UUID,
  game_type: "lottery_wheel",
  status: "active" | "completed" | "failed",
  wager_amount: 5000,           // UGX
  odds_offered: 6,              // 1 in 6 chance
  house_edge: 0.15,             // 15%
  server_seed: "SEED_ABC...",   // Server-side randomness
  client_seed: "SEED_XYZ...",   // Client-side randomness
  nonce: 12345,                 // Incrementing nonce
  result: {
    prize_id: 3,
    prize_name: "💰 Bonus Win!",
    payout_multiplier: 3.0,     # Amount won / wager
    winnings: 15000,
    verification_hash: "SHA256_HASH"
  },
  user_balance_before: 50000,
  user_balance_after: 60000,
  house_profit: 750,            # 15% of wager
  created_at: timestamp,
  completed_at: timestamp
}
```

**Fair Gaming (Provably Fair)**:
```javascript
// Server generates seed before revealing result
const serverSeed = crypto.randomBytes(32).toString('hex');
const clientSeed = req.body.client_seed;
const nonce = req.body.nonce;

// Hash is sent to client BEFORE game result
const hash = SHA256(serverSeed);

// After game completes, reveal seed to client
const verification = SHA256(serverSeed + clientSeed + nonce);
// Client can verify: this matches the result
```

**API Endpoints**:
```
POST   /games/spin              # Start a spin (with wager)
GET    /games/:gameId           # Get game result
GET    /games/history           # User's game history
```

---

## Phase 2: Game Frontend Integration (Weeks 2-3, Parallel)

### 2.1 Connect Phaser Game to Backend

**Update `src/services/gameAPI.js`**:
```javascript
class GameAPI {
  async login(phone, password) {
    const res = await fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    const { token, user } = await res.json();
    localStorage.setItem('auth_token', token);
    return user;
  }

  async getBalance() {
    const token = localStorage.getItem('auth_token');
    return fetch('/wallet/balance', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async placeSpin(wagerAmount, clientSeed) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch('/games/spin', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        wager: wagerAmount,
        client_seed: clientSeed
      })
    });
    return res.json();
  }
}
```

### 2.2 Update GameScene.js

**Add login screen**:
```javascript
// Pre-game: Show login screen
if (!user) {
  this.scene.start('LoginScene');
  return;
}

// In-game: Show balance
this.add.text(10, 10, `Balance: ${user.balance} UGX`, 
  { fontSize: '16px', fill: '#00ff00' });

// Spin button now deducts from balance
async spin() {
  const minimumWager = 500;  // 500 UGX minimum
  if (this.playerBalance < minimumWager) {
    alert('Insufficient balance');
    return;
  }

  this.wagerAmount = minimumWager;
  const result = await this.gameAPI.placeSpin(this.wagerAmount);
  
  // Show result
  if (result.winnings > 0) {
    this.resultText.setText(`Won ${result.winnings} UGX!`);
  }
}
```

---

## Phase 3: Compliance & KYC (Weeks 3-4)

### 3.1 KYC (Know Your Customer)

**Uganda Requirements**:
- National ID verification
- Proof of address (utility bill)
- Self-photos (liveness check)
- Limits based on verification tier

**Database**:
```javascript
{
  user_id: UUID,
  tier: "unverified" | "basic" | "verified",
  documents: [
    { type: "national_id", url: "s3://...", status: "verified" },
    { type: "selfie", url: "s3://...", status: "verified" }
  ],
  limits: {
    daily_deposit: tier === "verified" ? 10000000 : 1000000,
    daily_withdrawal: tier === "verified" ? 5000000 : 500000
  }
}
```

**APIs**:
```
POST   /kyc/submit           # Upload KYC documents
GET    /kyc/status           # Check verification status
```

### 3.2 Responsible Gaming

```javascript
// Set deposit limits
{
  user_id: UUID,
  daily_limit: 500000,
  weekly_limit: 2000000,
  monthly_limit: 5000000,
  self_exclusion: boolean,
  exclusion_until: timestamp
}

// API for player to set limits
POST   /responsible-gaming/set-limits
GET    /responsible-gaming/limits
```

### 3.3 AML (Anti-Money Laundering)

- Flag transactions > 10M UGX
- Monitor for pattern abuse
- Log all transactions for audit

---

## Phase 4: Admin Dashboard (Weeks 4-5)

**Features**:
- View user statistics
- Approve/deny KYC
- Monitor game fairness metrics
- View transaction history
- Manage house accounts
- Withdraw house profits

---

## Phase 5: Deployment & DevOps (Week 5-6)

### Infrastructure

**Option A: AWS** (Recommended)
```
- EC2: Backend (Node.js)
- RDS: PostgreSQL database
- ElastiCache: Redis
- S3: Document storage (KYC)
- Cognito: Alternative auth
- CloudFront: CDN for game assets
```

**Option B: DigitalOcean** (Cheaper for Uganda)
```
- Droplet: VPS for backend
- Managed Database: PostgreSQL
- Spaces: S3-compatible storage
- App Platform: Deploy Node.js
```

**Docker Compose for Local Dev**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: quick_odds
      POSTGRES_PASSWORD: dev_password
  
  redis:
    image: redis:7
  
  backend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
```

---

## Complete Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Phaser 3 + React | Game UI + Web interface |
| **Backend** | Node.js + Express | API server |
| **Database** | PostgreSQL | User data, wallets, transactions |
| **Cache** | Redis | Session, rate limiting |
| **Payment** | M-Pesa Daraja + Stripe | Mobile money + cards |
| **Storage** | AWS S3/DigitalOcean Spaces | KYC documents |
| **Auth** | JWT + OTP | User verification |
| **Hosting** | AWS/DigitalOcean | Infrastructure |
| **Monitoring** | Sentry + DataDog | Error tracking |

---

## Security Checklist

- ✅ HTTPS/TLS for all communications
- ✅ Password hashing (bcrypt)
- ✅ JWT token expiration (15 min access, 7 day refresh)
- ✅ Rate limiting (10 requests/min per IP)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CSRF token on forms
- ✅ Server-side validation (never trust client input)
- ✅ Provably fair algorithm
- ✅ PCI-DSS compliance for payments
- ✅ Data encryption at rest
- ✅ Audit logging for all financial transactions

---

## Revenue Model

**House Edge: 15%**
- User wagers 5,000 UGX
- Expected payout: 12,500 UGX (2.5x multiplier)
- House profit: 2,500 UGX (15%)

**Example Daily Revenue** (1,000 active users):
- Avg daily wager per user: 50,000 UGX
- Total wagered: 50,000,000 UGX
- House profit: **7,500,000 UGX (~$2,000 USD)**

---

## Regulatory Considerations for Uganda

⚠️ **CRITICAL**: Uganda has gambling regulations:
- Obtain Gaming License from Uganda Gaming Board
- Comply with National Gambling Regulatory Framework
- Ensure all operations run from Uganda or licensed jurisdiction
- Anti-corruption measures

**Recommended**: Consult with Ugandan legal firm specializing in gaming law before launch.

---

## Timeline

```
Week 1: User auth + wallet system
Week 2: M-Pesa integration + Game session engine
Week 3: Frontend integration + KYC system
Week 4: Admin dashboard + Compliance review
Week 5: DevOps + Deployment
Week 6: QA + Load testing + Launch
```

**Total Development Time: 6-8 weeks** (with experienced team)

---

## Next Steps

1. **Choose your tech stack** (use the one above or modify)
2. **Set up GitHub repo structure** for backend
3. **Initialize Node.js backend project**
4. **Create database schema**
5. **Implement auth system first**
6. **Build payment integrations**
7. **Connect to Phaser game**

---

## Questions?

- Need help setting up the backend?
- Want me to create starter code?
- Need clarification on any part?
