# Tatkal Assistant — Personal Railway Booking Preparation & Readiness Desk

> **Member 1 (Frontend Engineer & UI Architect)**  
> Next.js 14 (App Router) • React 18 • TypeScript • Tailwind CSS • Lucide React

Tatkal Assistant is a personal Indian Railways Tatkal preparation and booking-assistance application. It helps travelers organize upcoming journeys, calculate the configured Tatkal opening countdown (10:00 AM IST for AC classes, 11:00 AM IST for Non-AC classes), review authorized train comparisons and recommendations, run through an interactive readiness checklist, safely launch the official IRCTC booking portal, and record booking outcomes and PNR references.

---

## 🌟 Visual Direction: Bright 3D Glass Travel Workspace

The user interface follows a modern glassmorphic travel-planning aesthetic:
- **Color Palette**: Warm ivory/pearl background (`#FAF8F5`), lightly translucent white glass surfaces (`rgba(255, 255, 255, 0.78)`), deep ink text (`#18221D`), botanical emerald accents (`#1B5E3C`), soft sky blue (`#0284C7`), warm coral highlights (`#E05D44`), and muted lavender (`#7C6A96`).
- **3D Depth & Elevation**: Multi-layered surfaces with soft glass shadows, subtle highlight borders (`inset 0 1px 0 0 rgba(255, 255, 255, 0.95)`), and gentle hover lifts.
- **Single-Axis Vertical Navigation**: Native, unobstructed vertical scrolling with smooth in-page transitions. No horizontal overflow, no scroll-jacking, and no forced snap points.
- **Accessibility & Reduced Motion**: Full `prefers-reduced-motion` support, visible high-contrast focus rings (`:focus-visible`), text-first status indicators, and screen-reader ARIA live announcements for countdown milestones (no second-by-second audio spam).

---

## 🏗️ Team Ownership & Architecture Boundaries

This application is built by a four-member engineering team:

| Team Member | Role & Module | Responsibilities & Boundaries |
|:---|:---|:---|
| **Member 1 (This Module)** | **Frontend & UI Architecture** | Pages (`/`, `/trips`, `/trains`, `/booking`, `/history`, `/settings`), forms, UI state, countdown widget, typed API client, demo adapter, accessibility, visual design system. |
| **Member 2** | **Backend & Persistence** | Express APIs, SQLite database, persistence models, backend validation, data deletion endpoints, and receipt/proof reference storage. |
| **Member 3** | **Scheduler & Timing Engine** | Authoritative opening-time calculation, train-origin departure date offsets, system notifications, missed-reminder recovery, and scheduling daemon. |
| **Member 4** | **Comparison & Security QA** | Train timetable data ingestion, quota allocations, multi-objective comparison scoring, recommendation generation, and security checks. |

---

## 🔒 Security & IRCTC Compliance Boundaries

Tatkal Assistant is strictly a **preparation tool**. It never promises guaranteed ticket confirmation.
- **Never Implemented**:
  - No automated IRCTC login or bot sessions.
  - No automated form submissions or booking scripts.
  - No CAPTCHA or OTP bypass mechanisms.
  - No storage or transmission of IRCTC passwords, Aadhaar OTPs, credit/debit card numbers, CVVs, or UPI PINs.
- **User-Controlled Official Booking**:
  - Clicking the **"Open Official IRCTC Portal"** button securely launches `https://www.irctc.co.in/` with `rel="noopener noreferrer"`.
  - All credentials and payments are entered by the user directly on the official IRCTC portal.
  - Opening the IRCTC link **never** marks a trip as booked, does not infer payment success, and does not invent confirmed PNRs.

---

## 🔌 API Integration: Proposed vs. Verified Contracts

The frontend uses a typed API service layer (`lib/api.ts`) supporting both **Live API** and **Transparent Demo Mode**:

| Endpoint | Method | Status | Payload / Return Type |
|:---|:---|:---|:---|
| `/trips` | `GET` | Proposed (Member 2) | Returns `Trip[]` |
| `/trips` | `POST` | Proposed (Member 2) | Body: `TripCreateInput`, Returns: `Trip` |
| `/trips/:id` | `GET` | Proposed (Member 2) | Returns `Trip` |
| `/trips/:id` | `PUT` | Proposed (Member 2) | Body: `TripUpdateInput`, Returns: `Trip` |
| `/trips/:id` | `DELETE`| Proposed (Member 2) | Returns `{ deletedId: string }` |
| `/scheduler/trip/:id` | `GET` | Proposed (Member 3) | Returns `SchedulerOpeningInfo` |
| `/trains/compare` | `GET` | Proposed (Member 4) | Query: `source`, `destination`, `class`, Returns `TrainComparisonResult[]` |
| `/booking/history` | `GET` | Proposed (Member 2) | Returns `BookingOutcomeRecord[]` |
| `/booking/record` | `POST` | Proposed (Member 2) | Body: `BookingOutcomeRecord`, Returns saved record |
| `/settings` | `GET` / `PUT` | Proposed (Member 2) | Returns `UserSettings` |

### Demo Mode Policy
- When `NEXT_PUBLIC_DEMO_MODE=true` (or when `NEXT_PUBLIC_API_BASE_URL` is unset), the application runs via an in-memory & `localStorage` demo adapter.
- A persistent amber banner informs reviewers that demo mode is active.
- Real API network failures **never** silently fall back to mock data; errors are surfaced with full diagnostic details.
- Demo data can be reset at any time via the "Reset Demo Data" button.

---

## 🚀 Getting Started

### Prerequisites
- Node.js LTS (v20+ or v24+)
- npm or npm.cmd

### Installation
```bash
# Clone or navigate to the project
cd tatkal-assistant

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env.local` file:
```env
# Member 2 Express Backend (leave empty to use demo adapter)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

# Demo Mode Toggle ('true' for offline demo preview, 'false' for live backend)
NEXT_PUBLIC_DEMO_MODE=true
```

### Development Server
```bash
npm run dev
# Starts dev server on http://localhost:3001
```

### Automated Tests
```bash
npm test
# Runs the 13-point test suite covering validation, countdowns, sorting, and safety boundaries
```

### Production Build
```bash
npm run build
npm start
```

---

## 📱 Application Routes

- `/` — **Dashboard**: Active journey profile, live Tatkal opening countdown, engine recommendation card, and pre-booking readiness checklist.
- `/trips` — **My Trips**: Saved journey cards with class badges, date summaries, and deletion confirmation dialogs.
- `/trips/new` — **Create Journey**: Accessible form with station validation, Tatkal passenger limit check (1-4 max), and class selection.
- `/trips/[id]` — **Trip Details & Edit**: Parameter editing and route reconfiguration.
- `/trains` — **Compare Trains**: Timetable table with fare breakdowns, run times, data freshness badges, and sorting controls.
- `/booking` — **Booking Desk**: Interactive checklist, countdown timer, IRCTC portal launcher, and manual booking outcome logger.
- `/history` — **Booking History**: Chronological log of manual outcomes with status badges and PNR references.
- `/settings` — **Settings & Privacy**: Travel class preferences, timetable strategy, and local data reset controls.

---

## 🧪 Verification Summary

- **Production Build**: Compiled and statically optimized (11 routes, 0 errors).
- **Unit & Logic Tests**: 14 tests passing (0 failures).
- **HTTP Endpoint Validation**: All 9 routes verified responding with HTTP 200.
- **Accessibility Compliance**: WCAG AA color contrast, visible focus rings, ARIA live countdown milestone alerts, and full `prefers-reduced-motion` support.
