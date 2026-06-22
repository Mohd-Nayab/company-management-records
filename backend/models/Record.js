import mongoose from 'mongoose';

/**
 * Company record schema.
 * Stored in the `company_management_records` collection.
 */
const recordSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    recordNo: {
      type: String,
      required: [true, 'Record number is required'],
      trim: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'company_management_records',
  }
);

// Text-like search uses regex in the controller; ensure common fields are indexed.
recordSchema.index({ name: 1 });
recordSchema.index({ phone: 1 });

const Record = mongoose.model('Record', recordSchema);

export default Record;
