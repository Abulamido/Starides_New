# Starides RIDES - Unified Delivery Platform

Welcome to Starides RIDES, a modern, multi-sided marketplace designed to connect customers, vendors, and delivery riders in a single, seamless ecosystem. This platform is built with a focus on real-time capabilities, scalability, and a great user experience, leveraging the power of Next.js and Firebase.

## Project Overview

Starides RIDES is a comprehensive delivery solution with four distinct user-facing dashboards:

1.  **Customer Dashboard:** Allows users to browse vendors, place orders, track deliveries in real-time, and manage their account.
2.  **Vendor Dashboard:** Enables store owners to manage their products, process incoming orders, view sales analytics, and manage their store profile.
3.  **Rider Dashboard:** Provides delivery personnel with tools to view available delivery jobs, manage active deliveries, track earnings, and view their delivery history.
4.  **Admin Dashboard:** A central control panel for platform administrators to manage users, vendors, riders, and orders, and to oversee platform-wide analytics.

## Tech Stack

This project is built on a modern, serverless-first architecture:

*   **Front-End:** Next.js (App Router) with React & TypeScript
*   **UI Components:** ShadCN UI & Tailwind CSS
*   **Back-End & Database:** Firebase (Firestore, Firebase Authentication, Cloud Functions)
*   **Generative AI:** Google's Genkit with the Gemini API
*   **Deployment:** Firebase App Hosting
*   **Mapping & Location:** Google Maps Platform

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or later)
*   npm (or another package manager like yarn or pnpm)
*   Firebase CLI

### 1. Installation

Clone the repository and install the necessary dependencies:

```bash
git clone <repository-url>
cd starides-rides
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project. This file is ignored by Git and will hold your secret keys. At a minimum, you will need your Google Gemini API key.

```
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### 3. Running the Development Server

The application has two parts: the Next.js front-end and the Genkit AI flows.

**To run the Next.js front-end:**

```bash
npm run dev
```

This will start the main application on `http://localhost:3000`.

**To run the Genkit AI flows locally:**

In a separate terminal, run:

```bash
npm run genkit:watch
```

This starts the Genkit development UI, allowing you to test and inspect your AI flows.

### 4. Connecting to Firebase

Ensure your Firebase CLI is logged in (`firebase login`) and configured to use the correct project (`firebase use <your-project-id>`). See `RULES.md` for more information on Firebase project setup.
