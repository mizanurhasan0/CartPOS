# CartPOS

A multi-store point-of-sale (POS) and inventory system with role-based access, realtime updates and a responsive, minimal UI.

- **Frontend:** React 19, Vite, Tailwind CSS, Redux Toolkit (`pos-frontend/`)
- **Backend:** Node.js, Express 5, Mongoose, Socket.IO (`pos-system-backend/`)
- **Database:** MongoDB (run it in Docker or use MongoDB Atlas)

## Roles

| Role | What they can do |
|---|---|
| **Superadmin** | Create and manage organizations (stores) and their admins; platform dashboard. |
| **Admin** | Run one store: dashboard, users, inventory (add / edit / restock), sales, bills and refunds, history, accounts, settings. |
| **User (cashier)** | Sell (POS screen), look up bills and stock (read-only, no cost prices), manage own profile. |

Permissions are enforced on the API (not only hidden in the UI).

## Quick start

### 1. Database (MongoDB in Docker)

```bash
docker run -d --name cartpos-db -p 127.0.0.1:27017:27017 \
  -v cartpos-db-data:/data/db \
  -v "$PWD/pos-system-backend/db/init:/docker-entrypoint-initdb.d:ro" \
  mongo:8
```

The init script creates a first superadmin (`superadmin@pos.local`). **Change its password after the first login.**

### 2. Backend

```bash
cd pos-system-backend
cp .env.example .env        # set JWT_SECRET (and MONGODB_URL if not local)
yarn install
npm run dev                 # http://localhost:4000
```

### 3. Frontend

```bash
cd pos-frontend
cp .env.example .env
yarn install
yarn dev                    # http://localhost:5173
```

## Demo data (optional)

With `MONGODB_URL` pointing at an empty database, run from `pos-system-backend/`:

```bash
node db/seed-users.cjs      # superadmin, admin, user + a store
node db/seed-products.cjs   # categories and products
node db/seed-images.cjs     # product photos (Wikimedia Commons, credits in db/image-credits.json)
node db/seed-all.cjs        # extra stores/users, bills, history and expenses
```

To show a "Demo accounts" table on the login page, set `VITE_DEMO_LOGINS` in `pos-frontend/.env` (see `.env.example`). Never enable it on a public deployment.

## Configuration

| File | Purpose |
|---|---|
| `pos-system-backend/.env` | `JWT_SECRET`, `MONGODB_URL`, `PORT`, `CORS_ORIGIN`, SMTP settings. **Never commit.** |
| `pos-frontend/.env` | `VITE_SERVER_URL`, `VITE_APP_SOCKET_URL`, optional `VITE_DEMO_LOGINS`. |

## Third-party notes

- The backend started from an MIT-licensed boilerplate; its `LICENSE` is kept in `pos-system-backend/LICENSE`.
- Charts use [ApexCharts](https://apexcharts.com), which is free only for organizations under US$2M annual revenue; check its license for your use.
- Demo product photos come from Wikimedia Commons under their individual licenses (see `pos-system-backend/db/image-credits.json`).
