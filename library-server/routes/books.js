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
const { checkAuth, checkAdminOrSameUser } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', addBook);
router.put('/:id', updateBook);
router.patch('/:id', updateBook);
router.patch('/:id/borrow', checkAuth, checkAdminOrSameUser, borrowBook);
router.patch('/:id/return', returnBook);
router.delete('/:id', deleteBook);

module.exports = router;