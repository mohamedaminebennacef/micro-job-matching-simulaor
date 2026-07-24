# Deployment Guide

## Architecture

```
Vercel (Frontend)  ──>  Render (Backend API)  ──>  Supabase (PostgreSQL)
  Next.js                NestJS                       Database
```

## Prerequisites

- GitHub repository with the code pushed
- [Supabase](https://supabase.com) project with a database created
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- [Groq](https://console.groq.com) API key (free tier, no card required)

---

## Step 1: Supabase (Database)

1. Go to your Supabase project dashboard
2. Navigate to **Settings > Database**
3. Copy the **Pooler** connection string (Transaction mode, IPv4)
4. It looks like: `postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

---

## Step 2: Render (Backend API)

### Create Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `campusgigs-api`
   - **Region:** US East (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Runtime:** Node
   - **Build Command:**
     ```
     npm install && npx prisma generate --schema=apps/api/prisma/schema.prisma && npm run build --workspace @campusgigs/api
     ```
   - **Start Command:**
     ```
     node apps/api/dist/main.js
     ```
   - **Note:** `prisma migrate deploy` is excluded from the start command because it hangs on Render's free tier (Supabase pooler connection). The DB schema should already exist from development (`prisma db push`). To run migrations manually later, use Render Shell: `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`
   - **Plan:** Free

### Environment Variables

Add these in the Render dashboard under **Environment**:

| Key | Value |
|-----|-------|
| `PORT` | `4000` |
| `DATABASE_URL` | Your Supabase pooler connection string |
| `GROQ_API_KEY` | Your Groq API key |
| `LLM_PROVIDER` | `groq` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (replace after Vercel deploy) |
| `JWT_SECRET` | A random string (e.g., `openssl rand -hex 32`) |

### Verify

After deployment, visit:
```
https://campusgigs-api.onrender.com/api/health
```

Expected response:
```json
{ "ok": true, "service": "campusgigs-api", "db": "connected" }
```

Also test Swagger docs:
```
https://campusgigs-api.onrender.com/docs
```

---

## Step 3: Vercel (Frontend)

### Create Project

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** > **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/web`
   - **Build Command:** (leave default, or set to `npm run build`)
   - **Install Command:** `npm install`

### Environment Variables

Add these in the Vercel dashboard under **Settings > Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://campusgigs-api.onrender.com` |

### Deploy

Click **Deploy**. Vercel will build and deploy automatically.

### Verify

Visit your Vercel URL. The app should load and display the gig creation form.

---

## Step 4: Update CORS

After Vercel deploys, you'll have a URL like `https://campusgigs-xxxx.vercel.app`.

1. Go to Render dashboard > campusgigs-api > **Environment**
2. Update `CORS_ORIGIN` to your actual Vercel URL
3. Save changes (Render will auto-redeploy)

---

## Step 5: GitHub Actions CI

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

It runs on every push to `main` and on pull requests:

1. Installs dependencies
2. Generates Prisma client
3. Typechecks both apps
4. Lints both apps
5. Builds both apps

No test step exists yet (no test framework in the project).

---

## Production Verification Checklist

### Backend (Render)

- [ ] Health check returns 200 with `"db": "connected"`:
  ```
  GET https://campusgigs-api.onrender.com/api/health
  ```
- [ ] Swagger docs are accessible:
  ```
  GET https://campusgigs-api.onrender.com/docs
  ```
- [ ] Sign up a manager:
  ```
  POST https://campusgigs-api.onrender.com/api/auth/signup
  Content-Type: application/json

  {
    "email": "test-manager@university.edu",
    "password": "password123",
    "role": "MANAGER"
  }
  ```
- [ ] Sign in and receive JWT:
  ```
  POST https://campusgigs-api.onrender.com/api/auth/signin
  Content-Type: application/json

  {
    "email": "test-manager@university.edu",
    "password": "password123"
  }
  ```
- [ ] Create a gig (with Bearer token):
  ```
  POST https://campusgigs-api.onrender.com/api/gigs
  Content-Type: application/json
  Authorization: Bearer <token>

  {
    "title": "Help moving lab equipment",
    "description": "Move boxes from Science Hall to storage",
    "location": "Science Hall, Room 204",
    "durationHours": 2,
    "hourlyRate": 18
  }
  ```
- [ ] Response includes ranked candidates with match percentages
- [ ] CORS allows requests from your Vercel domain

### Frontend (Vercel)

- [ ] Landing page loads at `/`
- [ ] Login page loads at `/login`
- [ ] Sign up page loads at `/signup` with role selector
- [ ] Manager dashboard loads at `/manager` (after login as manager)
- [ ] Student dashboard loads at `/student` (after login as student)
- [ ] Gig creation form works at `/manager/gigs/create`
- [ ] Profile editing works at `/student/profile`

### CI (GitHub Actions)

- [ ] Workflow runs on push to main
- [ ] All steps pass (typecheck, lint, build)

---

## Troubleshooting

### Health check returns 503
- Verify `DATABASE_URL` is correct in Render
- Check that Supabase allows connections from Render's IP
- Ensure the connection string uses the **pooler** (port 6543), not direct connection

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_BASE_URL` is set in Vercel
- Verify `CORS_ORIGIN` in Render matches your Vercel URL exactly (including `https://`)
- Note: Vercel env vars with `NEXT_PUBLIC_` prefix are baked in at build time — you must redeploy after changing them

### Render sleeps after inactivity
- Free tier spins down after 15 minutes of no traffic
- First request takes ~50 seconds to wake up
- This is expected for a demo/internship project
- Consider upgrading to a paid plan for production use

### Build fails on Render
- Check build logs for errors
- Ensure `prisma generate` runs before `tsc` (the build script handles this)
- Verify all environment variables are set

---

## Environment Variables Summary

### Render (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (use `4000`) |
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string |
| `GROQ_API_KEY` | Yes | Groq API key for AI matching |
| `LLM_PROVIDER` | Yes | `groq` for production, `mock` for testing |
| `CORS_ORIGIN` | Yes | Your Vercel frontend URL |
| `JWT_SECRET` | Yes | Random secret for JWT signing (use `openssl rand -hex 32`) |

### Vercel (Frontend)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API URL (e.g., `https://campusgigs-api.onrender.com`) |
