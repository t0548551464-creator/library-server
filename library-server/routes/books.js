const express = require('express');
const {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  borrowBook,
  returnBook,
  deleteBook,
} = require('../controllers/books.controller');

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', addBook);
router.put('/:id', updateBook);
router.patch('/:id', updateBook);
router.patch('/:id/borrow', borrowBook);
router.patch('/:id/return', returnBook);
router.delete('/:id', deleteBook);

module.exports = router;