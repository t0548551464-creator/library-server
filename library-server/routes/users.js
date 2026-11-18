const express = require('express');
const { signUp, signIn, getAllUsers, updateUser } = require('../controllers/user.controller');
const { checkAuth, checkAdmin, checkSameUser } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/', checkAuth, checkAdmin, getAllUsers);
router.put('/:id', checkAuth, checkSameUser, updateUser);
router.patch('/:id', checkAuth, checkSameUser, updateUser);

module.exports = router;