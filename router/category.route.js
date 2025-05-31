const express = require('express');
const router = express.Router();
const Category = require('../schema/category.model');

router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const existing = await Category.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Category already exists' });

    const newCategory = await Category.create({ name });
    res.status(201).json({ message: 'Category created', data: newCategory });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
