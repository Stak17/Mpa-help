# Mpa Help 🇺🇬
> *"Simple help for everyday life."*

A production-ready, mobile-first Progressive Web App (PWA) built specifically for Ugandan users, Android phones, job seekers, households, and small businesses.

---

## 🌟 Overview & Core Principles

Traditional AI chatbots often feel overwhelming, abstract, or disconnected from local cultural and economic realities. **Mpa Help** follows a straightforward 4-step workflow:

```
OPEN APP → Choose what you need → Enter a few details → Get useful result → Copy / Share / Save
```

All interactions are structured around practical Ugandan needs:
- Currency is **Uganda Shillings (UGX)**.
- Local payment references include **MTN Mobile Money (MoMo)** and **Airtel Money**.
- Real everyday expenses: **Rent (Muzigo/House)**, **Food & Market**, **Transport (Matatu taxi, Boda boda, Fuel)**, **Yaka electricity tokens**, **NWSC water**, and **Airtime/Data**.
- Culturally respectful tone for elders, headteachers, LC1 chairpersons, landlords, and employers.
- Real **English ↔ Luganda (Oluganda)** translation with cultural idioms.

---

## 🚀 Core Functional Modules

1. **Ask Mpa Help (Global Assistant)**
   - Powered by Gemini 3.8 Flash accessed strictly server-side.
   - Conversational memory during active sessions.
   - Actions on every response: **Copy**, **Share** (WhatsApp & Native Web Share), **Save to Library**, **Regenerate**, and **Helpful / Not Helpful feedback rating**.

2. **Write Something (Document Generator)**
   - Dynamic templates for: Job Applications, Cover Letters, Landlord/Tenant Notices, School Letters (fees plans, excuse notes), Formal Complaints, Business Adverts, and Invitations.
   - Tone controls: *Professional*, *Respectful*, *Friendly*, *Short*.
   - Live editable preview before saving, copying, or printing.

3. **Professional CV Builder**
   - 3 clean Ugandan CV styles: *Classic Professional*, *Modern Minimal*, and *Executive Kampala*.
   - Structured multi-entry workflow: Personal Details, Professional Summary, Education, Experience, Skills tags, Languages, and References.
   - Strictly avoids fabricating credentials. Clear bracketed placeholders highlight any missing user details.

4. **My Money (Ugandan Budgeting & Savings)**
   - Monthly income in UGX.
   - Granular expenses: Rent, Food, Transport (Matatu/Boda), School Fees, Airtime/Data, Yaka, NWSC Water, Healthcare, Debt, and Custom categories.
   - Real-time calculations: Total expenses, remaining balance, and visual expense percentage progress bars.
   - **Help Me Plan My Money**: AI financial organization advisor with practical Ugandan cost-cutting tips.
   - **Savings Goal Calculator**: Calculates periodic daily, weekly, and monthly targets in UGX.

5. **Find Work & Career Hub**
   - Quick access to CV Builder and Cover Letter drafting.
   - **Interactive Interview Practice**: Select from 10 Ugandan job categories (e.g. Shop Attendant, Cashier, Teacher, Boda Logistics, IT, Healthcare). AI generates realistic interview questions and provides constructive feedback (Strengths, Growth Points, and Exemplary Answers).
   - Career Profile manager with target UGX salary and location.

6. **Grow My Business**
   - Multiple business profile manager (Name, Category, Location e.g. Kikuubo/Owino/Jinja, Products, WhatsApp).
   - Generates WhatsApp status/broadcast messages with emojis, Facebook posts, TikTok video scripts, product descriptions, promotional offers, and polite customer negotiation templates.
   - **Improve My Advertisement**: AI critique and multi-version rewriting tool.

7. **Translation (English ↔ Luganda)**
   - Natural contextual translation between English and Luganda.
   - Fast everyday phrase chips.
   - Architecture prepared for future languages: Lusoga, Runyankole, Acholi, and Ateso.

8. **Saved Content & Library**
   - Real-time Firestore sync with offline local cache.
   - Filters: All, Documents, CVs, Business, Translations, Chats.
   - Debounced search across title and content.
   - Sorting: Newest, Oldest, Category.

9. **PWA & Offline Experience**
   - Compliant Web App Manifest (`app/manifest.ts`) and Service Worker (`/public/sw.js`).
   - In-app install button (`PWAInstallButton`) for Android and iOS Safari guidance.
   - Offline indicator banner explaining that saved items remain accessible offline.

10. **Usage Limits & Subscription Architecture**
    - Configurable central limits:
      - **Free**: 10 AI requests / month
      - **Plus**: 200 AI requests / month (`UGX 15,000 / mo`)
      - **Business**: 1,000 AI requests / month (`UGX 45,000 / mo`)
    - Abstracted payment service interface (`services/paymentService.ts`) ready for MTN MoMo Open API, Airtel Money, or Flutterwave.

11. **Protected Admin Dashboard**
    - Authorized admin access for configured administrator emails (e.g. `travourstak22@gmail.com`).
    - Live metrics: Total users, active users, AI request volume, paid tier breakdown, user satisfaction rating, and feature request distribution.
    - System controls: Maintenance mode toggle and free usage tier adjustment.

12. **Privacy & Data Rights**
    - Full transparency under Uganda's Data Protection and Privacy Act.
    - One-click permanent data deletion interface in user settings.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with Dark and Light mode support
- **AI Engine**: `@google/genai` using model `gemini-3.8-flash` on server-side Next.js API routes (`app/api/gemini/*`)
- **Database**: Cloud Firestore with Attribute-Based Access Control security rules (`firestore.rules`)
- **Authentication**: Firebase Authentication with Google Sign-in and instant guest mode
- **PWA**: Custom service worker with precaching and offline navigation fallback
- **Icons**: Lucide React + custom SVG/PNG brand icon assets

---

## 🔐 Environment Variables (`.env.example`)

```env
# Required for Gemini AI API calls (injected by AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Host URL for self-referential links
APP_URL="https://your-domain.app"

# Optional production payment gateway credentials:
# MTN_MOMO_API_USER="your-mtn-user"
# MTN_MOMO_API_KEY="your-mtn-key"
# MTN_MOMO_SUBSCRIPTION_KEY="your-mtn-subscription-key"
# AIRTEL_MONEY_CLIENT_ID="your-airtel-client-id"
# AIRTEL_MONEY_CLIENT_SECRET="your-airtel-client-secret"
```

---

## 🧪 Testing

Run the automated test suite verifying budget calculations, plan limits, currency formatting, and admin security guards:

```bash
bun tests/logic.test.ts
# or
npx tsx tests/logic.test.ts
```

---

## 🚢 Deployment to Google Cloud / Cloud Run

The application is built with standalone Next.js output (`output: 'standalone'` in `next.config.ts`), making it deployment-ready for Google Cloud Run:

```bash
npm run build
npm start
```
