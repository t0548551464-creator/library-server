const mongoose = require('mongoose');
const User = require('../models/user.model');
const { generateToken } = require('../middlewares/auth.middleware');

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const signUp = async (req, res, next) => {
  const { name, username, email, password, phone, role } = req.body || {};
  const finalName = name || username;

  if (!finalName || !email || !password) {
    return next(httpError(400, 'name, email and password are required'));
  }

  try {
    const newUser = await User.create({
      name: finalName,
      email,
      password,
      phone,
      role,
    });

    const token = generateToken(newUser);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    if (error.code === 11000) {
      return next(httpError(409, `A user with email ${email} already exists`));
    }
    next(error);
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(httpError(400, 'email and password are required'));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return next(httpError(401, 'Wrong email or password'));
    }

    const isMatch = await User.checkPassword(password, user.password);
    if (!isMatch) {
      return next(httpError(401, 'Wrong email or password'));
    }

    const token = generateToken(user);

    res.json({ message: `Welcome ${user.name}`, user, token });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(httpError(400, `"${id}" is not a valid user id`));
  }

  const { name, username, email, phone, password } = req.body || {};
  const finalName = name || username;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(httpError(404, `User ${id} not found`));
    }

    if (finalName !== undefined) user.name = finalName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (password !== undefined) user.password = password;

    await user.save();
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return next(httpError(409, `A user with email ${email} already exists`));
    }
    next(error);
  }
};

module.exports = { signUp, signIn, getAllUsers, updateUser };