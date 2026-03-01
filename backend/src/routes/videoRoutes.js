const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getVideos, getVideoById, getVideosByUser, uploadVideo, updateVideo, deleteVideos } = require('../controllers/videoController');
const { authMiddleware } = require('../middleware/auth');

const VIDEO_SIZE_LIMIT_MB = parseInt(process.env.VIDEO_SIZE_LIMIT_MB || '300', 10);
const VIDEOS_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'videos');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEOS_UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: VIDEO_SIZE_LIMIT_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp4|webm|mov)$/i;
    const mimeOk = /^video\/(mp4|webm|quicktime)$/.test(file.mimetype);
    const extOk = allowed.test(path.extname(file.originalname));
    if (mimeOk && extOk) return cb(null, true);
    cb(new Error('Allowed video formats: mp4, webm, mov'));
  },
});

router.get('/', getVideos);
router.get('/user/:userId', getVideosByUser);
router.get('/:id', getVideoById);
router.post('/', authMiddleware, (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: `Файл слишком большой. Максимум ${VIDEO_SIZE_LIMIT_MB} МБ` });
      }
      return res.status(400).json({ message: err.message || 'Ошибка загрузки видео' });
    }
    next();
  });
}, uploadVideo);
router.patch('/:id', authMiddleware, updateVideo);
router.delete('/', authMiddleware, deleteVideos);

module.exports = router;
