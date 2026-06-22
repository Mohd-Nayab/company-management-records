/**
 * Combines all the Markdown docs in this folder into ONE styled, print-ready
 * HTML file (PROJECT-DOCUMENTATION.html). Open that file in your browser and
 * press Ctrl + P -> "Save as PDF" to get your PDF. No internet or extra
 * packages required — it uses only Node.js built-ins plus a tiny Markdown
 * converter included below.
 *
 * Run from the project root or the docs folder:
 *   node docs/build-pdf.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The docs to combine, in order.
const files = [
  '01-PROJECT-OVERVIEW.md',
  '02-MONGODB-AND-DATABASES.md',
  '03-BACKEND-EXPLAINED.md',
  '04-FRONTEND-EXPLAINED.md',
  '05-INTERVIEW-GUIDE.md',
];

// ---- Minimal, dependency-free Markdown -> HTML converter --------------------
// Supports: headings, bold, inline code, code blocks, tables, lists,
// blockquotes, horizontal rules, paragraphs. Good enough for these docs.

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const inline = (text) =>
  escapeHtml(text)
    // inline code first so ** inside code isn't bolded
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

const renderTable = (rows) => {
  const cells = (line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());
  const header = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  let html = '<table><thead><tr>';
  html += header.map((h) => `<th>${inline(h)}</th>`).join('');
  html += '</tr></thead><tbody>';
  for (const r of body) {
    html += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
  }
  html += '</tbody></table>';
  return html;
};

const mdToHtml = (md) => {
  const lines = md.split('\n');
  let html = '';
  let i = 0;
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      closeList();
      const lang = line.trim().replace(/```/g, '');
      let code = '';
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code += escapeHtml(lines[i]) + '\n';
        i += 1;
      }
      html += `<pre class="code" data-lang="${lang}"><code>${code}</code></pre>`;
      i += 1;
      continue;
    }

    // Table (line with | and next line is a separator)
    if (line.includes('|') && lines[i + 1] && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      closeList();
      const tableRows = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableRows.push(lines[i]);
        i += 1;
      }
      html += renderTable(tableRows);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      html += `<h${level}>${inline(h[2])}</h${level}>`;
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      closeList();
      html += '<hr/>';
      i += 1;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      closeList();
      let quote = '';
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote += inline(lines[i].trim().replace(/^>\s?/, '')) + ' ';
        i += 1;
      }
      html += `<blockquote>${quote}</blockquote>`;
      continue;
    }

    // List item
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
      i += 1;
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      closeList();
      i += 1;
      continue;
    }

    // Paragraph
    closeList();
    html += `<p>${inline(line)}</p>`;
    i += 1;
  }
  closeList();
  return html;
};

// ---- Build the combined HTML ------------------------------------------------

let body = '';
for (const file of files) {
  const full = path.join(__dirname, file);
  if (!fs.existsSync(full)) {
    console.warn(`Skipping missing file: ${file}`);
    continue;
  }
  const md = fs.readFileSync(full, 'utf8');
  body += `<section class="doc">${mdToHtml(md)}</section>`;
}

const template = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Company Management Records — Complete Documentation</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a; line-height: 1.6; max-width: 860px; margin: 0 auto;
    padding: 40px 32px;
  }
  h1 { font-size: 26px; color: #1d4ed8; border-bottom: 3px solid #2563eb; padding-bottom: 8px; margin-top: 36px; }
  h2 { font-size: 21px; color: #0f172a; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
  h3 { font-size: 17px; color: #1e293b; margin-top: 22px; }
  h4 { font-size: 15px; color: #334155; margin-top: 18px; }
  p { margin: 10px 0; }
  ul { margin: 10px 0 10px 22px; }
  li { margin: 4px 0; }
  code { background: #f1f5f9; color: #be123c; padding: 1px 5px; border-radius: 4px; font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; }
  pre.code { background: #0f172a; color: #e2e8f0; padding: 14px 16px; border-radius: 8px; overflow-x: auto; font-size: 12.5px; line-height: 1.5; page-break-inside: avoid; }
  pre.code code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #2563eb; background: #eff6ff; margin: 14px 0; padding: 10px 16px; border-radius: 0 8px 8px 0; color: #1e3a8a; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 13.5px; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 22px 0; }
  .cover { text-align: center; padding: 80px 0 40px; }
  .cover h1 { font-size: 34px; border: none; }
  .cover p { color: #64748b; font-size: 15px; }
  .doc { page-break-before: always; }
  .doc:first-of-type { page-break-before: avoid; }
  @media print {
    body { padding: 0 12px; }
    a { color: inherit; text-decoration: none; }
  }
</style>
</head>
<body>
  <div class="cover">
    <h1>Company Management Records</h1>
    <p>Complete Project Documentation &amp; Interview Preparation Guide</p>
    <p>Full-Stack MERN Application — React · Node.js · Express · MongoDB</p>
  </div>
  ${body}
</body>
</html>`;

const outPath = path.join(__dirname, 'PROJECT-DOCUMENTATION.html');
fs.writeFileSync(outPath, template, 'utf8');
console.log('Built documentation HTML:');
console.log(outPath);
console.log('\nNext: open it in your browser and press Ctrl + P -> "Save as PDF".');
