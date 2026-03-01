const db = require('../db');
const fs = require('fs');
const path = require('path');

const PAGE_SIZE = 50;

const getPhotos = async (req, res) => {
  try {
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || PAGE_SIZE), 100);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    const [photosResult, countResult] = await Promise.all([
      db.query(`
        SELECT p.*, json_build_object('id', u.id, 'username', u.username) as user
        FROM "Photo" p
        JOIN "User" u ON p."userId" = u.id
        ORDER BY p.id
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      db.query('SELECT COUNT(*)::int AS total FROM "Photo"'),
    ]);

    const total = countResult.rows[0].total;
    res.json({ photos: photosResult.rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPhotoById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, json_build_object('id', u.id, 'username', u.username) as user
      FROM "Photo" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.id = $1
    `, [parseInt(req.params.id)]);
    
    const photo = result.rows[0];
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPhotosByUser = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, json_build_object('id', u.id, 'username', u.username) as user
      FROM "Photo" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p."userId" = $1
    `, [parseInt(req.params.userId)]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadPhoto = async (req, res) => {
  const { title, description, fullDescription } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const result = await db.query(
      'INSERT INTO "Photo" (title, description, "fullDescription", filename, "userId") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, fullDescription, req.file.filename, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updatePhoto = async (req, res) => {
  const { title, description, fullDescription } = req.body;
  try {
    const result = await db.query('SELECT * FROM "Photo" WHERE id = $1', [parseInt(req.params.id)]);
    const photo = result.rows[0];
    
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (photo.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateResult = await db.query(
      'UPDATE "Photo" SET title = $1, description = $2, "fullDescription" = $3 WHERE id = $4 RETURNING *',
      [title, description, fullDescription, parseInt(req.params.id)]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const deletePhotos = async (req, res) => {
  const { ids } = req.body; // Array of IDs
  try {
    const idList = ids.map(id => parseInt(id));
    const result = await db.query('SELECT * FROM "Photo" WHERE id = ANY($1)', [idList]);
    const photos = result.rows;

    for (const photo of photos) {
      if (photo.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: `Access denied for photo ID ${photo.id}` });
      }
    }

    await db.query('DELETE FROM "Photo" WHERE id = ANY($1)', [idList]);

    // Delete files from disk
    photos.forEach(photo => {
      const filePath = path.join(__dirname, '../uploads', photo.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.json({ message: 'Photos deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPhotos, getPhotoById, getPhotosByUser, uploadPhoto, updatePhoto, deletePhotos };
