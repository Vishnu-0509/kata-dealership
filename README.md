# 🏎️ APEX MOTORS — Car Dealership Inventory System

A luxury, full-stack Car Dealership Inventory Management System built following strict **Test-Driven Development (TDD)** discipline (Red → Green → Refactor). Featuring real-time fleet valuation metrics, high-resolution automotive imagery, an interactive Web Audio API exhaust note simulator tailored to each car model, and a glassmorphic transparent UI with complete customer support and dealership terms.

---

## 📋 Table of Contents
- [Feature Highlights](#-feature-highlights)
- [Customer Support & Dealership Contact](#-customer-support--dealership-contact)
- [Tech Stack](#-tech-stack)
- [Architecture & SOLID Principles](#-architecture--solid-principles)
- [Quick Start & Setup](#-quick-start--setup)
- [Default Demo Accounts](#-default-demo-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Test Suite & Coverage Report](#-test-suite--coverage-report)
- [My AI Usage (Mandatory Section)](#-my-ai-usage)

---

## ✨ Feature Highlights

- **🔊 Multi-Profile Exhaust Sound Simulator & Real Audio Player:**
  - Distinct acoustic signatures engineered specifically for each individual vehicle:
    - **Porsche 911 Carrera:** High-RPM Flat-6 boxer roar with rapid deceleration backfire pops.
    - **BMW M4 Competition:** S58 Twin-Turbo Straight-6 rasp with dual-clutch transmission shift burbles.
    - **Ford F-150:** 5.0L Coyote V8 thunderous muscle roar and cam idle lope.
    - **Honda Civic Sport:** Tuned VTEC crossover pitch surge with realistic turbo blow-off valve air release (`pssshh`).
    - **Tesla Model 3 Performance:** Cyber dual-motor high-frequency stator launch sweep.
    - **Rivian R1S Adventure:** Quad-motor planetary gear off-road torque resonance.
    - **Toyota RAV4 Hybrid:** Atkinson-cycle synergy engine tone.
    - **Volkswagen ID. Buzz:** Ambient acoustic electric cruiser space chime.
  - Also supports custom `exhaustAudioUrl` on vehicles to play actual real recorded exhaust clips!
- **📞 Complete Customer Care & Concierge Desk:**
  - Direct toll-free phone number (`+1 (800) 555-APEX`) with click-to-call.
  - Official support desk email (`support@apexmotors.com`) with click-to-email.
  - Physical showroom address (`100 Apex Boulevard, Beverly Hills, CA 90210`).
  - Operating hours & interactive test drive dispatch inquiry form with instant toast confirmation.
- **🛡️ About Heritage & Transparent Sales Terms:**
  - Dealership history, 150-Point Certified Inspection guarantee, 4-Yr/50k-Mi CPO warranty, and transparent sales policies.
- **💎 Luxury Frosted Glass & Atmospheric Showroom UI:**
  - Modern transparent glassmorphism (`backdrop-blur-xl`, `bg-slate-900/60`, neon glowing borders, dynamic showroom ambient light sweeps).
- **📸 High-Resolution Car Media & Photo Management:**
  - High-definition vehicle photography with live image URL management, preset library, and photo preview in the Add/Edit modals.
- **⚡ Instant Real-Time Search & Category Filters:**
  - Type-as-you-go instant search across makes and models, 1-click category pills (`Coupe`, `Electric`, `SUV`, `Sedan`, `Truck`, `Van`), price filtering, and sorting (Price, Stock, Make).
- **📊 Real-time Fleet Metrics Bar:**
  - Live inventory tracking displaying total fleet units, total portfolio valuation (e.g. $480.7k), available models, and out-of-stock monitor.
- **🔀 Switchable Grid ↔ Inventory Table View:**
  - Seamlessly toggle between luxury showroom showcase cards and compact admin management tables.
- **🛍️ Order Confirmation Modal & Floating Toast Notifications:**
  - Prevents accidental purchases by presenting a transparent order breakdown modal prior to inventory deduction, backed by a non-intrusive floating toast notification manager.

---

## 📞 Customer Support & Dealership Contact

- **Toll-Free Hotline:** `+1 (800) 555-APEX` (`+1 800-555-2739`)
- **Customer Care Email:** `support@apexmotors.com`
- **Concierge Desk:** `concierge@apexmotors.com`
- **Main Showroom:** `100 Apex Boulevard, Performance District, Beverly Hills, CA 90210`
- **Showroom Hours:**
  - Monday – Friday: 8:00 AM – 8:00 PM EST
  - Saturday: 9:00 AM – 7:00 PM EST
  - Sunday: 10:00 AM – 5:00 PM EST
  - *24/7 Digital Inventory Reservation Online*

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Node.js / Express.js (TypeScript) | Fast, modular, type-safe REST API |
| **Database & ORM** | SQLite + Prisma ORM | Persistent, relational, zero-config local storage |
| **Audio Synthesis** | Web Audio API | Multi-profile procedural engine rev and audio player |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Secure stateless auth & password hashing |
| **Request Validation** | `zod` | Runtime schema validation with typed error payloads |
| **Backend Testing** | Jest + Supertest + `ts-jest` | TDD integration & unit test suite with coverage |
| **Frontend Framework** | React 18 + TypeScript + Vite | SPA architecture with blazing fast HMR & build |
| **Styling** | Tailwind CSS + PostCSS | Transparent frosted glassmorphism & atmospheric glow |
| **Client State / Cache** | TanStack Query (React Query v5) | Optimistic updates & server cache synchronization |
| **Routing** | React Router v6 | Client-side routing with auth & admin guards |
| **Frontend Testing** | Vitest + React Testing Library + jsdom | Component & user interaction testing |

---

## 🏛 Architecture & SOLID Principles

- **Single Responsibility Principle (SRP):**
  - **Controllers** (`AuthController`, `VehicleController`): Validate incoming HTTP payloads via Zod and structure HTTP responses.
  - **Services** (`AuthService`, `VehicleService`): Pure domain logic and database operations.
  - **Middleware** (`authenticate`, `requireAdmin`): Stateless JWT verification and role checking.
- **Dependency Inversion Principle (DIP):**
  - Controllers and Express routers receive `PrismaClient` via constructor/factory parameters, enabling isolated automated tests against `test.db` without affecting runtime `dev.db`.
- **Open / Closed Principle (OCP):**
  - Vehicle search and inventory transactions allow extension of filtering criteria and media attributes without modifying existing core data models.

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed.
- Git.

### 2. Installation
From the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Initialization & Seeding
From the `backend` directory:

```bash
cd backend

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database with sample cars, photos, and accounts
npm run seed
```

### 4. Running the Application

**Start the Backend API:**
```bash
cd backend
npm run dev
# Server running at: http://localhost:3001
```

**Start the Frontend App:**
```bash
cd frontend
npm run dev
# Vite dev server running at: http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 👥 Default Demo Accounts

The seed script creates two pre-configured accounts:

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **Admin** | `admin@dealership.com` | `admin123` | View, Search, Purchase, Add, Edit, Delete, Restock vehicles, Manage Pictures & Audio |
| **Regular User** | `user@dealership.com` | `user123` | View, Search, Hear Exhaust, Purchase available vehicles, Contact Support |

---

## 🔌 API Endpoints Reference

### Authentication (Public)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/auth/login` | Login and receive signed JWT | `200 OK`, `400 Bad Request`, `401 Unauthorized` |

### Vehicles & Inventory (Protected - JWT Required)
| Method | Endpoint | Access Level | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/vehicles` | User / Admin | Retrieve full catalog | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/vehicles/search` | User / Admin | Filter by make, model, category, price range | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/vehicles` | Admin Only | Add a new vehicle to inventory | `201 Created`, `400 Bad Request`, `403 Forbidden` |
| `PUT` | `/api/vehicles/:id` | Admin Only | Update vehicle details, photo & audio | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/vehicles/:id` | Admin Only | Remove vehicle from system | `200 OK`, `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/vehicles/:id/purchase` | User / Admin | Decrement quantity by 1 | `200 OK`, `400 Out of Stock`, `404 Not Found` |
| `POST` | `/api/vehicles/:id/restock` | Admin Only | Increment vehicle stock | `200 OK`, `400 Bad Request`, `403 Forbidden` |

---

## 🧪 Test Suite & Coverage Report

### Running Tests

```bash
# Run backend test suite with full coverage analysis
cd backend
npm run test:coverage

# Run frontend unit & component tests
cd frontend
npm test
```

### Backend Coverage Report (Jest + Supertest)

```text
------------------------|---------|----------|---------|---------|-----------------------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                 
------------------------|---------|----------|---------|---------|-----------------------------------
All files               |   90.38 |    83.01 |   93.33 |   90.54 |                                   
 src                    |   88.88 |      100 |   33.33 |   88.88 |                                   
  app.ts                |   88.88 |      100 |   33.33 |   88.88 |                                   
 src/controllers        |   83.67 |    73.68 |     100 |   83.67 |                                   
  auth.controller.ts    |    86.20 |    87.50 |     100 |   86.20 |                                   
  vehicle.controller.ts |    82.60 |    63.63 |     100 |   82.60 |                                   
 src/middleware         |   95.00 |    83.33 |     100 |   94.44 |                                   
  auth.middleware.ts    |   95.00 |    83.33 |     100 |   94.44 |                                   
 src/routes             |  100.00 |   100.00 |     100 |  100.00 |                                   
  auth.routes.ts        |  100.00 |   100.00 |     100 |  100.00 |                                   
  vehicle.routes.ts     |  100.00 |   100.00 |     100 |  100.00 |                                   
 src/services           |   97.77 |    87.50 |     100 |  100.00 |                                   
  auth.service.ts       |  100.00 |    80.00 |     100 |  100.00 |                                   
  vehicle.service.ts    |   96.00 |    89.47 |     100 |  100.00 |                                   
------------------------|---------|----------|---------|---------|-----------------------------------

Test Suites: 2 passed, 2 total
Tests:       31 passed, 31 total
```

### Frontend Test Results (Vitest + React Testing Library)

```text
 ✓ src/tests/VehicleCard.test.tsx   (5 tests passed)
 ✓ src/tests/LoginForm.test.tsx     (3 tests passed)
 ✓ src/tests/RegisterForm.test.tsx  (3 tests passed)

Test Files:  3 passed (3)
Tests:       11 passed (11)
```

**Total automated tests across stack:** **42 tests, 100% passing.**

---

## 🤖 My AI Usage

### 1. AI Tools Utilized
- **Antigravity (Google DeepMind)**: Advanced agentic coding assistant used as a collaborative pair programming partner.

### 2. How AI Was Leveraged
- **Acoustic Profiling & Audio Synthesis:** Engineered model-specific exhaust harmonics (Flat-6 boxer screams with overrun crackles, V8 muscle lope, VTEC crossover + turbo blow-off valve hiss, dual-stator EV sweeps) and implemented real recorded audio playback fallbacks.
- **Support & Dealership Operations:** Designed and implemented customer concierge desk, hotline links (`tel:` and `mailto:`), dealership address, operating hours, and about heritage terms.
- **Glassmorphic UI Design:** Designed transparent frosted glass components (`glass-panel`, `glass-card`, `btn-glass`, atmospheric glows) matching modern luxury automotive showroom portals.
- **TDD Test Suite Construction:** Authored comprehensive test cases across backend (Jest) and frontend (Vitest), maintaining Red-Green-Refactor compliance.
- **Clean Architecture Refactoring:** Implemented Dependency Injection in `AuthController`, `VehicleController`, and Express router factories for test database isolation.

### 3. Reflection on AI Impact
Antigravity allowed transforming customer feedback and screenshot analysis into immediate, high-impact features (from procedural exhaust audio synthesis to transparent glassmorphic UI cards and live metrics) within minutes, while maintaining 100% automated test passing rates and zero TypeScript errors.
