# 🏎️ KATA MOTORS — Car Dealership Inventory System

A luxury full-stack Car Dealership Inventory Management System built with **TypeScript, Node.js, Express, Prisma ORM, SQLite, React 18, and Tailwind CSS**. Designed with an authentic frosted transparent glassmorphic aesthetic, real-time fleet valuation metrics, high-resolution automotive imagery, an interactive Web Audio API acoustic engine simulator, multi-vehicle side-by-side specification comparison, and atomic stock concurrency protection.

---

## 📸 Visual Evidence & Application Showcase

All screenshots were captured from the running application using automated headless Chrome.

| Screen | View | Image |
|---|---|---|
| **01. Login Portal** | Desktop (1400×900) | ![Login Portal](docs/screenshots/01-login-desktop.png) |
| **02. Customer Dashboard** | Desktop (1400×900) | ![Customer Dashboard](docs/screenshots/02-customer-dashboard.png) |
| **03. Specifications Comparison** | Desktop (1400×900) | ![Specifications Comparison](docs/screenshots/03-specifications-comparison.png) |
| **04. Acoustic Exhaust & Inspection** | Desktop (1400×900) | ![Acoustic Inspection Modal](docs/screenshots/04-vehicle-inspect-acoustics.png) |
| **05. Zero-Stock Protection** | Desktop (1400×900) | ![Out of Stock State](docs/screenshots/05-out-of-stock-state.png) |
| **06. Admin Management Dashboard** | Desktop (1400×900) | ![Admin Management](docs/screenshots/06-admin-inventory-management.png) |
| **07. Vehicle Creation Modal** | Desktop (1400×900) | ![Vehicle Create Modal](docs/screenshots/07-vehicle-create-modal.png) |
| **08. Responsive Mobile View** | Mobile (390×844) | ![Mobile Dashboard](docs/screenshots/08-mobile-dashboard.png) |

---

## 📋 Table of Contents

- [Feature Highlights](#-feature-highlights)
- [Simulated vs Persistent Features](#-simulated-vs-persistent-features)
- [Tech Stack](#-tech-stack)
- [Architecture & SOLID Principles](#-architecture--solid-principles)
- [Setup & Reproducible Run Guide](#-setup--reproducible-run-guide)
- [Default Demo Accounts](#-default-demo-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Test Suite & Coverage Report](#-test-suite--coverage-report)
- [TDD Narrative & Remediation Audit](#-tdd-narrative--remediation-audit)
- [Publishing & Git Remote Instructions](#-publishing--git-remote-instructions)
- [My AI Usage](#-my-ai-usage)

---

## ✨ Feature Highlights

- **🔒 Hardened Authentication & Security:**
  - Secure stateless JWT authentication with strict mandatory environment configuration. Startup immediately aborts if `JWT_SECRET` is unset or blank.
  - Zero hardcoded fallback secrets. No forged tokens accepted.
  - Granular role-based authorization guards on all admin endpoints (`POST`, `PUT`, `DELETE`, `restock`).
- **🛡️ Race Condition Stock Protection (Zero-Stock Floor):**
  - High-concurrency atomic purchase protection using Prisma conditional update operations (`quantity: { gt: 0 }`).
  - Guaranteed stock consistency: simultaneous purchases decrement stock sequentially and safely reject concurrent buyers once stock reaches 0. Negative inventory is physically impossible.
- **⚖️ Side-by-Side Specifications Comparison Matrix:**
  - Dedicated comparison matrix allowing buyers to select and evaluate up to 4 vehicles simultaneously.
  - Factory telemetry & engineering metrics: Horsepower (`BHP`), 0–60 mph acceleration, top speed (`V-Max`), showroom price, city/hwy MPG or EV range, fuel/battery capacity, transmission, drivetrain, powertrain architecture, seating, and curb weight.
  - Dynamic class leader badges: `★ Best Value`, `⚡ Highest Power`, `🚀 Quickest`, and `🏁 Highest V-Max`.
  - Feature access restricted to regular customers (hidden for administrators).
- **📦 Empty Inventory Modal Availability:**
  - Decoupled modal rendering in `VehicleList.tsx` ensuring administrators can add vehicles when inventory is empty, after deleting the last vehicle, or when active search criteria return zero matches.
  - Includes an inline "+ Add New Vehicle" button directly within the empty state container.
- **🔊 Multi-Profile Exhaust Sound Engine & Audio Player:**
  - Distinct acoustic signatures engineered specifically for individual vehicles (Flat-6 boxer scream, Twin-Turbo Straight-6 rasp, Coyote V8 roar, VTEC turbo blow-off hiss, dual-stator EV sweeps).
  - Supports optional custom `exhaustAudioUrl` on vehicles to play actual recorded audio files.
- **🛡️ Robust Input Validation & Sanitization:**
  - Strict query validation using Zod: enforces finite numeric non-negative price bounds, rejects malformed strings (`minPrice=10junk`), rejects array parameters (`make[]=Audit`), and ensures `minPrice <= maxPrice`.
  - Required text inputs (`make`, `model`, `category`) are trimmed to reject whitespace-only submissions with descriptive 400 responses.
- **💎 Transparent White Glass Aesthetic:**
  - Luxury crystalline showroom design with frosted glassmorphism tokens (`bg-white/[0.12]`, `backdrop-blur-3xl`, `border-white/25`), real-time fleet valuation metrics, and live automotive background video/photo atmosphere.

---

## 🎭 Simulated vs Persistent Features

To maintain transparency, here is the exact operational status of all application features:

| Feature | Status | Implementation Details |
|---|---|---|
| **User Authentication & Passwords** | **Fully Persistent** | Stored in SQLite database with `bcryptjs` 10-round salted password hashing and signed JWT sessions. |
| **Vehicle Inventory CRUD & Stock** | **Fully Persistent** | Stored in SQLite database via Prisma ORM with relational integrity and atomic stock updates. |
| **Race-Condition Protection** | **Fully Persistent** | Executed directly on SQLite with atomic SQL conditional decrements (`WHERE quantity > 0`). |
| **Specifications Comparison** | **Interactive Client State** | Dynamic selection stored in client state; specs data persisted in vehicle database records. |
| **Vehicle Acoustics Engine** | **Simulated & Audio Fallback** | Procedurally synthesized via Web Audio API oscillators/filters; plays custom MP3/WAV if `exhaustAudioUrl` is provided. |
| **Concierge Support Inquiries** | **Local Demo Persistence** | Form submissions are persisted to browser `localStorage` (`kata_demo_inquiries`) for evaluation. Clearly labeled as a demonstration form; no external emails are dispatched. |

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Node.js / Express.js (TypeScript) | Modular, type-safe RESTful API |
| **Database & ORM** | SQLite + Prisma ORM | Persistent, relational, file-based database |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Secure stateless auth & password hashing |
| **Validation** | Zod (v3.23) | Schema validation for query parameters and request bodies |
| **Backend Testing** | Jest + Supertest + `ts-jest` | TDD integration & concurrency test suite |
| **Frontend Framework** | React 18 + TypeScript + Vite | Single Page Application with optimized production bundling |
| **Styling** | Tailwind CSS + PostCSS | Transparent frosted glassmorphism |
| **State Management** | TanStack Query (React Query v5) | Optimistic updates & server cache synchronization |
| **Routing** | React Router v6 | Client-side routing with authentication guards |
| **Frontend Testing** | Vitest + React Testing Library + jsdom | Component & DOM interaction testing |

---

## 🏛 Architecture & SOLID Principles

- **Single Responsibility Principle (SRP):**
  - **Controllers** (`AuthController`, `VehicleController`): Handle HTTP request extraction, Zod validation, and response formatting.
  - **Services** (`AuthService`, `VehicleService`): Pure business logic, authorization verification, and atomic database queries.
  - **Middleware** (`auth.middleware.ts`): Stateless JWT token decoding and role checking.
  - **Config** (`env.ts`): Centralized environment variable parsing and startup validation.
- **Dependency Inversion Principle (DIP):**
  - Controllers and Express routers receive `PrismaClient` via constructor/factory parameters, enabling tests to inject an isolated `test.db` client without mutating development `dev.db`.
- **Open / Closed Principle (OCP):**
  - Search filters and vehicle telemetry specifications allow schema extension without rewriting existing core transaction flows.

---

## 🚀 Setup & Reproducible Run Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (Tested with v24.22.1 LTS)
- **Git**

### 2. Fresh Environment Setup
Clone the repository and prepare the configuration:

```bash
# Clone the repository
git clone <repository-url>
cd Kata

# Configure Backend Environment
# Windows PowerShell:
Copy-Item backend/.env.example backend/.env

# Linux / macOS:
cp backend/.env.example backend/.env
```

`backend/.env.example` documents all required variables:
- `DATABASE_URL="file:./dev.db"`
- `JWT_SECRET="kata-dealership-secure-jwt-secret-key-32chars"`
- `PORT=3001`
- `FRONTEND_URL="http://localhost:5173"`
- `NODE_ENV="development"`

### 3. Dependency Installation & Database Initialization

```bash
# Backend Installation & Database Setup
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# Frontend Installation
cd ../frontend
npm install
```

### 4. Running Development Servers

Open two terminal sessions:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server listens on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite dev server running on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

### 5. Running Production Builds

```bash
# Build Backend
cd backend
npm run build
npm start
# Launches compiled production server from dist/server.js on port 3001
# Verify: curl http://localhost:3001/api/health -> {"status":"ok"}

# Build Frontend
cd ../frontend
npm run build
npm run preview
# Serves compiled production bundle on port 5173
```

---

## 👥 Default Demo Accounts

The seed script creates pre-configured accounts:

| Role | Email | Password | Access Method | Allowed Capabilities |
|---|---|---|---|---|
| **Admin** | `admin@dealership.com` | `admin123` | Manual form login (Admin Demo button removed) | Full inventory CRUD, Restocking, Edit Details, Add Vehicles, Image/Audio Management |
| **Registered Customer** | `user@dealership.com` | `user123` | Manual form login or Registration | Browse catalog, Filter, Hear Exhaust, Compare Specifications, **Purchase Available Stock** |
| **Demo Client** | `demo@dealership.com` | `demo123` | Click **`[👤 Explore as Client Demo]`** button | **View-Only Mode**: Browse catalog, hear exhaust acoustics, and compare specs. **Cannot purchase or make changes without logging in.** |

---

## 🔌 API Endpoints Reference

### Authentication (Public)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/auth/login` | Login and receive signed JWT | `200 OK`, `400 Bad Request`, `401 Unauthorized` |

### Vehicles & Inventory (Protected — JWT Required)
| Method | Endpoint | Access Level | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/vehicles` | User / Admin | Retrieve full inventory catalog | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/vehicles/search` | User / Admin | Filter by make, model, category, price range | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| `POST` | `/api/vehicles` | Admin Only | Add a new vehicle to inventory | `201 Created`, `400 Bad Request`, `403 Forbidden` |
| `PUT` | `/api/vehicles/:id` | Admin Only | Update vehicle details, photo & audio | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/vehicles/:id` | Admin Only | Remove vehicle from inventory | `200 OK`, `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/vehicles/:id/purchase` | User / Admin | Atomically decrement quantity by 1 | `200 OK`, `400 Out of Stock`, `404 Not Found` |
| `POST` | `/api/vehicles/:id/restock` | Admin Only | Increment vehicle stock | `200 OK`, `400 Bad Request`, `403 Forbidden` |

---

## 🧪 Test Suite & Coverage Report

The test suite automatically provisions an isolated SQLite test database (`backend/prisma/test.db`) through a Jest `globalSetup` hook before test execution, completely protecting development data (`dev.db`).

### Running Automated Tests

```bash
# Run all backend tests with coverage analysis
cd backend
npm run test:coverage

# Run all frontend component & integration tests
cd ../frontend
npm test
```

### Actual Backend Coverage Report (Jest + Supertest)

```text
PASS tests/vehicle.test.ts
PASS tests/auth.test.ts
PASS tests/validation.test.ts
PASS tests/concurrency.test.ts
PASS tests/security.test.ts
------------------------|---------|----------|---------|---------|---------------------------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                     
------------------------|---------|----------|---------|---------|---------------------------------------
All files               |   87.70 |    69.76 |    82.50 |   87.81 |                                       
 src                    |   88.88 |   100.00 |    33.33 |   88.88 |                                       
  app.ts                |   88.88 |   100.00 |    33.33 |   88.88 | 21,30                                 
 src/config             |   52.17 |     5.26 |    28.57 |   52.17 |                                       
  env.ts                |   52.17 |     5.26 |    28.57 |   52.17 | 27-32,48,56-68                        
 src/controllers        |   85.18 |    78.26 |   100.00 |   85.18 |                                       
  auth.controller.ts    |   86.20 |    87.50 |   100.00 |   86.20 | 40,51-52,63                           
  vehicle.controller.ts |   84.81 |    73.33 |   100.00 |   84.81 | 76,99,118,129-130,141,158,181,200-204 
 src/middleware         |  100.00 |   100.00 |   100.00 |  100.00 |                                       
  auth.middleware.ts    |  100.00 |   100.00 |   100.00 |  100.00 |                                       
 src/routes             |  100.00 |   100.00 |   100.00 |  100.00 |                                       
  auth.routes.ts        |  100.00 |   100.00 |   100.00 |  100.00 |                                       
  vehicle.routes.ts     |  100.00 |   100.00 |   100.00 |  100.00 |                                       
 src/services           |   97.91 |    91.66 |   100.00 |  100.00 |                                       
  auth.service.ts       |  100.00 |   100.00 |   100.00 |  100.00 |                                       
  vehicle.service.ts    |   96.42 |    90.90 |   100.00 |  100.00 | 21,28,110                             
------------------------|---------|----------|---------|---------|---------------------------------------

Test Suites: 5 passed, 5 total
Tests:       48 passed, 48 total
```

### Actual Frontend Test Results (Vitest + jsdom)

```text
 ✓ src/tests/ClientInterceptorAndCategories.test.ts  (2 tests passed)
 ✓ src/tests/LoginForm.test.tsx                      (3 tests passed)
 ✓ src/tests/RegisterForm.test.tsx                   (3 tests passed)
 ✓ src/tests/VehicleComparisonModal.test.tsx         (4 tests passed)
 ✓ src/tests/VehicleCard.test.tsx                    (6 tests passed)
 ✓ src/tests/VehicleListEmptyModal.test.tsx          (2 tests passed)

Test Files:  6 passed, 6 total
Tests:       21 passed, 21 total
```

**Total automated tests across stack:** **71 passed of 71 tests (100% passing).**

---

## 🔁 TDD Narrative & Remediation Audit

### Honest Acknowledgment of Initial Development Limitation
In the initial project setup, the baseline commit bundled initial implementations and baseline test suites together rather than committing each Red test individually. For all subsequent behavioral fixes and enhancements identified in the independent review, strict Test-Driven Development (Red → Green → Refactor) was rigorously applied and recorded in the Git history:

### 1. JWT Configuration & Security Hardening
- **Problem:** Missing `JWT_SECRET` fell back to `'fallback-secret'`, allowing forged tokens.
- **Red Phase (Commit `2aaa085`):** Authored `backend/tests/security.test.ts` testing rejection of forged fallback tokens, invalid signatures, expired tokens, and missing configurations.
- **Green Phase (Commit `7384daf`):** Centralized validation in `backend/src/config/env.ts`, removed all fallback strings, and ensured server startup fails fast if the secret is missing.

### 2. Concurrent Purchase Race Conditions & Stock Underflow
- **Problem:** Separate stock check and decrement allowed 5 simultaneous purchases on quantity 1 to drive stock negative (-4).
- **Red Phase (Commit `3ac27bf`):** Authored `backend/tests/concurrency.test.ts` reproducing 5 simultaneous purchases against 1 available vehicle.
- **Green Phase (Commit `dee7a67`):** Implemented atomic conditional update in `backend/src/services/vehicle.service.ts` (`quantity: { gt: 0 }`), ensuring exactly 1 purchase succeeds and final quantity is 0.

### 3. Empty Inventory Modal Rendering Bug
- **Problem:** `VehicleList.tsx` returned early when `vehicles.length === 0`, preventing the Add Vehicle modal from opening when the showroom had zero cars.
- **Red Phase (Commit `e0a229a`):** Authored `frontend/src/tests/VehicleListEmptyModal.test.tsx` verifying modal rendering on empty inventory.
- **Green Phase (Commit `60c65fc`):** Decoupled modal rendering from the empty state container and added an inline "+ Add New Vehicle" button.

### 4. API Input Validation & Query Parameter Sanitization
- **Problem:** Malformed query inputs (`minPrice=abc`, `minPrice=10junk`, `make[]=Audit`) caused 500 errors or accepted invalid values. Whitespace strings were accepted for required vehicle fields.
- **Red Phase (Commit `5c42091`):** Authored `backend/tests/validation.test.ts` asserting 400 responses for invalid numeric formats, array filters, negative prices, and whitespace strings.
- **Green Phase (Commit `0f2a87c`):** Created `searchVehicleSchema` using Zod to enforce finite non-negative numbers, reject arrays, validate `minPrice <= maxPrice`, and trim required strings.

### 5. Frontend Interceptor, Category Harmony & Support Form
- **Problem:** 401 on login immediately reloaded the page, hiding error messages. Hatchback and Convertible were omitted from filter pills. Support form claimed false dispatch.
- **Red Phase (Commit `9e53fba`):** Authored `frontend/src/tests/ClientInterceptorAndCategories.test.ts` checking category inclusions and non-redirect on `/auth/login`.
- **Green Phase (Commit `eeba96a`):** Shared category definitions across form and dashboard, excluded auth endpoints from the Axios 401 redirect, and labeled the support form as a local demonstration feature.

---

## 🌐 Publishing & Git Remote Instructions

Currently, no Git remote is configured on this repository (`git remote -v` returns empty).

To publish this repository to your GitHub account:

```bash
# 1. Create a new repository on GitHub (e.g. named 'kata-dealership')
# 2. Add the remote URL:
git remote add origin https://github.com/<your-username>/kata-dealership.git

# 3. Rename branch to master/main (if desired) and push:
git branch -M master
git push -u origin master
```

---

## 🤖 My AI Usage

### 1. AI Tools Utilized
- **Antigravity (Google DeepMind)**: Advanced agentic coding assistant powered by **Claude Sonnet 4.6 (Thinking)** used as an active pair programming partner.

### 2. Collaboration & Assistance
- **Security Audit & Hardening:** Designed fail-fast startup configuration validation and eliminated fallback secrets.
- **Concurrency Engineering:** Implemented atomic SQL conditional decrements in Prisma ORM to solve database race conditions.
- **Rigorous TDD Cycle:** Partnered in writing failing regression tests demonstrating each reported bug prior to implementing fixes.
- **Automated Verification & Evidence:** Created headless Chrome DevTools Protocol automation scripts to capture genuine screenshots from the production build without fabrication.
- **Documentation Integrity:** Maintained verbatim prompt logs in `PROMPTS.md` and archived raw execution transcripts in `docs/transcripts/transcript.jsonl`.
