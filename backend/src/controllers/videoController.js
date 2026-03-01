const db = require('../db');
const fs = require('fs');
const path = require('path');

const PAGE_SIZE = 50;
const VIDEOS_UPLOAD_DIR = path.join(__dirname, '../uploads/videos');

const getVideos = async (req, res) => {
  try {
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || PAGE_SIZE), 100);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    const [videosResult, countResult] = await Promise.all([
      db.query(`
        SELECT v.*, json_build_object('id', u.id, 'username', u.username) as user
        FROM "Video" v
        JOIN "User" u ON v."userId" = u.id
        ORDER BY v.id
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      db.query('SELECT COUNT(*)::int AS total FROM "Video"'),
    ]);

    const total = countResult.rows[0].total;
    res.json({ videos: videosResult.rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVideoById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, json_build_object('id', u.id, 'username', u.username) as user
      FROM "Video" v
      JOIN "User" u ON v."userId" = u.id
      WHERE v.id = $1
    `, [parseInt(req.params.id)]);

    const video = result.rows[0];
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getVideosByUser = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, json_build_object('id', u.id, 'username', u.username) as user
      FROM "Video" v
      JOIN "User" u ON v."userId" = u.id
      WHERE v."userId" = $1
    `, [parseInt(req.params.userId)]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadVideo = async (req, res) => {
  const { title, description, fullDescription } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const result = await db.query(
      'INSERT INTO "Video" (title, description, "fullDescription", filename, "userId") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, fullDescription, req.file.filename, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateVideo = async (req, res) => {
  const { title, description, fullDescription } = req.body;
  try {
    const result = await db.query('SELECT * FROM "Video" WHERE id = $1', [parseInt(req.params.id)]);
    const video = result.rows[0];

    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateResult = await db.query(
      'UPDATE "Video" SET title = $1, description = $2, "fullDescription" = $3 WHERE id = $4 RETURNING *',
      [title, description, fullDescription, parseInt(req.params.id)]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteVideos = async (req, res) => {
  const { ids } = req.body;
  try {
    const idList = ids.map(id => parseInt(id));
    const result = await db.query('SELECT * FROM "Video" WHERE id = ANY($1)', [idList]);
    const videos = result.rows;

    for (const video of videos) {
      if (video.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: `Access denied for video ID ${video.id}` });
      }
    }

    await db.query('DELETE FROM "Video" WHERE id = ANY($1)', [idList]);

    videos.forEach(video => {
      const filePath = path.join(VIDEOS_UPLOAD_DIR, video.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.json({ message: 'Videos deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getVideos, getVideoById, getVideosByUser, uploadVideo, updateVideo, deleteVideos };
