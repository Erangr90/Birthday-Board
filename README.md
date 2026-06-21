# Birthday Board

A small full-stack **Birthday Board** web app. Authenticated users can see who has a
birthday today, browse a paginated list of everyone's birthdays, search birthdays by
date, manage their own profile, and (as admins) manage all users.

---

## Notes before you run

- **Port `5173` must be free** on your machine — it is used by the client (frontend)
  side of the project. Make sure nothing else is using it before starting.
- Docker and Docker Compose must be installed and running.
- The App will run on `http://localhost:5173/'

---

## Security note about the `.env` file

I am aware that committing the `.env` file into the project is a security issue. I did
this intentionally to provide the **simplest possible interaction for running this
app** — so you can clone and run it without any manual environment setup.

## Run the app

From the project root, run:

```bash
docker compose up
```

---

## Viewing the database

To inspect the data directly, download **MongoDB Compass**
(https://www.mongodb.com/try/download/compass) and connect using the **connection
string** that is in the /api/.env file as "MONGO_URI". Paste that connection string into Compass to
browse the collections.

---

## Admin user

For login as admin:
- email: admin@birthdayboard.dev
- password: Admin1234!

---

## Technologies

**Frontend**
- React + Vite + TypeScript
- Redux Toolkit (shared state)
- Axios (HTTP client)
- Zod (client-side validation)
- React Router (routing + route guards)
- react-aria-components (accessible menus/popovers)

**Backend**
- Node.js + Express + TypeScript
- Layered architecture: routes → controllers → services → models → middleware
- Mongoose (MongoDB modeling/validation)
- Zod (server-side validation)
- Winston (logging)
- JWT in httpOnly cookies (authentication)
- Brevo (verification-code emails)
- node-cron (daily scheduled jobs)
- PM2 (`pm2-runtime`) in the production image

**Data**
- **MongoDB** is the persistent source of truth (via Mongoose).
- **Redis** is used *only* as a daily cache of the users who have a birthday today.
  It is warmed on startup and rebuilt by a cron job. If Redis is unavailable or stale,
  the app still reads correct data from MongoDB.

**Infrastructure**
- **Docker Compose** orchestrates `client`, `api`, and `redis`.
- The client (Vite preview) is the only public entry point and reverse-proxies `/api`
  to the internal-only API. MongoDB is external (configured via `MONGO_URI`).

---

## User interface features

- **Landing page** for guests, with **login** and **registration**.
- **Registration** is a multi-step flow: fill the form → the backend emails a 6-digit
  code → enter the code → the account is created and you are logged in.
- **Birthday Board (`/home`)** — a highlighted section/carousel for **today's
  birthdays**, plus a **paginated list** of everyone else with age and days until the
  next birthday.
- **Search (`/search`)** — find birthdays by **date range**, a **specific day**, or a
  **month**.
- **Profile (`/profile`)** — edit your own name, email, birth date, and password.
- **Manage users (`/manage-users`, admins only)** — list all users, create users, and
  delete users (with an optional email-suspension duration).
- **Route guards** redirect users based on authentication state and role.
- **Extras** — lazy-loaded routes (code splitting), an error boundary, loaders, and an
  **accessibility panel** (high contrast, large text, reduced motion, strong focus)
  with a skip-to-content link.

---

## Code / backend features

- **Authentication** — JWT access + refresh tokens stored in httpOnly cookies.
  Endpoints: `POST /auth/send-code`, `POST /auth` (register), `/auth/login`,
  `/auth/logout`, `/auth/refresh`, `GET /auth/me`. The Axios client transparently
  refreshes expired tokens, and sessions are revalidated when the tab regains focus.
  Roles: `USER` and `ADMIN`.
- **Users / birthdays** — `/users/today`, `/users` (all, excluding today),
  `/users/range`, `/users/birthday`, `/users/admin`, `PATCH /users/me`,
  `POST /users` (admin create), `DELETE /users/:id` (admin). **All list endpoints are
  paginated on the server** and return a consistent `{ users, pagination }` shape.
- **Three-layer validation** — Zod on the client, Zod on the server (bodies, params,
  query), and Mongoose schema constraints at the database level.
- **Today's-birthday logic** — a birthday is "today" when its month and day match the
  current date (independent of birth year), with consistent timezone handling and the
  Redis cache described above.
- **Cross-cutting concerns** — centralized error-handling middleware, request context,
  email suspension, and seed scripts for usable demo data.

---

## Log files

The backend writes logs with **Winston**, and these log files are available inside the
project. In the Docker setup the API container's `logs` directory is mounted to
**`api/logs/`** on your machine, so you can open the analytics/operation log files
there to see API, MongoDB, and Redis operations (successes and failures). No passwords,
tokens, cookies, or private personal data are written to these logs.

---

