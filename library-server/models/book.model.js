const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false },
);

const borrowSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    userCode: { type: Number, required: true },
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    categories: { type: [String], default: [] },
    supplier: { type: supplierSchema },

    isBorrowed: { type: Boolean, default: false },
    borrows: { type: [borrowSchema], default: [] },
  },
  { versionKey: false },
);

module.exports = mongoose.model('Book', bookSchema);