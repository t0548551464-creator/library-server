const { users } = require('../db');

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const withoutPassword = ({ password, ...user }) => user;

const signUp = (req, res, next) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return next(httpError(400, 'username, email and password are required'));
  }
  if (users.some((u) => u.email === email)) {
    return next(httpError(409, `A user with email ${email} already exists`));
  }

  const code = users.length > 0 ? Math.max(...users.map((u) => u.code)) + 1 : 1;
  const newUser = { code, username, email, password, borrowedBooks: [] };
  users.push(newUser);

  res.status(201).json(withoutPassword(newUser));
};

const signIn = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(httpError(400, 'email and password are required'));
  }

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return next(httpError(401, 'Wrong email or password'));
  }

  res.json({ message: `Welcome ${user.username}`, user: withoutPassword(user) });
};

const getAllUsers = (req, res) => {
  res.json(users.map(withoutPassword));
};

module.exports = { signUp, signIn, getAllUsers };