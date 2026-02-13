# Transfer CRUD - Wallet Transfer API

[![Tests](https://img.shields.io/badge/tests-23%20passing-brightgreen)](.) [![Coverage](https://img.shields.io/badge/coverage-98.34%25-brightgreen)](.)

A robust wallet transfer API built with TypeScript, featuring idempotency, optimistic locking, and double-entry bookkeeping.

[🇧🇷 Versão em Português](./README.pt-BR.md)

## 🚀 Features

- **Wallet Management**: Create wallets and check balances
- **Secure Transfers**: Transfer funds between wallets with idempotency
- **Double-Entry Bookkeeping**: Immutable ledger entries for all transactions
- **Optimistic Locking**: Race condition protection using version control
- **Idempotency**: Prevent duplicate operations with 24-hour key caching
- **Comprehensive Testing**: 98.34% code coverage with 23 tests
- **Production Ready**: Error handling, validation, and security headers

## ⚠️ Important Notice

**This is a learning/portfolio project** designed to demonstrate professional patterns in wallet systems:
- ✅ Idempotency and race condition handling
- ✅ Double-entry bookkeeping and transaction integrity
- ✅ Comprehensive testing and documentation
- ❌ **No authentication/authorization** (intentionally omitted to focus on core patterns)

**For production use**, you would need to add:
- JWT/OAuth authentication
- User ownership validation (ensure users can only access their own wallets)
- Rate limiting per user
- Audit logging with user IDs
- RBAC (Role-Based Access Control)

**Perfect for**: Portfolio, learning, technical interviews, or as a starting template.

## 🏗️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5.x
- **Database**: PostgreSQL 15 + Prisma ORM 7.x
- **Cache**: Redis 7
- **Testing**: Jest + Supertest
- **Validation**: Zod
- **Security**: Helmet + CORS

## 📋 Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose (for databases)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd transfer-crud
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Start databases with Docker**
```bash
pnpm docker:up
```

5. **Run migrations**
```bash
pnpm prisma:migrate
```

6. **Seed the database (optional)**
```bash
pnpm prisma:seed
```

## 🎯 Running the Project

### Development Mode
```bash
pnpm dev
```
Server runs on `http://localhost:3000`

### Production Build
```bash
pnpm build
pnpm start
```

### Testing
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

### Database Management
```bash
# Prisma Studio
pnpm prisma:studio

# Generate Prisma Client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```
**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-02-13T10:30:00.000Z"
}
```

### Create Wallet
```http
POST /wallet
Content-Type: application/json

{
  "ownerId": "user-123"
}
```
**Response**: `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ownerId": "user-123",
  "version": 1,
  "createdAt": "2026-02-13T10:30:00.000Z",
  "updatedAt": "2026-02-13T10:30:00.000Z"
}
```

### Get Wallet Balance
```http
GET /wallet/:id/balance
```
**Response**: `200 OK`
```json
{
  "balance": 1000.50
}
```

### Transfer Funds
```http
POST /transfer
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "fromWalletId": "550e8400-e29b-41d4-a716-446655440000",
  "toWalletId": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 100
}
```
**Response**: `200 OK`
```json
{
  "success": true,
  "transactionId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Important**: The `Idempotency-Key` header is required and must be a valid UUID v4. This prevents duplicate transfers if the request is retried.

## 🛡️ Security Features

### Idempotency
- Client-generated UUID v4 keys
- 24-hour Redis cache
- Prevents duplicate operations on retry

### Optimistic Locking
- Version-based concurrency control
- Both sender and receiver wallets are locked
- Prevents race conditions and double-spending

### Double-Entry Bookkeeping
- Immutable ledger entries
- Audit trail for all transactions
- Negative amounts for debits, positive for credits

### Input Validation
- Zod schema validation
- UUID format checks
- Amount and field validations

## 🧪 Testing

The project includes comprehensive tests covering:

- **Wallet API** (9 tests)
  - CRUD operations
  - Validation rules
  - Balance calculations
  
- **Transfer API** (12 tests)
  - Successful transfers
  - Idempotency checks
  - Insufficient funds
  - Non-existent wallets
  - Concurrent transfers
  - Double-entry integrity
  
- **Error Handling** (2 tests)
  - Generic errors
  - Prisma errors

**Coverage**: 98.34% statements, 88.88% branches, 100% functions

## 📁 Project Structure

```
transfer-crud/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── modules/
│   │   ├── transfer/       # Transfer logic
│   │   └── wallet/         # Wallet logic
│   ├── shared/
│   │   ├── cache/          # Redis client
│   │   ├── database/       # Prisma client
│   │   ├── errors/         # Custom errors
│   │   ├── logger/         # Logging
│   │   └── middlewares/    # Express middlewares
│   ├── app.ts              # Express app
│   └── server.ts           # Server entry point
├── tests/                  # Test files
├── docker-compose.yml      # Database containers
└── tsconfig.json          # TypeScript config
```

## 🔍 Architecture Decisions

### Why Double-Entry Bookkeeping?
Creates an immutable audit trail. Every transfer generates two ledger entries (debit and credit), making it easy to track all transactions and ensure balance integrity.

### Why Optimistic Locking?
Prevents race conditions without blocking. Version numbers ensure that concurrent updates fail fast, protecting against double-spending while maintaining high throughput.

### Why Redis for Idempotency?
Fast in-memory checks prevent duplicate processing. 24-hour TTL balances between safety and memory usage.

### Why Prisma 7.x Adapter Pattern?
Prisma 7.x requires explicit database adapters. Using `@prisma/adapter-pg` with `pg` Pool provides better connection management and type safety.

## 🐛 Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Validation error |
| 404 | Not Found - Wallet doesn't exist |
| 409 | Conflict - Unique constraint or optimistic lock failure |
| 500 | Internal Server Error |

## 📝 License

ISC

## 👤 Author

Built as a practice project for learning professional patterns in CRUD applications.

---

**Note**: This project demonstrates professional patterns including idempotency, optimistic locking, double-entry bookkeeping, comprehensive testing, and security best practices.
