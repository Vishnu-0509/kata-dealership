# 🚗 Car Dealership Inventory System

A full-stack car dealership inventory management system built with Test-Driven Development (TDD). Features user authentication, vehicle CRUD operations, and inventory management.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + TypeScript + Express |
| ORM | Prisma |
| Database | SQLite (dev/test) |
| Auth | JWT + bcrypt |
| Backend Testing | Jest + Supertest |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| State Management | TanStack Query (React Query) |
| Frontend Testing | Vitest + React Testing Library |

## Project Structure

```
car-dealership/
├── backend/          # Express API
│   ├── prisma/       # Database schema & migrations
│   ├── src/          # Source code
│   └── tests/        # Jest test suites
└── frontend/         # React SPA
    └── src/
        ├── api/      # Axios API client
        ├── components/
        ├── hooks/    # React Query hooks
        └── pages/
```

## Prerequisites

- Node.js 18+
- npm

## Local Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd car-dealership

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set up the Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Run the Backend

```bash
cd backend
npm run dev
# API available at http://localhost:3001
```

### 4. Run the Frontend

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
```

### 5. Create an Admin User

Register normally via the UI or API, then manually promote via Prisma Studio:

```bash
cd backend
npx prisma studio
# Open http://localhost:5555 → Users → set role to ADMIN
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, get JWT |

### Vehicles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/vehicles` | User | List all vehicles |
| GET | `/api/vehicles/search` | User | Search/filter vehicles |
| POST | `/api/vehicles` | Admin | Add vehicle |
| PUT | `/api/vehicles/:id` | Admin | Update vehicle |
| DELETE | `/api/vehicles/:id` | Admin | Delete vehicle |
| POST | `/api/vehicles/:id/purchase` | User | Purchase (decrement qty) |
| POST | `/api/vehicles/:id/restock` | Admin | Restock (increment qty) |

## Running Tests

```bash
# Backend tests (with coverage)
cd backend
npx prisma migrate dev --name init  # ensure test DB exists
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

## Screenshots

> *(Add screenshots of your running application here)*

---

## My AI Usage

This project was built with **Antigravity (Google DeepMind)** as an AI coding assistant.

### Tools Used
- **Antigravity** — primary AI pair programmer throughout the project

### How I Used AI

| Task | AI Usage |
|---|---|
| Project scaffold | Used AI to generate the initial monorepo structure, `package.json` configs, and `tsconfig.json` |
| Prisma schema | AI suggested the schema design for `User` and `Vehicle` models with appropriate types |
| TDD test suite | AI generated the initial test cases for auth and vehicle endpoints following the Red-Green-Refactor pattern |
| Service layer | AI wrote the `AuthService` and `VehicleService` with proper error handling |
| JWT middleware | AI implemented the `authenticate` and `requireAdmin` middleware |
| React components | AI built the `VehicleCard`, `VehicleForm`, `VehicleList`, and auth form components |
| Tailwind styling | AI applied Tailwind utility classes for a responsive, professional UI |
| React Query hooks | AI wrote the data-fetching and mutation hooks using TanStack Query |

### My Reflection

Using Antigravity as a pair programmer dramatically accelerated the scaffolding and boilerplate phases. The AI was particularly effective at:
- **Maintaining consistency** across files (naming conventions, error patterns, types)
- **Writing comprehensive test cases** that cover edge cases I might have missed
- **Generating type-safe TypeScript** with proper interfaces

However, I reviewed every generated file, customized the business logic, and made deliberate design decisions (e.g., using SQLite over PostgreSQL for portability, the search query structure). The AI acted as a force multiplier, not a replacement for engineering judgment.

---

## Deployment (Optional)

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Railway
- Connect GitHub repo
- Set environment variables (`DATABASE_URL`, `JWT_SECRET`)
- Railway auto-detects Node.js
