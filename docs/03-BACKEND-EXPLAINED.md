# 03 — Backend Internals (Node.js + Express), File by File

This chapter explains **every backend file** so you can confidently answer "walk me through your backend."

---

## 1. The big picture of the backend

The backend is a **REST API server**. "REST API" means it exposes URLs (endpoints) that the frontend calls using standard HTTP methods:

| HTTP Method | Meaning | Example in this app |
| --- | --- | --- |
| **GET** | Read data | `GET /api/records` (list records) |
| **POST** | Create data | `POST /api/upload` (upload CSV) |
| **PUT** | Update data | `PUT /api/records/:id` (edit a record) |
| **DELETE** | Remove data | `DELETE /api/records/:id` |

**Node.js** = the runtime that lets JavaScript run on a server (outside the browser).
**Express** = a lightweight framework that makes building the API routes easy.

---

## 2. The request lifecycle (memorize this flow)

When a request like `GET /api/records?page=1` arrives, it travels through layers:

```
Request → [Middleware: Helmet, CORS, Compression, JSON parser]
        → [Rate limiter]
        → [Router: matches the URL]
        → [Controller: runs the logic, queries MongoDB via Mongoose]
        → [Response sent back as JSON]
        (if anything throws → Error Handler middleware catches it)
```

This layered approach is called the **middleware pipeline**. Each piece does one job and passes control to the next using `next()`.

---

## 3. `server.js` — the entry point

This is the file that starts everything. Run order:

```js
dotenv.config();        // 1. Load secrets from .env into process.env
connectDB();            // 2. Connect to MongoDB Atlas
const app = express();  // 3. Create the Express app

app.set('trust proxy', 1);  // 4. Needed for rate-limiting behind a proxy

// 5. Apply middleware (runs on EVERY request, in order):
app.use(helmet());          // sets secure HTTP headers
app.use(compression());     // gzip-compresses responses (faster)
app.use(cors({ ... }));     // allows the frontend domain to call this API
app.use(express.json());    // parses JSON request bodies
app.use(morgan('dev'));     // logs requests (dev only)
app.use('/api', apiLimiter);// rate limiting

// 6. Register routes:
app.use('/api/upload', uploadRoutes);
app.use('/api/records', recordRoutes);

// 7. Error handling (must be LAST):
app.use(notFound);          // 404 for unknown routes
app.use(errorHandler);      // global error handler

// 8. Start listening:
app.listen(PORT, ...);
```

**Why order matters:** Middleware runs top-to-bottom. Security and parsing must come before routes; error handlers must come last so they catch everything.

---

## 4. `config/db.js` — connecting to the database

```js
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('MONGO_URI missing'); process.exit(1); }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);   // crash early if DB is unreachable
  }
};
```

**Key ideas:**
- It reads the secret connection string from the environment (never hard-coded).
- `process.exit(1)` — if the DB can't connect, the server **fails fast** instead of running broken. This is a **production best practice** ("fail loudly, fail early").
- `async/await` — modern way to handle asynchronous operations (the connection takes time; we wait for it without blocking).

---

## 5. `models/Record.js` — the data schema

Covered in detail in chapter 02. In one sentence:
> "It defines the shape of each record, enforces required fields and uniqueness on `recordNo`, adds automatic timestamps, and creates indexes for fast searching."

---

## 6. `middlewares/` — reusable cross-cutting logic

A **middleware** is a function that runs between the request and the response. It has access to `(req, res, next)`.

### `upload.js` — handling file uploads with Multer
```js
const upload = multer({
  storage,        // where/how to store the file
  fileFilter,     // only accept .csv files
  limits: { fileSize: 10 * 1024 * 1024 },  // max 10 MB
});
```
- **Multer** is middleware that handles `multipart/form-data` (the format browsers use to upload files).
- The `fileFilter` checks both the **file extension** (`.csv`) and the **MIME type** — rejecting anything else. This is **file-type validation** (security).
- `limits.fileSize` blocks files larger than 10 MB — prevents abuse / server overload.
- Files are stored temporarily on disk with a unique name, then **deleted after parsing**.

### `errorHandler.js` — centralized error handling
Two functions:
- `notFound` — returns a clean 404 JSON for unknown URLs.
- `errorHandler` — the **global error handler**. It inspects the error type and returns the right HTTP status:
  - `CastError` → 400 (bad ID format)
  - `ValidationError` → 400 (schema rule broken)
  - duplicate key (`code 11000`) → 409 (recordNo already exists)
  - Multer `LIMIT_FILE_SIZE` → 400 (file too big)
- It hides stack traces in production (security) and logs them in development.

**Why this matters:** Instead of scattering error handling everywhere, ALL errors funnel to one place that returns a consistent `{ success: false, message }` shape. Clean and professional.

### `asyncHandler.js` — the DRY helper
```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```
This wraps every async controller so that if it throws, the error is automatically forwarded to `errorHandler` via `next()`. Without it, you'd need a `try/catch` in every single controller. **DRY = Don't Repeat Yourself.**

### `rateLimiter.js` — preventing abuse
```js
export const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 300 });
export const uploadLimiter = rateLimit({ windowMs: 15*60*1000, max: 30 });
```
- Limits how many requests one IP can make in 15 minutes.
- General API: 300 requests; uploads: stricter 30. Protects against denial-of-service and accidental loops.

---

## 7. `routes/` — mapping URLs to logic

Routes are just a **table of contents** connecting URLs to controller functions.

### `recordRoutes.js`
```js
router.route('/').get(getRecords).delete(deleteAllRecords);
router.get('/stats', getStats);
router.get('/companies', getCompanies);
router.route('/:id').get(getRecordById).put(updateRecord).delete(deleteRecord);
```

**Important subtlety (great to mention):**
> "I registered the specific routes `/stats` and `/companies` **before** the dynamic `/:id` route. Otherwise Express would interpret `/stats` as an `:id` parameter and try to look up a record with id 'stats'. Route order matters in Express."

### `uploadRoutes.js`
```js
router.post('/', uploadLimiter, upload.single('file'), uploadCsv);
```
This shows **chained middleware**: rate-limit → handle the uploaded file (`upload.single('file')`) → run the controller. They run left to right.

---

## 8. `controllers/recordController.js` — the actual logic

This is where the real work happens. Each function corresponds to one endpoint. (Detailed code is in chapter 02 under CRUD.) Here's what each one does:

| Function | Endpoint | What it does |
| --- | --- | --- |
| `uploadCsv` | POST /api/upload | Parses CSV, dedupes, bulk inserts |
| `getRecords` | GET /api/records | Paginated + searchable list |
| `getStats` | GET /api/records/stats | Total, today's count, recent 5 |
| `getCompanies` | GET /api/records/companies | Aggregation: count per company |
| `getRecordById` | GET /api/records/:id | One record |
| `updateRecord` | PUT /api/records/:id | Edit a record |
| `deleteRecord` | DELETE /api/records/:id | Delete one |
| `deleteAllRecords` | DELETE /api/records | Delete all |

### The CSV upload logic explained step-by-step (the centerpiece)

This is the most impressive part to explain. The `uploadCsv` flow:

1. **Receive the file** — Multer has already saved it to `uploads/`. If no file, throw a 400 error.
2. **Parse the CSV** — `parseCsv()` streams the file through `csv-parser`:
   ```js
   fs.createReadStream(filePath)
     .pipe(csv({ mapHeaders: ({ header }) => normalizeKey(header) }))
     .on('data', (row) => { /* collect valid rows */ })
     .on('end', () => resolve(rows));
   ```
   - **Streaming** means it reads the file **chunk by chunk** instead of loading the whole thing into memory — efficient for large files.
   - `normalizeKey` maps header variations (e.g. "Phone Number", "phone_number") to the canonical field `phone`. This makes the upload **forgiving** of different CSV formats.
   - Only rows with both `name` and `recordNo` are kept (basic validation).
3. **Deduplicate within the file** — using a JavaScript `Set` of seen `recordNo`s.
4. **Deduplicate against the database** — one query `Record.find({ recordNo: { $in: recordNos } })` finds all already-existing recordNos at once (uses the index — fast).
5. **Bulk insert** — `Record.insertMany(toInsert, { ordered: false })` inserts only the new ones.
6. **Cleanup** — a `finally` block deletes the temp file no matter what.
7. **Respond** — `{ success: true, insertedCount, duplicates }`.

**Interview gold:**
> "The upload handler streams the CSV with `csv-parser` to keep memory usage low, normalizes header names so it accepts varied CSV formats, then performs **two-level deduplication** — within the file using a Set, and against the database using a single indexed `$in` query — before bulk-inserting with `insertMany`. The temp file is always cleaned up in a `finally` block. It returns how many rows were inserted versus skipped."

---

## 9. `scripts/generateCsv.js` — the data generator

A standalone Node script I wrote to generate realistic test data (1,000 records across 5 companies). It demonstrates:
- Reading command-line arguments (`process.argv`).
- Generating randomized but realistic data.
- Properly **CSV-escaping** fields that contain commas/quotes (wrapping in quotes, doubling inner quotes) — a real data-engineering detail.
- Writing a file with `fs.writeFileSync`.

Run it with: `node scripts/generateCsv.js 200` (200 records per company).

---

## 10. Backend security summary (a checklist interviewers love)

| Threat | Mitigation in this project |
| --- | --- |
| Malicious headers / XSS | **Helmet** sets secure HTTP headers |
| Unauthorized cross-origin calls | **CORS** restricts allowed origins |
| Denial of service / spam | **Rate limiting** (express-rate-limit) |
| Huge file uploads | **10 MB limit** via Multer |
| Wrong file types | **`.csv`-only** filter |
| Secrets in code | **Environment variables** (`.env`) |
| Regex/query injection in search | **Escaping special characters** |
| Leaking internal errors | **Stack traces hidden** in production |
