require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
const cors = require('cors');
const connectDB = require('./db');


app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// connect DB
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/malldb').catch(err=>console.error(err));


// set io for routes
app.set('io', io);


// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/security', require('./routes/security'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/foodcourt', require('./routes/foodcourt'));


io.on('connection', (socket) => {
console.log('socket connected', socket.id);
socket.on('disconnect', ()=> console.log('socket disconnected', socket.id));
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Mall backend running
