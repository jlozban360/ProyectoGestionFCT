package com.fct.config;

import com.fct.entity.*;
import com.fct.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProfesorRepository profesorRepository;
    private final EmpresaRepository empresaRepository;
    private final AlumnoRepository alumnoRepository;
    private final ContactoRepository contactoRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        if (profesorRepository.count() > 0) {
            log.info("Base de datos ya inicializada. Omitiendo seed...");
            return;
        }

        log.info("Iniciando carga masiva de datos iniciales...");

        List<Profesor> profesores = seedProfesores();
        List<Empresa> empresas = seedEmpresas();
        seedAlumnos(empresas);
        seedContactos(profesores, empresas);

        log.info("✓ Proceso de inicialización completado con éxito");
    }

    private List<Profesor> seedProfesores() {
        log.info("Creando 15 profesores...");
        List<Profesor> profesores = new ArrayList<>();
        String[] nombres = {"Admin", "Julia", "Marcos", "Elena", "Ricardo", "Sonia", "Pablo", "Lucía", "Diego", "Nuria", "Tomas", "Inma", "Victor", "Carla", "Javier"};

        for (int i = 0; i < 15; i++) {
            boolean isAdmin = i == 0;
            profesores.add(Profesor.builder()
                    .nombre(nombres[i] + (isAdmin ? " FCT" : " Profe"))
                    .email(isAdmin ? "admin@fct.edu" : nombres[i].toLowerCase() + "@fct.edu")
                    .password(passwordEncoder.encode(isAdmin ? "admin123" : "profe123"))
                    .telefono("6000000" + (10 + i))
                    .rol(isAdmin ? Profesor.Rol.ADMIN : Profesor.Rol.COLABORADOR)
                    .activo(true)
                    .build());
        }
        log.info("✓ Profesores creados.");
        return profesorRepository.saveAll(profesores);
    }

    private List<Empresa> seedEmpresas() {
        log.info("Creando 30 empresas...");
        List<Empresa> empresas = new ArrayList<>();
        String[] nombresEmpresas = {
                "Indra", "Accenture", "Capgemini", "NTT Data", "Deloitte", "Iberdrola", "Telefónica", "Santander", "BBVA", "Amazon",
                "Google Cloud", "Microsoft", "Oracle", "IBM", "Airtel", "Orange", "Vodafone", "Siemens", "Alstom", "Ferrovial",
                "Mercadona Tech", "Glovo", "Cabify", "Wallapop", "Typeform", "Idealista", "Fotocasa", "Aena", "Renfe", "Correos"
        };

        for (int i = 0; i < 30; i++) {
            empresas.add(Empresa.builder()
                    .cif("B" + (10000000 + i))
                    .nombre(nombresEmpresas[i])
                    .sector(i % 2 == 0 ? "Consultoría TI" : "Desarrollo Software")
                    .modalidad(i % 3 == 0 ? Empresa.Modalidad.DUAL : Empresa.Modalidad.FCT)
                    .contactoPrincipal("Responsable " + i)
                    .telefono("91" + (5000000 + i))
                    .email("rrhh@" + nombresEmpresas[i].toLowerCase().replace(" ", "") + ".es")
                    .activa(true)
                    .perfilesSolicitados(List.of("DAM", "DAW", "ASIR"))
                    .build());
        }
        log.info("✓ Empresas creadas.");
        return empresaRepository.saveAll(empresas);
    }

    private void seedAlumnos(List<Empresa> empresas) {
        log.info("Creando 40 alumnos con ciclos y estados variados...");

        // Nombres para 40 alumnos
        String[] nombres = {
            "Carlos", "Sara", "Miguel", "Laura", "David", "Sofía", "Javier", "Irene", "Pablo", "María",
            "Álvaro", "Cristina", "Andrés", "Beatriz", "Fernando", "Natalia", "Roberto", "Patricia", "Hugo", "Carmen"
        };

        // 10 por ciclo: DAM, DAW, SMR, ASIR
        Alumno.CicloFormativo[] ciclos = new Alumno.CicloFormativo[40];
        for (int i = 0; i < 10; i++) ciclos[i]      = Alumno.CicloFormativo.DAM;
        for (int i = 10; i < 20; i++) ciclos[i]     = Alumno.CicloFormativo.DAW;
        for (int i = 20; i < 30; i++) ciclos[i]     = Alumno.CicloFormativo.SMR;
        for (int i = 30; i < 40; i++) ciclos[i]     = Alumno.CicloFormativo.ASIR;

        // Por cada bloque de 10: 3 DISPONIBLE, 3 ENVIADO, 2 ACEPTADO, 1 EN_PRACTICAS, 1 RECHAZADO
        Alumno.EstadoAlumno[] patronBloque = {
            Alumno.EstadoAlumno.DISPONIBLE, Alumno.EstadoAlumno.DISPONIBLE, Alumno.EstadoAlumno.DISPONIBLE,
            Alumno.EstadoAlumno.ENVIADO, Alumno.EstadoAlumno.ENVIADO, Alumno.EstadoAlumno.ENVIADO,
            Alumno.EstadoAlumno.ACEPTADO, Alumno.EstadoAlumno.ACEPTADO,
            Alumno.EstadoAlumno.EN_PRACTICAS,
            Alumno.EstadoAlumno.RECHAZADO,
        };

        List<Alumno> alumnos = new ArrayList<>();
        for (int i = 0; i < 40; i++) {
            Alumno.EstadoAlumno estado = patronBloque[i % 10];
            Empresa empresa = (estado != Alumno.EstadoAlumno.DISPONIBLE)
                    ? empresas.get(i % empresas.size()) : null;

            alumnos.add(Alumno.builder()
                    .nombre(nombres[i % nombres.length])
                    .apellidos("Apellido " + i + " " + (char)('A' + (i % 26)))
                    .email("alumno" + i + "@alumno.edu")
                    .ciclo(ciclos[i])
                    .curso(i % 2 == 0 ? "2" : "1")
                    .estado(estado)
                    .empresa(empresa)
                    .build());
        }
        alumnoRepository.saveAll(alumnos);
        log.info("✓ 40 alumnos creados (DAM×10, DAW×10, SMR×10, ASIR×10) con estados variados.");
    }

    private void seedContactos(List<Profesor> profesores, List<Empresa> empresas) {
        // Distribución realista con picos en temporada FCT (feb-abr y oct-dic)
        // 2024: año completo | 2025: año completo | 2026: solo ene-abr (hasta hoy)
        int[][] distribucion = {
                {2024,  1, 2}, {2024,  2, 4}, {2024,  3, 6}, {2024,  4, 7},
                {2024,  5, 3}, {2024,  6, 2}, {2024,  7, 1}, {2024,  8, 1},
                {2024,  9, 3}, {2024, 10, 5}, {2024, 11, 6}, {2024, 12, 4},
                {2025,  1, 3}, {2025,  2, 5}, {2025,  3, 8}, {2025,  4, 9},
                {2025,  5, 4}, {2025,  6, 3}, {2025,  7, 2}, {2025,  8, 1},
                {2025,  9, 4}, {2025, 10, 7}, {2025, 11, 8}, {2025, 12, 5},
                {2026,  1, 4}, {2026,  2, 6}, {2026,  3, 9}, {2026,  4, 5},
        };

        String[] motivos = {
                "Presentación del programa FCT",
                "Seguimiento de alumno en prácticas",
                "Renovación de convenio de colaboración",
                "Captación de nueva empresa",
                "Reunión anual con RRHH",
                "Visita a instalaciones",
                "Revisión de plazas disponibles",
        };
        String[] necesidades = {"DAW", "DAM", "ASIR", "DAM y DAW", "DAW y ASIR", "DAM y ASIR"};
        String[] proximasAcciones = {
                "Enviar documentación del convenio",
                "Llamada de seguimiento en 2 semanas",
                "Visita presencial al centro de trabajo",
                "Reunión virtual con el tutor",
                "",
        };

        List<Contacto> contactos = new ArrayList<>();
        for (int[] entry : distribucion) {
            int year = entry[0], month = entry[1], count = entry[2];
            int maxDay = LocalDate.of(year, month, 1).lengthOfMonth();
            for (int i = 0; i < count; i++) {
                int day = random.nextInt(maxDay) + 1;
                contactos.add(Contacto.builder()
                        .empresa(empresas.get(random.nextInt(empresas.size())))
                        .profesor(profesores.get(random.nextInt(profesores.size())))
                        .fecha(LocalDate.of(year, month, day))
                        .tipo(Contacto.TipoContacto.values()[random.nextInt(Contacto.TipoContacto.values().length)])
                        .motivo(motivos[random.nextInt(motivos.length)])
                        .resultado(Contacto.ResultadoContacto.values()[random.nextInt(Contacto.ResultadoContacto.values().length)])
                        .necesidades(necesidades[random.nextInt(necesidades.length)])
                        .proximaAccion(proximasAcciones[random.nextInt(proximasAcciones.length)])
                        .build());
            }
        }
        contactoRepository.saveAll(contactos);
        log.info("✓ {} contactos creados distribuidos de 2024 a abril 2026.", contactos.size());
    }
}