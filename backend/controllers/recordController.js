import fs from 'fs';
import csv from 'csv-parser';
import Record from '../models/Record.js';
import asyncHandler from '../middlewares/asyncHandler.js';

/**
 * Normalize a CSV header key to a known field name.
 * Supports a few common header variations.
 */
const normalizeKey = (key = '') => {
  const k = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
  const map = {
    id: 'id',
    name: 'name',
    companyname: 'name',
    address: 'address',
    phone: 'phone',
    phonenumber: 'phone',
    recordno: 'recordNo',
    recordnumber: 'recordNo',
    record: 'recordNo',
  };
  return map[k] || null;
};

/**
 * Parse a CSV file into an array of normalized record objects.
 */
const parseCsv = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => normalizeKey(header) }))
      .on('data', (data) => {
        const row = {};
        if (data.id !== undefined && data.id !== '') {
          const parsed = Number(data.id);
          if (!Number.isNaN(parsed)) row.id = parsed;
        }
        if (data.name) row.name = String(data.name).trim();
        if (data.address) row.address = String(data.address).trim();
        if (data.phone) row.phone = String(data.phone).trim();
        if (data.recordNo) row.recordNo = String(data.recordNo).trim();

        // A row must have at least a recordNo and a name to be valid.
        if (row.recordNo && row.name) {
          rows.push(row);
        }
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });

/**
 * @desc    Upload a CSV file, parse it and bulk insert records.
 * @route   POST /api/upload
 * @access  Public
 */
export const uploadCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No CSV file uploaded');
  }

  const filePath = req.file.path;

  try {
    const parsedRows = await parseCsv(filePath);

    if (parsedRows.length === 0) {
      res.status(400);
      throw new Error('CSV is empty or missing required columns (name, recordNo)');
    }

    // De-duplicate within the file itself by recordNo.
    const seen = new Set();
    const uniqueRows = [];
    let inFileDuplicates = 0;
    for (const row of parsedRows) {
      if (seen.has(row.recordNo)) {
        inFileDuplicates += 1;
      } else {
        seen.add(row.recordNo);
        uniqueRows.push(row);
      }
    }

    // Find which recordNos already exist in the DB.
    const recordNos = uniqueRows.map((r) => r.recordNo);
    const existing = await Record.find({ recordNo: { $in: recordNos } })
      .select('recordNo')
      .lean();
    const existingSet = new Set(existing.map((e) => e.recordNo));

    const toInsert = uniqueRows.filter((r) => !existingSet.has(r.recordNo));
    const dbDuplicates = uniqueRows.length - toInsert.length;

    let insertedCount = 0;
    if (toInsert.length > 0) {
      // ordered:false continues past any unexpected duplicate races.
      const inserted = await Record.insertMany(toInsert, { ordered: false });
      insertedCount = inserted.length;
    }

    res.status(201).json({
      success: true,
      insertedCount,
      duplicates: inFileDuplicates + dbDuplicates,
    });
  } finally {
    // Always clean up the temporary uploaded file.
    fs.unlink(filePath, () => {});
  }
});

/**
 * @desc    Get paginated, searchable list of records.
 * @route   GET /api/records?page=&limit=&search=
 * @access  Public
 */
export const getRecords = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const search = (req.query.search || '').trim();

  let filter = {};
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter = {
      $or: [{ name: regex }, { address: regex }, { phone: regex }, { recordNo: regex }],
    };
  }

  const total = await Record.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const records = await Record.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    total,
    page,
    totalPages,
    records,
  });
});

/**
 * @desc    Get dashboard statistics.
 * @route   GET /api/records/stats
 * @access  Public
 */
export const getStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [total, today, recent] = await Promise.all([
    Record.countDocuments(),
    Record.countDocuments({ createdAt: { $gte: startOfDay } }),
    Record.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    success: true,
    stats: {
      total,
      today,
      recent,
    },
  });
});

/**
 * @desc    Get records grouped by company name with counts.
 * @route   GET /api/records/companies
 * @access  Public
 */
export const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Record.aggregate([
    {
      $group: {
        _id: '$name',
        count: { $sum: 1 },
        lastUpdated: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      $project: {
        _id: 0,
        name: '$_id',
        count: 1,
        lastUpdated: 1,
      },
    },
  ]);

  res.json({ success: true, companies });
});

/**
 * @desc    Get a single record by id.
 * @route   GET /api/records/:id
 * @access  Public
 */
export const getRecordById = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id).lean();
  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }
  res.json({ success: true, record });
});

/**
 * @desc    Update a record.
 * @route   PUT /api/records/:id
 * @access  Public
 */
export const updateRecord = asyncHandler(async (req, res) => {
  const { name, address, phone, recordNo, id } = req.body;

  const record = await Record.findByIdAndUpdate(
    req.params.id,
    { name, address, phone, recordNo, id },
    { new: true, runValidators: true }
  );

  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }

  res.json({ success: true, record });
});

/**
 * @desc    Delete a single record.
 * @route   DELETE /api/records/:id
 * @access  Public
 */
export const deleteRecord = asyncHandler(async (req, res) => {
  const record = await Record.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }
  res.json({ success: true, message: 'Record deleted' });
});

/**
 * @desc    Delete all records.
 * @route   DELETE /api/records
 * @access  Public
 */
export const deleteAllRecords = asyncHandler(async (req, res) => {
  const result = await Record.deleteMany({});
  res.json({
    success: true,
    message: 'All records deleted',
    deletedCount: result.deletedCount,
  });
});
