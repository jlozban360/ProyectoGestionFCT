package com.fct.repository;

import com.fct.entity.Alumno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {

    List<Alumno> findByEmpresaId(Long empresaId);

    long countByEstado(Alumno.EstadoAlumno estado);

    @Query("SELECT a.ciclo, COUNT(a) FROM Alumno a GROUP BY a.ciclo")
    List<Object[]> countByCiclo();

    @Query("SELECT a FROM Alumno a WHERE " +
            "(:search IS NULL OR a.nombre LIKE %:search% OR a.apellidos LIKE %:search%)")
    Page<Alumno> findBySearch(@Param("search") String search, Pageable pageable);
}
