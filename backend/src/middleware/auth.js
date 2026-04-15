const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, message: 'No autenticado' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, nombre, email, telefono, rol, activo, created_at, tema FROM profesores WHERE email = $1',
      [payload.sub]
    );
    if (!rows.length || !rows[0].activo) {
      return res.status(401).json({ status: 401, message: 'No autenticado' });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ status: 401, message: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'ADMIN' && req.user?.rol !== 'SUPERADMIN') {
    return res.status(403).json({ status: 403, message: 'No tienes permisos para realizar esta acción' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.rol !== 'SUPERADMIN') {
    return res.status(403).json({ status: 403, message: 'Solo el superadministrador puede realizar esta acción' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireSuperAdmin };
