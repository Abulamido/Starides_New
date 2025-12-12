# Product Requirements Document (PRD): Starides RIDES

### 1. Introduction & Vision

Starides RIDES is a unified, multi-sided delivery platform designed for the Nigerian market. Its vision is to create a seamless, efficient, and reliable ecosystem that connects customers with local vendors and empowers a network of independent riders to facilitate instant delivery. The platform will serve as a one-stop solution for ordering goods—from restaurant meals to groceries—and managing the entire delivery lifecycle.

### 2. User Roles & Personas

The platform is built around four core user roles:

*   **Customer:** The end-user who browses vendors, places orders, and wants a fast, reliable delivery experience.
*   **Vendor:** A local business (e.g., restaurant, grocery store) that lists products on the platform to reach more customers and manage orders efficiently.
*   **Rider:** An independent contractor who uses their vehicle to accept and fulfill delivery tasks for a fee.
*   **Admin:** A platform operator responsible for user management, quality control, financial oversight, and platform health.

### 3. Core Features & Functionality

#### 3.1 Customer-Facing Features
*   **Authentication:** Secure sign-up and login.
*   **Vendor Discovery:** Browse a list of vendors, filterable by category.
*   **Product Browsing:** View products/menu items for a selected vendor.
*   **Shopping Cart:** Add/remove items and adjust quantities.
*   **Checkout:** Place an order and select a payment method.
*   **Order Tracking:** View the real-time status of an order (e.g., Processing, Shipped, Delivered).
*   **Order History:** See a list of all past orders.

#### 3.2 Vendor-Facing Features
*   **Dashboard:** An overview of key metrics (total orders, revenue, pending orders).
*   **Product Management:** Add, edit, and remove products from their store listing.
*   **Order Management:** View and process incoming orders, updating their status (e.g., "Mark as Shipped").
*   **Analytics:** View sales data and performance metrics (Future Scope).
*   **Earnings:** Track revenue and manage payouts (Future Scope).

#### 3.3 Rider-Facing Features
*   **Dashboard:** An overview of active deliveries, completed jobs, and total earnings.
*   **Delivery Queue:** View and accept available delivery tasks.
*   **Active Delivery Management:** Update the status of an accepted delivery (e.g., "Picked Up," "Delivered").
*   **Delivery History:** See a log of all completed deliveries.
*   **Earnings:** Track earnings and request payouts.

#### 3.4 Admin-Facing Features
*   **Central Dashboard:** A high-level overview of platform-wide activity (users, vendors, orders).
*   **User Management:** View and manage all users on the platform.
*   **Vendor Management:** Approve new vendor sign-ups and manage existing vendors.
*   **Rider Management:** Onboard and manage riders.
*   **Order Oversight:** View all orders placed across the platform.

### 4. AI Integration: Dynamic Delivery Fee & ETA Optimization

*   **Core AI Feature:** An AI-powered tool within the Vendor and Admin dashboards that uses a Genkit flow with the Gemini API to calculate optimal delivery fees and predict accurate ETAs. It analyzes real-time traffic data from the Google Maps API, historical delivery times, current rider availability, and order complexity.
*   **Value Proposition:** The feature directly addresses profitability and customer satisfaction. It enables vendors to set competitive yet profitable delivery fees while providing customers with reliable and transparent delivery timeframes, reducing support overhead and increasing trust.

### 5. Monetization Strategy

The platform will generate revenue through a multi-stream, commission-based model:
*   **Vendor Commission:** A standard commission of **10-15%** is charged to the vendor on the total value of each order fulfilled through the platform.
*   **Delivery Fee Commission:** A **20% commission** is taken from the delivery fee portion of each order. The remaining 80% goes to the rider.
*   **Platform Service Fee:** A nominal, fixed fee (e.g., **₦100 - ₦250**) is added to each customer's order at checkout to cover payment processing and operational costs.
*   **Featured Listings (Future Scope):** A premium subscription for vendors (e.g., **₦10,000/month**) that gives them "Featured" placement in search results, increasing their visibility.
