# CodeVector

CodeVector is a full-stack product browsing demo built to solve a common pagination problem in real-world applications: keeping results stable even when new records are inserted during browsing.

The project uses cursor-based pagination with PostgreSQL, along with a lightweight frontend to visualize the behavior in real time.

## Overview

This application demonstrates how to paginate large datasets without the common issues caused by offset-based pagination. When new products are added while a user is browsing, cursor-based pagination ensures that the user does not see duplicate items or skip products unexpectedly.

## Key Features

- Stable, cursor-based pagination for large product lists
- High-performance seeding of 200,000 sample products
- Live insertion of new products to test pagination behavior
- REST API endpoints for product, category, and count data
- Simple frontend interface for visual testing

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg (Node PostgreSQL driver)
- dotenv
- Vanilla JavaScript and HTML/CSS

## Project Structure

- [backend/server.js](backend/server.js) — Express server and pagination API
- [backend/db.js](backend/db.js) — PostgreSQL connection pool setup
- [backend/seed.js](backend/seed.js) — Script to generate and seed 200,000 sample products
- [backend/add_50.js](backend/add_50.js) — Adds 50 new products to test live pagination behavior
- [frontend/index.html](frontend/index.html) — Frontend UI for browsing products

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- A PostgreSQL database available
- A valid database connection URL

## Setup

1. Clone the repository and navigate to the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your environment variables in [backend/.env](backend/.env) by setting a valid `DATABASE_URL`.

## Run the Project

From the project root, use the following commands:

### Start the backend server

```bash
npm run start
```

### Seed the database with sample products

```bash
npm run seed
```

### Insert 50 new products to test live updates

```bash
npm run add-50
```

Once the server is running, open:

```text
http://localhost:3000
```

## API Endpoints

- `GET /api/products` — returns paginated products
- `GET /api/products/count` — returns total product count
- `GET /api/categories` — returns available categories

You can pass query parameters such as `limit`, `cursor`, and `category` to the products endpoint.

## Why Cursor Pagination?

Offset-based pagination can break when new rows are inserted between requests. Cursor-based pagination avoids this by ordering records using a stable key tuple such as `(created_at, id)` and fetching items after the last seen row.

## Testing the Concurrency Behavior

To observe the pagination behavior in action:

1. Open the app in the browser.
2. Navigate to a later page.
3. In another terminal, run `npm run add-50`.
4. Continue browsing and notice that products remain consistent without duplicates or missing entries.

## Notes

The project is designed to work with services such as Supabase, Neon, or any other PostgreSQL provider that supports SSL connections.
