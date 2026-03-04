# CashFlow

A personal finance mobile app that helps you take control of your money by tracking expenses, managing budgets, and monitoring subscriptions — all in one place.


## About
A senior project finance app connected to and hosted on AWS.

**Course:** SE425 Senior Project  
**School:** NEIT  
**Author1:** Ian Alvarado  
**Author2:** Keegan Preston

## Features

- **Authentication** - Sign up and sign in with secure account management
- **Dashboard** - View monthly income, spending, and remaining balance
- **Transactions** - Track and add expenses by category with detail view
- **Budgets** - Set spending limits per category with progress tracking and detail view
- **Subscriptions** - Manage recurring payments (Netflix, Spotify, etc.) with detail view
- **Search & Filter** - Search transactions by note or category, and filter by category
- **Export Reports** - Generate and share monthly PDF or CSV reports
- **Profile** - Customize profile with avatar, currency preferences
- **Dark/Light Mode** - Theme toggle support
- **Multi-Currency** - Support for USD, EUR, GBP, JPY, and more
- **Native Date Picker** - Calendar-based date selection for transactions and subscriptions

## Tech Stack

- React Native + Expo
- TypeScript
- AsyncStorage (local data persistence)
- React Navigation
- Expo Print (PDF generation)
- Expo Sharing (share sheet integration)
- Expo File System (file export)
- Expo Image Picker (profile photos)
- DateTimePicker (native date selection)
- AWS

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npx expo start
   ```
3. Create an account and sign in.
4. Start tracking your finances!