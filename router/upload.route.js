const express = require('express');
const router = express.Router();
const uploadCloud = require('../configs/cloudinary.config');

router.post('/', uploadCloud.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ url: req.file.path });
});

module.exports = router;