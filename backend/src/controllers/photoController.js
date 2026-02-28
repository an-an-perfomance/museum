const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const getPhotos = async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      include: { user: { select: { id: true, username: true } } },
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPhotoById = async (req, res) => {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: { select: { id: true, username: true } } },
    });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getPhotosByUser = async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      where: { userId: parseInt(req.params.userId) },
      include: { user: { select: { id: true, username: true } } },
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadPhoto = async (req, res) => {
  const { title, description } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const photo = await prisma.photo.create({
      data: {
        title,
        description,
        filename: req.file.filename,
        userId: req.user.id,
      },
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePhoto = async (req, res) => {
  const { title, description } = req.body;
  try {
    const photo = await prisma.photo.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (photo.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description },
    });
    res.json(updatedPhoto);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePhotos = async (req, res) => {
  const { ids } = req.body; // Array of IDs
  try {
    const photos = await prisma.photo.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
    });

    for (const photo of photos) {
      if (photo.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: `Access denied for photo ID ${photo.id}` });
      }
    }

    await prisma.photo.deleteMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
    });

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
