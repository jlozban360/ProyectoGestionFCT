const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { buildPage } = require('../utils/pagination');

const VALID_TIPO  = ['OFERTA', 'DEMANDA', 'INFO', 'URGENTE'];
const VALID_CICLO = ['DAM', 'DAW', 'SMR', 'ASIR'];

const SORTABLE = {
  titulo:    'an.titulo',
  tipo:      'an.tipo',
  ciclo:     'an.ciclo',
  createdAt: 'an.created_at',
  autor:     'p.nombre',
};

function mapAnuncio(row) {
  return {
    id:          row.id,
    titulo:      row.titulo,
    contenido:   row.contenido,
    tipo:        row.tipo,
    ciclo:       row.ciclo       ?? null,
    numPlazas:   row.num_plazas  ?? null,
    empresaId:   row.empresa_id  ?? null,
    empresa:     row.empresa_nombre ?? null,
    autorId:     row.autor_id    ?? null,
    autor:       row.autor_nombre ?? null,
    activo:      row.activo,
    destacado:   row.destacado,
    fechaInicio: row.fecha_inicio ?? null,
    fechaFin:    row.fecha_fin    ?? null,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

router.use(authenticate);

// GET /api/anuncios
router.get('/', async (req, res, next) => {
  try {
    const { search, tipo, ciclo, activo, page = 0, size = 9, sortBy, sortDir } = req.query;
    const offset = Number(page) * Number(size);
    const params = [];
    const conditions = [];

    if (activo !== 'all') {
      params.push(activo === 'false' ? false : true);
      conditions.push(`an.activo = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(an.titulo ILIKE $${idx} OR an.contenido ILIKE $${idx})`);
    }
    if (tipo && VALID_TIPO.includes(tipo.toUpperCase())) {
      params.push(tipo.toUpperCase());
      conditions.push(`an.tipo = $${params.length}`);
    }
    if (ciclo && VALID_CICLO.includes(ciclo.toUpperCase())) {
      params.push(ciclo.toUpperCase());
      conditions.push(`an.ciclo = $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderCol  = SORTABLE[sortBy] ?? null;
    const orderDir  = sortDir === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = orderCol
      ? `${orderCol} ${orderDir}`
      : 'an.destacado DESC, an.created_at DESC';

    const baseFrom = `FROM anuncios an
      LEFT JOIN profesores p ON an.autor_id  = p.id
      LEFT JOIN empresas   e ON an.empresa_id = e.id`;

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) ${baseFrom} ${where}`, params
    );
    const totalElements = Number(countRows[0].count);

    params.push(Number(size));
    params.push(offset);
    const { rows } = await pool.query(
      `SELECT an.*, p.nombre AS autor_nombre, e.nombre AS empresa_nombre
       ${baseFrom} ${where}
       ORDER BY ${orderClause}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json(buildPage(rows.map(mapAnuncio), totalElements, Number(page), Number(size)));
  } catch (err) { next(err); }
});

// GET /api/anuncios/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT an.*, p.nombre AS autor_nombre, e.nombre AS empresa_nombre
       FROM anuncios an
       LEFT JOIN profesores p ON an.autor_id  = p.id
       LEFT JOIN empresas   e ON an.empresa_id = e.id
       WHERE an.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 404, message: `Anuncio no encontrado: ${req.params.id}` });
    }
    res.json(mapAnuncio(rows[0]));
  } catch (err) { next(err); }
});

// POST /api/anuncios
router.post('/', async (req, res, next) => {
  try {
    const { titulo, contenido, tipo = 'INFO', ciclo, numPlazas, empresaId, fechaInicio, fechaFin, destacado = false } = req.body;

    if (!titulo?.trim() || !contenido?.trim()) {
      return res.status(400).json({ status: 400, message: 'Campos obligatorios: titulo, contenido' });
    }
    if (!VALID_TIPO.includes(tipo?.toUpperCase())) {
      return res.status(400).json({ status: 400, message: `Tipo inválido: ${tipo}` });
    }

    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.rol);

    const { rows } = await pool.query(
      `INSERT INTO anuncios
         (titulo, contenido, tipo, ciclo, num_plazas, empresa_id, autor_id, activo, destacado, fecha_inicio, fecha_fin, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE,$8,$9,$10,NOW(),NOW()) RETURNING *`,
      [
        titulo.trim(), contenido.trim(), tipo.toUpperCase(),
        ciclo && VALID_CICLO.includes(ciclo.toUpperCase()) ? ciclo.toUpperCase() : null,
        numPlazas ? Number(numPlazas) : null,
        empresaId ?? null,
        req.user.id,
        isAdmin ? Boolean(destacado) : false,
        fechaInicio ?? null,
        fechaFin    ?? null,
      ]
    );

    let empresaNombre = null;
    if (rows[0].empresa_id) {
      const r = await pool.query('SELECT nombre FROM empresas WHERE id=$1', [rows[0].empresa_id]);
      empresaNombre = r.rows[0]?.nombre ?? null;
    }
    res.status(201).json(mapAnuncio({ ...rows[0], autor_nombre: req.user.nombre, empresa_nombre: empresaNombre }));
  } catch (err) { next(err); }
});

// PUT /api/anuncios/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { titulo, contenido, tipo, ciclo, numPlazas, empresaId, fechaInicio, fechaFin, activo, destacado } = req.body;

    if (!titulo?.trim() || !contenido?.trim()) {
      return res.status(400).json({ status: 400, message: 'Campos obligatorios: titulo, contenido' });
    }

    const existing = await pool.query('SELECT * FROM anuncios WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Anuncio no encontrado: ${id}` });
    }

    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.rol);
    if (!isAdmin && existing.rows[0].autor_id !== req.user.id) {
      return res.status(403).json({ status: 403, message: 'No tienes permiso para editar este anuncio' });
    }

    const newDestacado = isAdmin && destacado !== undefined
      ? Boolean(destacado)
      : existing.rows[0].destacado;

    const { rows } = await pool.query(
      `UPDATE anuncios
       SET titulo=$1, contenido=$2,
           tipo       = COALESCE(NULLIF($3,''), tipo),
           ciclo      = $4,
           num_plazas = $5,
           empresa_id = $6,
           fecha_inicio = $7,
           fecha_fin    = $8,
           activo     = COALESCE($9, activo),
           destacado  = $10,
           updated_at = NOW()
       WHERE id=$11 RETURNING *`,
      [
        titulo.trim(), contenido.trim(),
        tipo && VALID_TIPO.includes(tipo.toUpperCase()) ? tipo.toUpperCase() : null,
        ciclo && VALID_CICLO.includes(ciclo.toUpperCase()) ? ciclo.toUpperCase() : null,
        numPlazas ? Number(numPlazas) : null,
        empresaId ?? null,
        fechaInicio ?? null,
        fechaFin    ?? null,
        activo !== undefined ? Boolean(activo) : null,
        newDestacado,
        id,
      ]
    );

    let empresaNombre = null;
    if (rows[0].empresa_id) {
      const r = await pool.query('SELECT nombre FROM empresas WHERE id=$1', [rows[0].empresa_id]);
      empresaNombre = r.rows[0]?.nombre ?? null;
    }
    const autorRow = await pool.query('SELECT nombre FROM profesores WHERE id=$1', [rows[0].autor_id]);
    res.json(mapAnuncio({ ...rows[0], autor_nombre: autorRow.rows[0]?.nombre ?? null, empresa_nombre: empresaNombre }));
  } catch (err) { next(err); }
});

// PATCH /api/anuncios/:id/destacar — toggle pin (admin only)
router.patch('/:id/destacar', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE anuncios SET destacado = NOT destacado, updated_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: 404, message: `Anuncio no encontrado: ${req.params.id}` });
    }
    const autorRow   = await pool.query('SELECT nombre FROM profesores WHERE id=$1', [rows[0].autor_id]);
    const empresaRow = rows[0].empresa_id
      ? await pool.query('SELECT nombre FROM empresas WHERE id=$1', [rows[0].empresa_id])
      : { rows: [] };
    res.json(mapAnuncio({ ...rows[0], autor_nombre: autorRow.rows[0]?.nombre ?? null, empresa_nombre: empresaRow.rows[0]?.nombre ?? null }));
  } catch (err) { next(err); }
});

// DELETE /api/anuncios/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await pool.query('SELECT * FROM anuncios WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Anuncio no encontrado: ${req.params.id}` });
    }
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.rol);
    if (!isAdmin && existing.rows[0].autor_id !== req.user.id) {
      return res.status(403).json({ status: 403, message: 'No tienes permiso para eliminar este anuncio' });
    }
    await pool.query('DELETE FROM anuncios WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
