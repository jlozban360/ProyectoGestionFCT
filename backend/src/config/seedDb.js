const bcrypt = require('bcryptjs');

// ─── Empresas hardcoded (30) ────────────────────────────────────────────────
const EMPRESAS_BASE = [
  { cif: 'A28000001', nombre: 'Indra Sistemas',         sector: 'Tecnología',           modalidad: 'FCT',         contacto: 'Carlos Ruiz',      cargo: 'Director RRHH',         tel: '915550011', email: 'rrhh@indra.es',             dir: 'Av. de Bruselas 35, Alcobendas',       trab: 1200, obs: 'Gran empresa TI, acepta perfiles DAM y DAW' },
  { cif: 'A28000002', nombre: 'Telefónica Tech',        sector: 'Telecomunicaciones',    modalidad: 'DUAL',        contacto: 'Ana Martínez',     cargo: 'Responsable Formación', tel: '915550022', email: 'formacion@telef.es',         dir: 'Gran Vía 28, Madrid',                  trab: 800,  obs: 'Prefieren alumnos de ASIR y SMR' },
  { cif: 'B28000003', nombre: 'Grupo Soluciones IT',    sector: 'Consultoría TI',        modalidad: 'FCT',         contacto: 'Pedro Sánchez',    cargo: 'CTO',                   tel: '915550033', email: 'pedro@soluciones-it.es',     dir: 'C/ Alcalá 100, Madrid',                trab: 45,   obs: null },
  { cif: 'B28000004', nombre: 'DataCloud Spain',        sector: 'Cloud & Datos',         modalidad: 'FCT',         contacto: 'Laura Gómez',      cargo: 'HR Manager',            tel: '915550044', email: 'hr@datacloud.es',            dir: 'C/ Serrano 55, Madrid',                trab: 120,  obs: 'Buscan perfiles con Python o Java' },
  { cif: 'A46000005', nombre: 'Mercadona Digital',      sector: 'Retail / Tecnología',   modalidad: 'CONTRATACION',contacto: 'José Fernández',   cargo: 'Jefe de Sistemas',      tel: '963550055', email: 'sistemas@mercadona.es',      dir: 'Av. Valencia 10, Paterna',             trab: 2000, obs: 'Alta posibilidad de contratación' },
  { cif: 'B41000006', nombre: 'Solusoft Sevilla',       sector: 'Desarrollo Software',   modalidad: 'FCT',         contacto: 'María Jiménez',    cargo: 'Directora Técnica',     tel: '954550066', email: 'mjimenez@solusoft.es',       dir: 'C/ Betis 20, Sevilla',                 trab: 30,   obs: null },
  { cif: 'A08000007', nombre: 'T-Systems Iberia',       sector: 'Tecnología',            modalidad: 'DUAL',        contacto: 'Miquel Puig',      cargo: 'Talent Acquisition',    tel: '932550077', email: 'talent@tsystems.es',         dir: 'Av. Diagonal 200, Barcelona',          trab: 600,  obs: 'Empresa alemana, buen ambiente' },
  { cif: 'B28000008', nombre: 'Cibernos',               sector: 'Consultoría TI',        modalidad: 'FCT',         contacto: 'Raúl Torres',      cargo: 'Gerente',               tel: '915550088', email: 'rtorres@cibernos.es',        dir: 'C/ Orense 70, Madrid',                 trab: 80,   obs: 'Trabajan con administración pública' },
  { cif: 'B46000009', nombre: 'Lynx Tech Solutions',    sector: 'Ciberseguridad',        modalidad: 'FCT',         contacto: 'Sofía Blanco',     cargo: 'Responsable RRHH',      tel: '961550099', email: 'sofia@lynx-tech.es',         dir: 'Parque Tecnológico, Paterna',          trab: 55,   obs: 'Perfil ideal: ASIR con ciberseguridad' },
  { cif: 'A28000010', nombre: 'Accenture España',       sector: 'Consultoría TI',        modalidad: 'MIXTA',       contacto: 'Isabel Moreno',    cargo: 'Campus Recruiter',      tel: '915550100', email: 'campus@accenture.es',        dir: 'C/ Joaquín Costa 26, Madrid',          trab: 5000, obs: 'Muchas plazas disponibles cada año' },
  { cif: 'B28000011', nombre: 'Netmind Learning',       sector: 'Formación TI',          modalidad: 'FCT',         contacto: 'David López',      cargo: 'Director',              tel: '915550111', email: 'dlopez@netmind.es',          dir: 'C/ Luchana 23, Madrid',                trab: 25,   obs: null },
  { cif: 'B08000012', nombre: 'Adevinta Spain',         sector: 'E-commerce',            modalidad: 'FCT',         contacto: 'Núria Sala',       cargo: 'HR Generalist',         tel: '932550122', email: 'nsala@adevinta.es',          dir: 'Av. Gran Via 16, Barcelona',           trab: 300,  obs: 'Wallapop / InfoJobs — ambiente startup' },
  { cif: 'A28000013', nombre: 'GMV Soluciones',         sector: 'Aeroespacial / TI',     modalidad: 'DUAL',        contacto: 'Fernando Ríos',    cargo: 'Jefe de Personas',      tel: '915550133', email: 'frios@gmv.es',               dir: 'Isaac Newton 11, Tres Cantos',         trab: 900,  obs: 'Proyectos internacionales' },
  { cif: 'B41000014', nombre: 'Atos IT Solutions',      sector: 'Tecnología',            modalidad: 'FCT',         contacto: 'Carmen Vega',      cargo: 'Responsable Formación', tel: '954550144', email: 'cvega@atos.es',              dir: 'C/ Luis Montoto 10, Sevilla',          trab: 150,  obs: null },
  { cif: 'B28000015', nombre: 'Plain Concepts',         sector: 'Desarrollo Software',   modalidad: 'FCT',         contacto: 'Alberto García',   cargo: 'CTO',                   tel: '915550155', email: 'agarcia@plainconcepts.es',   dir: 'C/ Príncipe de Vergara 108, Madrid',   trab: 200,  obs: 'Microsoft Gold Partner' },
  { cif: 'B46000016', nombre: 'iQBit',                  sector: 'Desarrollo Software',   modalidad: 'FCT',         contacto: 'Patricia Molina',  cargo: 'HR Manager',            tel: '961550166', email: 'patricia@iqbit.es',          dir: 'C/ Colón 1, Valencia',                 trab: 40,   obs: 'Empresa local con buen ambiente' },
  { cif: 'A28000017', nombre: 'NTT Data Spain',         sector: 'Consultoría TI',        modalidad: 'MIXTA',       contacto: 'Roberto Serrano',  cargo: 'Recruitment Manager',   tel: '915550177', email: 'rserrano@nttdata.es',        dir: 'Av. Partenón 12, Madrid',              trab: 3000, obs: 'Empresa japonesa, proyectos bancarios' },
  { cif: 'B08000018', nombre: 'Typeform',               sector: 'SaaS',                  modalidad: 'FCT',         contacto: 'Laia Costa',       cargo: 'People Ops',            tel: '932550188', email: 'lcosta@typeform.com',        dir: 'C/ Pallars 85, Barcelona',             trab: 500,  obs: 'Inglés imprescindible' },
  { cif: 'B28000019', nombre: 'Sngular',                sector: 'Desarrollo Software',   modalidad: 'FCT',         contacto: 'Jaime Rueda',      cargo: 'Director Técnico',      tel: '915550199', email: 'jrueda@sngular.es',          dir: 'C/ Emilio Vargas 4, Madrid',           trab: 700,  obs: null },
  { cif: 'B46000020', nombre: 'Thinkingroup',           sector: 'Marketing Digital',     modalidad: 'FCT',         contacto: 'Elena Pascual',    cargo: 'Directora',             tel: '961550200', email: 'elena@thinkingroup.es',      dir: 'C/ Jorge Juan 18, Valencia',           trab: 35,   obs: 'Orientada a SMR con conocimientos web' },
  { cif: 'A28000021', nombre: 'Sopra Steria',           sector: 'Consultoría TI',        modalidad: 'DUAL',        contacto: 'Luis Navarro',     cargo: 'Responsable Practicas', tel: '915550211', email: 'lnavarro@soprasteria.es',    dir: 'C/ Albarracín 25, Madrid',             trab: 1800, obs: 'Empresa francesa, proyectos AGE' },
  { cif: 'B08000022', nombre: 'Factorial HR',           sector: 'SaaS / RRHH',           modalidad: 'FCT',         contacto: 'Anna Ferrer',      cargo: 'Talent Manager',        tel: '932550222', email: 'anna@factorial.es',          dir: 'C/ Pallars 99, Barcelona',             trab: 250,  obs: 'Startup unicornio española' },
  { cif: 'B28000023', nombre: 'Semantix España',        sector: 'Big Data',              modalidad: 'FCT',         contacto: 'Pablo Morales',    cargo: 'Data Lead',             tel: '915550233', email: 'pablo@semantix.es',          dir: 'C/ Alcalá 200, Madrid',                trab: 60,   obs: 'Buscan DAW con conocimientos BI' },
  { cif: 'B41000024', nombre: 'Ingenia',                sector: 'Consultoría TI',        modalidad: 'FCT',         contacto: 'Rosa Delgado',     cargo: 'RRHH',                  tel: '954550244', email: 'rosa@ingenia.es',            dir: 'C/ Resolana 16, Sevilla',              trab: 90,   obs: null },
  { cif: 'B46000025', nombre: 'Novait',                 sector: 'Desarrollo Software',   modalidad: 'CONTRATACION',contacto: 'Andrés Cano',      cargo: 'CEO',                   tel: '961550255', email: 'andres@novait.es',           dir: 'C/ Turia 30, Valencia',                trab: 20,   obs: 'Muy interesados en contratar' },
  { cif: 'B28000026', nombre: 'Babel Sistemas',         sector: 'Tecnología',            modalidad: 'FCT',         contacto: 'Cristina Flores',  cargo: 'HR Specialist',         tel: '915550266', email: 'cflores@babel.es',           dir: 'C/ María de Molina 50, Madrid',        trab: 250,  obs: null },
  { cif: 'A28000027', nombre: 'Everis (NTT Data)',      sector: 'Consultoría TI',        modalidad: 'MIXTA',       contacto: 'Marcos Reyes',     cargo: 'Selección',             tel: '915550277', email: 'mreyes@everis.es',           dir: 'Av. Manoteras 52, Madrid',             trab: 2500, obs: 'Filial de NTT Data' },
  { cif: 'B08000028', nombre: 'King (Activision)',      sector: 'Videojuegos',           modalidad: 'FCT',         contacto: 'Júlia Mas',        cargo: 'Studio HR',             tel: '932550288', email: 'julia.mas@king.com',         dir: 'Av. Diagonal 420, Barcelona',          trab: 700,  obs: 'Candy Crush — proyectos DAM/DAW' },
  { cif: 'B28000029', nombre: 'Viewnext',               sector: 'Tecnología',            modalidad: 'FCT',         contacto: 'Santiago Ortega',  cargo: 'Responsable Formación', tel: '915550299', email: 'sortega@viewnext.es',        dir: 'C/ Josefa Valcárcel 24, Madrid',       trab: 400,  obs: 'Filial de IBM España' },
  { cif: 'B46000030', nombre: 'Apliter Tecnología',    sector: 'Desarrollo Software',   modalidad: 'FCT',         contacto: 'Verónica Gil',     cargo: 'Gerente',               tel: '961550300', email: 'vgil@apliter.es',            dir: 'C/ Músico Ginés 1, Murcia',            trab: 18,   obs: 'Empresa pequeña, trato cercano' },
];

// ─── Datos para generación de empresas extra (270) ──────────────────────────
const EMP_PREFIJOS  = ['Tech','Digital','Smart','Global','Next','Pro','Alpha','Cloud','Cyber','Data','Net','Web','App','Dev','Soft','Info','Nova','Pixel','Code','Fast','Open','Flex','Pure','Agile','Blue'];
const EMP_SUFIJOS   = ['Solutions','Systems','Technologies','Consulting','Services','Labs','Group','Works','Digital','Innovations','Partners','Hub','Studio','Factory','Ventures','Dynamics','Logic','Forge','Craft','Nexus'];
const EMP_SECTORES  = ['Tecnología','Cloud & Datos','Ciberseguridad','Consultoría TI','Desarrollo Software','E-commerce','SaaS','Telecomunicaciones','IA & Machine Learning','Big Data','Fintech','HealthTech','EdTech','DevOps','Robótica & IoT','Marketing Digital','Videojuegos','Aeroespacial / TI'];
const EMP_MODALIDAD = ['FCT','FCT','FCT','FCT','DUAL','DUAL','CONTRATACION','MIXTA']; // FCT más probable
const EMP_CARGOS    = ['Director RRHH','HR Manager','Responsable Formación','Talent Acquisition','Campus Recruiter','CTO','People Ops','Responsable Practicas'];
const EMP_CIUDADES  = ['Madrid','Barcelona','Valencia','Sevilla','Bilbao','Málaga','Zaragoza','Murcia','Palma','Las Palmas','Valladolid','Córdoba','Alicante','Vigo','Gijón','Granada','A Coruña','Vitoria','Pamplona','Santander'];

// ─── Profesores hardcoded (19) ───────────────────────────────────────────────
const PROFESORES_BASE = [
  { nombre: 'María González Pérez',    email: 'mgonzalez@fct.edu',  telefono: '600100001', rol: 'COLABORADOR' },
  { nombre: 'Luis Martínez García',    email: 'lmartinez@fct.edu',  telefono: '600100002', rol: 'COLABORADOR' },
  { nombre: 'Carmen López Rodríguez',  email: 'clopez@fct.edu',     telefono: '600100003', rol: 'COLABORADOR' },
  { nombre: 'Javier Sánchez Jiménez',  email: 'jsanchez@fct.edu',   telefono: '600100004', rol: 'COLABORADOR' },
  { nombre: 'Ana Fernández Torres',    email: 'afernandez@fct.edu', telefono: '600100005', rol: 'COLABORADOR' },
  { nombre: 'Pablo Ruiz Moreno',       email: 'pruiz@fct.edu',      telefono: '600100006', rol: 'COLABORADOR' },
  { nombre: 'Elena Díaz Navarro',      email: 'ediaz@fct.edu',      telefono: '600100007', rol: 'COLABORADOR' },
  { nombre: 'Roberto Álvarez Muñoz',   email: 'ralvarez@fct.edu',   telefono: '600100008', rol: 'COLABORADOR' },
  { nombre: 'Silvia Romero Iglesias',  email: 'sromero@fct.edu',    telefono: '600100009', rol: 'COLABORADOR' },
  { nombre: 'Antonio Herrera Vega',    email: 'aherrera@fct.edu',   telefono: '600100010', rol: 'COLABORADOR' },
  { nombre: 'Laura Molina Castro',     email: 'lmolina@fct.edu',    telefono: '600100011', rol: 'COLABORADOR' },
  { nombre: 'Carlos Serrano Ramos',    email: 'cserrano@fct.edu',   telefono: '600100012', rol: 'COLABORADOR' },
  { nombre: 'Patricia Blanco Ríos',    email: 'pblanco@fct.edu',    telefono: '600100013', rol: 'COLABORADOR' },
  { nombre: 'Alejandro Flores Pardo',  email: 'aflores@fct.edu',    telefono: '600100014', rol: 'COLABORADOR' },
  { nombre: 'Rosa Ortega Vargas',      email: 'rortega@fct.edu',    telefono: '600100015', rol: 'COLABORADOR' },
  { nombre: 'Fernando Cano Medina',    email: 'fcano@fct.edu',      telefono: '600100016', rol: 'ADMIN' },
  { nombre: 'Isabel Reyes Delgado',    email: 'ireyes@fct.edu',     telefono: '600100017', rol: 'COLABORADOR' },
  { nombre: 'Víctor Pascual Nieto',    email: 'vpascual@fct.edu',   telefono: '600100018', rol: 'COLABORADOR' },
  { nombre: 'Marta Guerrero Rubio',    email: 'mguerrero@fct.edu',  telefono: '600100019', rol: 'COLABORADOR' },
];

// ─── Datos compartidos ───────────────────────────────────────────────────────
const CICLOS  = ['DAM','DAW','SMR','ASIR'];
const CURSOS  = ['1º','2º'];
const PERFILES = ['Desarrollador Backend','Desarrollador Frontend','Desarrollador Full Stack','Técnico de Sistemas','Técnico de Redes','Administrador de BD','DevOps','Ciberseguridad','QA / Testing','Soporte TI'];
const NOMBRES  = ['Alejandro','Carlos','Daniel','David','Diego','Eduardo','Francisco','Gabriel','Hugo','Javier','Jorge','José','Juan','Lucas','Manuel','Marcos','Miguel','Pablo','Pedro','Rafael','Sergio','Álvaro','Adrián','Rubén','Iván','Raúl','Mario','Óscar','Alberto','Fernando','María','Laura','Lucía','Ana','Sara','Carmen','Elena','Patricia','Marta','Cristina','Isabel','Sofía','Andrea','Natalia','Beatriz','Verónica','Silvia','Rosa','Alicia','Irene'];
const APELLIDOS = ['García','Martínez','López','Sánchez','González','Rodríguez','Fernández','Pérez','Álvarez','Torres','Ramírez','Flores','Moreno','Jiménez','Ruiz','Díaz','Hernández','Gómez','Muñoz','Alonso','Romero','Navarro','Suárez','Molina','Ortega','Delgado','Castro','Vega','Ramos','Nieto'];
const MOTIVOS  = [
  'Presentación de la empresa y programa FCT',
  'Seguimiento de candidatos enviados',
  'Revisión de perfiles disponibles para el próximo curso',
  'Consulta sobre modalidad de prácticas dual',
  'Visita a instalaciones para evaluación',
  'Confirmación de plazas para el próximo trimestre',
  'Resolución de incidencias con alumno en prácticas',
  'Reunión de evaluación intermedia',
  'Propuesta de convenio de colaboración',
  'Actualización de datos de contacto',
  'Solicitud de nuevos perfiles formativos',
  'Valoración final de alumnos en prácticas',
  'Interés en ampliar número de plazas',
  'Información sobre nuevos ciclos formativos',
  'Coordinación de horarios de tutoría',
];
const TIPOS     = ['LLAMADA','EMAIL','VISITA'];
const RESULTADOS = ['INTERESADO','PENDIENTE','NO_INTERESADO','EN_PROCESO','HECHO','DESCARTADO'];

function pick(arr)            { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max)    { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickEstado() {
  // ~52% DISPONIBLE, rest repartido
  const r = Math.random();
  if (r < 0.52) return 'DISPONIBLE';
  if (r < 0.67) return 'EN_PRACTICAS';
  if (r < 0.79) return 'ACEPTADO';
  if (r < 0.89) return 'ENVIADO';
  return 'RECHAZADO';
}

// INSERT por lotes para contactos (más rápido que N inserts individuales)
async function batchInsertContactos(client, rows) {
  const BATCH = 80;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const vals  = chunk.map((_, j) =>
      `($${j*6+1},$${j*6+2},$${j*6+3},$${j*6+4},$${j*6+5},$${j*6+6},NOW())`
    ).join(',');
    await client.query(
      `INSERT INTO contactos (empresa_id,profesor_id,fecha,tipo,motivo,resultado,created_at) VALUES ${vals}`,
      chunk.flat()
    );
  }
}

async function seedDb(client) {

  // ── 1. Profesores hardcoded (19) ────────────────────────────────────────
  const profesorIds = [];
  const hash = await bcrypt.hash('profesor123', 10);
  for (const p of PROFESORES_BASE) {
    const ex = await client.query('SELECT id FROM profesores WHERE email=$1', [p.email]);
    if (!ex.rows.length) {
      const { rows } = await client.query(
        `INSERT INTO profesores (nombre,email,password,telefono,rol,activo,tema)
         VALUES ($1,$2,$3,$4,$5,TRUE,'light') RETURNING id`,
        [p.nombre, p.email, hash, p.telefono, p.rol]
      );
      profesorIds.push(rows[0].id);
    } else {
      profesorIds.push(ex.rows[0].id);
    }
  }
  const adminRow = await client.query("SELECT id FROM profesores WHERE email='admin@fct.edu'");
  if (adminRow.rows.length) profesorIds.unshift(adminRow.rows[0].id);

  // ── 2. Profesores generados (~180 extra = ~200 total) ───────────────────
  const profCount = await client.query('SELECT COUNT(*) FROM profesores');
  if (Number(profCount.rows[0].count) < 200) {
    const needed = 200 - Number(profCount.rows[0].count);
    for (let i = 0; i < needed; i++) {
      const nombre = NOMBRES[i % NOMBRES.length];
      const ap1    = APELLIDOS[(i * 3)  % APELLIDOS.length];
      const ap2    = APELLIDOS[(i * 7 + 5) % APELLIDOS.length];
      const email  = `profe${i + 20}@fct.edu`;
      const ex     = await client.query('SELECT id FROM profesores WHERE email=$1', [email]);
      if (!ex.rows.length) {
        const { rows } = await client.query(
          `INSERT INTO profesores (nombre,email,password,telefono,rol,activo,tema)
           VALUES ($1,$2,$3,$4,'COLABORADOR',TRUE,'light') RETURNING id`,
          [`${nombre} ${ap1} ${ap2}`, email, hash, `6${randInt(10,99)}${randInt(100000,999999)}`]
        );
        profesorIds.push(rows[0].id);
      } else {
        profesorIds.push(ex.rows[0].id);
      }
    }
  } else {
    // Ya existen: cargar todos los ids
    const { rows } = await client.query('SELECT id FROM profesores');
    rows.forEach(r => { if (!profesorIds.includes(r.id)) profesorIds.push(r.id); });
  }

  // ── 3. Empresas hardcoded (30) ───────────────────────────────────────────
  const empresaIds = [];
  for (const e of EMPRESAS_BASE) {
    const { rows } = await client.query(
      `INSERT INTO empresas (cif,nombre,sector,modalidad,contacto_principal,cargo_contacto,
        telefono,email,direccion,num_trabajadores,observaciones,activa,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,NOW(),NOW())
       ON CONFLICT (cif) DO NOTHING RETURNING id`,
      [e.cif, e.nombre, e.sector, e.modalidad, e.contacto, e.cargo, e.tel, e.email, e.dir, e.trab, e.obs ?? null]
    );
    let eid;
    if (rows.length) {
      eid = rows[0].id;
      const np = randInt(1, 3);
      const ps = [...PERFILES].sort(() => Math.random() - 0.5).slice(0, np);
      for (const p of ps) await client.query('INSERT INTO empresa_perfiles VALUES ($1,$2) ON CONFLICT DO NOTHING', [eid, p]);
    } else {
      const r2 = await client.query('SELECT id FROM empresas WHERE cif=$1', [e.cif]);
      eid = r2.rows[0].id;
    }
    empresaIds.push(eid);
  }

  // ── 4. Empresas generadas (~270 extra = ~300 total) ─────────────────────
  const empCount = await client.query('SELECT COUNT(*) FROM empresas');
  if (Number(empCount.rows[0].count) < 300) {
    const needed = 300 - Number(empCount.rows[0].count);
    for (let i = 0; i < needed; i++) {
      const pref  = EMP_PREFIJOS[i % EMP_PREFIJOS.length];
      const suf   = EMP_SUFIJOS[Math.floor(i / EMP_PREFIJOS.length) % EMP_SUFIJOS.length];
      const nombre = `${pref} ${suf}`;
      const cif   = `G${String(28100000 + i).padStart(8, '0')}`;
      const ciudad = pick(EMP_CIUDADES);
      const { rows } = await client.query(
        `INSERT INTO empresas (cif,nombre,sector,modalidad,contacto_principal,cargo_contacto,
          telefono,email,direccion,num_trabajadores,activa,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,NOW(),NOW())
         ON CONFLICT (cif) DO NOTHING RETURNING id`,
        [
          cif, nombre,
          EMP_SECTORES[i % EMP_SECTORES.length],
          pick(EMP_MODALIDAD),
          `${pick(NOMBRES)} ${pick(APELLIDOS)}`,
          pick(EMP_CARGOS),
          `9${randInt(10,99)}${randInt(100000,999999)}`,
          `contacto@${pref.toLowerCase()}${suf.toLowerCase()}.es`,
          `C/ Gran Vía ${randInt(1,200)}, ${ciudad}`,
          randInt(10, 2000),
        ]
      );
      if (rows.length) {
        const eid = rows[0].id;
        const np  = randInt(1, 3);
        const ps  = [...PERFILES].sort(() => Math.random() - 0.5).slice(0, np);
        for (const p of ps) await client.query('INSERT INTO empresa_perfiles VALUES ($1,$2) ON CONFLICT DO NOTHING', [eid, p]);
        empresaIds.push(eid);
      }
    }
  } else {
    const { rows } = await client.query('SELECT id FROM empresas');
    rows.forEach(r => { if (!empresaIds.includes(r.id)) empresaIds.push(r.id); });
  }

  // ── 5. Alumnos (600, ~52% DISPONIBLE) ───────────────────────────────────
  const alumnoCount = await client.query('SELECT COUNT(*) FROM alumnos');
  if (Number(alumnoCount.rows[0].count) < 600) {
    const needed = 600 - Number(alumnoCount.rows[0].count);
    for (let i = 0; i < needed; i++) {
      const estado   = pickEstado();
      const empresaId = ['EN_PRACTICAS','ACEPTADO','ENVIADO'].includes(estado) ? pick(empresaIds) : null;
      await client.query(
        `INSERT INTO alumnos (nombre,apellidos,email,telefono,ciclo,curso,estado,empresa_id,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
        [
          pick(NOMBRES),
          `${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
          `alumno${Number(alumnoCount.rows[0].count) + i + 1}@alumnos.fct.edu`,
          `6${randInt(10,99)}${randInt(100000,999999)}`,
          pick(CICLOS), pick(CURSOS), estado, empresaId,
        ]
      );
    }
  }

  // ── 6. Contactos por año ─────────────────────────────────────────────────
  // 2024: 100  |  2025: 1233  |  2026: 543 (hasta 14-abr)
  const contactoCount = await client.query('SELECT COUNT(*) FROM contactos');
  if (Number(contactoCount.rows[0].count) < 1800) {
    function dateInMonth(year, month, maxDay) {
      const d = randInt(1, maxDay);
      return `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    function dom(year, month) { return new Date(year, month, 0).getDate(); }
    function buildRows(year, monthDist, maxDayOverride) {
      return monthDist.flatMap(([m, count, maxDay]) =>
        Array.from({ length: count }, () => [
          pick(empresaIds), pick(profesorIds),
          dateInMonth(year, m, maxDay ?? dom(year, m)),
          pick(TIPOS), pick(MOTIVOS), pick(RESULTADOS),
        ])
      );
    }

    // 2024 — 100 contactos
    // Ene:6 Feb:7 Mar:9 Abr:10 May:11 Jun:10 Jul:8 Ago:5 Sep:8 Oct:10 Nov:9 Dic:7
    await batchInsertContactos(client, buildRows(2024, [
      [1,6],[2,7],[3,9],[4,10],[5,11],[6,10],[7,8],[8,5],[9,8],[10,10],[11,9],[12,7],
    ]));

    // 2025 — 1233 contactos
    // Ene:70 Feb:85 Mar:95 Abr:105 May:115 Jun:125 Jul:100 Ago:80 Sep:95 Oct:110 Nov:125 Dic:128
    await batchInsertContactos(client, buildRows(2025, [
      [1,70],[2,85],[3,95],[4,105],[5,115],[6,125],[7,100],[8,80],[9,95],[10,110],[11,125],[12,128],
    ]));

    // 2026 — 543 contactos (máximo 14-abr)
    // Ene:100 Feb:120 Mar:170 Abr:153 (días 1-14)
    await batchInsertContactos(client, buildRows(2026, [
      [1,100,31],[2,120,28],[3,170,31],[4,153,14],
    ]));
  }

  // ── 7. Anuncios (tablón) ─────────────────────────────────────────────────
  const anunciosCount = await client.query('SELECT COUNT(*) FROM anuncios');
  if (Number(anunciosCount.rows[0].count) === 0) {
    const adminId  = (await client.query("SELECT id FROM profesores WHERE email='admin@fct.edu'")).rows[0]?.id;
    const prof1Id  = (await client.query("SELECT id FROM profesores WHERE email='mgonzalez@fct.edu'")).rows[0]?.id;
    const prof2Id  = (await client.query("SELECT id FROM profesores WHERE email='lmartinez@fct.edu'")).rows[0]?.id;
    const prof3Id  = (await client.query("SELECT id FROM profesores WHERE email='clopez@fct.edu'")).rows[0]?.id;
    const prof4Id  = (await client.query("SELECT id FROM profesores WHERE email='jsanchez@fct.edu'")).rows[0]?.id;
    const prof5Id  = (await client.query("SELECT id FROM profesores WHERE email='afernandez@fct.edu'")).rows[0]?.id;
    const prof6Id  = (await client.query("SELECT id FROM profesores WHERE email='pruiz@fct.edu'")).rows[0]?.id;
    const prof8Id  = (await client.query("SELECT id FROM profesores WHERE email='ralvarez@fct.edu'")).rows[0]?.id;
    const adminAlt = (await client.query("SELECT id FROM profesores WHERE email='fcano@fct.edu'")).rows[0]?.id;

    const emp1Id  = (await client.query("SELECT id FROM empresas WHERE cif='A28000001'")).rows[0]?.id; // Indra
    const emp2Id  = (await client.query("SELECT id FROM empresas WHERE cif='A28000002'")).rows[0]?.id; // Telefónica
    const emp4Id  = (await client.query("SELECT id FROM empresas WHERE cif='B28000004'")).rows[0]?.id; // DataCloud
    const emp10Id = (await client.query("SELECT id FROM empresas WHERE cif='A28000010'")).rows[0]?.id; // Accenture
    const emp18Id = (await client.query("SELECT id FROM empresas WHERE cif='B08000018'")).rows[0]?.id; // Typeform
    const emp25Id = (await client.query("SELECT id FROM empresas WHERE cif='B46000025'")).rows[0]?.id; // Novait
    const emp3Id  = (await client.query("SELECT id FROM empresas WHERE cif='B28000003'")).rows[0]?.id; // S2 Grupo / tercera
    const emp5Id  = (await client.query("SELECT id FROM empresas WHERE cif='B28000005'")).rows[0]?.id; // quinta
    const emp7Id  = (await client.query("SELECT id FROM empresas WHERE cif='A28000007'")).rows[0]?.id; // séptima
    const emp12Id = (await client.query("SELECT id FROM empresas WHERE cif='B28000012'")).rows[0]?.id; // duodécima

    const ANUNCIOS_SEED = [
      {
        titulo: 'Indra Sistemas busca 3 alumnos DAM para prácticas',
        contenido: 'Indra Sistemas abre 3 plazas de prácticas FCT para alumnos de 2º DAM. Perfiles junior con conocimientos en Java, Spring Boot y bases de datos relacionales. El proyecto se desarrollará en las oficinas de Alcobendas. Alta posibilidad de contratación al finalizar.',
        tipo: 'OFERTA', ciclo: 'DAM', num_plazas: 3, empresa_id: emp1Id, autor_id: prof1Id,
        activo: true, destacado: true, fecha_inicio: '2026-04-01', fecha_fin: '2026-06-30',
        created_at: '2026-04-10 10:00:00',
      },
      {
        titulo: '¡URGENTE! Empresa cancela plazas — necesitamos alternativa',
        contenido: 'Grupo Soluciones IT ha cancelado sus 3 plazas previstas para mayo. Necesitamos encontrar empresas alternativas para los alumnos DAM ya comprometidos. Por favor, si conocéis empresas interesadas, contactad con el departamento a la mayor brevedad posible.',
        tipo: 'URGENTE', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: true, destacado: true, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-20 08:00:00',
      },
      {
        titulo: 'ASIR — 3 alumnos sin empresa, plazo cierra en 10 días',
        contenido: 'Quedan 3 alumnos de 2º ASIR sin empresa asignada y el plazo límite finaliza en 10 días. Conocimientos en redes Cisco, virtualización VMware, administración Windows Server y Linux. Se admiten empresas fuera de Madrid con ayuda para desplazamiento.',
        tipo: 'URGENTE', ciclo: 'ASIR', num_plazas: 3, empresa_id: null, autor_id: prof6Id ?? adminId,
        activo: true, destacado: true, fecha_inicio: null, fecha_fin: '2026-04-30',
        created_at: '2026-04-21 08:30:00',
      },
      {
        titulo: 'Telefónica Tech — 2 plazas DAW disponibles',
        contenido: 'Telefónica Tech abre 2 plazas de prácticas para alumnos de 2º DAW. Se requiere conocimiento de React, TypeScript y desarrollo de APIs REST con Node.js. Modalidad presencial en la sede de Gran Vía, Madrid. Incorporación en mayo.',
        tipo: 'OFERTA', ciclo: 'DAW', num_plazas: 2, empresa_id: emp2Id, autor_id: prof2Id,
        activo: true, destacado: false, fecha_inicio: '2026-05-01', fecha_fin: '2026-07-31',
        created_at: '2026-04-15 09:30:00',
      },
      {
        titulo: '5 alumnos DAW disponibles para prácticas inmediatas',
        contenido: 'El departamento tiene 5 alumnos de 2º DAW disponibles para comenzar prácticas de forma inmediata. Perfiles con experiencia en React, Vue.js y desarrollo de APIs REST. Se pueden asignar a empresas de cualquier ciudad con modalidad remota o presencial.',
        tipo: 'DEMANDA', ciclo: 'DAW', num_plazas: 5, empresa_id: null, autor_id: prof3Id,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-18 11:00:00',
      },
      {
        titulo: 'Accenture España — convocatoria abierta para todos los ciclos',
        contenido: 'Accenture España abre su convocatoria anual de prácticas con 8 plazas disponibles para alumnos de todos los ciclos: DAM, DAW, ASIR y SMR. Las entrevistas se realizarán la semana del 5 de mayo en sus oficinas de Joaquín Costa. Ambiente internacional y proyectos de gran escala.',
        tipo: 'OFERTA', ciclo: null, num_plazas: 8, empresa_id: emp10Id, autor_id: prof4Id,
        activo: true, destacado: false, fecha_inicio: '2026-05-15', fecha_fin: '2026-09-15',
        created_at: '2026-04-17 16:30:00',
      },
      {
        titulo: 'Alumnos SMR buscan empresa — 4 plazas libres',
        contenido: '4 alumnos de 2º SMR todavía sin empresa asignada. Conocimientos en redes, sistemas Windows/Linux, virtualización con Hyper-V y soporte técnico nivel 1 y 2. Disponibles desde el 1 de mayo. Se admiten empresas fuera del área metropolitana de Madrid.',
        tipo: 'DEMANDA', ciclo: 'SMR', num_plazas: 4, empresa_id: null, autor_id: prof5Id,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-19 10:15:00',
      },
      {
        titulo: 'DataCloud Spain busca perfil Python/Data Science',
        contenido: 'DataCloud Spain necesita un alumno de 2º DAM con conocimientos de Python, pandas y bases de datos relacionales (PostgreSQL). El proyecto trata sobre migración de datos a la nube. Posibilidad real de incorporación directa al finalizar las prácticas.',
        tipo: 'OFERTA', ciclo: 'DAM', num_plazas: 1, empresa_id: emp4Id, autor_id: prof8Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-01', fecha_fin: '2026-07-31',
        created_at: '2026-04-16 13:00:00',
      },
      {
        titulo: 'Reunión coordinación FCT — 30 de abril a las 10:00h',
        contenido: 'Convocatoria de reunión de coordinación del departamento FCT para el miércoles 30 de abril a las 10:00h en la sala de reuniones B-204. Asistencia obligatoria para todos los tutores con alumnos asignados. Se revisará el estado actual de colocaciones y los casos pendientes.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-21 14:00:00',
      },
      {
        titulo: 'Nuevos convenios firmados con el parque tecnológico de Paterna',
        contenido: 'El departamento ha firmado nuevos convenios de colaboración con 5 empresas del parque tecnológico de Paterna: Lynx Tech Solutions, iQBit, Novait, Apliter Tecnología y Thinkingroup. Podéis consultar los detalles de cada empresa en el apartado Empresas del sistema.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: prof1Id,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-22 09:00:00',
      },
      {
        titulo: 'Recordatorio: entrega de memorias — fecha límite 15 de mayo',
        contenido: 'Recordatorio importante: la fecha límite para la entrega de memorias de prácticas es el 15 de mayo. Los tutores de empresa deben tener cumplimentada la evaluación intermedia antes del 30 de abril. Los alumnos que no entreguen en plazo no podrán ser evaluados en la convocatoria ordinaria.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: '2026-05-15',
        created_at: '2026-04-20 12:00:00',
      },
      {
        titulo: 'Novait — empresa interesada en contratar tras prácticas',
        contenido: 'Novait (Valencia) ha manifestado interés en contratar a los alumnos de prácticas una vez finalizado el período. Empresa pequeña con muy buen ambiente y proyectos modernos con tecnologías actuales (React, Node.js, PostgreSQL). Plazas limitadas, se asignarán por orden de solicitud.',
        tipo: 'OFERTA', ciclo: 'DAW', num_plazas: 2, empresa_id: emp25Id, autor_id: prof2Id,
        activo: true, destacado: false, fecha_inicio: '2026-05-01', fecha_fin: '2026-08-31',
        created_at: '2026-04-23 08:00:00',
      },
      {
        titulo: 'Typeform Barcelona — oferta expirada (referencia)',
        contenido: 'Typeform (Barcelona) buscaba 2 alumnos de DAW con nivel B2 de inglés. Trabajo en equipo internacional con perfiles de toda Europa. La oferta ya ha sido cubierta; se deja como referencia para futuras convocatorias similares.',
        tipo: 'OFERTA', ciclo: 'DAW', num_plazas: 2, empresa_id: emp18Id, autor_id: prof8Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: '2026-03-01', fecha_fin: '2026-04-01',
        created_at: '2026-03-10 10:00:00',
      },

      // ── ACTIVOS (15 nuevos) ──────────────────────────────────────────────
      {
        titulo: 'Empresa tecnológica busca 2 alumnos ASIR — Alcalá de Henares',
        contenido: 'Empresa de servicios gestionados (MSP) ubicada en Alcalá de Henares necesita 2 alumnos de 2º ASIR para reforzar su equipo de soporte. Tareas: administración de servidores Windows/Linux, resolución de incidencias Nivel 2 y gestión de copias de seguridad. Buen ambiente de trabajo y posibilidad de continuidad.',
        tipo: 'OFERTA', ciclo: 'ASIR', num_plazas: 2, empresa_id: emp3Id ?? null, autor_id: prof6Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-01', fecha_fin: '2026-07-31',
        created_at: '2026-04-14 09:00:00',
      },
      {
        titulo: 'SMR — soporte técnico en cadena de tiendas retail',
        contenido: 'Empresa del sector retail con presencia en toda la Comunidad de Madrid busca 2 alumnos de SMR para dar soporte técnico en tienda: TPVs, impresoras de etiquetas, redes locales y resolución de incidencias. Horario comercial. Posibilidad de contrato al término.',
        tipo: 'OFERTA', ciclo: 'SMR', num_plazas: 2, empresa_id: emp5Id ?? null, autor_id: prof5Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-15', fecha_fin: '2026-08-15',
        created_at: '2026-04-16 11:30:00',
      },
      {
        titulo: '3 alumnos DAM disponibles — perfil backend Java/Spring',
        contenido: 'Tres alumnos de 2º DAM con sólidos conocimientos en Java, Spring Boot, Hibernate y MySQL buscan empresa para prácticas FCT. Disponibles para incorporación inmediata, modalidad presencial o híbrida. Excelente expediente académico. Contactad con el tutor para coordinar entrevistas.',
        tipo: 'DEMANDA', ciclo: 'DAM', num_plazas: 3, empresa_id: null, autor_id: prof1Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-11 10:00:00',
      },
      {
        titulo: '2 alumnos DAW disponibles — perfil frontend React/Vue',
        contenido: 'Dos alumnos de 2º DAW especializados en frontend buscan empresa. Dominan React (hooks, context, react-query), Vue 3 y Tailwind CSS. Experiencia en proyectos reales desarrollados en clase. Disponibles desde el 1 de mayo. Preferencia por empresas en Madrid o remoto.',
        tipo: 'DEMANDA', ciclo: 'DAW', num_plazas: 2, empresa_id: null, autor_id: prof3Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-13 16:00:00',
      },
      {
        titulo: 'Accenture — sesión informativa el 6 de mayo a las 11h',
        contenido: 'Accenture España organiza una sesión informativa para alumnos interesados en sus plazas de prácticas. La presentación tendrá lugar el 6 de mayo a las 11:00h en el aula de actos. Hablarán responsables de RRHH y antiguos alumnos del centro que trabajan allí. Asistencia libre, se recomienda a todos los que tengan oferta pendiente.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: emp10Id, autor_id: prof4Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-22 10:00:00',
      },
      {
        titulo: 'Nuevo modelo de informe de seguimiento — descarga disponible',
        contenido: 'El departamento ha actualizado el modelo oficial de informe de seguimiento mensual de prácticas. El nuevo modelo recoge mejor los indicadores exigidos por la Consejería. Disponible en la carpeta compartida del departamento (ruta: RRHH > FCT > Plantillas 2026). Por favor usad esta versión a partir de mayo.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-21 17:00:00',
      },
      {
        titulo: '¡URGENTE! Tutor empresa no responde — alumno sin supervisión',
        contenido: 'El tutor de empresa de uno de nuestros alumnos DAW lleva dos semanas sin responder a correos ni llamadas. El alumno está trabajando sin supervisión formal. Se necesita que el responsable de FCT contacte urgentemente con la empresa para regularizar la situación o buscar una empresa alternativa.',
        tipo: 'URGENTE', ciclo: 'DAW', num_plazas: null, empresa_id: null, autor_id: prof2Id ?? adminId,
        activo: true, destacado: true, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-23 07:45:00',
      },
      {
        titulo: 'Indra — convocatoria adicional para DAW, 2 plazas nuevas',
        contenido: 'Indra Sistemas amplía su oferta y abre 2 plazas adicionales para alumnos de 2º DAW. Se trabajará en el área de desarrollo web corporativo con tecnologías Angular y Java. Las entrevistas se realizarán de forma telemática la primera semana de mayo. Buena oportunidad en empresa líder del sector.',
        tipo: 'OFERTA', ciclo: 'DAW', num_plazas: 2, empresa_id: emp1Id, autor_id: prof1Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-12', fecha_fin: '2026-08-12',
        created_at: '2026-04-22 15:00:00',
      },
      {
        titulo: 'Alumno ASIR disponible — perfil redes y ciberseguridad',
        contenido: 'Un alumno de 2º ASIR con enfoque en ciberseguridad busca empresa. Ha completado el módulo de seguridad con sobresaliente y tiene certificación CompTIA Security+ en proceso. Disponible de inmediato, preferencia por empresas que trabajen con SOC, pentesting o administración de sistemas críticos.',
        tipo: 'DEMANDA', ciclo: 'ASIR', num_plazas: 1, empresa_id: null, autor_id: prof6Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-20 09:30:00',
      },
      {
        titulo: 'Recordatorio visitas de seguimiento — mayo y junio',
        contenido: 'Recordad que todos los tutores FCT deben realizar al menos una visita presencial o videollamada de seguimiento durante mayo y antes del 15 de junio. Registrad la visita en el sistema indicando fecha, empresa y observaciones. Las visitas no registradas no computan para la evaluación del módulo.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: '2026-06-15',
        created_at: '2026-04-23 09:00:00',
      },
      {
        titulo: 'DataCloud — plaza adicional perfil DevOps/Cloud',
        contenido: 'DataCloud Spain amplía su demanda con una plaza para perfil DevOps. Se valorará experiencia con Docker, CI/CD básico y nociones de AWS o Azure. El alumno trabajará codo con codo con el equipo de infraestructura en la migración de servicios a la nube. Posibilidad de teletrabajo parcial.',
        tipo: 'OFERTA', ciclo: 'DAM', num_plazas: 1, empresa_id: emp4Id, autor_id: prof8Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-05', fecha_fin: '2026-08-05',
        created_at: '2026-04-17 14:00:00',
      },
      {
        titulo: '2 alumnos SMR sin empresa — zona sur de Madrid',
        contenido: 'Dos alumnos de 2º SMR de la zona sur de Madrid (Leganés, Getafe) aún sin empresa asignada. Conocimientos en redes, soporte técnico, Windows Server básico y cableado estructurado. Se priorizan empresas en esa zona para evitar desplazamientos largos, aunque también se aceptan ofertas remotas.',
        tipo: 'DEMANDA', ciclo: 'SMR', num_plazas: 2, empresa_id: null, autor_id: prof5Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-18 08:45:00',
      },
      {
        titulo: 'Empresa de videojuegos busca DAM — proyecto Unity',
        contenido: 'Estudio indie de videojuegos con sede en Madrid busca 1 alumno de 2º DAM para colaborar en el desarrollo de un juego móvil con Unity y C#. No es necesaria experiencia previa en Unity; se valorarán buenas bases de programación orientada a objetos. Ambiente creativo y muy motivador.',
        tipo: 'OFERTA', ciclo: 'DAM', num_plazas: 1, empresa_id: emp7Id ?? null, autor_id: prof1Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-01', fecha_fin: '2026-07-31',
        created_at: '2026-04-15 12:00:00',
      },
      {
        titulo: 'Jornada de orientación laboral — martes 28 de abril',
        contenido: 'El martes 28 de abril a las 16:00h se celebra la jornada de orientación laboral para alumnos de 2º. Contaremos con la participación de ex-alumnos del centro que llevan 2-5 años en el sector. Hablarán sobre su experiencia, proceso de selección y consejos para el primer empleo. Muy recomendable para los que estén en búsqueda activa.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: prof4Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-04-22 11:00:00',
      },
      {
        titulo: 'Novait abre plaza para perfil fullstack con inglés',
        contenido: 'Novait (Valencia) amplía su oferta con una plaza para perfil fullstack. Se requiere nivel B1 de inglés como mínimo, ya que parte del equipo es extranjero. Stack: React + Node.js + PostgreSQL. La empresa ofrece tutoría muy activa y proyectos reales desde el primer día. Modalidad híbrida o remota.',
        tipo: 'OFERTA', ciclo: 'DAW', num_plazas: 1, empresa_id: emp25Id, autor_id: prof2Id ?? adminId,
        activo: true, destacado: false, fecha_inicio: '2026-05-05', fecha_fin: '2026-09-05',
        created_at: '2026-04-23 10:00:00',
      },

      // ── INACTIVOS (11 nuevos) ────────────────────────────────────────────
      {
        titulo: 'OFERTA CUBIERTA — empresa de logística, 2 plazas SMR',
        contenido: 'Empresa de logística y distribución buscaba 2 alumnos SMR para gestión de infraestructura interna y soporte a usuarios. Las plazas ya han sido cubiertas con alumnos del centro. Se mantiene el registro para futuras convocatorias con esta empresa.',
        tipo: 'OFERTA', ciclo: 'SMR', num_plazas: 2, empresa_id: emp12Id ?? null, autor_id: prof5Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: '2026-02-01', fecha_fin: '2026-04-30',
        created_at: '2026-02-15 09:00:00',
      },
      {
        titulo: 'OFERTA EXPIRADA — startup IA busca DAM (Python/ML)',
        contenido: 'Startup de inteligencia artificial necesitaba 1 alumno DAM con Python y nociones de machine learning. La oferta expiró sin cubrirse por falta de alumnos con el perfil requerido. Si surge convocatoria similar en el futuro, asegurarse de que haya alumnos con ese perfil antes de publicar.',
        tipo: 'OFERTA', ciclo: 'DAM', num_plazas: 1, empresa_id: null, autor_id: prof1Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: '2025-11-01', fecha_fin: '2026-01-31',
        created_at: '2025-11-10 11:00:00',
      },
      {
        titulo: 'CUBIERTA — agencia de marketing digital, 1 plaza DAW',
        contenido: 'Agencia de marketing digital con sede en Málaga buscaba 1 alumno DAW con conocimientos de WordPress, SEO básico y maquetación HTML/CSS. La plaza fue cubierta. La empresa ha valorado muy positivamente al alumno asignado y ha pedido que se les tenga en cuenta para el próximo año.',
        tipo: 'OFERTA', ciclo: 'DAW', num_plazas: 1, empresa_id: null, autor_id: prof3Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: '2026-01-15', fecha_fin: '2026-03-15',
        created_at: '2026-01-20 10:00:00',
      },
      {
        titulo: 'RESUELTA — alumnos ASIR colocados tras búsqueda urgente',
        contenido: 'Los 4 alumnos ASIR que estaban sin empresa tras la cancelación de Redes Corporativas S.L. han sido colocados. Dos van a Sistemas MCM, uno a Inforlan y el último a CloudBase. Agradecemos la colaboración de todos los que aportaron contactos. El caso queda cerrado.',
        tipo: 'DEMANDA', ciclo: 'ASIR', num_plazas: 4, empresa_id: null, autor_id: prof6Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-03-05 14:00:00',
      },
      {
        titulo: 'RESUELTA — 3 alumnos SMR de promoción anterior colocados',
        contenido: 'Los tres alumnos SMR que habían quedado sin empresa a mediados de febrero ya tienen plaza confirmada. Se gestionó a través de dos empresas nuevas que han firmado convenio. Queda el registro para estadísticas del departamento.',
        tipo: 'DEMANDA', ciclo: 'SMR', num_plazas: 3, empresa_id: null, autor_id: prof5Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-02-20 16:30:00',
      },
      {
        titulo: 'INFO CADUCADA — plazos entrega documentación enero',
        contenido: 'Recordatorio de los plazos para la entrega de documentación FCT en el período de enero: acuerdo de colaboración antes del 10 de enero, programación formativa antes del 15, y primera evaluación parcial antes del 31. Aviso ya vencido; conservado como referencia para el próximo ciclo.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: false, destacado: false, fecha_inicio: null, fecha_fin: '2026-01-31',
        created_at: '2026-01-05 08:00:00',
      },
      {
        titulo: 'OFERTA EXPIRADA — empresa de ciberseguridad, perfil ASIR',
        contenido: 'Empresa especializada en ciberseguridad ofrecía 2 plazas para ASIR con perfil en seguridad de redes y pentesting básico. La convocatoria expiró en febrero. La empresa no contactó para renovar la oferta. Si surge interés por su parte, retomar el contacto directamente.',
        tipo: 'OFERTA', ciclo: 'ASIR', num_plazas: 2, empresa_id: null, autor_id: prof6Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: '2025-12-01', fecha_fin: '2026-02-28',
        created_at: '2025-12-10 09:30:00',
      },
      {
        titulo: 'URGENTE RESUELTO — alumno retirado de empresa por conflicto',
        contenido: 'La situación del alumno DAM retirado de la empresa BetaTech por conflicto con el tutor ha quedado resuelta. El alumno ha sido recolocado en otra empresa y completará el período de prácticas sin afectar a su evaluación. El departamento ha dejado en suspenso el convenio con BetaTech para revisión.',
        tipo: 'URGENTE', ciclo: 'DAM', num_plazas: null, empresa_id: null, autor_id: adminAlt ?? adminId,
        activo: false, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2026-03-18 10:00:00',
      },
      {
        titulo: 'INFO PASADA — cambios en normativa FCT curso 2025-2026',
        contenido: 'Resumen de los cambios normativos aprobados por la Consejería para el curso 2025-2026: ampliación del período mínimo de prácticas a 400 horas para algunos ciclos, nuevo formato de convenio tripartito, y obligatoriedad del seguro de accidentes para empresas de más de 50 trabajadores. Aviso informativo ya incorporado a los documentos oficiales del departamento.',
        tipo: 'INFO', ciclo: null, num_plazas: null, empresa_id: null, autor_id: adminId,
        activo: false, destacado: false, fecha_inicio: null, fecha_fin: null,
        created_at: '2025-09-15 09:00:00',
      },
      {
        titulo: 'RESUELTA — demanda DAW primer trimestre cubierta al 100%',
        contenido: 'Todos los alumnos de 2º DAW del primer período (septiembre-enero) han completado sus prácticas. Tasa de colocación: 100%. De los 18 alumnos, 12 han recibido oferta de contratación directa al finalizar. Queda el registro para las estadísticas anuales del departamento.',
        tipo: 'DEMANDA', ciclo: 'DAW', num_plazas: 18, empresa_id: null, autor_id: prof3Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: null, fecha_fin: '2026-01-31',
        created_at: '2026-01-31 17:00:00',
      },
      {
        titulo: 'OFERTA EXPIRADA — empresa de consultoría ERP, perfil DAM',
        contenido: 'Empresa de consultoría SAP buscaba 1 alumno DAM con base en Java y disposición para aprender ABAP. La oferta quedó desierta por falta de coincidencia de perfil. Nota para el próximo año: valorar incluir nociones de ERP/SAP en el currículo de DAM.',
        tipo: 'OFERTA', ciclo: 'DAM', num_plazas: 1, empresa_id: null, autor_id: prof8Id ?? adminId,
        activo: false, destacado: false, fecha_inicio: '2025-10-01', fecha_fin: '2025-12-31',
        created_at: '2025-10-05 11:00:00',
      },
    ];

    for (const a of ANUNCIOS_SEED) {
      await client.query(
        `INSERT INTO anuncios
           (titulo, contenido, tipo, ciclo, num_plazas, empresa_id, autor_id, activo, destacado, fecha_inicio, fecha_fin, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)`,
        [
          a.titulo, a.contenido, a.tipo, a.ciclo ?? null, a.num_plazas ?? null,
          a.empresa_id ?? null, a.autor_id ?? null, a.activo, a.destacado,
          a.fecha_inicio ?? null, a.fecha_fin ?? null, a.created_at,
        ]
      );
    }
  }

  console.log('Seed completado: ~300 empresas · ~200 profesores · 600 alumnos · 1876 contactos (2024-2026) · 39 anuncios (70% activos)');
}

module.exports = seedDb;
