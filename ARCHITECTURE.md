# Architecture Overview: Starides RIDES

This document outlines the system architecture for the Starides RIDES platform. The architecture is designed to be scalable, real-time, and secure, built primarily on the Google Cloud and Firebase ecosystem.

## Core Principles

*   **Serverless-First:** We leverage managed, serverless services wherever possible to reduce operational overhead and scale automatically.
*   **Real-Time by Default:** The user experience relies heavily on real-time data synchronization. Firestore is the centerpiece of this strategy.
*   **Component-Based Front-End:** The user interface is built as a collection of reusable React components for consistency and maintainability.
*   **Secure & Segregated:** Data access is controlled by granular security rules, and different user roles have clearly defined capabilities.

## System Components & Services

The platform is composed of several key services that work in concert:

#### 1. **Front-End Application**
*   **Framework:** **Next.js with React & TypeScript**. The Next.js App Router is used for optimized page rendering and routing.
*   **Hosting:** The application is hosted on **Firebase App Hosting**, which provides a managed environment for modern web apps with CI/CD integration.

#### 2. **Back-End Services (Firebase)**
*   **Database:** **Firestore** is the primary NoSQL database. It stores all application data (user profiles, products, orders) and provides real-time updates to clients via its SDK.
*   **Authentication:** **Firebase Authentication** handles secure user sign-up, login, and identity management across all roles (Customer, Vendor, Rider, Admin).
*   **Server-Side Logic:** **Firebase Cloud Functions** (written in TypeScript) are used for trusted, server-side operations that cannot be done on the client, such as:
    *   Processing payments (future).
    *   Sending push notifications.
    *   Performing complex data aggregations.
    *   Interacting with the Gemini API via Genkit for secure server-side calls.

#### 3. **Generative AI**
*   **Framework:** **Genkit**, an open-source framework for building AI-powered flows.
*   **Model:** **Google Gemini API** is used for the "Dynamic Delivery Fee & ETA Optimization" feature. The Genkit flow is defined on the server and called from the client application.

#### 4. **External Services**
*   **Mapping and Geolocation:** **Google Maps Platform** is essential for:
    *   Calculating distances for delivery fees.
    *   Providing real-time traffic data to the AI model.
    *   Displaying live rider locations on a map (future scope).

## Data Flow: Placing an Order

Here is a simplified data flow for a core user journey:

1.  **Client (Customer):** A customer adds items to their cart and clicks "Place Order". A server action is triggered in Next.js.
2.  **Server Action:** The action function validates the order data.
3.  **Firestore (Write):** It then writes a new document to the `/orders` collection in Firestore with a status of `Processing`.
4.  **Firestore (Real-Time Listener):**
    *   The **Vendor Dashboard** is listening for new documents in the `orders` collection where the `vendorId` matches their own. The new order appears on their screen in real-time.
    *   The **Admin Dashboard** is listening to the entire `orders` collection and also sees the new order appear instantly.
5.  **Client (Vendor):** The vendor prepares the order and clicks "Mark as Shipped". This updates the order document's status in Firestore.
6.  **Firestore (Real-Time Listener):**
    *   The **Rider Dashboard** is listening for orders with a status of `Processing` (or a similar status indicating it's ready for pickup). The order becomes visible to available riders.
    *   The **Customer Dashboard** (via the `OrderStatusListener`) is notified of the status change to "Shipped" and displays a toast notification.
