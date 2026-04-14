const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { buildPage } = require('../utils/pagination');

const VALID_CICLO = ['DAM', 'DAW', 'SMR', 'ASIR'];
const VALID_ESTADO = ['DISPONIBLE', 'ENVIADO', 'ACEPTADO', 'RECHAZADO', 'EN_PRACTICAS'];

function mapAlumno(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    apellidos: row.apellidos,
    email: row.email,
    telefono: row.telefono,
    ciclo: row.ciclo,
    curso: row.curso,
    estado: row.estado,
    empresa: row.empresa_nombre ?? null,
    empresaId: row.empresa_id ?? null,
    observaciones: row.observaciones,
    createdAt: row.created_at,
  };
}

router.use(authenticate);

// GET /api/alumnos
router.get('/', async (req, res, next) => {
  try {
    const { search, ciclo, page = 0, size = 20 } = req.query;
    const offset = Number(page) * Number(size);
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(a.nombre ILIKE $${idx} OR a.apellidos ILIKE $${idx} OR a.email ILIKE $${idx})`);
    }
    if (ciclo && VALID_CICLO.includes(ciclo.toUpperCase())) {
      params.push(ciclo.toUpperCase());
      conditions.push(`a.ciclo = $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM alumnos a ${where}`, params
    );
    const totalElements = Number(countRows[0].count);

    params.push(Number(size));
    params.push(offset);
    const { rows } = await pool.query(
      `SELECT a.*, e.nombre AS empresa_nombre FROM alumnos a
       LEFT JOIN empresas e ON a.empresa_id = e.id
       ${where} ORDER BY a.apellidos ASC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json(buildPage(rows.map(mapAlumno), totalElements, Number(page), Number(size)));
  } catch (err) { next(err); }
});

// GET /api/alumnos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, e.nombre AS empresa_nombre FROM alumnos a
       LEFT JOIN empresas e ON a.empresa_id = e.id WHERE a.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 404, message: `Alumno no encontrado: ${req.params.id}` });
    }
    res.json(mapAlumno(rows[0]));
  } catch (err) { next(err); }
});

// POST /api/alumnos
router.post('/', async (req, res, next) => {
  try {
    const { nombre, apellidos, email, telefono, ciclo, curso,
      estado = 'DISPONIBLE', observaciones } = req.body;

    if (!nombre || !apellidos || !ciclo || !curso) {
      return res.status(400).json({ status: 400, message: 'Campos obligatorios: nombre, apellidos, ciclo, curso' });
    }
    if (!VALID_CICLO.includes(ciclo?.toUpperCase())) {
      return res.status(400).json({ status: 400, message: `Ciclo inválido: ${ciclo}` });
    }

    const { rows } = await pool.query(
      `INSERT INTO alumnos (nombre, apellidos, email, telefono, ciclo, curso, estado, observaciones, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING *`,
      [nombre, apellidos, email ?? null, telefono ?? null, ciclo.toUpperCase(), curso,
        VALID_ESTADO.includes(estado) ? estado : 'DISPONIBLE', observaciones ?? null]
    );
    const alumno = rows[0];
    res.status(201).json(mapAlumno({ ...alumno, empresa_nombre: null }));
  } catch (err) { next(err); }
});

// PUT /api/alumnos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { nombre, apellidos, email, telefono, ciclo, curso, estado, observaciones } = req.body;

    if (!nombre || !apellidos || !ciclo || !curso) {
      return res.status(400).json({ status: 400, message: 'Campos obligatorios: nombre, apellidos, ciclo, curso' });
    }

    const existing = await pool.query('SELECT id FROM alumnos WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Alumno no encontrado: ${id}` });
    }

    const { rows } = await pool.query(
      `UPDATE alumnos SET nombre=$1, apellidos=$2, email=$3, telefono=$4, ciclo=$5, curso=$6,
        estado=COALESCE($7, estado), observaciones=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [nombre, apellidos, email ?? null, telefono ?? null, ciclo.toUpperCase(), curso,
        estado && VALID_ESTADO.includes(estado) ? estado : null, observaciones ?? null, id]
    );
    const alumnoRow = rows[0];
    const empresaRows = alumnoRow.empresa_id
      ? (await pool.query('SELECT nombre FROM empresas WHERE id = $1', [alumnoRow.empresa_id])).rows
      : [];
    res.json(mapAlumno({ ...alumnoRow, empresa_nombre: empresaRows[0]?.nombre ?? null }));
  } catch (err) { next(err); }
});

// POST /api/alumnos/:id/asignar
router.post('/:id/asignar', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { empresaId, estado } = req.body;

    const existing = await pool.query('SELECT id FROM alumnos WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Alumno no encontrado: ${id}` });
    }

    let empresaNombre = null;
    if (empresaId != null) {
      const empRows = await pool.query('SELECT nombre FROM empresas WHERE id = $1', [empresaId]);
      if (!empRows.rows.length) {
        return res.status(404).json({ status: 404, message: `Empresa no encontrada: ${empresaId}` });
      }
      empresaNombre = empRows.rows[0].nombre;
    }

    const { rows } = await pool.query(
      `UPDATE alumnos SET empresa_id=$1,
        estado=COALESCE(NULLIF($2, ''), estado::text)::varchar,
        updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [empresaId ?? null, estado ?? null, id]
    );
    res.json(mapAlumno({ ...rows[0], empresa_nombre: empresaNombre }));
  } catch (err) { next(err); }
});

// DELETE /api/alumnos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM alumnos WHERE id = $1', [req.params.id]);
    if (!rowCount) {
      return res.status(404).json({ status: 404, message: `Alumno no encontrado: ${req.params.id}` });
    }
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
