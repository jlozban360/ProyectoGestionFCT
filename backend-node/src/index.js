require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rutas bajo /api (igual que Spring con context-path: /api)
app.use('/api/health',     require('./routes/health'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/empresas',   require('./routes/empresas'));
app.use('/api/alumnos',    require('./routes/alumnos'));
app.use('/api/contactos',  require('./routes/contactos'));
app.use('/api/profesores', require('./routes/profesores'));
app.use('/api/dashboard',  require('./routes/dashboard'));

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Node.js escuchando en puerto ${PORT}`);
});
