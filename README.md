# MERN Authentication & Role-Based Authorization

A full-stack application built with **MongoDB, Express, React, and Node.js** featuring JWT authentication, role-based access control, and secure token management following industry best practices.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access Control](#role-based-access-control)
- [API Endpoints](#api-endpoints)
- [Security Best Practices](#security-best-practices)
- [Custom React Hooks](#custom-react-hooks)
- [Frontend Routes](#frontend-routes)

## Features

- User registration with real-time form validation
- Secure login with JWT access and refresh tokens
- Role-based authorization (Admin, Editor, User)
- Persistent login with "Trust This Device" option
- Automatic token refresh via Axios interceptors
- Protected API routes with middleware chaining
- CORS configuration with origin whitelisting
- HTTP request and error logging
- CRUD operations for employee management
- Accessible forms with ARIA attributes

## Tech Stack

### Backend

| Package | Purpose |
|---------|---------|
| Express 5 | Web framework |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT creation & verification |
| bcrypt | Password hashing |
| cookie-parser | Secure cookie handling |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable management |
| date-fns / uuid | Logging utilities |

### Frontend

| Package | Purpose |
|---------|---------|
| React 19 | UI library |
| react-router-dom 7 | Client-side routing |
| axios | HTTP client |
| jwt-decode | Token decoding on client |
| @fortawesome | UI icons |
| @fvilers/disable-react-devtools | Production security |

## Project Structure

```
├── server/
│   ├── server.js                 # Entry point
│   ├── config/
│   │   ├── allowedOrigins.js     # CORS whitelist
│   │   ├── corsOptions.js        # CORS configuration
│   │   ├── dbConn.js             # MongoDB connection
│   │   └── roles_list.js         # Role definitions
│   ├── model/
│   │   ├── User.js               # User schema (username, password, roles, refreshToken)
│   │   └── Employee.js           # Employee schema (firstname, lastname)
│   ├── controllers/
│   │   ├── authController.js     # Login logic
│   │   ├── registerController.js # Registration logic
│   │   ├── refreshTokenController.js
│   │   ├── logoutController.js
│   │   └── employeesControllers.js
│   ├── middleware/
│   │   ├── verifyJWT.js          # Token validation
│   │   ├── verifyRoles.js        # Role authorization
│   │   ├── credentials.js        # Cookie credentials
│   │   ├── logEvents.js          # Request logging
│   │   └── errorhandeler.js      # Global error handler
│   └── routers/
│       ├── auth.js
│       ├── register.js
│       ├── refresh.js
│       ├── logout.js
│       └── api/employees.js
│
└── client/
    └── src/
        ├── App.js                # Route definitions
        ├── api/axios.js          # Axios instances
        ├── context/AuthProvidor.js
        ├── hooks/
        │   ├── useAuth.js        # Auth context access
        │   ├── useRefreshToken.js # Token refresh
        │   ├── useAxiousPrivate.js # Interceptor-equipped Axios
        │   ├── useLogout.js      # Logout logic
        │   ├── useInput.js       # Form input with persistence
        │   ├── useLocalStorage.js # localStorage wrapper
        │   └── useToggle.js      # Toggle with persistence
        └── components/
            ├── Login.js
            ├── Register.js
            ├── RequireAuth.js    # Route protection
            ├── PersistLogin.js   # Persistent sessions
            ├── Home.js
            ├── Admin.js
            ├── Editor.js
            ├── Lounge.js
            ├── Users.js
            └── ...
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/NodeJsCrash.git
   cd NodeJsCrash
   ```

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Run the application**

   ```bash
   # Start the backend (from /server)
   npm run dev

   # Start the frontend (from /client)
   npm start
   ```

   The backend runs on `http://localhost:3500` and the frontend on `http://localhost:3000`.

## Environment Variables

### Server (`server/.env`)

```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
DATA_BASE_URI=your_mongodb_connection_string
```

Generate secure secrets using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client (`client/.env`)

```env
NODE_ENV=production
```

Setting `NODE_ENV=production` disables React DevTools in production builds.

## Authentication Flow

```
┌──────────┐     POST /register      ┌──────────┐
│  Client  │ ──────────────────────►  │  Server  │  bcrypt hash → save to DB
└──────────┘                          └──────────┘

┌──────────┐     POST /auth           ┌──────────┐
│  Client  │ ──────────────────────►  │  Server  │  verify password
└──────────┘                          └──────────┘
     │                                      │
     │  ◄── accessToken (response body) ────┘
     │  ◄── refreshToken (httpOnly cookie) ─┘
     │
     │        GET /employees
     │  ──── Authorization: Bearer <token> ──►  verifyJWT → verifyRoles → controller
     │
     │        Token expired? (403)
     │  ──── GET /refresh (cookie) ──────────►  new accessToken
     │
     │        GET /logout
     │  ──── clear cookie ───────────────────►  clear DB refreshToken
```

- **Access tokens** are short-lived (10s) and sent in the response body — never stored in localStorage
- **Refresh tokens** are long-lived (1d) and stored only in httpOnly cookies — inaccessible to JavaScript
- On 403 responses, the Axios interceptor automatically refreshes the token and retries the request

## Role-Based Access Control

Three roles with numeric codes used in JWT payloads:

| Role | Code | Permissions |
|------|------|-------------|
| User | 2001 | View employees, access home page |
| Editor | 1984 | Create and update employees |
| Admin | 5150 | Full CRUD including delete |

Roles are enforced at two levels:
- **Backend**: `verifyRoles` middleware checks `req.roles` against allowed roles before controller execution
- **Frontend**: `RequireAuth` component decodes the JWT and checks roles before rendering protected routes

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/auth` | Login and receive tokens |
| GET | `/refresh` | Refresh access token |
| GET | `/logout` | Logout and clear tokens |

### Protected (requires JWT)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/employees` | All authenticated | List all employees |
| GET | `/employees/:id` | All authenticated | Get single employee |
| POST | `/employees` | Admin, Editor | Create employee |
| PUT | `/employees` | Admin, Editor | Update employee |
| DELETE | `/employees` | Admin | Delete employee |

## Security Best Practices

### Token Management
- Access tokens are short-lived and kept in memory (React state) — not in localStorage
- Refresh tokens stored in httpOnly cookies, preventing XSS access
- Refresh tokens are tracked in the database and cleared on logout
- `sameSite` and `secure` cookie flags configured for cross-site protection

### Password Security
- Passwords hashed with bcrypt (10 salt rounds) before storage
- Client-side validation enforces strong passwords: 8-24 characters with uppercase, lowercase, number, and special character

### CORS & Credentials
- Origin whitelist restricts cross-origin requests
- `credentials` middleware sets proper headers before CORS processing
- `withCredentials: true` on Axios for cookie transmission

### Middleware Pipeline
```
credentials → cors → logger → routes
                                 └─► verifyJWT → verifyRoles → controller
                                                                   └─► errorHandler
```

### Frontend Protection
- Route guards via `RequireAuth` component with role checking
- `PersistLogin` wrapper handles session recovery on page refresh
- Axios interceptors handle token refresh transparently
- Request cleanup with `AbortController` on component unmount
- React DevTools disabled in production

### Form Validation & Accessibility
- Real-time regex validation with visual feedback (check/X icons)
- `aria-invalid`, `aria-live`, and `aria-describedby` for screen readers
- Focus management on form load and error states

### Logging
- All HTTP requests logged with timestamps and UUIDs
- Errors logged to separate error log file
- Log files auto-created if missing

## Custom React Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Access auth context (user, token, roles) |
| `useRefreshToken` | Call `/refresh` endpoint and update auth state |
| `useAxiosPrivate` | Axios instance with automatic token injection and refresh-on-403 |
| `useLogout` | Clear auth state and server-side refresh token |
| `useLocalStorage` | Persist state to localStorage with lazy initialization |
| `useToggle` | Boolean toggle persisted to localStorage |
| `useInput` | Form input state with localStorage persistence and reset |

## Frontend Routes

| Path | Access | Component | Description |
|------|--------|-----------|-------------|
| `/login` | Public | Login | User login form |
| `/register` | Public | Register | User registration form |
| `/linkpage` | Public | LinkPage | Navigation links |
| `/unauthorized` | Public | Unauthorized | Access denied page |
| `/` | User+ | Home | Welcome page with navigation |
| `/editor` | Editor | Editor | Editor-only content |
| `/admin` | Admin | Admin | Admin panel with user list |
| `/lounge` | Editor, Admin | Lounge | Shared editor/admin area |
| `*` | Public | Missing | 404 page |
