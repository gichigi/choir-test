# Choir - AI-Powered Brand Voice Generator

Choir is an AI application that creates a unique brand voice for your business in minutes. Generate authentic content that sounds exactly like your brand, every time.

![Choir Brand Voice Generator](https://github.com/gichigi/choir-test/raw/main/public/choir-screenshot.png)



## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Onboarding Flow](#onboarding-flow)
- [Technology Stack](#technology-stack)

## Overview
Choir helps businesses create a consistent brand voice across all their content. By answering a few questions about your business, target audience, and values, Choir creates an AI-powered brand voice model that generates content that sounds authentic to your brand.

## Features
- **AI Brand Voice Generation**: Create a unique brand voice that captures your company's personality and values.
- **4-Step Onboarding Process**: Quick and intuitive setup process to capture your business details.
- **Content Generation**: Create blog posts, social media content, emails, and more in your brand voice.
- **User Authentication**: Secure sign up and login with Firebase Authentication.
- **Data Storage**: All your brand information securely stored in Firebase Firestore.
- **Responsive Design**: Mobile-friendly interface using ShadCn UI components.
- **Subscription Management**: Premium features managed through Stripe subscription (in development).

## Getting Started

### Prerequisites
Before you begin, ensure you have the following:
- Node.js (v18 or newer)
- npm or yarn
- Firebase account and project
- Stripe account (for subscription features)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/gichigi/choir-test.git
cd choir-test
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables
Create a `.env.local` file in the root directory with the following:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Firebase Admin Configuration
FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_ADMIN_PRIVATE_KEY="your_firebase_admin_private_key"

# Stripe Configuration (if implementing payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Running the App

To run the development server:
```bash
npm run dev
```

Your app will be available at http://localhost:3000

## Project Structure
- `/src/app`: Next.js app router pages and API routes
- `/src/app/onboarding`: Onboarding flow pages
- `/src/app/dashboard`: Dashboard and content generation pages
- `/src/app/api`: Backend API endpoints
- `/src/components`: Reusable UI components
- `/src/firebase`: Firebase configuration and utilities
- `/src/hooks`: Custom React hooks

## Onboarding Flow
Choir features a 4-step onboarding process to gather information about your business:

1. **Business Information**: Name and year established
2. **Business Description**: Products, services, and what your business does
3. **Target Audience & Values**: Who you serve and your core business values
4. **Review & Confirmation**: Verify your information before creating your brand voice

## Technology Stack
- **Frontend**: Next.js, React, Tailwind CSS, ShadCn UI
- **Backend**: Next.js API routes, Firebase Functions
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Payments**: Stripe (in development)
- **Deployment**: Vercel/Firebase Hosting (recommended)

---

Built with ❤️ using Next.js, Firebase, and AI technology.
