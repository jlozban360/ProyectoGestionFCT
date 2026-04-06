package com.fct.repository;

import com.fct.entity.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

    List<Contacto> findByEmpresaIdOrderByFechaDesc(Long empresaId);

    long countByFechaBetween(LocalDate start, LocalDate end);

    @Query("SELECT c.profesor.nombre, COUNT(c) FROM Contacto c " +
           "WHERE c.profesor IS NOT NULL " +
           "GROUP BY c.profesor.nombre ORDER BY COUNT(c) DESC")
    List<Object[]> findProfesoresActivos();

    @Query("SELECT FUNCTION('MONTH', c.fecha), COUNT(c) FROM Contacto c " +
           "WHERE FUNCTION('YEAR', c.fecha) = :year GROUP BY FUNCTION('MONTH', c.fecha)")
    List<Object[]> findContactosPorMes(@Param("year") int year);
}
