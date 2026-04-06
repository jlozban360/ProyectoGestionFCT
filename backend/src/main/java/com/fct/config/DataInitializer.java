package com.fct.config;

import com.fct.entity.Alumno;
import com.fct.entity.Empresa;
import com.fct.entity.Profesor;
import com.fct.repository.AlumnoRepository;
import com.fct.repository.EmpresaRepository;
import com.fct.repository.ProfesorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProfesorRepository profesorRepository;
    private final EmpresaRepository empresaRepository;
    private final AlumnoRepository alumnoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedProfesores();
        seedEmpresas();
        seedAlumnos();
    }

    private void seedProfesores() {
        if (profesorRepository.count() > 0) return;

        log.info("Creando datos iniciales de profesores...");

        Profesor admin = Profesor.builder()
                .nombre("Admin FCT")
                .email("admin@fct.edu")
                .password(passwordEncoder.encode("admin123"))
                .telefono("600000001")
                .rol(Profesor.Rol.ADMIN)
                .activo(true)
                .build();

        Profesor colaborador = Profesor.builder()
                .nombre("Julia López")
                .email("julia.lopez@fct.edu")
                .password(passwordEncoder.encode("profe123"))
                .telefono("600000002")
                .rol(Profesor.Rol.COLABORADOR)
                .activo(true)
                .build();

        profesorRepository.saveAll(List.of(admin, colaborador));
        log.info("✓ Profesores creados. Admin: admin@fct.edu / admin123");
    }

    private void seedEmpresas() {
        if (empresaRepository.count() > 0) return;

        log.info("Creando datos iniciales de empresas...");

        List<Empresa> empresas = List.of(
            Empresa.builder().cif("B12345678").nombre("Accenture Spain")
                .sector("Consultoría TI").modalidad(Empresa.Modalidad.FCT)
                .contactoPrincipal("María García").telefono("912345678")
                .email("rrhh@accenture.es").activa(true)
                .perfilesSolicitados(List.of("DAM", "DAW")).build(),
            Empresa.builder().cif("A87654321").nombre("Indra Sistemas")
                .sector("Software").modalidad(Empresa.Modalidad.DUAL)
                .contactoPrincipal("Carlos López").telefono("913456789")
                .email("empleo@indra.es").activa(true)
                .perfilesSolicitados(List.of("DAM", "ASIR")).build(),
            Empresa.builder().cif("B11223344").nombre("Capgemini España")
                .sector("Consultoría TI").modalidad(Empresa.Modalidad.FCT)
                .contactoPrincipal("Ana Martín").telefono("914567890")
                .email("recruiting@capgemini.es").activa(true)
                .perfilesSolicitados(List.of("DAW", "DAM")).build()
        );

        empresaRepository.saveAll(empresas);
        log.info("✓ Empresas de ejemplo creadas");
    }

    private void seedAlumnos() {
        if (alumnoRepository.count() > 0) return;

        log.info("Creando datos iniciales de alumnos...");

        List<Alumno> alumnos = List.of(
            Alumno.builder().nombre("Carlos").apellidos("Rodríguez García")
                .email("carlos.r@alumno.edu").ciclo(Alumno.CicloFormativo.DAM)
                .curso("2").estado(Alumno.EstadoAlumno.DISPONIBLE).build(),
            Alumno.builder().nombre("Sara").apellidos("Martínez López")
                .email("sara.m@alumno.edu").ciclo(Alumno.CicloFormativo.DAW)
                .curso("2").estado(Alumno.EstadoAlumno.DISPONIBLE).build(),
            Alumno.builder().nombre("Miguel").apellidos("Fernández Ruiz")
                .email("miguel.f@alumno.edu").ciclo(Alumno.CicloFormativo.SMR)
                .curso("2").estado(Alumno.EstadoAlumno.DISPONIBLE).build()
        );

        alumnoRepository.saveAll(alumnos);
        log.info("✓ Alumnos de ejemplo creados");
    }
}
