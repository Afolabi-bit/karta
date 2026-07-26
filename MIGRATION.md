# Karta TypeScript Migration Guide & Record

## Overview

This repository has been fully converted from JavaScript to TypeScript (`.ts` / `.tsx`). The migration was performed incrementally across 7 batches while ensuring the Next.js application remained continuously buildable (`next build`) and runnable (`next dev`) at every step.

---

## Technical Stack & Configuration

- **Framework**: Next.js 16.2.10 (App Router)
- **UI Library**: React 19.2.4
- **ORM**: Prisma 7.8.0 (`@prisma/adapter-neon` / `@neondatabase/serverless`)
- **Authentication**: `@clerk/nextjs` v7
- **State Management**: `@reduxjs/toolkit` + `react-redux`
- **Compiler Configuration**: `"strict": true` in `tsconfig.json`

---

## Central Domain Type Architecture

All domain models and extended composite types are declared and re-exported in [`types/index.ts`](file:///c:/dev/karta/types/index.ts):

- **Prisma Model Re-exports**: `User`, `Product`, `Order`, `OrderItem`, `Address`, `Rating`, `Store`, `Coupon`, `OrderStatus`, `PaymentMethod`.
- **Extended Types**:
  - `CartItem`: Product payload with quantity for client state and order processing.
  - `RatingWithUser`: Prisma `Rating` joined with user name and image.
  - `ProductWithDetails`: Prisma `Product` with included store and rating metadata.
  - `OrderWithDetails`: Prisma `Order` with `orderItems`, `address`, and `user` relations.

---

## Redux Store Typing

Redux state management in [`lib/store.ts`](file:///c:/dev/karta/lib/store.ts) is fully typed:

```ts
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<AppStore>();
```

All React components consume `useAppDispatch` and `useAppSelector` for automatic type inference over `RootState`.

---

## Summary of Converted Batches

1. **Central Types & Configurations**:
   - `types/index.ts`
   - `config/imagekit.ts` & `config/openai.ts`
   - `assets/assets.ts`
   - `middlewares/authAdmin.ts` & `middlewares/authsellers.ts`

2. **Redux State Slices & Store**:
   - `lib/features/address/addressSlice.ts`
   - `lib/features/cart/cartSlice.ts`
   - `lib/features/product/productSlice.ts`
   - `lib/features/rating/ratingSlice.ts`
   - `lib/store.ts`

3. **Base UI Components & Skeletons**:
   - `app/StoreProvider.tsx`
   - `components/Title.tsx`, `PageTitle.tsx`, `KartaLogoIcon.tsx`, `Loading.tsx`, `TableSkeleton.tsx`, `ProductSkeleton.tsx`, `Counter.tsx`, `Rating.tsx`, `OurSpec.tsx`, `Newsletter.tsx`

4. **Interactive UI Components & Modals**:
   - `components/ProductCard.tsx`, `ProductDetails.tsx`, `ProductDescription.tsx`, `Banner.tsx`, `BestSelling.tsx`, `CategoriesMarquee.tsx`, `Hero.tsx`, `LatestProducts.tsx`, `Navbar.tsx`, `Footer.tsx`, `OrderItem.tsx`, `OrderSummary.tsx`, `OrdersAreaChart.tsx`, `AddressModal.tsx`, `RatingModal.tsx`

5. **Admin & Store Sub-Layouts & Components**:
   - `components/admin/AdminNavbar.tsx`, `AdminSidebar.tsx`, `AdminLayout.tsx`, `StoreInfo.tsx`
   - `components/store/StoreNavbar.tsx`, `StoreSidebar.tsx`, `StoreLayout.tsx`

6. **Backend API Route Handlers**:
   - `app/api/address/route.ts`
   - `app/api/admin/**/*.ts` (`approve-store`, `coupon`, `dashboard`, `is-admin`, `stores`, `toggle-store`)
   - `app/api/cart/route.ts`, `app/api/coupon/route.ts`, `app/api/inngest/route.ts`, `app/api/order/route.ts`, `app/api/orders/route.ts`, `app/api/products/route.ts`, `app/api/rating/route.ts`, `app/api/search/route.ts`, `app/api/stripe/route.ts`
   - `app/api/store/**/*.ts` (`ai`, `create`, `dashboard`, `data`, `product`, `seller`, `stock-toggle`)

7. **App Router Pages & Layouts**:
   - Main root layout: `app/layout.tsx`
   - Public pages: `app/(public)/layout.tsx`, `page.tsx`, `cart/page.tsx`, `create-store/page.tsx`, `loading/page.tsx`, `orders/page.tsx`, `pricing/page.tsx`, `product/[productId]/page.tsx`, `shop/page.tsx`, `shop/[username]/page.tsx`
   - Admin pages: `app/admin/layout.tsx`, `page.tsx`, `approve/page.tsx`, `coupons/page.tsx`, `stores/page.tsx`
   - Store pages: `app/store/layout.tsx`, `page.tsx`, `add-product/page.tsx`, `manage-product/page.tsx`, `orders/page.tsx`

---

## Verification & Build Compliance

- Running `npm run build` executes `prisma generate && next build`.
- Zero TypeScript errors were emitted with `"strict": true` enabled in `tsconfig.json`.
- Pruned all obsolete `.js` and `.jsx` source files from the repository.

---

## Recommendations for Future Maintenance

1. **Prisma Schema Changes**: When updating `prisma/schema.prisma`, run `npx prisma generate` to sync Prisma model types before building.
2. **Adding New API Routes**: Always type Next.js handlers as `export async function GET(request: NextRequest)` and return `NextResponse.json(...)`.
3. **Clerk v7 Upgrade Notes**:
   - Use `<Show when="signed-in">` / `<Show when="signed-out">` (hyphenated props).
   - Use `const { userId, has } = await auth()` in Server Components and API route handlers.
