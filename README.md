# Mala Phenyle Chemical Works - E-Commerce Platform

A production-grade, secure, and modern full-stack e-commerce application built for **Mala Phenyle Chemical Works** based in Birgunj, Nepal. It serves retail customers across Nepal and includes a specialized B2B Wholesaler/Distributor workflow, courier dispatch management, a robust administrative panel, and automated inventory reconciliation.

---

## Technical Stack

- **Frontend & Backend**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 (configured with customized brand tokens in CSS)
- **Database**: PostgreSQL (hosted on Neon or private infrastructure)
- **ORM**: Prisma v6 (with connection singletons)
- **Authentication**: Custom JWT Session Management via HTTP-Only Cookies (web) and authorization Bearer headers (API integrations ready)
- **Validation**: Zod schema validations
- **Fulfillment**: Cash on Delivery (COD) default, with placeholder flags for eSewa, Khalti, bank transfers, and QR codes
- **Storage**: Cloudinary (Production) / Local Filesystem (Development fallback)

---

## Directory Structure

```text
mala-chem-ecommerce/
├── prisma/
│   ├── migrations/           # Database migration files
│   ├── schema.prisma         # Postgres Database Schema
│   └── seed.ts               # Idempotent database seed script
├── src/
│   ├── app/                  # Next.js App Router Pages
│   │   ├── (auth)/           # Authentication login/register pages
│   │   ├── (customer)/       # Retail catalog storefront (Home, products, cart, checkout)
│   │   ├── admin/            # Admin dashboard screens & operational panels
│   │   ├── delivery/         # Courier dispatch panel
│   │   ├── providers.tsx     # Session & Cart React Context providers
│   │   └── api/              # Core API endpoints (Auth, checkout, orders, settings, health)
│   ├── components/           # Reusable UI Widgets
│   │   └── storefront/       # Navbars, footers, etc.
│   ├── context/              # Context Providers (AuthContext, CartContext)
│   ├── lib/                  # Utilities
│   │   ├── env.ts            # Central environment variable validator (Zod)
│   │   ├── constants.ts      # Geographic constants for Nepal (7 Provinces, 77 Districts)
│   │   ├── db.ts             # Prisma client singleton helper
│   │   ├── auth.ts           # Hashing and token helpers
│   │   ├── storage.ts        # Storage service abstraction (local uploads vs Cloudinary)
│   │   └── validation.ts     # Zod validation schemas
│   └── middleware.ts         # Edge-compatible authentication route guards
├── public/                   # Static images, assets, logo placeholders
├── DEPLOYMENT_CHECKLIST.md   # Deployment verification checklist
├── .env.example              # Environment variables template
├── package.json              # Project dependencies
└── README.md                 # Documentation
```

---

## Production Security Notes

1. **Passwords Hashing**: Passwords are secure-hashed using `bcryptjs` with 10 salt rounds before storage.
2. **HTTP-only Cookies**: Authentication tokens are stored in custom HTTP-only cookies (`token`), rendering them inaccessible to client-side scripts (guarding against XSS).
3. **Cookie Security**: In production, cookies are flagged with `Secure; SameSite=Lax` and configured with a 7-day expiration time.
4. **Secrets Separation**: All secrets (database URLs, API tokens, passwords) are loaded via environment variables and validated at startup using `src/lib/env.ts`. No secrets are committed to the codebase.
5. **No Local File Writes in Production**: Production uploads are directed to Cloudinary, avoiding data loss due to Vercel's ephemeral local filesystem.

---

## Database Connection & Migrations

The database connection utilizes Neon PostgreSQL's connection pools for optimal serverless performance.

- **DATABASE_URL**: Points to the Neon pooled connection URL (used by serverless functions).
- **DIRECT_URL**: Points to the Neon direct database connection URL (non-pooled; required to run schema migrations).

### Run Migrations to Database

Do not use `npx prisma db push` in production. Instead, run production migrations using the direct URL connection:
```bash
npx prisma migrate deploy
```

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file from the template:
```bash
cp .env.example .env
```
Fill in your database URL. For local Postgres:
```text
DATABASE_URL="postgresql://postgres:password@localhost:5432/mala_chem?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/mala_chem?schema=public"
JWT_SECRET="generate_a_long_secure_string_at_least_32_bytes"
SEED_SUPERADMIN_EMAIL="admin@malachemicals.com"
SEED_SUPERADMIN_PASSWORD="SuperSecureAdminPassword123!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Seed the Database
Populate defaults (idempotent seed for categories, products, delivery zones, test accounts, settings):
```bash
npx prisma db seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## Cloudinary Upload Integration Setup

To support product image uploads in production, configure the following Cloudinary parameters:

1. Create a free account on [Cloudinary](https://cloudinary.com).
2. Retrieve your Cloud Name, API Key, and API Secret from the console dashboard.
3. Configure Vercel or local environment variables:
   ```text
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```
4. Product image uploads will automatically switch to Cloudinary with local fallback if configuration is missing.

---

## Key Production Business Routines

### 1. Concurrent-Safe Order Numbers
Order numbers follow the format `MALA-YYYY-000001`. To prevent race conditions from concurrent checkouts generating duplicate numbers, checkouts atomically increment and lock the year row in the `YearlyOrderSequence` model inside a database transaction.

### 2. Atomic Stock Reservations
Checkouts run inside a `db.$transaction` block. The transaction verifies variant stock levels and decrements inventory only when stock is sufficient. If a checkout exceeds stock, the transaction rolls back, preventing negative inventory or overselling.

### 3. Idempotent Order Cancellations
When a customer or admin cancels an order, stock is restored, and an `InventoryLog` is recorded. This routine queries the current order status inside a transaction lock. If the order has already been marked as `CANCELLED`, the restoration is skipped, preventing duplicate stock replenishment.

### 4. Configurable Settings Desk
Rather than hardcoding business coordinates, the storefront loads phone numbers, free delivery thresholds, and announcement texts dynamically from the `ShopSettings` database table (seeded with initial values for Sunil Kr. Gupta & Mala Phenyle Works).

---

## Vercel Deployment Instructions

1. **Push the codebase to GitHub**:
   Ensure the repository is updated (e.g. `rahulgupta32/Mala-Phenyle-Chemical-Works`).
2. **Add Project to Vercel**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New > Project**, and import `rahulgupta32/Mala-Phenyle-Chemical-Works`.
3. **Configure Environment Variables**:
   Add the following variables in the project settings:
   - `DATABASE_URL` (Neon Pooled connection URL)
   - `DIRECT_URL` (Neon Direct connection URL)
   - `JWT_SECRET` (Secure key at least 32 characters long)
   - `SEED_SUPERADMIN_EMAIL` (Seed Super Admin Email)
   - `SEED_SUPERADMIN_PASSWORD` (Seed Super Admin Password)
   - `NEXT_PUBLIC_APP_URL` (The Vercel deployment URL)
   - `CLOUDINARY_CLOUD_NAME` (Optional Cloudinary setup)
   - `CLOUDINARY_API_KEY` (Optional Cloudinary setup)
   - `CLOUDINARY_API_SECRET` (Optional Cloudinary setup)
4. **Deploy**:
   Click **Deploy**. Next.js will compile cleanly.
5. **Run Production Migrations & Seed**:
   Run manually from your local command line pointing to the production database:
   ```bash
   # Run migrations
   npx prisma migrate deploy
   
   # Run idempotent seed
   npx prisma db seed
   ```
6. **Verify Monitoring**:
   Check `https://your-domain.vercel.app/api/health` to confirm the database connectivity state reports success.
