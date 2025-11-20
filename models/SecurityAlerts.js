const mongoose = require('mongoose');
const s = new mongoose.Schema({ type:String, details:Object, severity:{type:String,default:'medium'}, createdAt:{type:Date,default:Date.now} });
module.exports = mongoose.model('SecurityAlert', s);
