const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchusar'); // ✅ correct name
const Note = require('../models/Note');

// 📌 GET all notes – Protected
router.get('/', fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error('❌ Error fetching notes:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 📌 POST new note – Protected
router.post('/', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const note = new Note({
      user: req.user.id,
      title,
      description,
      tag: tag || 'General'
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error('❌ Error saving note:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 📌 PUT update note – Protected
router.put('/:id', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      console.warn(`⚠️ Note not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized action' });
    }

    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json(updatedNote); // ✅ Send updated note directly
  } catch (error) {
    console.error('❌ Error updating note:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 📌 DELETE note – Protected
router.delete('/:id', fetchUser, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      console.warn(`⚠️ Cannot delete — note not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Unauthorized action' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting note:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
