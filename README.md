# Company Management Records

Production-ready full-stack app to upload CSV files of company records, store them in MongoDB Atlas, and view / search / filter / export them.

> **Live Demo:** https://company-records.netlify.app
>
> _Single URL — frontend (Netlify) proxies `/api` to the backend (Render) which connects to MongoDB Atlas. First load may take ~50s while the free-tier API wakes up._

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router DOM, React Hook Form, React Toastify, TanStack Table, Heroicons

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Multer, csv-parser, Cors, dotenv, Helmet, Morgan, Compression, express-rate-limit

## Project Structure

```
mongodb_project/
├── backend/
│   ├── config/db.js
│   ├── controllers/recordController.js
│   ├── middlewares/ (upload, errorHandler, asyncHandler, rateLimiter)
│   ├── models/Record.js
│   ├── routes/ (recordRoutes, uploadRoutes)
│   ├── uploads/
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  pages/  hooks/  services/
    │   ├── context/  layouts/  utils/
    │   ├── App.jsx  main.jsx  index.css
    ├── index.html
    └── package.json
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and add your MongoDB Atlas connection string:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/company_management?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` to the backend automatically.

## CSV Format

Headers (case-insensitive, common variants supported):

```
id,name,address,phone,recordNo
```

A sample file is provided at `backend/sample-data.csv`. `name` and `recordNo` are required per row; duplicate `recordNo` values are skipped.

## API Endpoints

| Method | Endpoint               | Description                                  |
| ------ | ---------------------- | -------------------------------------------- |
| POST   | `/api/upload`          | Upload & parse a CSV file (multipart `file`) |
| GET    | `/api/records`         | List records (`page`, `limit`, `search`)     |
| GET    | `/api/records/stats`   | Dashboard statistics                         |
| GET    | `/api/records/:id`     | Get a single record                          |
| PUT    | `/api/records/:id`     | Update a record                              |
| DELETE | `/api/records/:id`     | Delete a record                              |
| DELETE | `/api/records`         | Delete all records                           |

## Features

- CSV upload with drag & drop, progress bar and duplicate detection
- Searchable, sortable, paginated records table (TanStack Table)
- View / Edit / Delete records, plus CSV export
- Dashboard with live stats
- Dark mode, toast notifications, confirmation modals, skeleton loaders, empty states
- Security: Helmet, CORS, compression, rate limiting, 10 MB file limit, `.csv`-only uploads
- Centralized error handling (404, validation, Mongoose & Multer errors)

## Production Build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

Set `frontend/.env` `VITE_API_BASE_URL` to your deployed API URL when hosting separately.

## Deployment

This app deploys in three independent parts (all have free tiers):

| Part | Host | Notes |
| --- | --- | --- |
| Database | MongoDB Atlas | Already set up (M0 free cluster) |
| Backend API | Render | Root dir `backend`, build `npm install`, start `npm start` |
| Frontend | Vercel or Netlify | Root dir `frontend`, build `npm run build`, output `dist` |

### Backend env vars (set in Render dashboard)
```
MONGO_URI   = your Atlas connection string
CLIENT_URL  = your deployed frontend URL (for CORS)
NODE_ENV    = production
```

### Frontend env var (set in Vercel/Netlify dashboard)
```
VITE_API_BASE_URL = https://your-backend.onrender.com/api
```

> **Note:** On Render's free tier the API sleeps after ~15 min of inactivity and takes ~50s to wake on the first request (cold start). This is normal for free hosting.
