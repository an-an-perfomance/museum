const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPhotos, getPhotoById, getPhotosByUser, uploadPhoto, updatePhoto, deletePhotos } = require('../controllers/photoController');
const { authMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  },
});

router.get('/', getPhotos);
router.get('/:id', getPhotoById);
router.get('/user/:userId', getPhotosByUser);
router.post('/', authMiddleware, upload.single('photo'), uploadPhoto);
router.patch('/:id', authMiddleware, updatePhoto);
router.delete('/', authMiddleware, deletePhotos);

module.exports = router;
