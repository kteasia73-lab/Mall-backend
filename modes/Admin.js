const mongoose = require('mongoose');
const s = new mongoose.Schema({ email: {type:String, unique:true}, hash: String, role: {type:String, default:'admin'} });
module.exports = mongoose.model('Admin', s);
