const router = require('express').Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const today = now.toISOString().split('T')[0];

    const [empresas, contactadosMes, alumnos, profesores] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM empresas WHERE activa = true'),
      pool.query('SELECT COUNT(*) FROM contactos WHERE fecha >= $1 AND fecha <= $2', [startOfMonth, today]),
      pool.query("SELECT COUNT(*) FROM alumnos WHERE estado = 'DISPONIBLE'"),
      pool.query('SELECT COUNT(*) FROM profesores WHERE activo = true'),
    ]);

    res.json({
      empresasActivas: Number(empresas.rows[0].count),
      contactadosMes: Number(contactadosMes.rows[0].count),
      alumnosDisponibles: Number(alumnos.rows[0].count),
      profesoresActivos: Number(profesores.rows[0].count),
    });
  } catch (err) { next(err); }
});

// GET /api/dashboard/contactos-mes
router.get('/contactos-mes', async (req, res, next) => {
  try {
    const targetYear = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const { rows } = await pool.query(
      `SELECT EXTRACT(MONTH FROM fecha)::int AS mes, COUNT(*) AS contactos
       FROM contactos
       WHERE EXTRACT(YEAR FROM fecha) = $1
       GROUP BY mes ORDER BY mes`,
      [targetYear]
    );
    const byMonth = {};
    for (const row of rows) byMonth[row.mes] = Number(row.contactos);

    const result = MESES.map((nombre, i) => ({
      mes: nombre,
      contactos: byMonth[i + 1] ?? 0,
    }));
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/dashboard/profesores-activos
router.get('/profesores-activos', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.nombre, COUNT(c.id) AS contactos
       FROM profesores p
       JOIN contactos c ON c.profesor_id = p.id
       GROUP BY p.id, p.nombre
       ORDER BY contactos DESC
       LIMIT 5`
    );
    res.json(rows.map(r => ({ nombre: r.nombre, contactos: Number(r.contactos) })));
  } catch (err) { next(err); }
});

// GET /api/dashboard/necesidades
router.get('/necesidades', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ciclo AS type, COUNT(*) AS value FROM alumnos GROUP BY ciclo`
    );
    res.json(rows.map(r => ({ type: r.type, value: Number(r.value) })));
  } catch (err) { next(err); }
});

module.exports = router;
