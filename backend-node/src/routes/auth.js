const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

function mapProfesor(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    rol: row.rol,
    activo: row.activo,
    tema: row.tema,
    createdAt: row.created_at,
    totalContactos: Number(row.total_contactos ?? 0),
  };
}

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 400, message: 'Email y contraseña son obligatorios' });
    }
    const { rows } = await pool.query(
      'SELECT * FROM profesores WHERE email = $1',
      [email]
    );
    const profesor = rows[0];
    if (!profesor || !profesor.activo) {
      return res.status(401).json({ status: 401, message: 'Credenciales incorrectas' });
    }
    const valid = await bcrypt.compare(password, profesor.password);
    if (!valid) {
      return res.status(401).json({ status: 401, message: 'Credenciales incorrectas' });
    }
    const token = jwt.sign(
      { sub: profesor.email },
      process.env.JWT_SECRET,
      { expiresIn: Math.floor(Number(process.env.JWT_EXPIRATION ?? 86400000) / 1000) + 's' }
    );
    res.json({ token, user: mapProfesor(profesor) });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json(mapProfesor(req.user));
});

module.exports = router;
