# 🛍️ Karta — Modern AI-Powered Multi-Vendor E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Vision_API-412991?style=flat-square&logo=openai)](https://openai.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-6772E5?style=flat-square&logo=stripe)](https://stripe.com/)

**Karta** is a full-stack, multi-vendor e-commerce ecosystem built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Prisma**, **Neon PostgreSQL**, **Clerk Authentication**, and **OpenAI Vision**.

It enables seamless online shopping for buyers, comprehensive store management for sellers with AI-assisted product listing generation, and administrative oversight for platform management.

---

## ✨ Features

### 🛒 Buyer Experience

- **Live Search & Instant Filtering**: Debounced real-time product search bar with live visual previews.
- **Dynamic Shopping Cart**: Synchronized cart state powered by Redux Toolkit and persisted database sync.
- **Smart Checkout Options**: Integrated with **Stripe Payment Gateway** and Cash on Delivery (COD).
- **Coupon System**: Dynamic discount codes supporting new user incentives and subscription tier discounts.
- **Order Tracking & Ratings**: View past orders, status tracking, and submit product reviews & star ratings.

### 🏪 Vendor / Store Dashboard

- **Store Application Flow**: Multi-step application system requiring admin approval.
- **AI Product Assistant (OpenAI Vision)**: Upload any product image to automatically compress and analyze it via OpenAI's Vision API, auto-generating high-quality product names and marketing descriptions.
- **Product Management**: Add, update, and toggle product stock status in real-time.
- **Revenue Analytics**: Interactive earnings and sales analytics charts powered by **Recharts**.
- **Store Order Fulfillment**: Manage customer orders and update shipment statuses (_Processing, Shipped, Delivered_).

### 🛡️ Admin Portal

- **Store Verification**: Review, approve, or reject vendor store applications.
- **Store Oversight**: Monitor active stores, toggle store availability, and view platform metrics.
- **Coupon Manager**: Create and manage global public or member-exclusive discount coupons.

### ⚡ Architecture & Security

- **Resource-Based Auth Guard**: Modern Clerk authentication without deprecated path matchers.
- **Canvas Image Optimization**: Client-side canvas compression reduces multi-megabyte camera photos to compressed web payloads before AI processing.
- **Event-Driven Workflows**: Integrated with **Inngest** for serverless background task processing and user synchronization.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons, React Hot Toast, Sonner
- **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk Auth](https://clerk.com/)
- **AI Integration**: [OpenAI GPT-4o / Vision API](https://platform.openai.com/)
- **Payments**: [Stripe SDK](https://stripe.com/)
- **Media Storage**: [ImageKit.io](https://imagekit.io/)
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **State Management**: Redux Toolkit & React-Redux

---

## 📁 Project Structure

```text
karta/
├── app/
│   ├── (public)/          # Public routes (Shop, Product Details, Cart, Pricing, Store Apply)
│   ├── admin/             # Admin portal (Stores approval, Coupons, Dashboard)
│   ├── api/               # Next.js API route handlers
│   │   ├── admin/         # Admin API endpoints
│   │   ├── store/         # Store management & AI listing endpoints
│   │   ├── inngest/       # Inngest background job webhook
│   │   ├── stripe/        # Stripe payment webhooks
│   │   └── search/        # Live product search API
│   ├── store/             # Store dashboard (Manage products, Add product, Store orders)
│   ├── layout.jsx         # Root layout with ClerkProvider & StoreProvider
│   └── proxy.ts           # Next.js 16 Clerk middleware boundary
├── components/            # Reusable UI components & layouts
├── config/                # ImageKit & OpenAI clients setup
├── lib/                   # Database client (Prisma) & Redux slices
├── middlewares/           # Seller & Admin auth helper utilities
├── prisma/                # Prisma schema & migration files
└── public/                # Static assets & logos
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or later
- **npm** / **yarn** / **pnpm**
- **PostgreSQL Database** (e.g. [Neon](https://neon.tech/))

### 1. Clone the repository

```bash
git clone https://github.com/Afolabi-bit/karta.git
cd karta
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-example.neon.tech/karta?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI (AI Product Vision Assistant)
OPENAI_API_KEY="sk-proj-..."
OPENAI_MODEL="gpt-4o-mini"

# ImageKit (Media Uploads)
IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application Config
NEXT_PUBLIC_CURRENCY_SYMBOL="$"
```

### 4. Database Setup & Prisma Sync

Run Prisma migrations and generate the client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the application.

---

## 📜 Scripts

| Script          | Description                                          |
| :-------------- | :--------------------------------------------------- |
| `npm run dev`   | Starts the Next.js development server                |
| `npm run build` | Generates Prisma client and builds production bundle |
| `npm start`     | Runs the production build server                     |
| `npm run lint`  | Runs ESLint check                                    |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
