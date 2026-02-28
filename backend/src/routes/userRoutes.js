const express = require('express');
const router = express.Router();
const { login, changePassword, createUser, getUsers, deleteUser, resetPassword } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.post('/admin/users', authMiddleware, adminMiddleware, createUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.patch('/:id/reset-password', authMiddleware, adminMiddleware, resetPassword);
router.patch('/me/password', authMiddleware, changePassword);

module.exports = router;
