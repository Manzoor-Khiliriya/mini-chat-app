const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendUserResponse = (res, user) => {
  res.cookie('token', createToken(user), { httpOnly: true, sameSite: 'lax' });
  res.json({
    user: { id: user._id, username: user.username, displayName: user.displayName, lastSeen: user.lastSeen },
  });
};

exports.signup = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'username taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, displayName });
    sendUserResponse(res, user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'invalid credentials' });

    sendUserResponse(res, user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
};

exports.me = async (req, res) => {
  const user = req.user;
  res.json({
    user: { id: user._id, username: user.username, displayName: user.displayName, lastSeen: user.lastSeen },
  });
};
