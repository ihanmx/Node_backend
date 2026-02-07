# Client-Side JWT Authentication, Persistent Login & Protected Routes — Step by Step Guide

> Based on your React project in `client/src/`

---

## Table of Contents

1. [The Big Picture — How It All Fits Together](#step-0-the-big-picture)
2. [Step 1 — Set Up Axios Instances](#step-1-set-up-axios-instances)
3. [Step 2 — Create the Auth Context (Global Auth State)](#step-2-create-the-auth-context)
4. [Step 3 — Create the `useAuth` Hook](#step-3-create-the-useauth-hook)
5. [Step 4 — Wrap the App with AuthProvider & BrowserRouter](#step-4-wrap-the-app)
6. [Step 5 — Build the Registration Page](#step-5-build-the-registration-page)
7. [Step 6 — Build the Login Page](#step-6-build-the-login-page)
8. [Step 7 — Create the `useRefreshToken` Hook](#step-7-create-the-userefreshtoken-hook)
9. [Step 8 — Create the `useAxiosPrivate` Hook (Interceptors)](#step-8-create-the-useaxiosprivate-hook)
10. [Step 9 — Build the `RequireAuth` Component (Route Protection)](#step-9-build-the-requireauth-component)
11. [Step 10 — Build the `PersistLogin` Component](#step-10-build-the-persistlogin-component)
12. [Step 11 — Create the `useLogout` Hook](#step-11-create-the-uselogout-hook)
13. [Step 12 — Create the `useLocalStorage` Hook](#step-12-create-the-uselocalstorage-hook)
14. [Step 13 — Wire Up Routes in App.js](#step-13-wire-up-routes)
15. [Step 14 — Use `useAxiosPrivate` in Protected Components](#step-14-use-useaxiosprivate-in-components)
16. [Complete Token Flow Diagram](#complete-token-flow-diagram)
17. [File Structure Summary](#file-structure-summary)

---

## Step 0: The Big Picture

Before writing any code, understand the **overall architecture**:

```
                        ┌──────────────────────────────────────┐
                        │            React App (Client)         │
                        │                                      │
  User visits app  ──►  │  index.js                            │
                        │    └─ BrowserRouter                  │
                        │        └─ AuthProvider (context)     │
                        │            └─ App.js (routes)        │
                        │                ├─ Public Routes      │
                        │                │   ├─ /register      │
                        │                │   ├─ /login         │
                        │                │   └─ /linkpage      │
                        │                └─ Protected Routes   │
                        │                    └─ PersistLogin    │
                        │                        └─ RequireAuth │
                        │                            ├─ /home  │
                        │                            ├─ /editor│
                        │                            ├─ /admin │
                        │                            └─ /lounge│
                        └──────────────────────────────────────┘
```

**Key Concepts:**
- **Access Token** — Short-lived JWT stored **in memory** (React state). Sent with every protected API request.
- **Refresh Token** — Long-lived JWT stored in an **HttpOnly cookie** (set by the server). Used to silently get a new access token when the old one expires.
- **Why two tokens?** — If an attacker steals the access token via XSS, it expires quickly. The refresh token is in an HttpOnly cookie so JavaScript can't touch it.

**What you'll build:**
| File | Purpose |
|------|---------|
| `api/axios.js` | Two Axios instances — public and private |
| `context/AuthProvidor.js` | Global auth state (user, roles, accessToken, persist) |
| `hooks/useAuth.js` | Shortcut hook to access auth context |
| `hooks/useRefreshToken.js` | Gets a new access token using the refresh token cookie |
| `hooks/useAxiousPrivate.js` | Axios with interceptors that auto-attach and auto-refresh tokens |
| `hooks/useLogout.js` | Clears auth state and calls server logout |
| `hooks/useLocalStorage.js` | Persist values (like username) in localStorage |
| `components/Register.js` | Registration form with validation |
| `components/Login.js` | Login form with "Trust This Device" checkbox |
| `components/RequireAuth.js` | Route guard — checks roles |
| `components/PersistLogin.js` | Silently restores session on page reload |

---

## Step 1: Set Up Axios Instances

**File:** `src/api/axios.js`

**Why?** You need two separate Axios instances:
1. A **default** instance for public requests (register, login) — no credentials needed.
2. A **private** instance for protected requests — includes cookies and will get interceptors attached later.

```js
import axios from "axios";
const BASE_URL = "http://localhost:3500";

// Default instance — for public endpoints (register, login)
export default axios.create({
  baseURL: BASE_URL,
});

// Private instance — for protected endpoints
// withCredentials: true → sends the HttpOnly refresh token cookie with every request
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
```

**Key point:** `withCredentials: true` is what tells the browser to include cookies (where the refresh token lives) in cross-origin requests. Without this, the browser strips cookies from requests to `localhost:3500` if your React app runs on `localhost:3000`.

---

## Step 2: Create the Auth Context

**File:** `src/context/AuthProvidor.js`

**Why?** You need a single source of truth for the user's auth state that any component in the app can access. React Context lets you avoid "prop drilling" (passing auth data through 10 levels of components).

```js
import { createContext, useState } from "react";

export const AuthContext = createContext({});

const AuthProvidor = ({ children }) => {
  // auth will hold: { user, pwd, roles, accessToken }
  const [auth, setAuth] = useState({});

  // persist = "Trust This Device" checkbox — remembered across browser sessions
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem("persist")) || false,
  );

  return (
    <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvidor;
```

**What `auth` looks like after login:**
```js
{
  user: "hanan",
  pwd: "Password1!",
  roles: [2001],          // array of role codes
  accessToken: "eyJhbG..." // the JWT access token
}
```

**What `persist` does:**
- `true` → When user refreshes the page, try to get a new access token from the refresh cookie.
- `false` → When user refreshes, don't try — treat it as a new session (force login again).
- Stored in `localStorage` so it survives browser close.

---

## Step 3: Create the `useAuth` Hook

**File:** `src/hooks/useAuth.js`

**Why?** Instead of writing `useContext(AuthContext)` in every single component, you create a one-liner custom hook. This is a common React pattern for cleaner code.

```js
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvidor";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
```

**Usage in any component:**
```js
const { auth, setAuth, persist, setPersist } = useAuth();
```

---

## Step 4: Wrap the App with AuthProvider & BrowserRouter

**File:** `src/index.js`

**Why?** Both `BrowserRouter` (for routing) and `AuthProvidor` (for auth state) need to wrap the entire app so every component inside has access to them.

```js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import AuthProvidor from "./context/AuthProvidor";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvidor>
        <App />
      </AuthProvidor>
    </BrowserRouter>
  </React.StrictMode>,
);
```

**Order matters:** `BrowserRouter` wraps `AuthProvidor` because some auth logic (like redirects) uses router hooks like `useNavigate`.

---

## Step 5: Build the Registration Page

**File:** `src/components/Register.js`

**Why?** Users need to create an account before they can log in. This page does **client-side validation** before sending data to the server.

### 5.1 — Define Validation Regex

```js
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
// ^ Start with a letter, then 3-23 more chars (letters, numbers, _, -)
// Total: 4-24 characters

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
// Must have: lowercase + uppercase + number + special char (!@#$%)
// Total: 8-24 characters
```

### 5.2 — Set Up State

```js
const [user, setUser] = useState("");
const [validName, setValidName] = useState(false);    // does username pass regex?
const [userFocus, setUserFocus] = useState(false);     // is user focused on this input?

const [pwd, setPwd] = useState("");
const [validPwd, setValidPwd] = useState(false);

const [matchPwd, setMatchPwd] = useState("");          // confirm password field
const [validMatch, setValidMatch] = useState(false);   // do passwords match?

const [errMsg, setErrMsg] = useState("");
const [success, setSuccess] = useState(false);
```

### 5.3 — Real-time Validation with useEffect

```js
// Validate username every time it changes
useEffect(() => {
  const result = USER_REGEX.test(user);
  setValidName(result);
}, [user]);

// Validate password + match every time either changes
useEffect(() => {
  const result = PWD_REGEX.test(pwd);
  setValidPwd(result);
  const match = pwd === matchPwd;
  setValidMatch(match);
}, [pwd, matchPwd]);

// Clear error message when user starts typing
useEffect(() => {
  setErrMsg("");
}, [user, pwd, matchPwd]);
```

**Pattern:** Each `useEffect` watches specific state variables and re-validates when they change. This gives the user instant feedback (green checkmark / red X).

### 5.4 — Handle Form Submit

```js
const handleSubmit = async (e) => {
  e.preventDefault();

  // Double-check validation (in case submit button was enabled via JS hack)
  const v1 = USER_REGEX.test(user);
  const v2 = PWD_REGEX.test(pwd);
  if (!v1 || !v2) {
    setErrMsg("Invalid Entry");
    return;
  }

  try {
    const response = await axios.post(
      "/register",
      JSON.stringify({ user: user, pwd: pwd }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
    setSuccess(true);
    setUser("");
    setPwd("");
    setMatchPwd("");
  } catch (err) {
    if (!err?.response) {
      setErrMsg("No Server Response");
    } else if (err.response?.status === 409) {
      setErrMsg("Username Taken");       // 409 = Conflict
    } else {
      setErrMsg("Registration Failed");
    }
    errRef.current.focus();   // focus on error for screen readers
  }
};
```

**Important:** We use the **default** axios instance (no token needed), and we use `JSON.stringify()` to send the body as JSON.

### 5.5 — Disable Button Until Valid

```jsx
<button disabled={!validName || !validPwd || !validMatch ? true : false}>
  Sign Up
</button>
```

The button is disabled until ALL three validations pass.

---

## Step 6: Build the Login Page

**File:** `src/components/Login.js`

**Why?** After registration, the user logs in. The server returns an **access token** and **roles**, and sets a **refresh token** in an HttpOnly cookie.

### 6.1 — Remember Where User Came From

```js
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || "/";
```

**Why?** If a user tried to visit `/admin` but wasn't logged in, `RequireAuth` redirects them to `/login` and passes the original path in `location.state`. After login, we send them back to `/admin` instead of just `/`.

### 6.2 — Handle Login Submit

```js
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "/auth",
      JSON.stringify({ user, pwd }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,   // IMPORTANT: to receive the HttpOnly cookie
      },
    );
    const accessToken = response?.data?.accessToken;
    const roles = response?.data?.roles;

    // Store everything in auth context (in memory — NOT localStorage)
    setAuth({ user, pwd, roles, accessToken });
    setPwd("");
    setUser("");

    // Redirect to where they were trying to go
    navigate(from, { replace: true });
  } catch (err) {
    if (!err?.response) {
      setErrMsg("No Server Response");
    } else if (err.response?.status === 400) {
      setErrMsg("Missing Username or Password");
    } else if (err.response?.status === 401) {
      setErrMsg("Unauthorized");
    } else {
      setErrMsg("Login Failed");
    }
    errRef.current.focus();
  }
};
```

**Critical:** `withCredentials: true` is what allows the browser to receive and store the HttpOnly cookie that the server sends back. Without it, the cookie is silently dropped.

### 6.3 — "Trust This Device" (Persist Login Checkbox)

```js
const togglePersist = () => {
  setPersist((prev) => !prev);
};

// Save persist preference to localStorage whenever it changes
useEffect(() => {
  localStorage.setItem("persist", JSON.stringify(persist));
}, [persist]);
```

```jsx
<div className="persistCheck">
  <input
    type="checkbox"
    id="persist"
    checked={persist}
    onChange={togglePersist}
  />
  <label htmlFor="persist">Trust This Device</label>
</div>
```

**What this does:**
- Checked → On page refresh, the app will use the refresh token to silently get a new access token.
- Unchecked → On page refresh, the user must log in again.

### 6.4 — Username Persistence with `useLocalStorage`

```js
const [user, setUser] = useLocalStorage("user", "");
```

This remembers the username in localStorage so the user doesn't have to retype it next time they visit the login page. (We'll build this hook in Step 12.)

---

## Step 7: Create the `useRefreshToken` Hook

**File:** `src/hooks/useRefreshToken.js`

**Why?** Access tokens expire quickly (e.g., 15 minutes). When they do, instead of forcing the user to log in again, we **silently** get a new one by calling `/refresh` with the refresh token cookie.

```js
import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    // Call the /refresh endpoint — the browser automatically sends
    // the HttpOnly cookie containing the refresh token
    const response = await axios.get("/refresh", { withCredentials: true });

    // Update the auth context with the new token and roles
    setAuth((prev) => {
      return {
        ...prev,                              // keep existing user, pwd
        roles: response.data.roles,           // update roles (server sends them fresh)
        accessToken: response.data.accessToken, // the new access token
      };
    });

    return response.data.accessToken;  // return to caller (used by interceptor)
  };

  return refresh;
};

export default useRefreshToken;
```

**Key points:**
- Uses the **default** axios instance (not private) because we don't need to attach the old expired token.
- `withCredentials: true` is needed so the refresh token cookie is sent.
- Returns the new access token so the caller (interceptor) can immediately use it.
- Uses `setAuth(prev => ...)` (functional update) to keep the existing `user` and `pwd` while only updating `roles` and `accessToken`.

**This hook is used in two places:**
1. `PersistLogin` — on initial page load to restore the session.
2. `useAxiosPrivate` — in the response interceptor when a 403 is received.

---

## Step 8: Create the `useAxiosPrivate` Hook (Interceptors)

**File:** `src/hooks/useAxiousPrivate.js`

**Why?** This is the **heart** of the auth system. Every time a protected component makes an API call, this hook:
1. **Automatically** attaches the access token to the request.
2. **Automatically** refreshes the token if the server says it's expired (403).
3. **Automatically** retries the failed request with the new token.

### 8.1 — Understand Axios Interceptors

Think of interceptors as **middleware** for HTTP requests:

```
YOUR CODE calls axiosPrivate.get("/employees")
        │
        ▼
  REQUEST INTERCEPTOR ← "Let me add the Authorization header"
        │
        ▼
   Request goes to server
        │
        ▼
   Server responds
        │
        ▼
  RESPONSE INTERCEPTOR ← "Is it a 403? Let me refresh and retry"
        │
        ▼
YOUR CODE receives the response
```

### 8.2 — The Full Implementation

```js
import { useEffect } from "react";
import useAuth from "./useAuth";
import { axiosPrivate } from "../api/axios";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
  const { auth } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    // ─── REQUEST INTERCEPTOR ───
    // Runs BEFORE every request made with axiosPrivate
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        // Only add the token if it's not already there
        // (on retry after refresh, the token is already set)
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // ─── RESPONSE INTERCEPTOR ───
    // Runs AFTER every response from axiosPrivate
    const responseIntercept = axiosPrivate.interceptors.response.use(
      // If response is OK (200), just pass it through
      (response) => response,

      // If there's an error...
      async (error) => {
        const prevRequest = error.config;  // the original request that failed

        // If 403 AND we haven't already retried this request
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;  // flag: "I already retried this one"

          // Get a fresh access token
          const newAccessToken = await refresh();

          // Update the failed request's header with the new token
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // Retry the original request
          return axiosPrivate(prevRequest);
        }

        // If it's not a 403, or we already retried → reject the error
        return Promise.reject(error);
      },
    );

    // ─── CLEANUP ───
    // Remove interceptors when the component using this hook unmounts
    // This prevents duplicate interceptors from stacking up
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;
```

### 8.3 — Why `prevRequest.sent = true`?

Without this flag, you'd get an **infinite loop**:
1. Request fails with 403 → interceptor refreshes token → retries request
2. If the retry also fails with 403 → interceptor refreshes again → retries again
3. ...forever

The `sent` flag ensures we only retry **once**. If the retry also fails, we know something is really wrong (refresh token expired too) and we let the error propagate.

### 8.4 — Why clean up interceptors?

Each time a component mounts, `useEffect` adds new interceptors. If you don't `eject` them on unmount, you'll end up with **multiple duplicate interceptors** all running on every request. The cleanup function in the `return` prevents this.

---

## Step 9: Build the `RequireAuth` Component (Route Protection)

**File:** `src/components/RequireAuth.js`

**Why?** You need to prevent unauthorized users from accessing protected pages. This component acts as a **gatekeeper** that wraps around routes.

```js
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // Check if the user has ANY of the allowed roles
  const hasRequiredRole = auth?.roles?.some((role) =>
    allowedRoles?.includes(role),
  );

  // Decision tree:
  if (hasRequiredRole) {
    return <Outlet />;  // ✓ Has the right role → show the page
  }

  if (auth?.user) {
    // Logged in but WRONG role → show "Unauthorized" page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Not logged in at all → redirect to login
  // Pass current location so login can redirect back after success
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;
```

**The decision flow:**
```
User visits /admin
     │
     ▼
Does auth.roles include any of [5150]?
     │
    YES → Show <Admin /> via <Outlet />
     │
    NO → Is auth.user set? (are they logged in at all?)
     │
    YES → Navigate to /unauthorized (logged in, wrong role)
     │
    NO → Navigate to /login (not logged in)
           └─ state: { from: "/admin" }  ← remember where they were going
```

**Why `<Outlet />`?** Because `RequireAuth` is used as a **layout route** in React Router. `<Outlet />` renders whatever child route is nested inside it.

**Why `.some()`?** Because a user might have multiple roles (e.g., `[2001, 1984]`) and a route might allow multiple roles (e.g., `[1984, 5150]`). `.some()` returns `true` if there's **any** overlap.

---

## Step 10: Build the `PersistLogin` Component

**File:** `src/components/PersistLogin.js`

**Why?** When the user refreshes the page, React state is wiped — including the access token. Without `PersistLogin`, the user would have to log in again on every page refresh. This component **silently** restores the session using the refresh token cookie.

```js
import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        await refresh();  // Get new access token from refresh cookie
      } catch (err) {
        console.error(err);  // Refresh failed — user must log in again
      } finally {
        isMounted && setIsLoading(false);  // Done loading either way
      }
    };

    // Only call refresh if we DON'T already have an access token
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => {
      isMounted = false;  // Prevent state update on unmounted component
    };
  }, []);

  return (
    <>
      {!persist
        ? <Outlet />                           // persist OFF → render immediately
        : isLoading
          ? <p>Loading...</p>                  // persist ON, still loading → show spinner
          : <Outlet />                         // persist ON, done loading → render
      }
    </>
  );
};

export default PersistLogin;
```

**The flow on page refresh:**

```
Page refreshes → React state is wiped (auth = {})
     │
     ▼
PersistLogin mounts
     │
     ▼
Is persist = true? (did user check "Trust This Device"?)
     │
    NO → Render children immediately (user must log in)
     │
   YES → Is auth.accessToken set?
     │
    YES → Already have a token, render immediately
     │
    NO → Call refresh() to get a new token
     │     │
     │    SUCCESS → auth updated with new token → render children
     │     │
     │    FAIL → render children anyway (RequireAuth will redirect to login)
     │
     └─── Show "Loading..." while waiting
```

**Why `isMounted`?** If the component unmounts before the async `refresh()` finishes (e.g., user navigates away), calling `setIsLoading` would cause a React warning. The `isMounted` flag prevents this.

---

## Step 11: Create the `useLogout` Hook

**File:** `src/hooks/useLogout.js`

**Why?** Logging out requires two things: clearing the client-side auth state AND telling the server to invalidate the refresh token.

```js
import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({});  // Immediately clear auth state (instant UI update)
    try {
      // Tell the server to clear the refresh token cookie
      axios.get("/logout", { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
```

**Why clear auth BEFORE the server call?**
- The UI should respond **instantly** — don't wait for the server.
- Even if the server call fails (e.g., network error), the user is still logged out on the client side.

**What the server does on `/logout`:**
- Finds the user with the refresh token from the cookie.
- Removes the refresh token from the database.
- Clears the cookie.

**Usage in Home.js:**
```js
const logout = useLogout();

const signOut = async () => {
  await logout();
  navigate("/login");
};
```

---

## Step 12: Create the `useLocalStorage` Hook

**File:** `src/hooks/useLocalStorage.js`

**Why?** Some values (like the username on the login form) should survive page refreshes without being part of the auth system. This hook works exactly like `useState` but automatically syncs to `localStorage`.

```js
import { useState, useEffect } from "react";

// Helper: get the value from localStorage (or fall back to initial value)
const getLocalValue = (key, initValue) => {
  // SSR safety check (for frameworks like Next.js)
  if (typeof window === "undefined") {
    return initValue;
  }

  // If value exists in localStorage, use it
  const localValue = JSON.parse(localStorage.getItem(key));
  if (localValue) return localValue;

  // Otherwise, use the initial value
  // (supports passing a function as initValue, like useState does)
  if (initValue instanceof Function) {
    return initValue();
  } else {
    return initValue;
  }
};

const useLocalStorage = (key, initValue) => {
  const [value, setValue] = useState(() => {
    return getLocalValue(key, initValue);
  });

  // Sync to localStorage every time the value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];  // Same API as useState
};

export default useLocalStorage;
```

**Usage:**
```js
// Instead of:  const [user, setUser] = useState("");
// Use:         const [user, setUser] = useLocalStorage("user", "");
```

Now `user` is automatically loaded from and saved to `localStorage["user"]`.

---

## Step 13: Wire Up Routes in App.js

**File:** `src/App.js`

**Why?** This is where you define which pages are public, which are protected, and which roles can access what.

### 13.1 — Define Role Constants

```js
const ROLES = {
  User: 2001,
  Editor: 1984,
  Admin: 5150,
};
```

These must match the role codes your **server** assigns. They're just numbers — the server and client must agree on them.

### 13.2 — Set Up the Route Structure

```jsx
function App() {
  return (
    <Routes>
      {/* Layout wrapper — every page renders inside <Layout /> */}
      <Route path="/" element={<Layout />}>

        {/* ─── PUBLIC ROUTES ─── */}
        {/* Anyone can access these, no auth needed */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="linkpage" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* ─── PROTECTED ROUTES ─── */}
        {/* Wrapped in PersistLogin → RequireAuth */}
        <Route element={<PersistLogin />}>

          {/* Only users with role 2001 (User) */}
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Only users with role 1984 (Editor) */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Editor]} />}>
            <Route path="editor" element={<Editor />} />
          </Route>

          {/* Only users with role 5150 (Admin) */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path="admin" element={<Admin />} />
          </Route>

          {/* Users with EITHER Editor OR Admin role */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Editor, ROLES.Admin]} />}>
            <Route path="lounge" element={<Lounge />} />
          </Route>

        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}
```

### 13.3 — How the Nesting Works

```
<Layout>                        ← Always renders (provides <main> wrapper)
  <PersistLogin>                ← Checks/restores session on load
    <RequireAuth allowedRoles>  ← Checks if user has the right role
      <Home />                  ← The actual page component
    </RequireAuth>
  </PersistLogin>
</Layout>
```

Each "layout route" (routes with `element` but no `path`) renders its child via `<Outlet />`. This creates a chain:
1. `Layout` renders `<Outlet />` → which renders `PersistLogin`
2. `PersistLogin` renders `<Outlet />` → which renders `RequireAuth`
3. `RequireAuth` renders `<Outlet />` → which renders `Home`

---

## Step 14: Use `useAxiosPrivate` in Protected Components

**File:** `src/components/Users.js` (used inside Admin page)

**Why?** When a protected component needs data from the server, it uses `useAxiosPrivate` instead of the regular axios. This ensures the access token is attached and refreshed automatically.

```js
import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiousPrivate";
import { useNavigate, useLocation } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState();
  const axiosPrivate = useAxiosPrivate();  // Axios with interceptors
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();  // For canceling the request on unmount

    const getUsers = async () => {
      try {
        const response = await axiosPrivate.get("/employees", {
          signal: controller.signal,   // Link to AbortController
        });
        isMounted && setUsers(response.data);
      } catch (err) {
        if (err.name === "CanceledError") {
          return;  // Ignore abort errors from cleanup
        }
        console.error(err);
        // If we get here, both access AND refresh tokens are expired
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    getUsers();

    return () => {
      isMounted = false;
      controller.abort();  // Cancel the request if component unmounts
    };
  }, []);

  return (
    <article>
      <h2>Users List</h2>
      {users?.length ? (
        <ul>
          {users.map((user, i) => (
            <li key={i}>{user?.username}</li>
          ))}
        </ul>
      ) : (
        <p>No users to display</p>
      )}
    </article>
  );
};
```

**What happens behind the scenes when `getUsers()` runs:**

```
axiosPrivate.get("/employees")
     │
     ▼
REQUEST INTERCEPTOR:
  "No Authorization header? Let me add: Bearer eyJhbG..."
     │
     ▼
Server checks the access token
     │
     ├── Token VALID → returns employee data → component renders the list
     │
     └── Token EXPIRED (403) →
              │
              ▼
         RESPONSE INTERCEPTOR:
           "Got a 403! Let me refresh..."
              │
              ▼
         Calls useRefreshToken → GET /refresh
              │
              ▼
         Server sends new access token
              │
              ▼
         Retries GET /employees with new token
              │
              ▼
         Component renders the list
```

**Why `AbortController`?** If the user navigates away from the page while the API call is still in progress, React unmounts the component. Without aborting, the response would come back and try to update state on an unmounted component. `controller.abort()` in the cleanup function prevents this.

---

## Complete Token Flow Diagram

```
═══════════════════════════════════════════════════════════════
                    REGISTRATION
═══════════════════════════════════════════════════════════════

  Register.js ──POST /register──► Server creates user
       │                              │
       └── Success? ──► Navigate to /login


═══════════════════════════════════════════════════════════════
                      LOGIN
═══════════════════════════════════════════════════════════════

  Login.js ──POST /auth──► Server validates credentials
       │                        │
       │                 Returns: { accessToken, roles }
       │                 Sets: HttpOnly cookie (refreshToken)
       │                        │
       └── setAuth({ user, pwd, roles, accessToken })
       └── Navigate to original page (from) or "/"


═══════════════════════════════════════════════════════════════
               MAKING A PROTECTED REQUEST
═══════════════════════════════════════════════════════════════

  Component ──axiosPrivate.get("/employees")──►
       │
  REQUEST INTERCEPTOR adds: Authorization: Bearer {accessToken}
       │
       ▼
  Server checks token
       │
       ├── 200 OK ──► Return data to component
       │
       └── 403 Forbidden (token expired) ──►
              │
         RESPONSE INTERCEPTOR catches 403
              │
         Calls refresh() ──GET /refresh──► Server checks cookie
              │                                  │
              │                           Returns: new accessToken
              │                                  │
              └── Retries original request with new token
                     │
                     └── 200 OK ──► Return data to component


═══════════════════════════════════════════════════════════════
              PAGE REFRESH (with persist = true)
═══════════════════════════════════════════════════════════════

  Page loads ──► React state is empty (auth = {})
       │
  PersistLogin mounts
       │
  No accessToken? ──► Calls refresh()
       │                    │
       │              GET /refresh with cookie
       │                    │
       │              Server returns new accessToken
       │                    │
       └── Auth context updated ──► Protected routes render


═══════════════════════════════════════════════════════════════
                      LOGOUT
═══════════════════════════════════════════════════════════════

  Home.js ──► useLogout()
       │
       ├── setAuth({})          ← Clear client state immediately
       │
       ├── GET /logout          ← Tell server to invalidate refresh token
       │                             Server clears the cookie
       │
       └── Navigate to /login
```

---

## File Structure Summary

```
client/src/
│
├── index.js                          [Step 4] Entry point — wraps app with BrowserRouter + AuthProvider
├── App.js                            [Step 13] Route definitions — public vs protected, role assignments
│
├── api/
│   └── axios.js                      [Step 1] Two Axios instances: default (public) + axiosPrivate (protected)
│
├── context/
│   └── AuthProvidor.js               [Step 2] Auth context — holds { user, roles, accessToken, persist }
│
├── hooks/
│   ├── useAuth.js                    [Step 3] Shortcut to access AuthContext
│   ├── useRefreshToken.js            [Step 7] GET /refresh → new access token
│   ├── useAxiousPrivate.js           [Step 8] Axios + interceptors (auto-attach token, auto-refresh on 403)
│   ├── useLogout.js                  [Step 11] Clear auth state + call server /logout
│   └── useLocalStorage.js            [Step 12] useState but synced to localStorage
│
└── components/
    ├── Layout.js                     Wrapper — renders <Outlet /> inside <main>
    ├── Register.js                   [Step 5] Registration form with real-time validation
    ├── Login.js                      [Step 6] Login form with "Trust This Device" checkbox
    ├── PersistLogin.js               [Step 10] Restores session silently on page refresh
    ├── RequireAuth.js                [Step 9] Route guard — checks user roles
    ├── Home.js                       Dashboard — has Sign Out button
    ├── Admin.js                      Admin page — contains <Users /> component
    ├── Editor.js                     Editor page
    ├── Lounge.js                     Mixed-role page (Editor OR Admin)
    ├── Users.js                      [Step 14] Fetches data using useAxiosPrivate
    ├── LinkPage.js                   Navigation hub (links to all pages)
    ├── Unauthorized.js               "You don't have access" page (wrong role)
    └── Missing.js                    404 page
```

---

## Security Summary

| Security Concern | How It's Handled |
|---|---|
| Where is the access token stored? | **React state (memory only)** — not in localStorage or sessionStorage. XSS can't steal it from memory as easily. |
| Where is the refresh token stored? | **HttpOnly cookie** — JavaScript cannot access it. Only the browser sends it automatically. |
| What if the access token is stolen? | It expires quickly (e.g., 15 min). Limited damage window. |
| What if someone skips RequireAuth? | The **server** also verifies the token and roles. Client-side protection is just UX — the real security is server-side. |
| What about CSRF attacks? | `withCredentials: true` + server-side origin/CORS validation. |
| What happens on logout? | Auth state cleared immediately + server invalidates the refresh token + cookie is cleared. |
