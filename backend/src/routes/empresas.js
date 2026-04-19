const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { buildPage } = require('../utils/pagination');

const VALID_MODALIDAD = ['FCT', 'DUAL', 'CONTRATACION', 'MIXTA'];

async function getPerfiles(empresaId) {
  const { rows } = await pool.query(
    'SELECT perfil FROM empresa_perfiles WHERE empresa_id = $1',
    [empresaId]
  );
  return rows.map(r => r.perfil);
}

function mapEmpresa(row, perfiles = []) {
  return {
    id: row.id,
    cif: row.cif,
    nombre: row.nombre,
    sector: row.sector,
    modalidad: row.modalidad,
    contactoPrincipal: row.contacto_principal,
    cargoContacto: row.cargo_contacto,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    numTrabajadores: row.num_trabajadores,
    perfilesSolicitados: perfiles,
    observaciones: row.observaciones,
    activa: row.activa,
    createdAt: row.created_at,
  };
}

router.use(authenticate);

const SORTABLE_EMPRESAS = {
  nombre: 'e.nombre', sector: 'e.sector',
  modalidad: 'e.modalidad', activa: 'e.activa',
};

// GET /api/empresas
router.get('/', async (req, res, next) => {
  try {
    const { search, sector, page = 0, size = 10, sortBy, sortDir } = req.query;
    const offset = Number(page) * Number(size);
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(e.nombre ILIKE $${params.length} OR e.cif ILIKE $${params.length})`);
    }
    if (sector) {
      params.push(sector);
      conditions.push(`e.sector = $${params.length}`);
    }

    const orderCol = SORTABLE_EMPRESAS[sortBy] ?? 'e.nombre';
    const orderDir = sortDir === 'DESC' ? 'DESC' : 'ASC';

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const countParams = [...params];
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM empresas e ${where}`, countParams
    );
    const totalElements = Number(countRows[0].count);

    params.push(Number(size));
    params.push(offset);
    const { rows } = await pool.query(
      `SELECT e.* FROM empresas e ${where} ORDER BY ${orderCol} ${orderDir} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const content = await Promise.all(rows.map(async row => {
      const perfiles = await getPerfiles(row.id);
      return mapEmpresa(row, perfiles);
    }));

    res.json(buildPage(content, totalElements, Number(page), Number(size)));
  } catch (err) { next(err); }
});

// GET /api/empresas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empresas WHERE id = $1', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ status: 404, message: `Empresa no encontrada: ${req.params.id}` });
    }
    const perfiles = await getPerfiles(rows[0].id);
    res.json(mapEmpresa(rows[0], perfiles));
  } catch (err) { next(err); }
});

// POST /api/empresas
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { cif, nombre, sector, modalidad, contactoPrincipal, cargoContacto,
      telefono, email, direccion, numTrabajadores, perfilesSolicitados, observaciones, activa = true } = req.body;

    if (!cif || !nombre) {
      return res.status(400).json({ status: 400, message: 'El CIF y nombre son obligatorios' });
    }
    if (modalidad && !VALID_MODALIDAD.includes(modalidad)) {
      return res.status(400).json({ status: 400, message: `Modalidad inválida: ${modalidad}` });
    }

    const existing = await client.query('SELECT id FROM empresas WHERE cif = $1', [cif]);
    if (existing.rows.length) {
      return res.status(400).json({ status: 400, message: `Ya existe una empresa con el CIF: ${cif}` });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO empresas (cif, nombre, sector, modalidad, contacto_principal, cargo_contacto,
        telefono, email, direccion, num_trabajadores, observaciones, activa, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()) RETURNING *`,
      [cif, nombre, sector ?? null, modalidad ?? null, contactoPrincipal ?? null, cargoContacto ?? null,
        telefono ?? null, email ?? null, direccion ?? null, numTrabajadores ?? null,
        observaciones ?? null, activa]
    );
    const empresa = rows[0];

    const perfiles = Array.isArray(perfilesSolicitados) ? perfilesSolicitados : [];
    for (const perfil of perfiles) {
      await client.query('INSERT INTO empresa_perfiles (empresa_id, perfil) VALUES ($1, $2)', [empresa.id, perfil]);
    }
    await client.query('COMMIT');

    res.status(201).json(mapEmpresa(empresa, perfiles));
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

// PUT /api/empresas/:id
router.put('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    const { cif, nombre, sector, modalidad, contactoPrincipal, cargoContacto,
      telefono, email, direccion, numTrabajadores, perfilesSolicitados, observaciones, activa = true } = req.body;

    if (!cif || !nombre) {
      return res.status(400).json({ status: 400, message: 'El CIF y nombre son obligatorios' });
    }
    if (modalidad && !VALID_MODALIDAD.includes(modalidad)) {
      return res.status(400).json({ status: 400, message: `Modalidad inválida: ${modalidad}` });
    }

    const existing = await client.query('SELECT id FROM empresas WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ status: 404, message: `Empresa no encontrada: ${id}` });
    }
    const dupCif = await client.query('SELECT id FROM empresas WHERE cif = $1 AND id <> $2', [cif, id]);
    if (dupCif.rows.length) {
      return res.status(400).json({ status: 400, message: `Ya existe otra empresa con el CIF: ${cif}` });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE empresas SET cif=$1, nombre=$2, sector=$3, modalidad=$4, contacto_principal=$5,
        cargo_contacto=$6, telefono=$7, email=$8, direccion=$9, num_trabajadores=$10,
        observaciones=$11, activa=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [cif, nombre, sector ?? null, modalidad ?? null, contactoPrincipal ?? null, cargoContacto ?? null,
        telefono ?? null, email ?? null, direccion ?? null, numTrabajadores ?? null,
        observaciones ?? null, activa, id]
    );

    const perfiles = Array.isArray(perfilesSolicitados) ? perfilesSolicitados : [];
    await client.query('DELETE FROM empresa_perfiles WHERE empresa_id = $1', [id]);
    for (const perfil of perfiles) {
      await client.query('INSERT INTO empresa_perfiles (empresa_id, perfil) VALUES ($1, $2)', [id, perfil]);
    }
    await client.query('COMMIT');

    res.json(mapEmpresa(rows[0], perfiles));
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

// DELETE /api/empresas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM empresas WHERE id = $1', [req.params.id]);
    if (!rowCount) {
      return res.status(404).json({ status: 404, message: `Empresa no encontrada: ${req.params.id}` });
    }
    res.status(204).send();
  } catch (err) { next(err); }
});

// GET /api/empresas/:id/contactos
router.get('/:id/contactos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, e.nombre AS empresa_nombre,
              p.id AS prof_id, p.nombre AS prof_nombre, p.email AS prof_email
       FROM contactos c
       JOIN empresas e ON c.empresa_id = e.id
       LEFT JOIN profesores p ON c.profesor_id = p.id
       WHERE c.empresa_id = $1
       ORDER BY c.fecha DESC`,
      [req.params.id]
    );
    res.json(rows.map(mapContacto));
  } catch (err) { next(err); }
});

// GET /api/empresas/:id/alumnos
router.get('/:id/alumnos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, e.nombre AS empresa_nombre FROM alumnos a
       LEFT JOIN empresas e ON a.empresa_id = e.id
       WHERE a.empresa_id = $1`,
      [req.params.id]
    );
    res.json(rows.map(mapAlumno));
  } catch (err) { next(err); }
});

function mapContacto(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    empresaNombre: row.empresa_nombre,
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

module.exports = router;
