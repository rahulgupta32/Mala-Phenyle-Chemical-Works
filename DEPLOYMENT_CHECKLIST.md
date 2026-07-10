# Mala Phenyle Chemical Works - Deployment Verification Checklist

This checklist must be executed and verified after deploying the application to Vercel and connecting it to Neon PostgreSQL.

---

## 1. Public Storefront & Ordering

- [ ] **Storefront Home Page**: Verify that the homepage loads successfully and displays the banner, search bar, and product category tiles.
- [ ] **Categories**: Verify that categories (Phenyle, Toilet Cleaner, Handwash, etc.) list correctly.
- [ ] **Products & Variants**: Browse to a product (e.g. `Mala Premium White Phenyle`) and verify that packaging variants (1L, 5L, Carton) load with correct prices.
- [ ] **Product Images**: Verify that product placeholder/uploaded images load properly.
- [ ] **Shopping Cart**: Add items to the cart, adjust quantities, verify that cart persists across page reloads.
- [ ] **Checkout Validation**: 
  - Verify that B2B wholesale accounts cannot check out with a subtotal under Rs. 10,000.
  - Verify that shipping forms validate all required fields.
- [ ] **Nepal Address Selection**: Verify that Province, District, and Municipality dropdowns work. Check that selecting districts updates shipping fees correctly.
- [ ] **Cash on Delivery Order Placement**: Verify that checkout completes successfully with COD and redirects to the confirmation receipt page.
- [ ] **Printable Invoice**: On the confirmation page, click **Print Official Invoice** and verify that it opens a styled invoice print dialog layout.
- [ ] **Order Number Format**: Confirm that the created order has a sequential unique order number following the database-locked format `MALA-YYYY-000001`.
- [ ] **Order Tracking Timeline**: Enter the order number and phone number on the `/track-order` guest console and verify that the package progress timeline loads correctly.

---

## 2. Authentication & Authorization Guards

- [ ] **Customer Registration**: Verify that new customers can register at `/register` and see their profile dashboard at `/my-account`.
- [ ] **Customer Login**: Log in at `/login` with valid customer credentials.
- [ ] **Credential Rejection**: Verify that incorrect passwords or unregistered emails show a safe error message without exposing details.
- [ ] **Logout Flow**: Click Logout and verify that the session cookie is cleared and the user is redirected to the home storefront.
- [ ] **Client Route Guards**: Verify that entering `/admin` or `/delivery` pages as a standard customer redirects back to the login gate with an unauthorized warning.
- [ ] **Role Verification**: 
  - Ensure standard customers cannot access the Admin panel.
  - Ensure delivery agents can only access `/delivery` jobs boards.
  - Ensure admins/superadmins can access `/admin`.
- [ ] **API Route Authorization**: Attempt to call administrative endpoints (e.g. `/api/admin/wholesale`) as a customer and verify it returns a `403 Forbidden` response.

---

## 3. Order Transactions & Inventory Safety

- [ ] **Atomic Stock Reservations**: Buy the last remaining stock of a product. Verify that it succeeds, decrements the database count by exactly that quantity, and writes a log of type `OUT` in `InventoryLog`.
- [ ] **Overselling Prevention**: Attempt to order a quantity higher than the available stock. Verify that checkout fails and blocks order creation.
- [ ] **Concurrent Checkout Safety**: Verify that concurrent transactions do not cause duplicate sequence order numbers or negative stock levels.
- [ ] **Atomic Stock Restoration**: Cancel an order (via `/my-account/orders/[id]` as customer or `/admin` as admin). Verify that:
  - The order status transitions to `CANCELLED`.
  - Item quantities are added back to variant and product stock levels exactly once.
  - A log of type `RESTORED` is created in `InventoryLog`.
- [ ] **Double Cancellation Block**: Attempt to cancel the same order twice. Verify that stock is only restored once and cannot be repeated.

---

## 4. Administrative Controls

- [ ] **Admin Dashboard**: Verify that total sales, low stock alerts, and B2B pending application counts load correctly.
- [ ] **Order Status Modifiers**: As Admin, change order status from `PENDING` to `CONFIRMED`, `PACKED`, `SHIPPED`, etc. Verify that tracking updates are visible on the customer's tracking screen.
- [ ] **Invalid Status Transitions Block**: Verify that delivery couriers or admins cannot set invalid status flows (e.g. setting an order back to `PENDING` after it is marked `DELIVERED`).
- [ ] **Product Catalog Builder**: Add a new product with custom variants. Verify it appears in the customer shop catalog.
- [ ] **Dynamic Settings Desk**: Update shop support numbers or announcement banners in `/admin/settings`. Verify that storefront footers and banners reflect the new values immediately.
- [ ] **Activity Logging**: Verify that admin modifications (like creating products or updating orders) write an audit trail in `AdminActivityLog`.

---

## 5. Production Build & Secrets Protection

- [ ] **Production Build Compilation**: Run `npm run build` and ensure Next.js compiles successfully without errors.
- [ ] **Database Connection Pools**: Verify that Prisma connection singletons are reused to avoid database connection exhaustion.
- [ ] **Neon Migration Deployments**: Run `npx prisma migrate deploy` and verify that all tables are safely provisioned on the Neon PostgreSQL host.
- [ ] **Idempotent Seeding**: Run `npx prisma db seed` multiple times and ensure it does not create duplicate entries for settings, users, categories, or delivery zones.
- [ ] **Health API Endpoint**: Query `GET /api/health` and verify it reports status `ok` with a timestamp, without revealing database credentials or server configurations.
- [ ] **No Exposed Secrets**: Ensure `.env` is listed in `.gitignore` and no private keys, passwords, or database credentials are committed to GitHub.
- [ ] **Environment Validation**: Confirm that server-side environment variables are validated at start using `src/lib/env.ts` and fail safely when missing in production.
- [ ] **Ephemeral File System Safety**: Ensure all product images and banners are uploaded to Cloudinary in production instead of Vercel's local filesystem.
