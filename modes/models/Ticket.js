const mongoose = require('mongoose');
const s = new mongoose.Schema({ name:String, email:String, subject:String, message:String, status:{type:String,default:'open'}, createdAt:{type:Date,default:Date.now} });
module.exports = mongoose.model('Ticket', s);
