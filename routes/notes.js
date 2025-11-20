const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Note = require('../models/Note');

// 📌 GET all notes (Protected)
router.get('/', fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ success: true, notes });
  } catch (err) {
    console.error('❌ Error fetching notes:', err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 📌 CREATE a new note (Protected)
router.post('/', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Title and description are required'
    });
  }

  try {
    const note = new Note({
      user: req.user.id,
      title,
      description,
      tag: tag || 'General'
    });

    const savedNote = await note.save();
    res.status(201).json({ success: true, note: savedNote });
  } catch (err) {
    console.error('❌ Error saving note:', err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 📌 UPDATE a note (Protected)
router.put('/:id', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized action' });
    }

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (tag) updatedFields.tag = tag;

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    res.json({ success: true, note: updatedNote });
  } catch (error) {
    console.error('❌ Error updating note:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 📌 DELETE a note (Protected)
router.delete('/:id', fetchUser, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized action' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting note:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
