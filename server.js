require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

//const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const solicitudesRoutes = require('./routes/solicitudes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

//app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', project: 'VozSegura', version: '2.0' }));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

app.listen(PORT, () => {
  console.log(`\n💜 VozSegura corriendo en http://localhost:${PORT}\n`);
});
