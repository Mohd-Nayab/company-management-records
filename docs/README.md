# Project Documentation & Interview Guide

This folder contains a complete, beginner-friendly explanation of the **Company Management Records** project — written so a fresher can learn it deeply and confidently explain it in **data-analysis** and **frontend** interviews.

## What's inside

| File | What it covers |
| --- | --- |
| `01-PROJECT-OVERVIEW.md` | What the app does, the stack, architecture, folder structure |
| `02-MONGODB-AND-DATABASES.md` | Databases, SQL vs NoSQL, MongoDB, Mongoose, indexes, CRUD, aggregation |
| `03-BACKEND-EXPLAINED.md` | Every backend file, Express, middleware, the CSV upload logic |
| `04-FRONTEND-EXPLAINED.md` | React fundamentals, every frontend layer, state management, TanStack Table |
| `05-INTERVIEW-GUIDE.md` | Data-flow stories, resume bullets, Q&A, glossary, 60-second pitch |

## How to read

Read the files **in order (01 → 05)**. Each builds on the previous. Re-read `02` (databases) and `05` (interview guide) before any interview.

## How to make the PDF (Windows, no installs needed)

A single combined, print-ready file has already been generated: **`PROJECT-DOCUMENTATION.html`**.

1. Double-click `PROJECT-DOCUMENTATION.html` to open it in your browser (Chrome/Edge).
2. Press **Ctrl + P** (Print).
3. In the "Destination"/"Printer" dropdown, choose **"Save as PDF"** (or "Microsoft Print to PDF").
4. Set Layout to **Portrait**, Margins to **Default**, and enable **Background graphics** (so colors/code blocks show).
5. Click **Save** → name it e.g. `Company-Management-Records-Documentation.pdf`.

### To regenerate the HTML after editing any `.md` file
```bash
node docs/build-pdf.js
```
This rebuilds `PROJECT-DOCUMENTATION.html` from the Markdown files.

## Tip for your resume

Use the ready-made bullet points in `05-INTERVIEW-GUIDE.md` (section 2). Tailor the order depending on whether the role is frontend-focused or data-focused.
