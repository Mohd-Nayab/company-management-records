# 02 — MongoDB & Databases (The Deep Dive)

This is the most important chapter for both **data analysis** and **backend** interviews. Read it twice.

---

## 1. What is a database? (Start from zero)

A **database** is an organized collection of data stored on a computer so it can be easily accessed, searched, and updated.

Without a database, your data would live in temporary memory (RAM) and vanish when the server restarts. A database makes data **persistent** (permanent) and **queryable** (searchable).

A **DBMS (Database Management System)** is the software that manages the database. MongoDB is a DBMS.

---

## 2. SQL vs NoSQL (a guaranteed interview question)

There are two big families of databases:

### SQL (Relational) databases — e.g. MySQL, PostgreSQL
- Data is stored in **tables** with fixed **rows** and **columns** (like Excel).
- You must define the structure (**schema**) upfront.
- Tables are linked using **relationships** (foreign keys).
- Query language: **SQL** (Structured Query Language).

### NoSQL (Non-relational) databases — e.g. MongoDB
- Data is stored in flexible **documents** (like JSON objects).
- Schema can be flexible — different documents can have different fields.
- Designed to scale horizontally (spread across many servers).
- MongoDB is a **document database**.

### Comparison table

| Concept | SQL (MySQL) | NoSQL (MongoDB) |
| --- | --- | --- |
| Storage unit | Table | Collection |
| One entry | Row / Record | Document |
| Field | Column | Field / Key |
| Structure | Rigid schema | Flexible schema |
| Query language | SQL | MongoDB Query API (JS-like) |
| Best for | Complex relationships, transactions | Large volumes, flexible/evolving data |

**Interview answer for "Why MongoDB?":**
> "I chose MongoDB because the CSV data maps naturally to JSON documents — each row becomes one document. It has a flexible schema, which is ideal for ingesting CSV files whose columns might vary. It also scales well for large datasets and integrates seamlessly with Node.js since both use JavaScript and JSON."

---

## 3. MongoDB core concepts (with this project's real examples)

### The hierarchy
```
MongoDB Server (Cluster)
   └── Database         → "company_management"
        └── Collection  → "company_management_records"
             └── Document → one company record
                  └── Field → "name", "address", etc.
```

### A real document in this project
A single record is stored as a **BSON document** (Binary JSON) that looks like:

```json
{
  "_id": "6a38e8273c13b129940255f2",
  "id": 1,
  "name": "Apple Inc",
  "address": "Ishaan Brown, Apple Inc, 300 Post St, San Francisco, CA 94108",
  "phone": "+1-408-239-6085",
  "recordNo": "APPL-00001",
  "createdAt": "2026-06-22T07:39:57.275Z",
  "updatedAt": "2026-06-22T07:39:57.275Z",
  "__v": 0
}
```

**Key fields to understand:**
- **`_id`** — Every MongoDB document gets a unique `_id` automatically. It's an **ObjectId** — a special 12-byte value that's globally unique. This is the **primary key**. In this app, the URLs use it: `/records/6a38e8273c13b129940255f2`.
- **`createdAt` / `updatedAt`** — Added automatically by Mongoose's `timestamps: true` option. Used for the "Records Today" dashboard stat.
- **`__v`** — A version key Mongoose adds internally (version number for the document). You can ignore it.

---

## 4. What is MongoDB Atlas? (The cloud part)

**MongoDB Atlas** is the official **cloud-hosted** version of MongoDB. Instead of installing MongoDB on your own computer, Atlas runs it on the cloud (AWS/Google/Azure) and manages backups, scaling, and security for you.

In this project:
- We created a **free M0 cluster** on Atlas.
- We added a **database user** (username + password) for authentication.
- We configured **Network Access** (IP whitelist) to allow connections.
- We got a **connection string** (the `MONGO_URI`) that the backend uses to connect.

**The connection string explained:**
```
mongodb+srv://promptopia_1:Beastboy%401234@cluster0.wbmsdq2.mongodb.net/company_management?retryWrites=true&w=majority
        │         │            │                    │                       │
        │         │            │                    │                       └── database name
        │         │            │                    └── cluster host address
        │         │            └── password (note: @ was encoded as %40)
        │         └── username
        └── protocol (srv = uses DNS to find servers automatically)
```

**Interview gold — the password encoding story:**
> "My database password contained an `@` symbol. In a connection URL, `@` is a reserved character that separates credentials from the host. So I had to **URL-encode** it to `%40`, otherwise the connection string would parse incorrectly. This taught me about URL encoding of reserved characters."

---

## 5. Mongoose — the bridge between Node.js and MongoDB

**Mongoose** is an **ODM (Object Data Modeling)** library. It's the translator between JavaScript objects and MongoDB documents.

Why use it instead of the raw MongoDB driver?
- **Schemas** — define and enforce structure.
- **Validation** — reject bad data (e.g. missing required fields).
- **Cleaner queries** — `Record.find()` instead of low-level commands.
- **Middleware/hooks, timestamps, indexes** — built-in conveniences.

### The Schema in this project (`models/Record.js`)
```js
const recordSchema = new mongoose.Schema(
  {
    id:       { type: Number },
    name:     { type: String, required: true, trim: true },
    address:  { type: String, trim: true, default: '' },
    phone:    { type: String, trim: true, default: '' },
    recordNo: { type: String, required: true, trim: true, unique: true, index: true },
  },
  { timestamps: true, collection: 'company_management_records' }
);
```

**Line-by-line meaning:**
- `type: String/Number` — the data type of each field.
- `required: true` — the field MUST be present, or the save fails with a validation error.
- `trim: true` — automatically removes leading/trailing spaces.
- `default: ''` — if not provided, use an empty string.
- `unique: true` — no two documents can have the same `recordNo`. **This enforces no duplicates at the database level.**
- `index: true` — builds an index for fast searching (explained below).
- `timestamps: true` — auto-adds `createdAt` and `updatedAt`.
- `collection: '...'` — forces the exact collection name.

---

## 6. Indexes — the secret to fast queries (interview favorite)

An **index** is like the index at the back of a textbook. Without it, to find a topic you'd read every page (slow). With it, you jump straight to the right page (fast).

In a database:
- **Without an index**, finding a record means scanning **every document** — called a **collection scan** (slow, O(n)).
- **With an index**, the database uses a sorted structure (a **B-tree**) to find it almost instantly (O(log n)).

In this project, `recordNo` is indexed (`index: true`). So when we check "does this recordNo already exist?" during upload, it's fast even with thousands of records. We also index `name` and `phone`.

**Trade-off to mention:** Indexes speed up reads but slightly slow down writes (the index must be updated on every insert) and use extra storage. So you only index fields you search/sort on frequently.

---

## 7. CRUD operations — with the exact Mongoose code used

**CRUD** = Create, Read, Update, Delete — the four basic database operations. This is THE core concept of the whole app.

### CREATE — bulk insert during upload
```js
await Record.insertMany(toInsert, { ordered: false });
```
- `insertMany` inserts an array of documents in **one** database operation (much faster than inserting one at a time).
- `ordered: false` means "if one document fails, keep inserting the rest" instead of stopping.

### READ — paginated, searchable list
```js
const records = await Record.find(filter)
  .sort({ createdAt: -1 })   // newest first (-1 = descending)
  .skip((page - 1) * limit)  // skip records from previous pages
  .limit(limit)              // return only `limit` records
  .lean();                   // return plain JS objects (faster)
```
This is **pagination** — instead of sending 10,000 records at once, we send small "pages" (e.g. 10 at a time).

### UPDATE — edit a record
```js
const record = await Record.findByIdAndUpdate(
  id,
  { name, address, phone, recordNo, id },
  { new: true, runValidators: true }  // return updated doc + re-check schema rules
);
```

### DELETE — single and all
```js
await Record.findByIdAndDelete(id);  // delete one by its _id
await Record.deleteMany({});         // delete all (empty filter = everything)
```

---

## 8. Search & filtering (the data-analysis part)

When a user types in the search box, the backend builds a query using **regular expressions (regex)**:

```js
const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
filter = {
  $or: [{ name: regex }, { address: regex }, { phone: regex }, { recordNo: regex }],
};
```

**Explained:**
- `RegExp(..., 'i')` — case-insensitive pattern match (so "apple" matches "Apple Inc").
- `$or` — a MongoDB **operator** meaning "match if ANY of these conditions is true". So the search looks across name OR address OR phone OR recordNo.
- The `.replace(...)` part **escapes special regex characters** so a user typing `.` or `*` doesn't break the search or cause injection. This is a **security** consideration.

**Common MongoDB query operators to memorize:**
| Operator | Meaning | Example |
| --- | --- | --- |
| `$or` | Match any condition | `{ $or: [{a:1}, {b:2}] }` |
| `$and` | Match all conditions | `{ $and: [...] }` |
| `$in` | Value is in a list | `{ recordNo: { $in: [...] } }` |
| `$gte` / `$lte` | Greater/less than or equal | `{ createdAt: { $gte: date } }` |
| `$ne` | Not equal | `{ status: { $ne: 'done' } }` |

This app uses `$in` during upload to check many recordNos at once, and `$gte` for "records created today".

---

## 9. The Aggregation Pipeline (advanced — great for data analysis interviews)

The **aggregation pipeline** is MongoDB's powerful data-processing feature. It passes documents through a series of **stages**, each transforming the data — like an assembly line. This is the closest thing to SQL's `GROUP BY`, and it's a HUGE plus for data-analysis roles.

In this project, the dashboard's "per-company breakdown" uses aggregation:

```js
const companies = await Record.aggregate([
  {
    $group: {                       // STAGE 1: group documents
      _id: '$name',                 // group by the company name
      count: { $sum: 1 },           // count documents in each group
      lastUpdated: { $max: '$createdAt' },  // newest date in each group
    },
  },
  { $sort: { count: -1, _id: 1 } }, // STAGE 2: sort by count (desc)
  {
    $project: {                     // STAGE 3: reshape the output
      _id: 0,
      name: '$_id',
      count: 1,
      lastUpdated: 1,
    },
  },
]);
```

**Stage-by-stage:**
1. **`$group`** — collapses all records with the same `name` into one group, counting them (`$sum: 1`) and finding the latest date (`$max`). This is exactly like SQL `GROUP BY name`.
2. **`$sort`** — orders the groups so the biggest companies appear first.
3. **`$project`** — chooses/renames which fields to return (renames `_id` to `name`, hides the raw `_id`).

**Result:** `[{ name: "Apple Inc", count: 200, lastUpdated: ... }, ...]`

**Interview gold:**
> "I used MongoDB's aggregation pipeline to compute per-company statistics. The `$group` stage works like SQL's GROUP BY — I grouped 1,000 records by company name and used `$sum` to count them and `$max` to find the latest upload date. Then `$sort` and `$project` shaped the output. This is the kind of server-side data summarization that's essential for analytics dashboards."

---

## 10. Database concepts you should be able to define

- **Persistence:** Data survives restarts (stored on disk, not just memory).
- **Schema:** The defined structure/shape of the data.
- **Primary key:** A unique identifier for each record (`_id` in MongoDB).
- **Index:** A structure that speeds up searches.
- **Query:** A request to read/filter data.
- **CRUD:** Create, Read, Update, Delete.
- **Pagination:** Returning data in small pages instead of all at once.
- **Aggregation:** Summarizing/grouping data (counts, averages, etc.).
- **Validation:** Rejecting data that doesn't meet the rules.
- **Connection pooling:** Mongoose/the driver reuses a pool of DB connections instead of opening a new one each time (efficiency).
