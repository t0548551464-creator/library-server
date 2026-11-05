const mongoose = require('mongoose');
const Book = require('../models/book.model');
const { users } = require('../db');

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const EDITABLE_FIELDS = ['name', 'price', 'categories', 'supplier'];

const pickEditable = (body = {}) => {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getAllBooks = async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const { name } = req.query;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return next(httpError(400, 'page and limit must be positive whole numbers'));
  }

  const filter = typeof name === 'string' && name.trim() !== ''
    ? { name: { $regex: escapeRegex(name.trim()), $options: 'i' } }
    : {};

  try {
    const [books, totalItems] = await Promise.all([
      Book.find(filter).skip((page - 1) * limit).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      books,
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(httpError(400, `"${id}" is not a valid book code`));
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return next(httpError(404, `Book ${id} not found`));
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const addBook = async (req, res, next) => {
  try {
    const book = await Book.create(pickEditable(req.body));
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(httpError(400, `"${id}" is not a valid book code`));
  }

  const body = req.body || {};
  const blockedFields = Object.keys(body).filter((field) => !EDITABLE_FIELDS.includes(field));
  if (blockedFields.length > 0) {
    return next(httpError(400, `These fields cannot be updated here: ${blockedFields.join(', ')}`));
  }

  const updates = pickEditable(body);
  let update;

  if (req.method === 'PUT') {
    const missing = ['name', 'price'].filter((field) => updates[field] === undefined);
    if (missing.length > 0) {
      return next(httpError(400, `PUT needs all the book details. Missing: ${missing.join(', ')}`));
    }
    update = { $set: { categories: [], ...updates } };
    if (updates.supplier === undefined) {
      update.$unset = { supplier: 1 };
    }
  } else {
    if (Object.keys(updates).length === 0) {
      return next(httpError(400, 'Send at least one field to update'));
    }
    update = { $set: updates };
  }

  try {
    const book = await Book.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!book) {
      return next(httpError(404, `Book ${id} not found`));
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const borrowBook = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(httpError(400, `"${id}" is not a valid book code`));
  }

  const userCode = Number(req.body?.userCode);
  const user = users.find((u) => u.code === userCode);
  if (!user) {
    return next(httpError(404, `User ${req.body?.userCode} not found`));
  }

  try {
    const book = await Book.findOneAndUpdate(
      { _id: id, isBorrowed: false },
      {
        $set: { isBorrowed: true },
        $push: { borrows: { date: new Date(), userCode } }, 
      },
      { new: true }
    );

    if (!book) {
      const exists = await Book.exists({ _id: id });
      if (!exists) {
        return next(httpError(404, `Book ${id} not found`));
      }
      return next(httpError(409, `Book ${id} is already borrowed`));
    }

    user.borrowedBooks.push(book.id);
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(httpError(400, `"${id}" is not a valid book code`));
  }

  try {
    const book = await Book.findOneAndUpdate(
      { _id: id, isBorrowed: true },
      { $set: { isBorrowed: false } },
      { new: true }
    );

    if (!book) {
      const exists = await Book.exists({ _id: id });
      if (!exists) {
        return next(httpError(404, `Book ${id} not found`));
      }
      return next(httpError(409, `Book ${id} is not borrowed`));
    }

    const lastBorrow = book.borrows[book.borrows.length - 1];
    const user = lastBorrow && users.find((u) => u.code === lastBorrow.userCode);
    if (user) {
      user.borrowedBooks = user.borrowedBooks.filter((code) => code !== book.id);
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(httpError(400, `"${id}" is not a valid book code`));
  }

  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return next(httpError(404, `Book ${id} not found`));
    }

    users.forEach((user) => {
      user.borrowedBooks = user.borrowedBooks.filter((code) => code !== book.id);
    });

    res.json({ message: `Book ${id} deleted`, book });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  borrowBook,
  returnBook,
  deleteBook,
};