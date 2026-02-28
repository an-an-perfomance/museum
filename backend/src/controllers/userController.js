const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM "User" WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO "User" (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role || 'USER']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: 'User already exists or invalid data' });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, role FROM "User"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);
    
    // Find photos to delete files
    const photoResult = await db.query('SELECT filename FROM "Photo" WHERE "userId" = $1', [userId]);
    const photos = photoResult.rows;
    
    await db.query('DELETE FROM "User" WHERE id = $1', [userId]);

    // Delete files from disk
    photos.forEach(photo => {
      const filePath = path.join(__dirname, '../uploads', photo.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.json({ message: 'User and their photos deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { id } = req.params;
  try {
    const newPassword = crypto.randomBytes(4).toString('hex'); // 8 chars
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPassword, parseInt(id)]);

    res.json({ newPassword });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, changePassword, createUser, getUsers, deleteUser, resetPassword };
