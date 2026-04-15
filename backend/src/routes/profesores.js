const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const VALID_ROL = ['SUPERADMIN', 'ADMIN', 'COLABORADOR'];

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

router.use(authenticate);

// GET /api/profesores
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, COUNT(c.id) AS total_contactos
       FROM profesores p
       LEFT JOIN contactos c ON c.profesor_id = p.id
       GROUP BY p.id
       ORDER BY p.nombre ASC`
    );
    res.json(rows.map(mapProfesor));
  } catch (err) { next(err); }
});

// GET /api/profesores/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, COUNT(c.id) AS total_contactos
       FROM profesores p
       LEFT JOIN contactos c ON c.profesor_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 404, message: `Profesor no encontrado: ${req.params.id}` });
    }
    res.json(mapProfesor(rows[0]));
  } catch (err) { next(err); }
});

// POST /api/profesores  (ADMIN puede crear COLABORADORs; solo SUPERADMIN puede crear ADMINs)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, rol = 'COLABORADOR', activo = true } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ status: 400, message: 'Campos obligatorios: nombre, email, password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 400, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const rolFinal = VALID_ROL.includes(rol) ? rol : 'COLABORADOR';

    // Nadie puede crear otro SUPERADMIN
    if (rolFinal === 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'No se puede crear otro superadministrador' });
    }

    // Solo SUPERADMIN puede crear ADMINs
    if (rolFinal === 'ADMIN' && req.user.rol !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'Solo el superadministrador puede crear administradores' });
    }

    const existing = await pool.query('SELECT id FROM profesores WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({ status: 400, message: `Ya existe un profesor con el email: ${email}` });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO profesores (nombre, email, password, telefono, rol, activo, tema, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'light',NOW()) RETURNING *`,
      [nombre, email, hashed, telefono ?? null, rolFinal, activo]
    );
    res.status(201).json(mapProfesor({ ...rows[0], total_contactos: 0 }));
  } catch (err) { next(err); }
});

// PUT /api/profesores/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    // Solo ADMIN/SUPERADMIN puede editar a otros; cualquiera puede editarse a sí mismo
    if (req.user.id != id && req.user.rol !== 'ADMIN' && req.user.rol !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'No tienes permisos para realizar esta acción' });
    }

    const { nombre, email, password, telefono, rol, activo, tema } = req.body;

    const existing = await pool.query('SELECT * FROM profesores WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Profesor no encontrado: ${id}` });
    }

    if (email && email !== existing.rows[0].email) {
      const dupEmail = await pool.query('SELECT id FROM profesores WHERE email = $1', [email]);
      if (dupEmail.rows.length) {
        return res.status(400).json({ status: 400, message: `Ya existe un profesor con el email: ${email}` });
      }
    }

    const rolFinal = rol && VALID_ROL.includes(rol) ? rol : existing.rows[0].rol;

    // El rol SUPERADMIN es inmutable: nadie puede cambiarlo
    if (existing.rows[0].rol === 'SUPERADMIN' && rolFinal !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'El rol de superadministrador no puede ser modificado' });
    }

    // Un ADMIN no puede cambiar el rol de otro ADMIN (solo SUPERADMIN puede)
    if (existing.rows[0].rol === 'ADMIN' && rolFinal !== 'ADMIN' && req.user.rol !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'Solo el superadministrador puede cambiar el rol de un administrador' });
    }

    // Nadie puede asignar el rol SUPERADMIN a otro profesor
    if (rolFinal === 'SUPERADMIN' && existing.rows[0].rol !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'No se puede asignar el rol de superadministrador' });
    }

    // Solo SUPERADMIN puede asignar rol ADMIN
    if (rolFinal === 'ADMIN' && rolFinal !== existing.rows[0].rol && req.user.rol !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'Solo el superadministrador puede asignar el rol de administrador' });
    }

    let passwordUpdate = '';
    const params = [
      nombre ?? existing.rows[0].nombre,
      email ?? existing.rows[0].email,
      telefono !== undefined ? telefono : existing.rows[0].telefono,
      rolFinal,
      activo !== undefined ? activo : existing.rows[0].activo,
      tema ?? existing.rows[0].tema,
    ];

    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password, 10);
      params.push(hashed);
      params.push(id);
      passwordUpdate = `, password=$${params.length - 1}`;
    } else {
      params.push(id);
    }

    const { rows } = await pool.query(
      `UPDATE profesores SET nombre=$1, email=$2, telefono=$3, rol=$4, activo=$5, tema=$6${passwordUpdate}
       WHERE id=$${params.length} RETURNING *`,
      params
    );
    const count = await pool.query('SELECT COUNT(*) FROM contactos WHERE profesor_id = $1', [id]);
    res.json(mapProfesor({ ...rows[0], total_contactos: count.rows[0].count }));
  } catch (err) { next(err); }
});

// DELETE /api/profesores/:id  (ADMIN puede borrar COLABORADORs; solo SUPERADMIN puede borrar ADMINs)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const target = await pool.query('SELECT rol FROM profesores WHERE id = $1', [req.params.id]);
    if (!target.rows.length) {
      return res.status(404).json({ status: 404, message: `Profesor no encontrado: ${req.params.id}` });
    }
    const targetRol = target.rows[0].rol;
    if ((targetRol === 'ADMIN' || targetRol === 'SUPERADMIN') && req.user.rol !== 'SUPERADMIN') {
      return res.status(403).json({ status: 403, message: 'Solo el superadministrador puede eliminar administradores' });
    }
    await pool.query('DELETE FROM profesores WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
