# CampusGigs

CampusGigs is a micro-job matching simulator for campus managers and student workers. A manager posts a short-term campus gig, the backend ranks five mock student candidates, and the frontend shows a live leaderboard with an assign action.

## Tech Stack

- Next.js for the frontend dashboard
- NestJS for the backend API
- TypeScript across the workspace
- Supabase-ready data model and environment placeholders
- Tailwind CSS for styling

## Setup Instructions

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create your local environment files from the examples.
   - Root: `.env.example`
   - Frontend: `apps/web/.env.example`
   - Backend: `apps/api/.env.example`

3. Start the development servers.

   ```bash
   npm run dev --workspace @campusgigs/web
   npm run dev --workspace @campusgigs/api
   ```

   The frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:4000`.

4. Build the workspace when you want a production check.

   ```bash
   npm run build --workspaces --if-present
   ```

## Project Layout

- `apps/web` - Next.js dashboard for posting gigs and reviewing ranked candidates.
- `apps/api` - NestJS service that simulates AI matching and assignment flow.

## Screenshots or Demo Links
