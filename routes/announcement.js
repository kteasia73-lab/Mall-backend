const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');


router.get('/', async (req, res) => {
const a = await Announcement.find().sort({ createdAt: -1 }).limit(50);
res.json(a);
});


router.post('/', async (req, res) => {
const { msg } = req.body;
const doc = await Announcement.create({ msg });
// emit via socket
const io = req.app.get('io'); if(io) io.emit('announcement', doc);
res.json(doc);
});


module.exports = router;
