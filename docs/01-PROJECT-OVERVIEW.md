# 01 — Project Overview & Architecture

> **One-line pitch (memorize this):**
> "I built a full-stack web application called **Company Management Records** that lets users upload CSV files of company data, stores them in a MongoDB cloud database, and provides a searchable, sortable, paginated dashboard to view, edit, delete and export those records."

---

## 1. What problem does it solve?

Companies often receive data in **CSV (spreadsheet)** files — lists of records like company names, addresses, phone numbers, and record IDs. Manually entering thousands of these rows into a system is slow and error-prone.

This application automates that:
- **Upload** a CSV → the system reads every row automatically.
- **Stores** clean data in a database (skipping duplicates).
- **Displays** the data in a professional dashboard where you can search, filter, sort, edit, delete, and export.

This is a classic **CRUD application** (Create, Read, Update, Delete) combined with **bulk data ingestion** — exactly the kind of system used in data-entry, CRM, and admin tools.

---

## 2. The "MERN-style" stack (what each piece does)

This is a **MERN-style** application. MERN = **M**ongoDB, **E**xpress, **R**eact, **N**ode.js.

| Layer | Technology | Plain-English Job |
| --- | --- | --- |
| **Database** | MongoDB Atlas | Cloud storage where all records live permanently |
| **Backend** | Node.js + Express | The "server" / "brain" that talks to the database and answers requests |
| **Frontend** | React + Vite | The website/UI that the user clicks around in |
| **Styling** | Tailwind CSS | Makes the UI look professional |

### Think of it like a restaurant:
- **Frontend (React)** = the dining area & menu the customer sees.
- **Backend (Express)** = the waiter who takes your order and brings food.
- **Database (MongoDB)** = the kitchen pantry where all ingredients (data) are stored.
- **API** = the language the waiter and kitchen use to communicate.

---

## 3. High-level architecture diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                          │
│                                                                │
│   React Frontend (Vite + Tailwind CSS)                         │
│   - Dashboard, Upload, Records, Edit, Settings pages           │
│   - Talks to backend using "Axios" over HTTP                   │
└───────────────────────────┬────────────────────────────────────┘
                            │  HTTP requests (JSON / file upload)
                            │  e.g. GET /api/records?page=1
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  BACKEND SERVER (Node.js + Express)            │
│                                                                │
│   - Receives requests on routes like /api/upload, /api/records │
│   - Security: Helmet, CORS, Rate limiting                      │
│   - Multer: handles the uploaded CSV file                      │
│   - csv-parser: reads CSV rows into JavaScript objects         │
│   - Mongoose: translates JS objects ↔ database documents       │
└───────────────────────────┬────────────────────────────────────┘
                            │  Mongoose queries (find, insertMany...)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  MONGODB ATLAS (Cloud Database)               │
│                                                                │
│   Database: company_management                                 │
│   Collection: company_management_records                       │
│   Documents: { id, name, address, phone, recordNo, ... }       │
└──────────────────────────────────────────────────────────────┘
```

**Memorize the data flow sentence:**
"The React frontend sends an HTTP request via Axios → Express receives it on a route → Mongoose runs a query against MongoDB Atlas → the result travels back as JSON → React renders it on screen."

---

## 4. The folder structure (and why it's organized this way)

The project is split into two independent applications: `backend/` and `frontend/`. This is called **separation of concerns** — each side can be developed, tested, and deployed independently.

```
mongodb_project/
├── backend/                  ← The server (Node.js + Express)
│   ├── config/
│   │   └── db.js             ← Connects to MongoDB
│   ├── models/
│   │   └── Record.js         ← Defines the shape of a record (schema)
│   ├── controllers/
│   │   └── recordController.js ← The actual logic (what happens on each request)
│   ├── routes/
│   │   ├── recordRoutes.js   ← Maps URLs to controller functions
│   │   └── uploadRoutes.js
│   ├── middlewares/
│   │   ├── upload.js         ← File-upload handling (Multer)
│   │   ├── errorHandler.js   ← Catches and formats all errors
│   │   ├── asyncHandler.js   ← Removes repetitive try/catch
│   │   └── rateLimiter.js    ← Prevents abuse (too many requests)
│   ├── uploads/              ← Temporary storage for uploaded files
│   ├── scripts/
│   │   └── generateCsv.js    ← Generates sample test data
│   ├── server.js             ← The entry point (starts everything)
│   ├── .env                  ← Secret config (DB password) — never shared
│   └── package.json          ← Lists backend dependencies
│
└── frontend/                 ← The website (React + Vite)
    ├── src/
    │   ├── components/        ← Reusable UI pieces (buttons, tables, cards)
    │   ├── pages/             ← Full screens (Dashboard, Upload, etc.)
    │   ├── hooks/             ← Reusable logic (useRecords)
    │   ├── context/           ← Global state (theme, records)
    │   ├── services/          ← Code that calls the backend API
    │   ├── layouts/           ← Page shell (sidebar + navbar)
    │   ├── utils/             ← Helper functions (date formatting, CSV export)
    │   ├── App.jsx            ← Defines all the routes/pages
    │   └── main.jsx           ← The entry point that mounts React
    ├── index.html
    └── package.json           ← Lists frontend dependencies
```

**Interview tip:** When asked "How did you structure your project?", say:
> "I followed a **layered / clean architecture**. On the backend I separated **routes** (URL definitions), **controllers** (business logic), **models** (data schema), and **middlewares** (cross-cutting concerns like auth, errors, file uploads). On the frontend I separated **pages**, reusable **components**, **services** for API calls, and **hooks/context** for state. This makes the code scalable and easy to maintain."

---

## 5. The complete feature list

**Core features:**
- CSV file upload with drag-and-drop and progress bar
- Automatic CSV parsing and bulk insert into the database
- Duplicate detection (skips records that already exist by `recordNo`)
- Paginated, searchable, sortable records table
- View / Edit / Delete individual records
- Delete all records
- Export records to CSV
- Dashboard with live statistics and per-company breakdown

**Polish / UX features:**
- Dark mode toggle
- Toast notifications (success/error popups)
- Confirmation modals (before destructive actions)
- Loading spinners and skeleton loaders
- Empty states (friendly messages when no data)
- Fully responsive (works on mobile, tablet, desktop)

**Production / engineering features:**
- Security: Helmet, CORS, rate limiting, file-type & file-size validation
- Centralized error handling (404, validation, database errors)
- Environment variables for secrets
- Clean, layered, scalable architecture

---

## 6. How to run the project (demo script for interviews)

```bash
# 1. Start the backend
cd backend
npm install          # installs dependencies (one time)
npm run dev          # starts server on http://localhost:5000

# 2. Start the frontend (in a second terminal)
cd frontend
npm install          # one time
npm run dev          # starts UI on http://localhost:5173
```

Then open `http://localhost:5173` in the browser.

**The only configuration needed** is the MongoDB connection string in `backend/.env`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/company_management
```

---

## 7. Why this project is good for a Data Analysis / Frontend resume

- **Frontend angle:** Demonstrates React, component design, state management, responsive UI, data tables with sorting/filtering/pagination — core frontend skills.
- **Data angle:** Demonstrates data ingestion (CSV → database), data cleaning (deduplication, validation), querying (search/filter/aggregation), and data export — the full data pipeline.
- **Full-stack credibility:** Shows you understand how data moves end-to-end, which makes you stand out as a fresher.
