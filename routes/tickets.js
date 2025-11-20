const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');


router.get('/', async (req, res) => {
const t = await Ticket.find().sort({ createdAt: -1 }).limit(200);
res.json(t);
});


router.post('/', async (req, res) => {
const { name, email, subject, message } = req.body;
const saved = await Ticket.create({ name, email, subject, message });
req.app.get('io') && req.app.get('io').emit('ticket_created', saved);
res.json(saved);
});


module.exports = router;
