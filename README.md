# TaskFlow — QA Automation Interview Project

Welcome! This repository contains a self-contained full-stack web application you will use as the basis for your QA automation interview.

You do **not** need to build anything from scratch. The app is already running — your job is to explore it, think critically about its testability, and prepare to write automation tests during the interview that demonstrate your skills and thinking.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18 + Vite (port `5173`)                   |
| Backend   | Node.js + Express, in-memory store (port `3001`)|
| Test tool | Playwright                                      |

---

## Quick Start

### Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- A terminal and a code editor

### 1. Clone and install

```bash
git clone https://github.com/DAMALogic/qa-interview-starter.git
cd qa-interview-starter
npm run install:all
```

### 2. Start the application

```bash
npm start
```

This starts both the backend API and the React frontend concurrently. Open **http://localhost:5173** in your browser.

### 3. Log in

| Username | Password    |
|----------|-------------|
| admin    | password123 |
| tester   | tester123   |

### 4. Run the existing tests

```bash
npm test
```

Playwright will start the servers automatically and execute all specs. To open the interactive Playwright UI instead:

```bash
npm run test:ui
```

To view the HTML report after a headless run:

```bash
cd tests && npm run test:report
```

---

## What the App Does

**TaskFlow** is a task management tool with the following features:

- **Authentication** — login, logout, and session management
- **Task list** — view all tasks with priority badges and due dates
- **Add / edit / delete tasks** — full CRUD via the UI
- **Complete tasks** — toggle tasks between active and completed
- **Filter tabs** — All / Active / Completed views
- **Search** — filter tasks by title in real time
- **Active count** — live counter of remaining tasks
- **User profile** — update your display name and change your password

---

## Project Structure

```
qa-interview-starter/
├── server/                     # Node.js / Express API (port 3001)
│   ├── index.js
│   └── routes/
│       ├── auth.js             # Login, logout, session
│       ├── tasks.js            # Task CRUD
│       └── users.js            # Profile & password
│
├── client/                     # React + Vite frontend (port 5173)
│   └── src/
│       ├── App.jsx             # Root component, navigation
│       ├── api.js              # Fetch wrapper for all API calls
│       └── components/
│           ├── Login.jsx
│           ├── TaskBoard.jsx
│           ├── TaskForm.jsx
│           ├── TaskItem.jsx
│           └── ProfilePage.jsx
│
└── tests/                      # Playwright test suite
    ├── playwright.config.js
    ├── pages/                  # Page Object Models (starter)
    │   ├── LoginPage.js
    │   └── TaskPage.js
    └── specs/                  # Starter specs (extend these)
        ├── auth.spec.js
        ├── tasks.spec.js
        └── api.spec.js
```

Every interactive element in the UI includes a `data-testid` attribute so your Playwright selectors stay decoupled from CSS and DOM structure.

---

## The Challenge

### What's already provided

- A fully working application with two user accounts and seeded task data
- A Playwright configuration with `webServer` entries — tests start the app for you
- Starter specs in `tests/specs/` covering a handful of happy-path scenarios
- Page Object Models in `tests/pages/` demonstrating one possible structure
- `// TODO (candidate):` comments throughout the specs pointing to untested areas

### What we'd like you to do

**Before the interview**, spend time exploring the app and extending the test suite. Think about:

1. **Coverage** — Which flows, edge cases, and error states are missing from the starter specs?
2. **API testing** — Can you validate the REST contract independently of the UI?
3. **Test design** — How do you keep tests fast, isolated, and maintainable?
4. **Observations** — Did you spot any behaviour that seems wrong or inconsistent?

There is no single correct answer. We are more interested in *how* you think than in hitting a specific number of tests.

---

## API Reference

All endpoints are served from `http://localhost:3001/api`. The Vite dev server proxies `/api` requests automatically, so you can also call them at `http://localhost:5173/api` during local development.

Authenticated endpoints require the header `x-auth-token: <token>` obtained from the login response.

### Auth

| Method | Endpoint        | Body                           | Response              |
|--------|-----------------|--------------------------------|-----------------------|
| POST   | `/auth/login`   | `{ username, password }`       | `{ token, username }` |
| POST   | `/auth/logout`  | *(header only)*                | `{ message }`         |
| GET    | `/auth/me`      | *(header only)*                | `{ username }`        |

### Tasks *(auth required)*

| Method | Endpoint      | Body / Query                                         | Response      |
|--------|---------------|------------------------------------------------------|---------------|
| GET    | `/tasks`      | `?status=all\|active\|completed` `&search=<string>`  | `Task[]`      |
| POST   | `/tasks`      | `{ title, priority?, dueDate? }`                     | `Task`        |
| PUT    | `/tasks/:id`  | `{ title?, priority?, dueDate?, completed? }`        | `Task`        |
| DELETE | `/tasks/:id`  | —                                                    | `{ message }` |

### User Profile *(auth required)*

| Method | Endpoint                  | Body                                                   | Response      |
|--------|---------------------------|--------------------------------------------------------|---------------|
| GET    | `/users/profile`          | —                                                      | `UserProfile` |
| PUT    | `/users/profile`          | `{ displayName }`                                      | `UserProfile` |
| PUT    | `/users/profile/password` | `{ currentPassword, newPassword, confirmPassword }`    | `{ message }` |

### Schemas

**Task**
```json
{
  "id":        "uuid",
  "title":     "string",
  "priority":  "Low | Medium | High",
  "dueDate":   "YYYY-MM-DD | null",
  "completed": "boolean",
  "createdAt": "ISO 8601"
}
```

**UserProfile**
```json
{
  "id":          "string",
  "username":    "string",
  "displayName": "string"
}
```

---

## Tips

- The `data-testid` attributes on UI elements are stable — prefer them over CSS selectors or text content for locators.
- The backend uses an **in-memory data store** that resets on restart. Think about how this affects test isolation and setup/teardown strategy.
- Both the UI and the API are fair game — senior QA engineers are expected to test at multiple layers.
- If something in the app looks off, make a note. That's part of the exercise.

Good luck, and feel free to reach out if you have any setup issues before the interview.
