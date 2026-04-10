package com.fct.repository;

import com.fct.entity.Contacto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

    List<Contacto> findByEmpresaIdOrderByFechaDesc(Long empresaId);

    long countByProfesorId(Long profesorId);

    long countByFechaBetween(LocalDate start, LocalDate end);

    @Query("SELECT c FROM Contacto c WHERE " +
           "(:search IS NULL OR c.empresa.nombre ILIKE %:search% OR c.motivo ILIKE %:search%) " +
           "AND (:tipo IS NULL OR c.tipo = :tipo) " +
           "AND (:resultado IS NULL OR c.resultado = :resultado)")
    Page<Contacto> findWithFilters(
            @Param("search") String search,
            @Param("tipo") Contacto.TipoContacto tipo,
            @Param("resultado") Contacto.ResultadoContacto resultado,
            Pageable pageable);

    @Query("SELECT c.profesor.nombre, COUNT(c) FROM Contacto c " +
           "WHERE c.profesor IS NOT NULL " +
           "GROUP BY c.profesor.nombre ORDER BY COUNT(c) DESC")
    List<Object[]> findProfesoresActivos();

    @Query(value = "SELECT EXTRACT(MONTH FROM fecha) as mes, COUNT(*) as total " +
                   "FROM contactos WHERE EXTRACT(YEAR FROM fecha) = :year " +
                   "GROUP BY EXTRACT(MONTH FROM fecha)", nativeQuery = true)
    List<Object[]> findContactosPorMes(@Param("year") int year);
}