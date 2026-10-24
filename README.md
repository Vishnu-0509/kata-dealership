# 🚗 Car Dealership Inventory System

A production-ready full-stack Car Dealership Inventory Management System built following strict **Test-Driven Development (TDD)** discipline (Red → Green → Refactor).

---

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [Architecture & SOLID Principles](#-architecture--solid-principles)
- [Project Structure](#-project-structure)
- [Quick Start & Setup](#-quick-start--setup)
- [Default Demo Accounts](#-default-demo-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Test Suite & Coverage Report](#-test-suite--coverage-report)
- [My AI Usage (Mandatory Section)](#-my-ai-usage)

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Node.js / Express.js (TypeScript) | Fast, modular, type-safe REST API |
| **Database & ORM** | SQLite + Prisma ORM | Persistent, relational, zero-config local storage |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Secure stateless auth & password hashing |
| **Request Validation** | `zod` | Runtime schema validation with typed error payloads |
| **Backend Testing** | Jest + Supertest + `ts-jest` | TDD integration & unit test suite with coverage |
| **Frontend Framework** | React 18 + TypeScript + Vite | SPA architecture with blazing fast HMR & build |
| **Styling** | Tailwind CSS + PostCSS | Modern, fully responsive dealership UI |
| **Client State / Cache** | TanStack Query (React Query v5) | Optimistic updates & server cache synchronization |
| **Routing** | React Router v6 | Client-side routing with auth & admin guards |
| **Frontend Testing** | Vitest + React Testing Library + jsdom | Component & user interaction testing |

---

## 🏛 Architecture & SOLID Principles

- **Single Responsibility Principle (SRP):**
  - **Controllers** (`AuthController`, `VehicleController`): Validate HTTP payload and status code handling.
  - **Services** (`AuthService`, `VehicleService`): Pure domain logic and database operations.
  - **Middleware** (`authenticate`, `requireAdmin`): Auth token decoding and role checking.
- **Dependency Inversion Principle (DIP):**
  - Controllers and Express routers receive `PrismaClient` via constructor/factory parameters, enabling isolated automated tests against `test.db` without affecting runtime `dev.db`.
- **Open / Closed Principle (OCP):**
  - Vehicle search and inventory transactions allow extension of filtering criteria without modifying existing core data models.

---

## 📁 Project Structure

```text
Kata/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # SQLite database schema
│   │   ├── seed.ts               # Database seeder with demo cars & users
│   │   └── migrations/           # Versioned migration history
│   ├── src/
│   │   ├── controllers/          # HTTP request handlers (AuthController, VehicleController)
│   │   ├── services/             # Domain logic (AuthService, VehicleService)
│   │   ├── middleware/           # JWT verification & Admin guards
│   │   ├── routes/               # Express route mapping
│   │   ├── types/                # TypeScript interfaces
│   │   ├── app.ts                # App factory with dependency injection
│   │   └── server.ts             # Server entry point
│   └── tests/                    # Jest + Supertest suites (auth.test.ts, vehicle.test.ts)
├── frontend/
│   ├── src/
│   │   ├── api/client.ts         # Axios client with JWT interceptor
│   │   ├── components/           # UI components (VehicleCard, VehicleList, VehicleForm, etc.)
│   │   ├── hooks/                # Custom React Query & Auth hooks
│   │   ├── pages/                # Pages (DashboardPage, LoginPage, RegisterPage)
│   │   └── tests/                # Vitest component test suites
│   └── vite.config.ts
├── PROMPTS.md                    # Raw AI development logs
└── README.md
```

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

# Seed database with sample cars and accounts
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

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@dealership.com` | `admin123` | Can view, search, purchase, create, edit, delete, and restock vehicles |
| **Regular User** | `user@dealership.com` | `user123` | Can view, search, and purchase available vehicles |

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
| `PUT` | `/api/vehicles/:id` | Admin Only | Update vehicle details | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/vehicles/:id` | Admin Only | Remove vehicle from system | `200 OK`, `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/vehicles/:id/purchase` | User / Admin | Decrement quantity by 1 | `200 OK`, `400 Out of Stock`, `404 Not Found` |
| `POST` | `/api/vehicles/:id/restock` | Admin Only | Increment vehicle stock | `200 OK`, `400 Bad Request`, `403 Forbidden` |

---

## 🧪 Test Suite & Coverage Report

The project adheres to rigorous Test-Driven Development. Tests run against an isolated SQLite test database (`test.db`).

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
Tests:       30 passed, 30 total
```

### Frontend Test Results (Vitest + React Testing Library)

```text
 ✓ src/tests/VehicleCard.test.tsx   (5 tests passed)
 ✓ src/tests/LoginForm.test.tsx     (3 tests passed)
 ✓ src/tests/RegisterForm.test.tsx  (3 tests passed)

Test Files:  3 passed (3)
Tests:       11 passed (11)
```

**Total automated tests across stack:** **41 tests, 100% passing.**

---

## 🤖 My AI Usage

### 1. AI Tools Utilized
- **Antigravity (Google DeepMind)**: Advanced agentic coding assistant used as a collaborative pair programming partner.

### 2. How AI Was Leveraged
- **API & Schema Modeling:** Brainstormed schema definitions for SQLite and Prisma to guarantee non-in-memory persistence while bypassing heavy local server dependencies.
- **TDD Test Suite Generation:** Co-authored test cases in Jest and Supertest prior to controller implementation, establishing the Red-Green-Refactor pattern.
- **Clean Architecture Refactoring:** AI assisted in refactoring tightly-coupled controllers into dependency-injected classes (`AuthController`, `VehicleController`), separating concerns and enabling 100% test isolation.
- **Frontend Component Construction:** Generated accessible React components (`VehicleCard`, `VehicleList`, `VehicleForm`, `Navbar`) and configured Tailwind UI styling with dynamic stock indicators and modals.
- **Error Diagnosing & Environment Configuration:** Diagnosed Windows PowerShell environment quirks, approved Prisma pre/post-install hooks, and tuned Vitest for single-fork execution.

### 3. Reflection on AI Impact
Utilizing Antigravity allowed transforming an estimated 6-day kata into an efficient single-day sprint without compromising code quality, test coverage, or architectural rigor. The AI acted as a pair programmer that accelerated boilerplate generation and test scaffolding, while human oversight drove technical decisions, business constraints, and adherence to SOLID design principles.

---

## 📦 Production Build

```bash
# Backend build verification
cd backend
npm run build    # Generates dist/ via tsc

# Frontend build verification
cd frontend
npm run build    # Generates dist/ via vite
```
