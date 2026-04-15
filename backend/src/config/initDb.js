const pool = require('./db');
const bcrypt = require('bcryptjs');
const seedDb = require('./seedDb');

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS profesores (
        id         SERIAL PRIMARY KEY,
        nombre     VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL UNIQUE,
        password   VARCHAR(255) NOT NULL,
        telefono   VARCHAR(50),
        rol        VARCHAR(20) NOT NULL DEFAULT 'COLABORADOR',
        activo     BOOLEAN NOT NULL DEFAULT TRUE,
        tema       VARCHAR(20) NOT NULL DEFAULT 'light',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id                 SERIAL PRIMARY KEY,
        cif                VARCHAR(20) NOT NULL UNIQUE,
        nombre             VARCHAR(255) NOT NULL,
        sector             VARCHAR(100),
        modalidad          VARCHAR(20),
        contacto_principal VARCHAR(255),
        cargo_contacto     VARCHAR(100),
        telefono           VARCHAR(50),
        email              VARCHAR(255),
        direccion          TEXT,
        num_trabajadores   INTEGER,
        observaciones      TEXT,
        activa             BOOLEAN NOT NULL DEFAULT TRUE,
        created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS empresa_perfiles (
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        perfil     VARCHAR(100) NOT NULL,
        PRIMARY KEY (empresa_id, perfil)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id            SERIAL PRIMARY KEY,
        nombre        VARCHAR(255) NOT NULL,
        apellidos     VARCHAR(255) NOT NULL,
        email         VARCHAR(255),
        telefono      VARCHAR(50),
        ciclo         VARCHAR(10) NOT NULL,
        curso         VARCHAR(50) NOT NULL,
        estado        VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
        empresa_id    INTEGER REFERENCES empresas(id) ON DELETE SET NULL,
        observaciones TEXT,
        created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contactos (
        id             SERIAL PRIMARY KEY,
        empresa_id     INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        profesor_id    INTEGER REFERENCES profesores(id) ON DELETE SET NULL,
        fecha          DATE NOT NULL,
        tipo           VARCHAR(20) NOT NULL,
        motivo         TEXT NOT NULL,
        resultado      VARCHAR(20),
        necesidades    TEXT,
        proxima_accion TEXT,
        created_at     TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Superadmin inicial
    const existing = await client.query("SELECT id FROM profesores WHERE email = 'admin@fct.edu'");
    if (!existing.rows.length) {
      const hashed = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO profesores (nombre, email, password, rol, activo, tema)
         VALUES ('Administrador', 'admin@fct.edu', $1, 'SUPERADMIN', TRUE, 'light')`,
        [hashed]
      );
      console.log('Usuario superadmin creado: admin@fct.edu / admin123');
    }

    console.log('Base de datos inicializada correctamente');
    await seedDb(client);
  } finally {
    client.release();
  }
}

module.exports = initDb;
