# Technical Documentation: Starides RIDES

This document provides a comprehensive technical guide to the Starides RIDES platform, covering its architecture, directory structure, data models, and core business logic.

---

## 1. Project Overview
Starides RIDES is a multi-sided marketplace for local on-demand delivery, connecting four key stakeholders:
*   **Customers**: Browse vendors, place orders, and pay via wallet or card.
*   **Vendors**: Manage products, process orders, and track earnings.
*   **Riders**: Accept delivery jobs and manage live deliveries.
*   **Admins**: Oversee system health, users, and transactions.

---

## 2. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, ShadCN UI (Neumorphic aesthetic) |
| **Backend/Database** | Firebase Firestore (Real-time NoSQL) |
| **Authentication** | Firebase Auth (Multi-role support) |
| **Server Logic** | Next.js Server Actions, Firebase Cloud Functions |
| **AI Layer** | Google Gemini API via Genkit |
| **Payments** | Paystack Integration (Live & Test modes) |
| **Mapping** | Google Maps Platform (Directions, Distance, Places) |

---

## 3. Directory Structure Guide

```text
src/
├── app/               # Next.js App Router (Routes & Server Actions)
│   ├── (auth)/        # Authentication routes (login, signup)
│   ├── admin/         # Administrator dashboard
│   ├── customer/      # Customer-facing app & checkout
│   ├── vendor/        # Vendor portal & product management
│   ├── rider/         # Rider interface & delivery tools
│   └── actions/       # Global Server Actions (payouts, push, wallet)
├── components/        # Shared UI components (ShadCN + Custom)
│   ├── ui/            # Base ShadCN components
│   └── maps/          # Google Maps wrappers & Address Autocomplete
├── context/           # React Context (Cart, Auth, etc.)
├── firebase/          # Firebase client & server SDK initialization
├── hooks/             # Custom React hooks (useUser, useUserRole, useToast)
├── lib/               # Utility functions, business logic, and types
└── config/            # External service configurations (Paystack)
```

---

## 4. Core Data Models (Firestore)

### `users` (Collection)
Primary user profiles with role-based metadata.
*   `uid`: string (Document ID)
*   `email`: string
*   `role`: 'customer' | 'vendor' | 'rider' | 'admin'
*   `displayName`: string
*   `phoneNumber`: string

### `orders` (Collection)
The core transaction entity.
*   `customerId`: string
*   `vendorId`: string
*   `riderId`: string (optional)
*   `status`: 'Processing' | 'Preparing' | 'In Transit' | 'Delivered'
*   `totalAmount`: number
*   `deliveryFee`: number
*   `paymentMethod`: 'wallet' | 'card' | 'cash'
*   `orderDate`: ServerTimestamp

### `wallets` (Collection)
Balances and transaction tracking for users.
*   `userId`: string (Document ID)
*   `balance`: number
*   `updatedAt`: ServerTimestamp

---

## 5. Security & Authorization

### Role Management
Roles are retrieved via the `useUserRole` hook, which caches the role in `localStorage` for PWA cold-starts. Firestore remains the source of truth.

### Route Protection
The `RoleGuard` component wraps layout files to ensure only authorized roles can access specific dashboards.
*   Location: `src/components/role-guard.tsx`

---

## 6. Core Business Workflows

### Ordering Flow
1.  **Selection**: Customer adds items to `CartContext`.
2.  **Checkout**: `CheckoutPage` calculates delivery fee via Google Maps Geometry API.
3.  **Payment**: `WalletPayment` (Server Action) or `PaystackButton`.
4.  **Creation**: Order document is added to Firestore with `Processing` status.
5.  **Notifications**: `createNotification` utility triggers both Firestore alerts and Push Notifications.

### Payout Flow
1.  Vendor/Rider requests payout via Dashboard.
2.  Server Action `requestPayout` (src/app/actions/payouts.ts) adds a record to `/payouts`.
3.  Admin approves/rejects; logic handles notification back to the user.

---

## 7. Development & Deployment

*   **Local UI**: `npm run dev`
*   **Genkit Watch**: `npm run genkit:watch`
*   **Build**: `npm run build`
*   **Deployment**: Firebase App Hosting (Auto-CD from GitHub `main`).

---

*Last Updated: December 2025*
