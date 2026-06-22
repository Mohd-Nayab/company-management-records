# 05 — Data Flow, Interview Q&A, and Resume Guide

This is your **interview playbook**. Practice answering these out loud.

---

## 1. End-to-end data flow walkthroughs (tell these as stories)

### Story A: "What happens when I upload a CSV?"
1. User drags a `.csv` file onto the Upload page in the **React** UI.
2. The frontend validates the file type and size **client-side**, then calls `uploadService.uploadCsv(file)`.
3. **Axios** sends a `POST /api/upload` request as `multipart/form-data`, reporting progress for the progress bar.
4. On the **Express** server, the `uploadLimiter` (rate limit) and **Multer** middleware run; Multer saves the file temporarily to `uploads/`.
5. The `uploadCsv` **controller** streams the file through **csv-parser**, normalizing headers and validating rows.
6. It deduplicates rows within the file (a `Set`) and against the database (an indexed `$in` query via **Mongoose**).
7. New rows are bulk-inserted with `insertMany` into the **MongoDB Atlas** `company_management_records` collection.
8. The temp file is deleted; the server responds `{ success, insertedCount, duplicates }`.
9. React shows a success **toast** and a result summary.

### Story B: "What happens when I search for a company?"
1. User types in the search box. A **debounce** waits 350ms after they stop typing.
2. `fetchRecords({ search })` calls `GET /api/records?search=Apple&page=1&limit=10`.
3. Express's `getRecords` controller builds a **case-insensitive regex** and queries with `$or` across name/address/phone/recordNo.
4. It applies **pagination** (`skip` + `limit`) and counts the total for page math.
5. Returns `{ records, total, page, totalPages }`.
6. React renders the rows in the **TanStack Table** and updates the pagination controls.

---

## 2. Resume bullet points (copy-paste ready)

Put the project under a "Projects" section. Use 3–5 bullets. Strong, metric-driven, action verbs:

**Company Management Records — Full-Stack Web Application** *(React, Node.js, Express, MongoDB)*
- Built a full-stack MERN application to ingest, store, and manage company records from CSV files, handling **1,000+ records** across multiple companies.
- Developed a **REST API** with Express featuring CRUD operations, server-side pagination, regex-based search, and a MongoDB **aggregation pipeline** for per-company analytics.
- Engineered a **streaming CSV parser** with two-level duplicate detection (in-file + database) and bulk inserts, reducing redundant data and improving ingestion efficiency.
- Designed a responsive React dashboard with **TanStack Table** (sorting, filtering, pagination), dark mode, CSV export, and complete loading/empty/error states.
- Implemented production practices: **environment-based config**, centralized error handling, input validation, and security via Helmet, CORS, rate limiting, and file-type/size validation.

**Tailoring:**
- **For a frontend role:** lead with the React/TanStack Table/responsive UI/state-management bullets.
- **For a data role:** lead with the CSV ingestion, deduplication, aggregation pipeline, and search/filter bullets.

---

## 3. Common interview questions & strong answers

### General / Project
**Q: Tell me about this project.**
> Use the one-line pitch from chapter 01, then mention the stack and 2–3 standout features (CSV ingestion, searchable dashboard, aggregation analytics).

**Q: Why did you build it / what problem does it solve?**
> "To automate bulk data entry. Instead of manually typing thousands of company records, users upload a CSV and the system cleans, deduplicates, and stores them, then provides a searchable dashboard."

**Q: What was the hardest part?**
> "Designing reliable CSV ingestion — handling varied header names, deduplicating both within the file and against existing database records efficiently, and streaming large files without exhausting memory. I solved it with header normalization, a Set for in-file dedup, and a single indexed `$in` query for database dedup."

**Q: What would you improve / add next?**
> "Authentication (JWT-based login), unit/integration tests (Jest), server-side sorting, per-company bulk delete, and deploying with CI/CD. I'd also add a background job queue for very large uploads."

### Database / MongoDB
**Q: Why MongoDB over SQL?**
> See chapter 02, section 2. Key: CSV rows map naturally to JSON documents, flexible schema, scales well, JS/JSON synergy with Node.

**Q: What is an index and why use one?**
> "An index is a sorted data structure that speeds up lookups, like a book's index. I indexed `recordNo` so duplicate checks during upload are fast even with thousands of records. The trade-off is slightly slower writes and more storage."

**Q: Explain the aggregation pipeline you used.**
> See chapter 02, section 9 — the `$group` / `$sort` / `$project` company breakdown.

**Q: How do you prevent duplicate records?**
> "Two layers: a `unique: true` index on `recordNo` at the database level, and application logic that dedupes within the file and checks existing recordNos with a single `$in` query before inserting."

### Backend / Node / Express
**Q: What is middleware?**
> "A function that runs between the request and response with access to `(req, res, next)`. I use it for security (Helmet, CORS), parsing, rate limiting, file uploads (Multer), and centralized error handling."

**Q: How do you handle errors?**
> "Centrally. An `asyncHandler` wrapper forwards any thrown error to a global error-handling middleware that maps error types (validation, cast, duplicate key, Multer) to proper HTTP status codes and a consistent JSON shape, hiding stack traces in production."

**Q: Sync vs async / what is async-await?**
> "JavaScript is single-threaded; async operations (DB queries, file reads) don't block. `async/await` lets me write asynchronous code that reads like synchronous code, awaiting promises without blocking the event loop."

### Frontend / React
**Q: Props vs state?**
> "Props are read-only data passed from parent to child. State is internal, mutable data a component manages; changing it triggers a re-render."

**Q: What is the virtual DOM?**
> "React keeps a lightweight in-memory copy of the UI (the virtual DOM). On state change it computes the minimal difference (diffing/reconciliation) and updates only the changed parts of the real DOM — making updates efficient."

**Q: useEffect — what and when?**
> "A hook to run side effects (data fetching, subscriptions, DOM updates) after render. The dependency array controls when it re-runs. I use it to fetch records when the page loads and to apply the dark-mode class when the theme changes."

**Q: How did you manage state?**
> Context API + custom `useRecords` hook (chapter 04, section 6).

**Q: How do you optimize performance?**
> "Server-side pagination (only fetch a page of data), debounced search (avoid a request per keystroke), `useCallback`/`useMemo` to avoid unnecessary re-renders, skeleton loaders for perceived performance, and `.lean()` queries on the backend for lighter payloads."

---

## 4. Key terms glossary (quick revision before an interview)

- **API** — Application Programming Interface; a contract for how software talks to other software.
- **REST** — an architectural style using HTTP methods (GET/POST/PUT/DELETE) on resource URLs.
- **CRUD** — Create, Read, Update, Delete.
- **Endpoint** — a specific API URL (e.g. `/api/records`).
- **HTTP status codes** — 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Server Error.
- **JSON** — JavaScript Object Notation; the data format exchanged between frontend and backend.
- **Middleware** — functions in the request pipeline.
- **Schema** — the defined shape of data.
- **ODM** — Object Data Modeling (Mongoose); maps JS objects to DB documents.
- **Index** — speeds up queries.
- **Aggregation** — server-side data grouping/summarizing.
- **Pagination** — serving data in pages.
- **SPA** — Single Page Application; the page doesn't reload on navigation.
- **Component / Props / State / Hook** — React fundamentals.
- **Context API** — React's built-in global state sharing.
- **Environment variable** — config/secret stored outside code (`.env`).
- **CORS** — Cross-Origin Resource Sharing; controls which domains can call your API.

---

## 5. A 60-second project summary to rehearse

> "I built **Company Management Records**, a full-stack MERN application. The frontend is React with Vite and Tailwind; the backend is Node.js with Express; and data is stored in MongoDB Atlas. Users upload CSV files, which the server parses with a streaming parser, deduplicates, and bulk-inserts into the database. The React dashboard then lets users search, sort, paginate, view, edit, delete, and export records, with a per-company analytics breakdown powered by MongoDB's aggregation pipeline. I followed clean, layered architecture — separating routes, controllers, models, and middleware on the backend, and pages, components, services, and hooks on the frontend — and added production features like centralized error handling, environment-based config, rate limiting, and full input validation. I also focused on UX with dark mode, toasts, skeleton loaders, empty states, and a fully responsive design."

---

## 6. Honesty & confidence tips for freshers

- **Be honest** about what you understand. It's fine to say "I implemented X; I'd love to learn more about Y."
- **Know your code.** Re-read these docs and actually click through the running app before interviews.
- **Run it live** if allowed — a working demo is powerful.
- **Have the GitHub link** ready and a clean README (already in the repo).
- **Tie features to concepts** — every feature in this app demonstrates a real CS/engineering concept (indexing, aggregation, middleware, state management). Name the concept when you explain the feature.
