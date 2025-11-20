const express = require('express');
const router = express.Router();
const SecurityAlert = require('../models/SecurityAlert');


router.get('/alerts', async (req, res) => {
const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(100);
res.json(alerts);
});


router.post('/event', async (req, res) => {
// expected body: { type, data, url, ts, shop }
const { type, data } = req.body;
// simple rule example: many login_fail -> create alert
if(type === 'login_fail'){
const alert = await SecurityAlert.create({ type: 'login_fail', details: data });
const io = req.app.get('io'); if(io) io.emit('security_alert', alert);
return res.json({ ok: true, alert });
}
// store generic low-priority alert for any suspicious payload
if(data && data.suspicious){
const alert = await SecurityAlert.create({ type: 'suspicious_activity', details: data });
req.app.get('io') && req.app.get('io').emit('security_alert', alert);
}
res.json({ ok: true });
});


module.exports = router;
