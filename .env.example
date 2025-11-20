# Mall Full Repos — Server (backend) + Admin Dashboard (frontend)

This document contains two complete repos you can copy into separate folders and deploy:

1. `mall-backend/` — Node.js + Express + MongoDB + Socket.IO API
2. `mall-admin/` — React + Vite admin dashboard (connects to backend)

---

## Quick README

### Steps (high level)

1. Create two folders: `mall-backend` and `mall-admin`.
2. Paste the files from each repo below into the correct folder structure.
3. Set environment variables in `mall-backend/.env` (see `.env.example`).
4. Install dependencies and run:

   * Backend: `npm install` → `npm run dev` (or use Docker)
   * Admin: `npm install` → `npm run dev` (or build and serve)
5. Update the `Mall — Single Install (Liquid)` snippet `MallConfig.backend` to your backend base URL.
6. Test flows (announcements, security events, tickets, food orders).

---

# Repo A: mall-backend

**Folder:** `mall-backend/`

### Files

```
mall-backend/
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── server.js
├── db.js
├── models/
│   ├── Admin.js
│   ├── Announcement.js
│   ├── Ticket.js
│   └── SecurityAlert.js
├── routes/
│   ├── auth.js
│   ├── announcements.js
│   ├── security.js
│   ├── tickets.js
│   └── foodcourt.js
└── public/
    └── admin-placeholder.html
```

---

### mall-backend/package.json

```json
{
  "name": "mall-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-jwt": "^7.7.8",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.4",
    "nodemailer": "^6.9.1",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

### mall-backend/.env.example

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/malldb
JWT_SECRET=replace_with_a_strong_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=admin@example.com
```

---

### mall-backend/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node","server.js"]
```

---

### mall-backend/docker-compose.yml (local dev)

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    ports:
      - '27017:27017'
  backend:
    build: .
    command: npm run dev
    volumes:
      - ./:/app
      - /app/node_modules
    ports:
      - '4000:4000'
    environment:
      - MONGO_URI=mongodb://mongo:27017/malldb
      - JWT_SECRET=devsecret
    depends_on:
      - mongo
volumes:
  mongo-data:
```

---

### mall-backend/db.js

```js
// db.js — connect to MongoDB
const mongoose = require('mongoose');
const connectDB = async (uri) => {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');
};
module.exports = connectDB;
```

---

### mall-backend/models/Admin.js

```js
const mongoose = require('mongoose');
const s = new mongoose.Schema({ email: {type:String, unique:true}, hash: String, role: {type:String, default:'admin'} });
module.exports = mongoose.model('Admin', s);
```

---

### mall-backend/models/Announcement.js

```js
const mongoose = require('mongoose');
const s = new mongoose.Schema({ msg: String, createdAt: { type: Date, default: Date.now } });
module.exports = mongoose.model('Announcement', s);
```

---

### mall-backend/models/Ticket.js

```js
const mongoose = require('mongoose');
const s = new mongoose.Schema({ name:String, email:String, subject:String, message:String, status:{type:String,default:'open'}, createdAt:{type:Date,default:Date.now} });
module.exports = mongoose.model('Ticket', s);
```

---

### mall-backend/models/SecurityAlert.js

```js
const mongoose = require('mongoose');
const s = new mongoose.Schema({ type:String, details:Object, severity:{type:String,default:'medium'}, createdAt:{type:Date,default:Date.now} });
module.exports = mongoose.model('SecurityAlert', s);
```

---

### mall-backend/routes/auth.js

```js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, admin.hash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

module.exports = router;
```

---

### mall-backend/routes/announcements.js

```js
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
```

---

### mall-backend/routes/security.js

```js
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
```

---

### mall-backend/routes/tickets.js

```js
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
```

---

### mall-backend/routes/foodcourt.js

```js
const express = require('express');
const router = express.Router();
// simple in-memory sample for shops
let shops = [ { id:1, name:'BurgerZone', status:'Normal' }, { id:2, name:'Cafe Aroma', status:'Normal' }, { id:3, name:'Sweet Bites', status:'Quiet' } ];

router.get('/shops', (req,res)=> res.json(shops));
router.post('/order', (req,res)=>{
  // body: { stallId }
  const { stallId } = req.body;
  const shop = shops.find(s => s.id == stallId);
  const order = { orderId: 'F' + Date.now(), shopId: stallId, eta: Math.floor(3 + Math.random()*8), status: 'preparing' };
  if(shop) shop.status = 'Busy';
  req.app.get('io') && req.app.get('io').emit('food_order', order);
  res.json(order);
});

module.exports = router;
```

---

### mall-backend/public/admin-placeholder.html

```html
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Mall Admin Placeholder</title></head>
  <body>
    <h1>Mall Admin Placeholder</h1>
    <p>Use the separate admin app for the full dashboard.</p>
  </body>
</html>
```

---

### mall-backend/server.js

```js
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
server.listen(PORT, () => console.log('Mall backend running on', PORT));
```

---

# Repo B: mall-admin (React + Vite)

**Folder:** `mall-admin/`

```
mall-admin/
├── package.json
├── vite.config.js
├── Dockerfile
├── .env
├── index.html
└── src/
    ├── main.jsx
    ├── api.js
    ├── pages/
    │   ├── Login.jsx
    │   └── Dashboard.jsx
    └── styles.css
```

---

### mall-admin/package.json

```json
{
  "name": "mall-admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

### mall-admin/vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()], server: { port: 5173 } })
```

---

### mall-admin/Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### mall-admin/.env (example)

```
VITE_BACKEND=http://localhost:4000
```

---

### mall-admin/index.html

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mall Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### mall-admin/src/main.jsx

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './styles.css'

function App(){
  const token = localStorage.getItem('MALL_ADMIN_TOKEN')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={ token ? <Dashboard /> : <Navigate to="/login" replace /> } />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
```

---

### mall-admin/src/api.js

```js
import axios from 'axios'
const BASE = import.meta.env.VITE_BACKEND || 'http://localhost:4000'
export const api = axios.create({ baseURL: BASE + '/api', headers: { 'Content-Type': 'application/json' } })
export function setAuth(token){ api.defaults.headers.common['Authorization'] = `Bearer ${token}` }
```

---

### mall-admin/src/pages/Login.jsx

```jsx
import React, {useState} from 'react'
import { api, setAuth } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const nav = useNavigate()
  async function submit(e){
    e.preventDefault()
    try{
      const res = await api.post('/auth/login', { email, password: pass })
      const token = res.data.token
      localStorage.setItem('MALL_ADMIN_TOKEN', token)
      setAuth(token)
      nav('/')
    }catch(err){ alert('Login failed') }
  }
  return (
    <div className="page-center">
      <form className="card" onSubmit={submit}>
        <h2>Mall Admin Login</h2>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button type="submit">Sign in</button>
      </form>
    </div>
  )
}
```

---

### mall-admin/src/pages/Dashboard.jsx

```jsx
import React, {useEffect, useState} from 'react'
import { api, setAuth } from '../api'
import { io } from 'socket.io-client'

export default function Dashboard(){
  const [ann, setAnn] = useState([])
  const [tickets, setTickets] = useState([])
  const [alerts, setAlerts] = useState([])
  const [shops, setShops] = useState([])
  const token = localStorage.getItem('MALL_ADMIN_TOKEN')

  useEffect(()=>{ if(token) setAuth(token) }, [token])

  useEffect(()=>{
    api.get('/announcements').then(r=>setAnn(r.data)).catch(()=>{})
    api.get('/tickets').then(r=>setTickets(r.data)).catch(()=>{})
    api.get('/security/alerts').then(r=>setAlerts(r.data)).catch(()=>{})
    api.get('/foodcourt/shops').then(r=>setShops(r.data)).catch(()=>{})

    const socket = io(import.meta.env.VITE_BACKEND || 'http://localhost:4000')
    socket.on('connect', ()=> console.log('socket connected'))
    socket.on('security_alert', data => setAlerts(prev=>[data,...prev]))
    socket.on('ticket_created', t => setTickets(prev=>[t,...prev]))
    socket.on('food_order', o => setShops(prev=> prev.map(s => s.id === o.shopId ? {...s, status: 'Busy'} : s)))
    return ()=> socket.disconnect()
  },[])

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h3>Teasia Mall — Admin</h3>
        <nav><ul>
          <li>Overview</li>
          <li>Announcements</li>
          <li>Tickets</li>
          <li>Food Court</li>
        </ul></nav>
      </aside>
      <main>
        <section className="cards">
          <div className="card">
            <h4>Security Alerts</h4>
            {alerts.slice(0,6).map(a=> <div key={a._id || a.id}>{a.type} — {a.details ? JSON.stringify(a.details) : a.msg}</div>)}
          </div>
          <div className="card">
            <h4>Recent Tickets</h4>
            {tickets.slice(0,6).map(t=> <div key={t._id || t.id}>{t.subject || t.name} — {t.status}</div>)}
          </div>
          <div className="card">
            <h4>Food Shops</h4>
            {shops.map(s=> <div key={s.id}>{s.name} — {s.status}</div>)}
          </div>
        </section>
        <section style={{marginTop:20}}>
          <h3>Announcements</h3>
          <ul>{ann.map(a=> <li key={a._id || a.id}>{a.msg}</li>)}</ul>
        </section>
      </main>
    </div>
  )
}
```

---

### mall-admin/src/styles.css

```css
body{font-family:Inter,system-ui,Arial;background:#f6f7fb;margin:0}
.page-center{height:100vh;display:flex;align-items:center;justify-content:center}
.card{padding:20px;border-radius:10px;background:#fff;box-shadow:0 8px 30px rgba(2,6,23,.08);width:320px}
.card input{display:block;margin:8px 0;padding:10px;border-radius:8px;border:1px solid #e6e6e6;width:100%}
.card button{padding:10px;border-radius:8px;border:0;background:#111;color:#fff;width:100%}
.dashboard{display:flex;min-height:100vh}
.sidebar{width:220px;background:#fff;padding:20px;border-right:1px solid #eee}
main{flex:1;padding:20px}
.cards{display:flex;gap:12px}
.card{background:#fff;padding:12px;border-radius:8px;flex:1}
```

---

# Final notes & next steps

* These repos are ready to be zipped and deployed. I intentionally kept the admin UI lightweight and dependency-minimal so you can iterate quickly.
* Security: set a strong `JWT_SECRET` and protect the backend endpoints behind proper auth if exposing publicly.
* Persistence: use MongoDB Atlas for production (set `MONGO_URI` accordingly).
* After deployment, update your Shopify snippet `MallConfig.backend` to the backend URL (e.g. `https://mall-backend.onrender.com`).

If you want, I can now:

* Provide a ZIP of both repos (paste-ready files) — I can output them here as individual text documents.
* Generate a `docker-compose` + `README` zipped bundle.
* Deploy a demo to Render with a one-click config (I’ll output the render.yaml and step list).

Which of those would you like next?
