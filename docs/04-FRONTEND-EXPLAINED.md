# 04 — Frontend Internals (React + Vite + Tailwind), Explained

This chapter is the most important for a **frontend job**. It explains React fundamentals using this project's real code.

---

## 1. What is React, Vite, and Tailwind?

- **React** — a JavaScript library for building user interfaces out of reusable **components**. Instead of one giant HTML file, you build small pieces (a button, a table, a card) and compose them.
- **Vite** — the **build tool / dev server**. It serves your code instantly during development (hot reload) and bundles it for production. It's the modern replacement for Create React App — much faster.
- **Tailwind CSS** — a **utility-first CSS framework**. Instead of writing separate CSS files, you style with small classes directly in the HTML, e.g. `className="flex items-center gap-4 rounded-xl bg-white p-6"`.

---

## 2. Core React concepts (define these in interviews)

### Components
A **component** is a reusable, self-contained piece of UI written as a JavaScript function that returns JSX.

```jsx
const Spinner = ({ size = 'md' }) => {
  return <div className="animate-spin ..." />;
};
```

### JSX
**JSX** is HTML-like syntax inside JavaScript. `<div className="card">` is JSX. It gets compiled to JavaScript function calls. Note: `class` becomes `className` because `class` is a reserved word in JS.

### Props
**Props** (properties) are how data is passed **from a parent component to a child** — like function arguments. They are **read-only**.
```jsx
<StatCard title="Total Records" value={1000} />   // parent passes props
const StatCard = ({ title, value }) => <div>{title}: {value}</div>  // child receives
```

### State
**State** is data that a component "remembers" and that can change over time. When state changes, React **re-renders** the component. Managed with the `useState` hook:
```jsx
const [file, setFile] = useState(null);  // file = current value, setFile = updater
```

### Hooks
**Hooks** are special functions starting with `use` that let function components use React features:
- `useState` — local state.
- `useEffect` — run side effects (e.g. fetch data when the component loads).
- `useCallback` / `useMemo` — performance optimizations (cache functions/values).
- `useRef` — hold a mutable value that doesn't trigger re-renders (e.g. a timer, or a DOM reference).
- **Custom hooks** — your own reusable logic (this project has `useRecords`).

### The component tree of this app
```
main.jsx
 └── ThemeProvider (dark mode context)
      └── RecordsProvider (records state context)
           └── App (defines routes)
                └── MainLayout (Sidebar + Navbar + page content)
                     └── Dashboard / Upload / Records / etc.
                          └── smaller components (StatCard, RecordsTable...)
```

---

## 3. `main.jsx` — the entry point

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>        {/* enables URL-based routing */}
    <ThemeProvider>      {/* provides dark/light mode everywhere */}
      <RecordsProvider>  {/* provides records data everywhere */}
        <App />
      </RecordsProvider>
    </ThemeProvider>
  </BrowserRouter>
);
```
This mounts the React app into the `<div id="root">` in `index.html`. The **providers** wrap the app so all components can access theme and records state.

---

## 4. `App.jsx` — routing

**React Router** maps URLs to page components without reloading the page (a **Single Page Application / SPA**).

```jsx
<Routes>
  <Route element={<MainLayout />}>      {/* shared sidebar+navbar shell */}
    <Route index element={<Dashboard />} />              {/* / */}
    <Route path="upload" element={<UploadCsv />} />      {/* /upload */}
    <Route path="records" element={<Records />} />       {/* /records */}
    <Route path="records/:id" element={<RecordDetails />} />     {/* dynamic */}
    <Route path="records/:id/edit" element={<EditRecord />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<NotFound />} />            {/* 404 catch-all */}
  </Route>
</Routes>
```
- `:id` is a **URL parameter** — read inside the page with `useParams()`.
- `*` is a wildcard that catches any unknown URL → shows the 404 page.

---

## 5. The services layer — talking to the backend

Instead of scattering API calls everywhere, all backend communication lives in `services/`.

### `services/api.js` — the Axios instance
```jsx
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));  // normalize error messages
  }
);
```
- **Axios** is a library for making HTTP requests (a nicer alternative to `fetch`).
- An **interceptor** runs on every response — here it extracts a clean error message from the backend so the UI always gets a readable error.
- `baseURL` uses an **environment variable** so the same code works in dev (proxy) and production (real URL).

### `services/recordService.js` & `uploadService.js`
These expose simple methods like `recordService.getRecords({ page, limit, search })` and `uploadService.uploadCsv(file, onProgress)`. The components don't know HTTP details — they just call these functions. **Separation of concerns.**

The upload service tracks progress:
```jsx
onUploadProgress: (evt) => onProgress(Math.round((evt.loaded * 100) / evt.total))
```
This is what powers the upload progress bar.

---

## 6. State management — Context API + custom hook

For a fresher, this is impressive to explain.

### The problem: "prop drilling"
If many components need the same data (the records list), passing it down through every level via props gets messy. 

### The solution: Context API
**Context** provides a way to share state globally without prop drilling. This app has two contexts:
- `ThemeContext` — current theme + a toggle function.
- `RecordsContext` — the records list and operations.

### The `useRecords` custom hook (the brain of records state)
```jsx
const useRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  // ... search, limit, total, totalPages

  const fetchRecords = useCallback(async (params) => {
    setLoading(true);
    const data = await recordService.getRecords(params);
    setRecords(data.records);
    // ... update total, pages
    setLoading(false);
  }, [page, limit, search]);

  return { records, loading, page, /* ... */ fetchRecords, removeRecord, removeAll };
};
```
This hook **encapsulates all records logic** (state + API calls). `RecordsContext` wraps it so any page can call `useRecordsContext()` to access the same shared records state.

**Interview gold:**
> "I managed global state with React's **Context API** combined with a **custom hook** called `useRecords`. The hook encapsulates the records state and all data operations — fetching, deleting, pagination. The context shares it across pages without prop drilling. This keeps components clean and the data logic reusable and testable."

---

## 7. The ThemeContext — dark mode

```jsx
const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);   // remember choice across refreshes
}, [theme]);
```
- Tailwind's `darkMode: 'class'` means dark styles activate when the `<html>` element has the `dark` class.
- `localStorage` **persists** the user's choice so it survives page reloads.
- `useEffect` runs whenever `theme` changes, applying the class and saving the preference.

---

## 8. The pages (what each screen does)

### `Dashboard.jsx`
- Fetches stats and company breakdown in **parallel** with `Promise.all` (faster than sequential).
- Shows StatCards (total / today / recent), a quick search bar, and a grid of `CompanyCard`s.
- Clicking a company card navigates to `/records?search=CompanyName` — reusing the search feature to filter.

### `UploadCsv.jsx` — the most interactive page
- **Drag-and-drop** using the browser's drag events (`onDragOver`, `onDrop`).
- Client-side validation (file type + size) **before** uploading (fast feedback).
- An upload **progress bar** driven by the Axios `onUploadProgress` callback.
- Success/error **toast** notifications and a result summary card.

### `Records.jsx` — the data table page
- Uses **TanStack Table** (see below).
- **Server-side** search & pagination (the backend does the filtering), **client-side** sorting.
- **Debounced search:** waits 350ms after the user stops typing before calling the API — avoids a request on every keystroke. Implemented with `setTimeout` + `useRef`.
- Delete with a confirmation modal; handles the edge case of deleting the last row on a page.
- CSV **export** of the current page.

### `RecordDetails.jsx` / `EditRecord.jsx`
- `RecordDetails` reads `:id` from the URL, fetches that one record, displays it.
- `EditRecord` uses **React Hook Form** to manage the form, pre-fills values with `reset()`, validates inputs, and submits via `updateRecord`.

### `Settings.jsx`
- Dark mode toggle and a **danger zone** "Delete All" with a confirmation modal.

---

## 9. TanStack Table — the professional data grid

**TanStack Table** (formerly React Table) is a **headless** table library — it handles the logic (sorting, columns) but you control the markup/styling.

```jsx
const table = useReactTable({
  data: records,
  columns,                       // defines each column + how to render its cell
  state: { sorting },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),  // enables sorting
  manualPagination: true,        // we paginate on the server
});
```
- `columns` is an array describing each column, including custom cell renderers (e.g. formatting the date, styling the recordNo as a badge, rendering View/Edit/Delete buttons).
- Clicking a header toggles sorting via `getToggleSortingHandler()`.

**Interview gold:**
> "I used TanStack Table, a headless table library, so I had full control over styling with Tailwind while it handled column definitions and sorting logic. I combined client-side sorting with server-side pagination and search for performance with large datasets."

---

## 10. Reusable components (the building blocks)

| Component | Purpose |
| --- | --- |
| `Spinner` | Loading indicator |
| `TableSkeleton` | Placeholder rows while data loads (better UX than a blank screen) |
| `EmptyState` | Friendly message when there's no data |
| `ConfirmModal` | "Are you sure?" dialog before deleting |
| `SearchBar` | Reusable search input with clear button |
| `Pagination` | Page controls + page-size selector |
| `StatCard` | Dashboard metric card |
| `CompanyCard` | Per-company summary card |
| `RecordsTable` | The TanStack data table |
| `Navbar` / `Sidebar` | Navigation |

This component library demonstrates **reusability** and **DRY** principles — a key frontend skill.

---

## 11. Responsive design & UX polish

- **Responsive** via Tailwind's breakpoint prefixes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` means 1 column on mobile, 2 on tablet, 3 on desktop. The sidebar collapses into a slide-in menu on mobile.
- **Toasts** (react-toastify) for non-blocking success/error feedback.
- **Skeleton loaders** and **spinners** for perceived performance.
- **Empty states** so the app never shows a confusing blank screen.
- **Confirmation modals** to prevent accidental data loss.

**Interview gold:**
> "I focused heavily on UX: skeleton loaders and spinners for loading states, toast notifications for feedback, empty states for no-data scenarios, confirmation modals before destructive actions, and a fully responsive layout using Tailwind's breakpoints. These details are what separate a demo from a production-quality app."
