const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { buildPage } = require('../utils/pagination');

const VALID_TIPO = ['LLAMADA', 'EMAIL', 'VISITA'];
const VALID_RESULTADO = ['INTERESADO', 'PENDIENTE', 'NO_INTERESADO', 'EN_PROCESO', 'HECHO', 'DESCARTADO'];

function mapContacto(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    empresaNombre: row.empresa_nombre,
    empresaCif: row.empresa_cif,
    profesor: row.prof_id ? { id: row.prof_id, nombre: row.prof_nombre, email: row.prof_email } : null,
    fecha: row.fecha,
    tipo: row.tipo,
    motivo: row.motivo,
    resultado: row.resultado,
    necesidades: row.necesidades,
    proximaAccion: row.proxima_accion,
    createdAt: row.created_at,
  };
}

const BASE_SELECT = `
  SELECT c.*, e.nombre AS empresa_nombre, e.cif AS empresa_cif,
         p.id AS prof_id, p.nombre AS prof_nombre, p.email AS prof_email
  FROM contactos c
  JOIN empresas e ON c.empresa_id = e.id
  LEFT JOIN profesores p ON c.profesor_id = p.id
`;

router.use(authenticate);

const SORTABLE_CONTACTOS = {
  fecha: 'c.fecha', empresa: 'e.nombre',
  tipo: 'c.tipo', resultado: 'c.resultado',
};

// GET /api/contactos
router.get('/', async (req, res, next) => {
  try {
    const { search, tipo, resultado, mes, year, page = 0, size = 20, sortBy, sortDir } = req.query;
    const offset = Number(page) * Number(size);
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(e.nombre ILIKE $${idx} OR c.motivo ILIKE $${idx} OR c.necesidades ILIKE $${idx} OR p.nombre ILIKE $${idx})`);
    }
    if (tipo && VALID_TIPO.includes(tipo.toUpperCase())) {
      params.push(tipo.toUpperCase());
      conditions.push(`c.tipo = $${params.length}`);
    }
    if (resultado && VALID_RESULTADO.includes(resultado.toUpperCase())) {
      params.push(resultado.toUpperCase());
      conditions.push(`c.resultado = $${params.length}`);
    }
    if (year && mes) {
      const y = Number(year), m = Number(mes);
      const lastDay = new Date(y, m, 0).getDate();
      params.push(`${y}-${String(m).padStart(2, '0')}-01`);
      conditions.push(`c.fecha >= $${params.length}`);
      params.push(`${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);
      conditions.push(`c.fecha <= $${params.length}`);
    } else if (year) {
      params.push(`${year}-01-01`);
      conditions.push(`c.fecha >= $${params.length}`);
      params.push(`${year}-12-31`);
      conditions.push(`c.fecha <= $${params.length}`);
    }

    const joinWhere = conditions.length
      ? 'JOIN empresas e ON c.empresa_id = e.id LEFT JOIN profesores p ON c.profesor_id = p.id WHERE ' + conditions.join(' AND ')
      : 'JOIN empresas e ON c.empresa_id = e.id LEFT JOIN profesores p ON c.profesor_id = p.id';

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM contactos c ${joinWhere}`, params
    );
    const totalElements = Number(countRows[0].count);

    const orderCol = SORTABLE_CONTACTOS[sortBy] ?? 'c.fecha';
    const orderDir = sortDir === 'ASC' ? 'ASC' : 'DESC';

    params.push(Number(size));
    params.push(offset);
    const { rows } = await pool.query(
      `${BASE_SELECT} ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
       ORDER BY ${orderCol} ${orderDir} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json(buildPage(rows.map(mapContacto), totalElements, Number(page), Number(size)));
  } catch (err) { next(err); }
});

// GET /api/contactos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `${BASE_SELECT} WHERE c.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 404, message: `Contacto no encontrado: ${req.params.id}` });
    }
    res.json(mapContacto(rows[0]));
  } catch (err) { next(err); }
});

// POST /api/contactos
router.post('/', async (req, res, next) => {
  try {
    const { empresaId, fecha, tipo, motivo, resultado, necesidades, proximaAccion } = req.body;

    if (!empresaId || !fecha || !tipo || !motivo) {
      return res.status(400).json({ status: 400, message: 'Campos obligatorios: empresaId, fecha, tipo, motivo' });
    }
    if (!VALID_TIPO.includes(tipo?.toUpperCase())) {
      return res.status(400).json({ status: 400, message: `Tipo inválido: ${tipo}` });
    }

    const empCheck = await pool.query('SELECT id FROM empresas WHERE id = $1', [empresaId]);
    if (!empCheck.rows.length) {
      return res.status(404).json({ status: 404, message: `Empresa no encontrada: ${empresaId}` });
    }

    const { rows } = await pool.query(
      `INSERT INTO contactos (empresa_id, profesor_id, fecha, tipo, motivo, resultado, necesidades, proxima_accion, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING id`,
      [empresaId, req.user.id, fecha, tipo.toUpperCase(),
        motivo, resultado ?? null, necesidades ?? null, proximaAccion ?? null]
    );
    const newId = rows[0].id;
    const { rows: full } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [newId]);
    res.status(201).json(mapContacto(full[0]));
  } catch (err) { next(err); }
});

// PUT /api/contactos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { fecha, tipo, motivo, resultado, necesidades, proximaAccion } = req.body;

    const existing = await pool.query('SELECT id FROM contactos WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Contacto no encontrado: ${id}` });
    }

    await pool.query(
      `UPDATE contactos SET fecha=$1, tipo=$2, motivo=$3, resultado=$4, necesidades=$5, proxima_accion=$6
       WHERE id=$7`,
      [fecha, tipo?.toUpperCase() ?? null, motivo, resultado ?? null, necesidades ?? null, proximaAccion ?? null, id]
    );
    const { rows: full } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [id]);
    res.json(mapContacto(full[0]));
  } catch (err) { next(err); }
});

// PATCH /api/contactos/:id/resultado
router.patch('/:id/resultado', async (req, res, next) => {
  try {
    const id = req.params.id;
    const resultado = (req.query.resultado ?? req.body.resultado ?? '').toUpperCase();

    if (!VALID_RESULTADO.includes(resultado)) {
      return res.status(400).json({ status: 400, message: `Resultado inválido: ${resultado}` });
    }

    const existing = await pool.query('SELECT id FROM contactos WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Contacto no encontrado: ${id}` });
    }

    await pool.query('UPDATE contactos SET resultado=$1 WHERE id=$2', [resultado, id]);
    const { rows: full } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [id]);
    res.json(mapContacto(full[0]));
  } catch (err) { next(err); }
});

// DELETE /api/contactos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM contactos WHERE id = $1', [req.params.id]);
    if (!rowCount) {
      return res.status(404).json({ status: 404, message: `Contacto no encontrado: ${req.params.id}` });
    }
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
