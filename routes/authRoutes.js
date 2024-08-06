// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username').isString().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('userType').isIn(['Writer', 'Publisher']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, userType } = req.body;
    try {
      const user = await User.create({ username, password, userType });
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const user = await User.findOne({ where: { username } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, userType: user.userType }, 'your-jwt-secret', { expiresIn: '1h' });
      req.session.userId = user.id;
      req.session.userType = user.userType;
      res.json({ message: 'Login successful', token });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Switch session type
router.post('/switch-session', async (req, res) => {
  const { userType } = req.body;
  if (!['Writer', 'Publisher'].includes(userType)) {
    return res.status(400).json({ error: 'Invalid userType' });
  }

  req.session.userType = userType;
  res.json({ message: `Switched to ${userType} session` });
});

module.exports = router;
