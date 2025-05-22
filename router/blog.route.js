const express = require('express');
const router = express.Router();
const Blog = require('../schema/blog.model');

router.post('/', async (req, res) => {
  try {
    const { title, content, author, thumbnail } = req.body;

    const blog = new Blog({
      title,
      content,
      author,
      thumbnail,
    });

    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving blog' });
  }
});

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'email gender role') 
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Error getting blogs' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'email gender role');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blog' });
  }
});

module.exports = router;
