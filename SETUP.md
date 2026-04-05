# 🐾 Positive Paws — Setup & Deployment Guide

## 1. Push to GitHub

Run these commands in your terminal from the `positive-paws` folder:

```bash
cd positive-paws

# Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit: Positive Paws dog training app"
git branch -M main
git remote add origin https://github.com/charlesmmelazzo-del/positive-paws.git
git push -u origin main
```

> You'll need to first create the repo at: https://github.com/new
> - Repository name: `positive-paws`
> - Visibility: Public or Private (your choice)
> - Do NOT initialize with README (we already have files)

---

## 2. Set Up Railway

Once pushed to GitHub, go to [Railway](https://railway.app):

1. **Create a new project** → "Deploy from GitHub repo" → select `positive-paws`
2. **Add a PostgreSQL database**: "New" → Database → PostgreSQL
3. **Set environment variables** on your web service:

```
DATABASE_URL=<auto-filled by Railway when you link the Postgres service>
JWT_SECRET=<generate a random string - use: openssl rand -base64 32>
NODE_ENV=production
CLIENT_URL=<your Railway app URL, e.g. https://positive-paws.up.railway.app>
PORT=5000
```

---

## 3. Run Migrations & Seed Data

After Railway deploys successfully, run these one-time commands.

**Option A — Railway CLI:**
```bash
railway run npm run migrate
railway run npm run seed
```

**Option B — Railway Dashboard:**
In your service settings → "Run Command" → paste each command.

---

## 4. Admin Login

After seeding:
- **Email:** `Mikemelazzo@me.com`
- **Password:** `PositivePaws2024!`

> ⚠️ Change your password after first login!

---

## 5. Local Development

```bash
# Install all dependencies
cd positive-paws
npm install --prefix server
npm install --prefix client

# Copy and fill in your env file
cp server/.env.example server/.env

# Run both simultaneously (two terminals):
npm run dev:server   # starts Express on port 5000
npm run dev:client   # starts Vite on port 5173
```

Local `.env` example:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/positive_paws
JWT_SECRET=local_dev_secret_change_me
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PORT=5000
```

---

## App Architecture

```
positive-paws/
├── client/          React + Vite frontend
│   └── src/
│       ├── pages/   14 page components
│       ├── context/ AuthContext (JWT auth)
│       └── utils/   axios API client
├── server/          Node.js + Express backend
│   └── src/
│       ├── routes/  REST API endpoints
│       ├── db/      PostgreSQL connection, migrations, seed
│       └── middleware/ JWT auth middleware
├── nixpacks.toml    Railway build config
└── railway.json     Railway deploy config
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/dogs | All dogs |
| GET | /api/dogs/my | User's dogs |
| POST | /api/dogs | Create dog |
| POST | /api/dogs/:id/connect | Link to existing dog |
| POST | /api/dogs/:id/logs | Log training session |
| GET | /api/courses | All courses |
| GET | /api/courses/:id | Course + lessons |
| GET | /api/courses/lessons/:id | Lesson + quiz |
| POST | /api/courses/lessons/:id/complete | Mark complete |
| POST | /api/courses/quizzes/:id/submit | Submit quiz |
| GET | /api/scenarios | All scenarios |
| GET | /api/scenarios/:id | Scenario + tips |
| GET | /api/leaderboard/users | User rankings |
| GET | /api/leaderboard/dogs | Dog rankings |
| GET | /api/admin/stats | Admin overview |
| GET | /api/admin/users | User management |
