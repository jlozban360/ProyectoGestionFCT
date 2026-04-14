const bcrypt = require('bcryptjs');

const EMPRESAS = [
  { cif: 'A28000001', nombre: 'Indra Sistemas', sector: 'Tecnología', modalidad: 'FCT', contacto: 'Carlos Ruiz', cargo: 'Director RRHH', telefono: '915550011', email: 'rrhh@indra.es', direccion: 'Av. de Bruselas 35, Alcobendas', trabajadores: 1200, obs: 'Gran empresa TI, acepta perfiles DAM y DAW' },
  { cif: 'A28000002', nombre: 'Telefónica Tech', sector: 'Telecomunicaciones', modalidad: 'DUAL', contacto: 'Ana Martínez', cargo: 'Responsable Formación', telefono: '915550022', email: 'formacion@telef.es', direccion: 'Gran Vía 28, Madrid', trabajadores: 800, obs: 'Prefieren alumnos de ASIR y SMR' },
  { cif: 'B28000003', nombre: 'Grupo Soluciones IT', sector: 'Consultoría', modalidad: 'FCT', contacto: 'Pedro Sánchez', cargo: 'CTO', telefono: '915550033', email: 'pedro@soluciones-it.es', direccion: 'C/ Alcalá 100, Madrid', trabajadores: 45, obs: null },
  { cif: 'B28000004', nombre: 'DataCloud Spain', sector: 'Cloud & Datos', modalidad: 'FCT', contacto: 'Laura Gómez', cargo: 'HR Manager', telefono: '915550044', email: 'hr@datacloud.es', direccion: 'C/ Serrano 55, Madrid', trabajadores: 120, obs: 'Buscan perfiles con Python o Java' },
  { cif: 'A46000005', nombre: 'Mercadona Digital', sector: 'Retail / Tecnología', modalidad: 'CONTRATACION', contacto: 'José Fernández', cargo: 'Jefe de Sistemas', telefono: '963550055', email: 'sistemas@mercadona.es', direccion: 'Av. Valencia 10, Paterna', trabajadores: 2000, obs: 'Alta posibilidad de contratación' },
  { cif: 'B41000006', nombre: 'Solusoft Sevilla', sector: 'Desarrollo Software', modalidad: 'FCT', contacto: 'María Jiménez', cargo: 'Directora Técnica', telefono: '954550066', email: 'mjimenez@solusoft.es', direccion: 'C/ Betis 20, Sevilla', trabajadores: 30, obs: null },
  { cif: 'A08000007', nombre: 'T-Systems Iberia', sector: 'Tecnología', modalidad: 'DUAL', contacto: 'Miquel Puig', cargo: 'Talent Acquisition', telefono: '932550077', email: 'talent@tsystems.es', direccion: 'Av. Diagonal 200, Barcelona', trabajadores: 600, obs: 'Empresa alemana, buen ambiente' },
  { cif: 'B28000008', nombre: 'Cibernos', sector: 'Consultoría TI', modalidad: 'FCT', contacto: 'Raúl Torres', cargo: 'Gerente', telefono: '915550088', email: 'rtorres@cibernos.es', direccion: 'C/ Orense 70, Madrid', trabajadores: 80, obs: 'Trabajan con administración pública' },
  { cif: 'B46000009', nombre: 'Lynx Tech Solutions', nombre2: null, sector: 'Ciberseguridad', modalidad: 'FCT', contacto: 'Sofía Blanco', cargo: 'Responsable RRHH', telefono: '961550099', email: 'sofia@lynx-tech.es', direccion: 'Parque Tecnológico, Paterna', trabajadores: 55, obs: 'Perfil ideal: ASIR con ciberseguridad' },
  { cif: 'A28000010', nombre: 'Accenture España', sector: 'Consultoría', modalidad: 'MIXTA', contacto: 'Isabel Moreno', cargo: 'Campus Recruiter', telefono: '915550100', email: 'campus@accenture.es', direccion: 'C/ Joaquín Costa 26, Madrid', trabajadores: 5000, obs: 'Muchas plazas disponibles cada año' },
  { cif: 'B28000011', nombre: 'Netmind Learning', sector: 'Formación TI', modalidad: 'FCT', contacto: 'David López', cargo: 'Director', telefono: '915550111', email: 'dlopez@netmind.es', direccion: 'C/ Luchana 23, Madrid', trabajadores: 25, obs: null },
  { cif: 'B08000012', nombre: 'Adevinta Spain', sector: 'E-commerce', modalidad: 'FCT', contacto: 'Núria Sala', cargo: 'HR Generalist', telefono: '932550122', email: 'nsala@adevinta.es', direccion: 'Av. Gran Via 16, Barcelona', trabajadores: 300, obs: 'Wallapop / InfoJobs — ambiente startup' },
  { cif: 'A28000013', nombre: 'GMV Soluciones', sector: 'Aeroespacial / TI', modalidad: 'DUAL', contacto: 'Fernando Ríos', cargo: 'Jefe de Personas', telefono: '915550133', email: 'frios@gmv.es', direccion: 'Isaac Newton 11, Tres Cantos', trabajadores: 900, obs: 'Proyectos internacionales' },
  { cif: 'B41000014', nombre: 'Atos IT Solutions Sevilla', sector: 'Tecnología', modalidad: 'FCT', contacto: 'Carmen Vega', cargo: 'Responsable Formación', telefono: '954550144', email: 'cvega@atos.es', direccion: 'C/ Luis Montoto 10, Sevilla', trabajadores: 150, obs: null },
  { cif: 'B28000015', nombre: 'Plain Concepts', sector: 'Desarrollo Software', modalidad: 'FCT', contacto: 'Alberto García', cargo: 'CTO', telefono: '915550155', email: 'agarcia@plainconcepts.es', direccion: 'C/ Príncipe de Vergara 108, Madrid', trabajadores: 200, obs: 'Microsoft Gold Partner' },
  { cif: 'B46000016', nombre: 'iQBit', sector: 'Desarrollo Software', modalidad: 'FCT', contacto: 'Patricia Molina', cargo: 'HR Manager', telefono: '961550166', email: 'patricia@iqbit.es', direccion: 'C/ Colón 1, Valencia', trabajadores: 40, obs: 'Empresa local con buen ambiente' },
  { cif: 'A28000017', nombre: 'NTT Data Spain', sector: 'Consultoría TI', modalidad: 'MIXTA', contacto: 'Roberto Serrano', cargo: 'Recruitment Manager', telefono: '915550177', email: 'rserrano@nttdata.es', direccion: 'Av. Partenón 12, Madrid', trabajadores: 3000, obs: 'Empresa japonesa, proyectos bancarios' },
  { cif: 'B08000018', nombre: 'Typeform', sector: 'SaaS', modalidad: 'FCT', contacto: 'Laia Costa', cargo: 'People Ops', telefono: '932550188', email: 'lcosta@typeform.com', direccion: 'C/ Pallars 85, Barcelona', trabajadores: 500, obs: 'Inglés imprescindible' },
  { cif: 'B28000019', nombre: 'Sngular', sector: 'Desarrollo Software', modalidad: 'FCT', contacto: 'Jaime Rueda', cargo: 'Director Técnico', telefono: '915550199', email: 'jrueda@sngular.es', direccion: 'C/ Emilio Vargas 4, Madrid', trabajadores: 700, obs: null },
  { cif: 'B46000020', nombre: 'Thinkingroup', sector: 'Marketing Digital', modalidad: 'FCT', contacto: 'Elena Pascual', cargo: 'Directora', telefono: '961550200', email: 'elena@thinkingroup.es', direccion: 'C/ Jorge Juan 18, Valencia', trabajadores: 35, obs: 'Orientada a SMR con conocimientos web' },
  { cif: 'A28000021', nombre: 'Sopra Steria', sector: 'Consultoría TI', modalidad: 'DUAL', contacto: 'Luis Navarro', cargo: 'Responsable Practicas', telefono: '915550211', email: 'lnavarro@soprasteria.es', direccion: 'C/ Albarracín 25, Madrid', trabajadores: 1800, obs: 'Empresa francesa, proyectos AGE' },
  { cif: 'B08000022', nombre: 'Factorial HR', sector: 'SaaS / RRHH', modalidad: 'FCT', contacto: 'Anna Ferrer', cargo: 'Talent Manager', telefono: '932550222', email: 'anna@factorial.es', direccion: 'C/ Pallars 99, Barcelona', trabajadores: 250, obs: 'Startup unicornio española' },
  { cif: 'B28000023', nombre: 'Semantix España', sector: 'Big Data', modalidad: 'FCT', contacto: 'Pablo Morales', cargo: 'Data Lead', telefono: '915550233', email: 'pablo@semantix.es', direccion: 'C/ Alcalá 200, Madrid', trabajadores: 60, obs: 'Buscan DAW con conocimientos BI' },
  { cif: 'B41000024', nombre: 'Ingenia', sector: 'Consultoría TI', modalidad: 'FCT', contacto: 'Rosa Delgado', cargo: 'RRHH', telefono: '954550244', email: 'rosa@ingenia.es', direccion: 'C/ Resolana 16, Sevilla', trabajadores: 90, obs: null },
  { cif: 'B46000025', nombre: 'Novait', sector: 'Desarrollo Software', modalidad: 'CONTRATACION', contacto: 'Andrés Cano', cargo: 'CEO', telefono: '961550255', email: 'andres@novait.es', direccion: 'C/ Turia 30, Valencia', trabajadores: 20, obs: 'Muy interesados en contratar' },
  { cif: 'B28000026', nombre: 'Babel Sistemas', sector: 'Tecnología', modalidad: 'FCT', contacto: 'Cristina Flores', cargo: 'HR Specialist', telefono: '915550266', email: 'cflores@babel.es', direccion: 'C/ María de Molina 50, Madrid', trabajadores: 250, obs: null },
  { cif: 'A28000027', nombre: 'Everis (NTT Data)', sector: 'Consultoría', modalidad: 'MIXTA', contacto: 'Marcos Reyes', cargo: 'Selección', telefono: '915550277', email: 'mreyes@everis.es', direccion: 'Av. Manoteras 52, Madrid', trabajadores: 2500, obs: 'Filial de NTT Data' },
  { cif: 'B08000028', nombre: 'King (Activision)', sector: 'Videojuegos', modalidad: 'FCT', contacto: 'Júlia Mas', cargo: 'Studio HR', telefono: '932550288', email: 'julia.mas@king.com', direccion: 'Av. Diagonal 420, Barcelona', trabajadores: 700, obs: 'Candy Crush — proyectos DAM/DAW' },
  { cif: 'B28000029', nombre: 'Viewnext', sector: 'Tecnología', modalidad: 'FCT', contacto: 'Santiago Ortega', cargo: 'Responsable Formación', telefono: '915550299', email: 'sortega@viewnext.es', direccion: 'C/ Josefa Valcárcel 24, Madrid', trabajadores: 400, obs: 'Filial de IBM España' },
  { cif: 'B46000030', nombre: 'Apliter Tecnología', sector: 'Desarrollo Software', modalidad: 'FCT', contacto: 'Verónica Gil', cargo: 'Gerente', telefono: '961550300', email: 'vgil@apliter.es', direccion: 'C/ Músico Ginés 1, Murcia', trabajadores: 18, obs: 'Empresa pequeña, trato cercano' },
];

const PROFESORES_EXTRA = [
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

const CICLOS = ['DAM', 'DAW', 'SMR', 'ASIR'];
const CURSOS = ['1º', '2º'];
const ESTADOS = ['DISPONIBLE', 'ENVIADO', 'ACEPTADO', 'RECHAZADO', 'EN_PRACTICAS'];
const PERFILES = ['Desarrollador Backend', 'Desarrollador Frontend', 'Desarrollador Full Stack', 'Técnico de Sistemas', 'Técnico de Redes', 'Administrador de BD', 'DevOps', 'Ciberseguridad', 'QA / Testing', 'Soporte TI'];

const NOMBRES = ['Alejandro','Carlos','Daniel','David','Diego','Eduardo','Francisco','Gabriel','Hugo','Javier','Jorge','José','Juan','Lucas','Manuel','Marcos','Miguel','Pablo','Pedro','Rafael','Sergio','Álvaro','Adrián','Rubén','Iván','Raúl','Mario','Óscar','Alberto','Fernando','María','Laura','Lucía','Ana','Sara','Carmen','Elena','Patricia','Marta','Cristina','Isabel','Sofía','Andrea','Natalia','Beatriz','Verónica','Silvia','Rosa','Alicia','Irene'];
const APELLIDOS = ['García','Martínez','López','Sánchez','González','Rodríguez','Fernández','Pérez','Álvarez','Torres','Ramírez','Flores','Moreno','Jiménez','Ruiz','Díaz','Hernández','Gómez','Muñoz','Alonso','Romero','Navarro','Suárez','Molina','Ortega','Delgado','Castro','Vega','Ramos','Nieto'];
const MOTIVOS_CONTACTO = [
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
const TIPOS = ['LLAMADA', 'EMAIL', 'VISITA'];
const RESULTADOS = ['INTERESADO', 'PENDIENTE', 'NO_INTERESADO', 'EN_PROCESO', 'HECHO', 'DESCARTADO'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  return d.toISOString().split('T')[0];
}

async function seedDb(client) {
  // --- Profesores ---
  const profesorIds = [];
  const hash = await bcrypt.hash('profesor123', 10);
  for (const p of PROFESORES_EXTRA) {
    const exists = await client.query('SELECT id FROM profesores WHERE email = $1', [p.email]);
    if (!exists.rows.length) {
      const { rows } = await client.query(
        `INSERT INTO profesores (nombre, email, password, telefono, rol, activo, tema)
         VALUES ($1,$2,$3,$4,$5,TRUE,'light') RETURNING id`,
        [p.nombre, p.email, hash, p.telefono, p.rol]
      );
      profesorIds.push(rows[0].id);
    } else {
      profesorIds.push(exists.rows[0].id);
    }
  }
  // Incluir el admin
  const adminRow = await client.query("SELECT id FROM profesores WHERE email = 'admin@fct.edu'");
  if (adminRow.rows.length) profesorIds.unshift(adminRow.rows[0].id);

  // --- Empresas ---
  const empresaIds = [];
  for (const e of EMPRESAS) {
    const exists = await client.query('SELECT id FROM empresas WHERE cif = $1', [e.cif]);
    if (!exists.rows.length) {
      const { rows } = await client.query(
        `INSERT INTO empresas (cif, nombre, sector, modalidad, contacto_principal, cargo_contacto,
          telefono, email, direccion, num_trabajadores, observaciones, activa, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,NOW(),NOW()) RETURNING id`,
        [e.cif, e.nombre, e.sector, e.modalidad, e.contacto, e.cargo, e.telefono, e.email, e.direccion, e.trabajadores, e.obs ?? null]
      );
      const empresaId = rows[0].id;
      // Perfiles (1-3 por empresa)
      const numPerfiles = randInt(1, 3);
      const perfilesEmpresa = [...PERFILES].sort(() => Math.random() - 0.5).slice(0, numPerfiles);
      for (const perfil of perfilesEmpresa) {
        await client.query('INSERT INTO empresa_perfiles (empresa_id, perfil) VALUES ($1,$2) ON CONFLICT DO NOTHING', [empresaId, perfil]);
      }
      empresaIds.push(empresaId);
    } else {
      empresaIds.push(exists.rows[0].id);
    }
  }

  // --- Alumnos (60) ---
  const alumnoCount = await client.query('SELECT COUNT(*) FROM alumnos');
  if (Number(alumnoCount.rows[0].count) < 60) {
    for (let i = 0; i < 60; i++) {
      const nombre = pick(NOMBRES);
      const apellido1 = pick(APELLIDOS);
      const apellido2 = pick(APELLIDOS);
      const ciclo = pick(CICLOS);
      const curso = pick(CURSOS);
      const estado = pick(ESTADOS);
      const emailAlumno = `alumno${i + 1}@alumnos.fct.edu`;
      const empresaId = ['EN_PRACTICAS', 'ACEPTADO', 'ENVIADO'].includes(estado) ? pick(empresaIds) : null;
      await client.query(
        `INSERT INTO alumnos (nombre, apellidos, email, telefono, ciclo, curso, estado, empresa_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
        [nombre, `${apellido1} ${apellido2}`, emailAlumno, `6${randInt(10,99)}${randInt(100000,999999)}`, ciclo, curso, estado, empresaId]
      );
    }
  }

  // --- Contactos (150) ---
  const contactoCount = await client.query('SELECT COUNT(*) FROM contactos');
  if (Number(contactoCount.rows[0].count) < 150) {
    for (let i = 0; i < 150; i++) {
      const empresaId = pick(empresaIds);
      const profesorId = pick(profesorIds);
      const fecha = randDate(365);
      const tipo = pick(TIPOS);
      const motivo = pick(MOTIVOS_CONTACTO);
      const resultado = pick(RESULTADOS);
      await client.query(
        `INSERT INTO contactos (empresa_id, profesor_id, fecha, tipo, motivo, resultado, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
        [empresaId, profesorId, fecha, tipo, motivo, resultado]
      );
    }
  }

  console.log('Datos de prueba cargados: 30 empresas, 19+1 profesores, 60 alumnos, 150 contactos');
}

module.exports = seedDb;
