import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a large CSV of company records across 5 big companies.
 * Usage: node scripts/generateCsv.js [recordsPerCompany]
 * Output: backend/big-companies-data.csv
 */

const RECORDS_PER_COMPANY = Number(process.argv[2]) || 200;

const companies = [
  {
    name: 'Apple Inc',
    prefix: 'APPL',
    cities: [
      ['1 Apple Park Way', 'Cupertino, CA 95014'],
      ['11 Penn Plaza', 'New York, NY 10001'],
      ['300 Post St', 'San Francisco, CA 94108'],
      ['815 N Michigan Ave', 'Chicago, IL 60611'],
    ],
    area: '408',
  },
  {
    name: 'Google LLC',
    prefix: 'GOOG',
    cities: [
      ['1600 Amphitheatre Pkwy', 'Mountain View, CA 94043'],
      ['111 8th Ave', 'New York, NY 10011'],
      ['747 6th St S', 'Kirkland, WA 98033'],
      ['320 N Morgan St', 'Chicago, IL 60607'],
    ],
    area: '650',
  },
  {
    name: 'Microsoft Corporation',
    prefix: 'MSFT',
    cities: [
      ['One Microsoft Way', 'Redmond, WA 98052'],
      ['11 Times Square', 'New York, NY 10036'],
      ['555 110th Ave NE', 'Bellevue, WA 98004'],
      ['1065 La Avenida St', 'Mountain View, CA 94043'],
    ],
    area: '425',
  },
  {
    name: 'Amazon.com Inc',
    prefix: 'AMZN',
    cities: [
      ['410 Terry Ave N', 'Seattle, WA 98109'],
      ['7 W 34th St', 'New York, NY 10001'],
      ['2100 University Ave', 'East Palo Alto, CA 94303'],
      ['2127 7th Ave', 'Seattle, WA 98121'],
    ],
    area: '206',
  },
  {
    name: 'Tesla Inc',
    prefix: 'TSLA',
    cities: [
      ['1 Tesla Rd', 'Austin, TX 78725'],
      ['3500 Deer Creek Rd', 'Palo Alto, CA 94304'],
      ['45500 Fremont Blvd', 'Fremont, CA 94538'],
      ['901 Page Ave', 'Fremont, CA 94538'],
    ],
    area: '512',
  },
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Aarav', 'Diya', 'Vivaan', 'Ananya',
  'Aditya', 'Ishaan', 'Priya', 'Rohan', 'Neha', 'Kabir',
];
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Mehta', 'Reddy', 'Nair', 'Iyer',
];

const pad = (num, size) => String(num).padStart(size, '0');
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// CSV-escape a value if it contains comma/quote/newline.
const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = ['id,name,address,phone,recordNo'];
let globalId = 1;

companies.forEach((company) => {
  for (let i = 1; i <= RECORDS_PER_COMPANY; i += 1) {
    const [street, cityState] = rand(company.cities);
    const employee = `${rand(firstNames)} ${rand(lastNames)}`;
    const address = `${employee}, ${company.name}, ${street}, ${cityState}`;
    const phone = `+1-${company.area}-${randInt(200, 999)}-${pad(randInt(0, 9999), 4)}`;
    const recordNo = `${company.prefix}-${pad(i, 5)}`;
    rows.push([globalId, esc(company.name), esc(address), esc(phone), recordNo].join(','));
    globalId += 1;
  }
});

const outPath = path.join(__dirname, '..', 'big-companies-data.csv');
fs.writeFileSync(outPath, rows.join('\n'), 'utf8');

console.log(
  `Generated ${rows.length - 1} records (${RECORDS_PER_COMPANY} x ${companies.length} companies)`
);
console.log(`File: ${outPath}`);
