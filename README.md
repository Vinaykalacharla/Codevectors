# CodeVector Backend Assignment

This repository contains the backend implementation for the CodeVector ~200,000 product pagination assignment.

## Architecture & Technical Decisions

### 1. The Concurrency Problem & Keyset Pagination
The prompt explicitly required: *"If 50 new products are added/updated while someone is browsing, they must not see the same product twice or miss one."*

Standard `OFFSET X LIMIT Y` pagination completely fails this requirement. If you are on Page 1 (items 1-50) and 50 new items are inserted, all original items are pushed to positions 51-100. When fetching Page 2 (`OFFSET 50`), the user will see the exact same items they just saw.

**Solution:** I implemented strict **Cursor-based (Keyset) Pagination**. By using the tuple `(created_at, id)`, the database queries for items *older* than the last seen item. This locks the pagination to the data itself, completely immunizing the feed against concurrent insertions. 

### 2. Performance & High-Speed Seeding
- **Database Indexing:** Added a composite index on `(category, created_at DESC, id DESC)` to guarantee `O(1)` query speeds regardless of how deep the user paginates.
- **Seeding Script (`seed.js`):** The assignment requested not to use a slow loop. The seed script chunks the 200,000 rows into massive batch inserts (5,000 rows per query), reducing network round-trips and populating the database in seconds.
- **Raw SQL:** Built using the `pg` driver to maintain absolute control over the complex tuple-comparison logic and minimize overhead, avoiding bloated ORMs.

## Project Structure
- `backend/server.js`: The Express.js backend containing the pagination logic.
- `backend/db.js`: PostgreSQL connection pool setup.
- `backend/seed.js`: The high-performance data generation script.
- `backend/add_50.js`: A simple utility to inject 50 new products to live-test the concurrency requirements.
- `frontend/index.html`: A vanilla JS/CSS frontend to visually verify the backend pagination.

## How to Run Locally

1. Create a PostgreSQL database (e.g., Neon DB, Supabase).
2. Inside the `backend` directory, copy `.env.example` to `.env` and provide your `DATABASE_URL`.
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Seed the database (Generates 200k rows instantly):
   ```bash
   node seed.js
   ```
5. Start the server:
   ```bash
   node server.js
   ```
6. Open `http://localhost:3000` in your browser.

## Testing Concurrency
To prove the cursor pagination handles live data correctly:
1. Open the UI and navigate to Page 3.
2. In a separate terminal, navigate to the `backend` folder and run `node add_50.js`.
3. Click "Next Page" or "Previous Page" in the UI. Notice that no items shift or duplicate.
4. Navigate back to Page 1, and the new item will flawlessly appear at the top.
