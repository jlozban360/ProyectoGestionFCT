const bcrypt = require('bcryptjs');

// ─── Empresas hardcoded (30) ────────────────────────────────────────────────
const EMPRESAS_BASE = [
  { cif: 'A28000001', nombre: 'Indra Sistemas',         sector: 'Tecnología',           modalidad: 'FCT',         contacto: 'Carlos Ruiz',      cargo: 'Director RRHH',         tel: '915550011', email: 'rrhh@indra.es',             dir: 'Av. de Bruselas 35, Alcobendas',       trab: 1200, obs: 'Gran empresa TI, acepta perfiles DAM y DAW' },
  { cif: 'A28000002', nombre: 'Telefónica Tech',        sector: 'Telecomunicaciones',    modalidad: 'DUAL',        contacto: 'Ana Martínez',     cargo: 'Responsable Formación', tel: '915550022', email: 'formacion@telef.es',         dir: 'Gran Vía 28, Madrid',                  trab: 800,  obs: 'Prefieren alumnos de ASIR y SMR' },
  { cif: 'B28000003', nombre: 'Grupo Soluciones IT',    sector: 'Consultoría',           modalidad: 'FCT',         contacto: 'Pedro Sánchez',    cargo: 'CTO',                   tel: '915550033', email: 'pedro@soluciones-it.es',     dir: 'C/ Alcalá 100, Madrid',                trab: 45,   obs: null },
  { cif: 'B28000004', nombre: 'DataCloud Spain',        sector: 'Cloud & Datos',         modalidad: 'FCT',         contacto: 'Laura Gómez',      cargo: 'HR Manager',            tel: '915550044', email: 'hr@datacloud.es',            dir: 'C/ Serrano 55, Madrid',                trab: 120,  obs: 'Buscan perfiles con Python o Java' },
  { cif: 'A46000005', nombre: 'Mercadona Digital',      sector: 'Retail / Tecnología',   modalidad: 'CONTRATACION',contacto: 'José Fernández',   cargo: 'Jefe de Sistemas',      tel: '963550055', email: 'sistemas@mercadona.es',      dir: 'Av. Valencia 10, Paterna',             trab: 2000, obs: 'Alta posibilidad de contratación' },
  { cif: 'B41000006', nombre: 'Solusoft Sevilla',       sector: 'Desarrollo Software',   modalidad: 'FCT',         contacto: 'María Jiménez',    cargo: 'Directora Técnica',     tel: '954550066', email: 'mjimenez@solusoft.es',       dir: 'C/ Betis 20, Sevilla',                 trab: 30,   obs: null },
  { cif: 'A08000007', nombre: 'T-Systems Iberia',       sector: 'Tecnología',            modalidad: 'DUAL',        contacto: 'Miquel Puig',      cargo: 'Talent Acquisition',    tel: '932550077', email: 'talent@tsystems.es',         dir: 'Av. Diagonal 200, Barcelona',          trab: 600,  obs: 'Empresa alemana, buen ambiente' },
  { cif: 'B28000008', nombre: 'Cibernos',               sector: 'Consultoría TI',        modalidad: 'FCT',         contacto: 'Raúl Torres',      cargo: 'Gerente',               tel: '915550088', email: 'rtorres@cibernos.es',        dir: 'C/ Orense 70, Madrid',                 trab: 80,   obs: 'Trabajan con administración pública' },
  { cif: 'B46000009', nombre: 'Lynx Tech Solutions',    sector: 'Ciberseguridad',        modalidad: 'FCT',         contacto: 'Sofía Blanco',     cargo: 'Responsable RRHH',      tel: '961550099', email: 'sofia@lynx-tech.es',         dir: 'Parque Tecnológico, Paterna',          trab: 55,   obs: 'Perfil ideal: ASIR con ciberseguridad' },
  { cif: 'A28000010', nombre: 'Accenture España',       sector: 'Consultoría',           modalidad: 'MIXTA',       contacto: 'Isabel Moreno',    cargo: 'Campus Recruiter',      tel: '915550100', email: 'campus@accenture.es',        dir: 'C/ Joaquín Costa 26, Madrid',          trab: 5000, obs: 'Muchas plazas disponibles cada año' },
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
  { cif: 'A28000027', nombre: 'Everis (NTT Data)',      sector: 'Consultoría',           modalidad: 'MIXTA',       contacto: 'Marcos Reyes',     cargo: 'Selección',             tel: '915550277', email: 'mreyes@everis.es',           dir: 'Av. Manoteras 52, Madrid',             trab: 2500, obs: 'Filial de NTT Data' },
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

  console.log('Seed completado: ~300 empresas · ~200 profesores · 600 alumnos · 1876 contactos (2024-2026)');
}

module.exports = seedDb;
