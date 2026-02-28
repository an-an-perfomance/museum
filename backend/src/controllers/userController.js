const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crypto = require('crypto');

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword, role: role || 'USER' },
      select: { id: true, username: true, role: true },
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'User already exists or invalid data' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);
    // Find photos to delete files
    const photos = await prisma.photo.findMany({ where: { userId } });
    
    await prisma.user.delete({ where: { id: userId } });

    // Delete files from disk
    const fs = require('fs');
    const path = require('path');
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
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });

    res.json({ newPassword });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, changePassword, createUser, getUsers, deleteUser, resetPassword };
