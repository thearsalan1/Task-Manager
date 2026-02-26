# Task Management Application

A production-ready Task Management Application built as part of a 24-hour Full Stack Developer Technical Assessment. It demonstrates backend architecture, authentication, security best practices, database handling, frontend integration, and deployment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, TypeScript |
| Frontend | Next.js (App Router) |
| Database | MongoDB (MongoDB Atlas) |
| Auth | JWT in HttpOnly cookies, bcrypt |
| Security | AES-256 encryption, input validation, secure cookies |
| Backend Deployment | Render / Railway |
| Frontend Deployment | Vercel |

---

## Features

### Core
- User registration and login
- JWT-based authentication stored in **HttpOnly cookies**
- Passwords securely hashed with **bcrypt**
- Full Task CRUD (title, description, status, created date)
- Each user can only access **their own tasks**

### Functional
- Pagination, status filtering, and title search on task listing
- Protected frontend routes — unauthenticated users redirected to `/login`
- Clean, minimal UI for login, registration, and task management

### Security
- HttpOnly cookie with `secure` and `sameSite` flags
- AES-256 encryption for task description field at rest
- Server-side input validation on all endpoints
- Secrets loaded from `.env` — never hardcoded

---

## Architecture Overview

```
┌─────────────────────────────┐       ┌──────────────────────────────┐
│      Frontend (Next.js)     │       │     Backend (Express.js)     │
│                             │       │                              │
│  /login   /register /tasks  │──────▶│  /api/auth    /api/tasks     │
│  fetch(..., credentials:    │       │  JWT middleware              │
│         'include')          │       │  AES encrypt/decrypt         │
└─────────────────────────────┘       └───────────────┬──────────────┘
                                                      │
                                             ┌────────▼────────┐
                                             │  MongoDB Atlas  │
                                             └─────────────────┘
```

---

## Local Setup

### Prerequisites
- Node.js (LTS)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
git clone <backend_repo_url> task-backend
cd task-backend
cp .env.example .env      # fill in values
npm install
npm run dev               # http://localhost:5000
```

### Frontend

```bash
git clone <frontend_repo_url> task-frontend
cd task-frontend
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
npm run dev                       # http://localhost:3000
```

Then open:
- `http://localhost:3000/register` — create a new user
- `http://localhost:3000/login` — log in
- `http://localhost:3000/tasks` — manage tasks

---

## Environment Variables

### Backend (`.env`)

```env
PORT=5000
MONGO_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<your_jwt_secret>
TASK_ENC_KEY=<32_bytes_hex_key_for_AES>
TASK_ENC_IV=<16_bytes_hex_iv_for_AES>
FRONTEND_URL=<frontend_url_for_cors>
NODE_ENV=development
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com/api
```

---

## Folder Structure

### Backend

```
task-backend/
  src/
    config/
      env.ts              # Environment variables
      db.ts               # MongoDB connection
    models/
      user.model.ts       # User schema and model
      task.model.ts       # Task schema and model
    controllers/
      auth.controller.ts  # Register, login, logout, current user
      task.controller.ts  # Task CRUD, pagination, filtering, search
    routes/
      auth.routes.ts      # /api/auth routes
      task.routes.ts      # /api/tasks routes
    middleware/
      auth.ts             # JWT auth middleware (reads HttpOnly cookie)
      errorHandler.ts     # Global error handler
    utils/
      jwt.ts              # JWT sign/verify helpers
      crypto.ts           # AES encrypt/decrypt utilities
    server.ts             # Express app bootstrap
  package.json
  tsconfig.json
  .env.example
```

---

## Data Models

### User

```typescript
{
  _id:       ObjectId
  name:      string
  email:     string       // unique, lowercase
  password:  string       // bcrypt-hashed
  createdAt: Date
  updatedAt: Date
}
```

### Task

```typescript
{
  _id:         ObjectId
  title:       string
  description: string     // AES-256 encrypted at rest
  status:      'todo' | 'in-progress' | 'done'
  userId:      ObjectId   // ref: User
  createdAt:   Date
  updatedAt:   Date
}
```

> Index on `{ userId: 1, createdAt: -1 }` for efficient pagination.

---

## API Documentation

**Base URL:** `<BACKEND_URL>/api`

### Auth

#### `POST /auth/register`

```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "Password123!" }

// Response 201
{ "message": "User registered successfully", "user": { "id": "...", "name": "John Doe", "email": "john@example.com" } }
```

#### `POST /auth/login`

```json
// Request
{ "email": "john@example.com", "password": "Password123!" }

// Response 200 — sets HttpOnly access_token cookie
{ "message": "Login successful", "user": { "id": "...", "name": "John Doe", "email": "john@example.com" } }
```

#### `POST /auth/logout`

```json
// Response 200
{ "message": "Logged out" }
```

#### `GET /auth/me`

```json
// Response 200
{ "user": { "id": "...", "name": "John Doe", "email": "john@example.com" } }

// Response 401
{ "message": "Not authenticated" }
```

---

### Tasks

All `/tasks` endpoints require a valid `access_token` cookie.

#### `POST /tasks` — Create a task

```json
// Request
{ "title": "Finish assignment", "description": "Complete full stack task app", "status": "todo" }

// Response 201
{ "id": "...", "title": "Finish assignment", "description": "Complete full stack task app", "status": "todo", "createdAt": "2026-02-26T10:00:00.000Z" }
```

#### `GET /tasks` — List tasks

Query params: `page` (default: 1), `limit` (default: 10), `status` (`todo` | `in-progress` | `done`), `search` (title substring)

```
GET /tasks?page=1&limit=5&status=todo&search=Finish
```

```json
// Response 200
{
  "data": [{ "id": "...", "title": "Finish assignment", "description": "...", "status": "todo", "createdAt": "..." }],
  "page": 1, "limit": 5, "total": 1, "totalPages": 1
}
```

#### `GET /tasks/:id` — Get a task

```json
// Response 200
{ "id": "...", "title": "...", "description": "...", "status": "todo", "createdAt": "..." }

// Response 404
{ "message": "Task not found" }
```

#### `PUT /tasks/:id` — Update a task

```json
// Request
{ "title": "Finish assignment (updated)", "description": "Update UI and deployment", "status": "in-progress" }

// Response 200
{ "id": "...", "title": "Finish assignment (updated)", "description": "Update UI and deployment", "status": "in-progress", "createdAt": "..." }
```

#### `DELETE /tasks/:id` — Delete a task

```json
// Response 200
{ "message": "Task deleted" }
```

---

## Security Details

**JWT + HttpOnly Cookies** — On login, a JWT (`{ userId }`) is issued as an HttpOnly cookie (`access_token`). Cookie flags: `httpOnly: true`, `secure: true` (production), `sameSite: 'none'` or `'lax'` depending on deployment, `maxAge` ~30 minutes.

**Password Hashing** — Passwords are hashed with bcrypt on registration and never stored in plain text.

**AES-256 Encryption** — Task descriptions are encrypted before being saved to MongoDB and decrypted before being returned to the client. The key and IV are stored only in environment variables.

**Input Validation** — All endpoints validate required fields and return `400 Bad Request` with structured errors on invalid input.

---

## Deployment

### Backend (Render)

```bash
npm run build
npm run start
```

Set all `.env` variables in the platform dashboard.

### Frontend (Vercel)

Set `NEXT_PUBLIC_API_URL` to the deployed backend URL + `/api`.

**CORS & Cookies:** Backend CORS must set `origin` to the frontend URL with `credentials: true`. Cookies must use correct `secure` and `sameSite` values for cross-origin requests.

---

## Manual Testing

Use Postman, Thunder Client, or similar to:

1. Register and login — confirm `access_token` cookie is returned as HttpOnly.
2. Call `/tasks` endpoints with and without the cookie to verify `200` vs `401`.
3. Confirm only the logged-in user's tasks are returned.
4. Verify pagination, status filter, and search work as expected.
5. Confirm task descriptions are stored as ciphertext in MongoDB but returned as plain text via the API.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
