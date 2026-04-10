package com.fct.repository;

import com.fct.entity.Alumno;
import org.springframework.data.domain.Page;
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

    // Solo alumnos que NO están DISPONIBLE (es decir, los que están en proceso o asignados a empresa)
    @Query("SELECT a.ciclo, COUNT(a) FROM Alumno a " +
            "WHERE a.estado <> com.fct.entity.Alumno$EstadoAlumno.DISPONIBLE " +
            "GROUP BY a.ciclo ORDER BY COUNT(a) DESC")
    List<Object[]> countByCicloNoDisponible();

    @Query("SELECT a FROM Alumno a WHERE " +
            "(:search IS NULL OR a.nombre ILIKE %:search% OR a.apellidos ILIKE %:search%) " +
            "AND (:ciclo IS NULL OR a.ciclo = :ciclo)")
    Page<Alumno> findBySearchAndCiclo(@Param("search") String search,
                                      @Param("ciclo") Alumno.CicloFormativo ciclo,
                                      Pageable pageable);
}
