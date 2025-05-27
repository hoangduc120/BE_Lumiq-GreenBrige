const express = require('express');
const router = express.Router();
const uploadCloud = require('../configs/cloudinary.config');
const cloudinary = require('cloudinary').v2;

router.post('/', uploadCloud.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

router.delete('/', async (req, res) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'public_id is required' });
  }

  try {
    const normalizedPublicId = public_id.replace(/\.[^/.]+$/, '');
    const result = await cloudinary.uploader.destroy(normalizedPublicId);
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
    }
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
    res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
  }
});

module.exports = router;