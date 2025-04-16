const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// @route   GET api/banners
// @desc    Get all active banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    // THIS IS THE FIX - Make sure we have the correct SQL query for active banners
    const [banners] = await db.query('SELECT * FROM banners WHERE active = ? ORDER BY created_at DESC', [true]);
    res.json(banners);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/banners/all
// @desc    Get all banners (including inactive)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const [banners] = await db.query('SELECT * FROM banners ORDER BY created_at DESC');
    res.json(banners);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/banners/:id
// @desc    Get banner by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Banner not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching banner:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/banners
// @desc    Create a banner
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    // THIS IS THE FIX - Debug what we're receiving
    console.log('Banner create request body:', req.body);
    console.log('Banner create file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload an image' });
    }
    
    const { title_fr, title_ar, subtitle_fr, subtitle_ar, active } = req.body;
    const image = `/uploads/${req.file.filename}`;
    
    // Convert active string to boolean
    const isActive = active === 'true' || active === true;
    
    const [result] = await db.query(
      'INSERT INTO banners (image, title_fr, title_ar, subtitle_fr, subtitle_ar, active) VALUES (?, ?, ?, ?, ?, ?)',
      [image, title_fr, title_ar, subtitle_fr, subtitle_ar, isActive]
    );
    
    const [newBanner] = await db.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newBanner[0]);
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/banners/:id
// @desc    Update a banner
// @access  Private
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    // THIS IS THE FIX - Debug what we're receiving
    console.log('Banner update request body:', req.body);
    console.log('Banner update file:', req.file);
    
    // Check if banner exists
    const [rows] = await db.query('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Banner not found' });
    }

    const banner = rows[0];
    const { title_fr, title_ar, subtitle_fr, subtitle_ar, active } = req.body;
    
    // Handle image update
    let image = banner.image;
    if (req.file) {
      // Delete old image if it exists
      if (banner.image) {
        const oldImagePath = path.join(__dirname, '..', banner.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = `/uploads/${req.file.filename}`;
    }
    
    // Convert active string to boolean
    const isActive = active === 'true' || active === true;
    
    // Update banner
    await db.query(
      'UPDATE banners SET image = ?, title_fr = ?, title_ar = ?, subtitle_fr = ?, subtitle_ar = ?, active = ? WHERE id = ?',
      [image, title_fr, title_ar, subtitle_fr, subtitle_ar, isActive, req.params.id]
    );
    
    // Get updated banner
    const [updatedBanner] = await db.query('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    
    res.json(updatedBanner[0]);
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/banners/:id
// @desc    Delete a banner
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if banner exists and get image path
    const [rows] = await db.query('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Banner not found' });
    }
    
    // Delete image file if it exists
    if (rows[0].image) {
      const imagePath = path.join(__dirname, '..', rows[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete banner from database
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    
    res.json({ msg: 'Banner removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;